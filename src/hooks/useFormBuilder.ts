"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_FORM_THEME, DEFAULT_FORM_SETTINGS } from "@/lib/constants";
import type { Question, QuestionType, QuestionOption, Form, FormTheme, FormSettings, SaveStatus, HistoryEntry } from "@/types";

const MAX_HISTORY = 50;

function createDefaultQuestion(type: QuestionType, orderIndex: number): Question {
  const hasOptions = ["multiple_choice", "checkboxes", "dropdown"].includes(type);
  return {
    id: uuidv4(),
    form_id: "",
    type,
    title: getDefaultTitle(type),
    description: null,
    placeholder: getDefaultPlaceholder(type),
    is_required: false,
    order_index: orderIndex,
    options: hasOptions
      ? [
          { id: uuidv4(), label: "Option 1", value: "option_1" },
          { id: uuidv4(), label: "Option 2", value: "option_2" },
        ]
      : null,
    settings: type === "rating" ? { min: 1, max: 5 } : type === "number" ? {} : null,
  };
}

function getDefaultTitle(type: QuestionType): string {
  const titles: Partial<Record<QuestionType, string>> = {
    short_text: "Short Answer",
    long_text: "Long Answer",
    multiple_choice: "Multiple Choice",
    checkboxes: "Checkboxes",
    dropdown: "Dropdown",
    date: "Date",
    time: "Time",
    number: "Number",
    email: "Email Address",
    phone: "Phone Number",
    file_upload: "File Upload",
    rating: "Rate Your Experience",
    section_break: "Section Title",
    statement: "Statement",
  };
  return titles[type] || "Question";
}

function getDefaultPlaceholder(type: QuestionType): string {
  const placeholders: Partial<Record<QuestionType, string>> = {
    short_text: "Type your answer here...",
    long_text: "Type your answer here...",
    email: "you@example.com",
    phone: "+91 ",
    number: "Enter a number",
  };
  return placeholders[type] || "";
}

export function useFormBuilder(formId: string) {
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Load form from Supabase
  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("forms")
        .select("*, questions(*)")
        .eq("id", formId)
        .single();

      if (data && isMountedRef.current) {
        const qs = (data.questions as Question[] || []).sort((a, b) => a.order_index - b.order_index);
        setForm({ ...data, questions: undefined });
        setQuestions(qs);
        pushHistory(data, qs);
      }
      setLoading(false);
    };
    load();
    return () => { isMountedRef.current = false; };
  }, [formId]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const pushHistory = useCallback((f: Partial<Form>, qs: Question[]) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, prev.length + 1);
      const entry: HistoryEntry = {
        title: f.title || "Untitled Form",
        description: f.description,
        questions: JSON.parse(JSON.stringify(qs)),
        theme: (f.theme as FormTheme) || DEFAULT_FORM_THEME,
        settings: (f.settings as FormSettings) || DEFAULT_FORM_SETTINGS,
        thank_you_message: f.thank_you_message || "Thank you for your response!",
      };
      const newHistory = [...trimmed.slice(Math.max(0, trimmed.length - MAX_HISTORY)), entry];
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  }, []);

  const undo = useCallback(() => {
    setHistoryIndex(prev => {
      if (prev <= 0) return prev;
      const newIdx = prev - 1;
      const entry = history[newIdx];
      if (entry) {
        setForm(f => f ? { ...f, title: entry.title, description: entry.description, theme: entry.theme, settings: entry.settings, thank_you_message: entry.thank_you_message } : f);
        setQuestions(entry.questions);
      }
      return newIdx;
    });
  }, [history]);

  const redo = useCallback(() => {
    setHistoryIndex(prev => {
      if (prev >= history.length - 1) return prev;
      const newIdx = prev + 1;
      const entry = history[newIdx];
      if (entry) {
        setForm(f => f ? { ...f, title: entry.title, description: entry.description, theme: entry.theme, settings: entry.settings, thank_you_message: entry.thank_you_message } : f);
        setQuestions(entry.questions);
      }
      return newIdx;
    });
  }, [history]);

  // Auto-save with 2s debounce
  const scheduleSave = useCallback((updatedForm: Form, updatedQuestions: Question[]) => {
    if (!form) return;
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { error: formError } = await supabase.from("forms").update({
        title: updatedForm.title,
        description: updatedForm.description,
        theme: updatedForm.theme,
        settings: updatedForm.settings,
        thank_you_message: updatedForm.thank_you_message,
        is_published: updatedForm.is_published,
        slug: updatedForm.slug,
      }).eq("id", formId);

      if (formError) { setSaveStatus("error"); return; }

      // Upsert questions
      const questionRows = updatedQuestions.map((q, i) => ({
        id: q.id,
        form_id: formId,
        type: q.type,
        title: q.title,
        description: q.description,
        placeholder: q.placeholder,
        is_required: q.is_required,
        order_index: i,
        options: q.options,
        settings: q.settings,
        logic: q.logic,
      }));

      if (questionRows.length > 0) {
        const { error: qError } = await supabase.from("questions").upsert(questionRows);
        if (qError) { setSaveStatus("error"); return; }
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 2000);
  }, [form, formId]);

  const updateForm = useCallback((updates: Partial<Form>) => {
    setForm(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      scheduleSave(updated, questions);
      return updated;
    });
  }, [questions, scheduleSave]);

  const addQuestion = useCallback((type: QuestionType) => {
    const newQ = createDefaultQuestion(type, questions.length);
    newQ.form_id = formId;
    const newQuestions = [...questions, newQ];
    setQuestions(newQuestions);
    setSelectedQuestionId(newQ.id);
    if (form) scheduleSave(form, newQuestions);
    pushHistory(form || {}, newQuestions);
  }, [questions, form, formId, scheduleSave, pushHistory]);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions(prev => {
      const updated = prev.map(q => q.id === id ? { ...q, ...updates } : q);
      if (form) scheduleSave(form, updated);
      return updated;
    });
  }, [form, scheduleSave]);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions(prev => {
      const updated = prev.filter(q => q.id !== id).map((q, i) => ({ ...q, order_index: i }));
      if (form) scheduleSave(form, updated);
      pushHistory(form || {}, updated);
      return updated;
    });
    if (selectedQuestionId === id) setSelectedQuestionId(null);

    // Delete from DB
    const supabase = createClient();
    supabase.from("questions").delete().eq("id", id);
  }, [form, selectedQuestionId, scheduleSave, pushHistory]);

  const duplicateQuestion = useCallback((id: string) => {
    const q = questions.find(q => q.id === id);
    if (!q) return;
    const idx = questions.indexOf(q);
    const newQ = { ...q, id: uuidv4(), title: `${q.title} (Copy)`, order_index: idx + 1 };
    const newQuestions = [
      ...questions.slice(0, idx + 1),
      newQ,
      ...questions.slice(idx + 1),
    ].map((q, i) => ({ ...q, order_index: i }));
    setQuestions(newQuestions);
    setSelectedQuestionId(newQ.id);
    if (form) scheduleSave(form, newQuestions);
    pushHistory(form || {}, newQuestions);
  }, [questions, form, scheduleSave, pushHistory]);

  const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
    setQuestions(prev => {
      const result = [...prev];
      const [moved] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, moved);
      const reindexed = result.map((q, i) => ({ ...q, order_index: i }));
      if (form) scheduleSave(form, reindexed);
      return reindexed;
    });
  }, [form, scheduleSave]);

  const addOption = useCallback((questionId: string) => {
    updateQuestion(questionId, {
      options: [
        ...(questions.find(q => q.id === questionId)?.options || []),
        { id: uuidv4(), label: `Option ${(questions.find(q => q.id === questionId)?.options?.length || 0) + 1}`, value: `option_${Date.now()}` } as QuestionOption,
      ],
    });
  }, [questions, updateQuestion]);

  const updateOption = useCallback((questionId: string, optionId: string, updates: Partial<QuestionOption>) => {
    const q = questions.find(q => q.id === questionId);
    if (!q?.options) return;
    updateQuestion(questionId, {
      options: q.options.map(o => o.id === optionId ? { ...o, ...updates, value: updates.label ? updates.label.toLowerCase().replace(/\s+/g, "_") : o.value } : o),
    });
  }, [questions, updateQuestion]);

  const deleteOption = useCallback((questionId: string, optionId: string) => {
    const q = questions.find(q => q.id === questionId);
    if (!q?.options) return;
    updateQuestion(questionId, { options: q.options.filter(o => o.id !== optionId) });
  }, [questions, updateQuestion]);

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId) || null;

  return {
    form, questions, selectedQuestion, selectedQuestionId,
    setSelectedQuestionId, saveStatus, loading,
    updateForm, addQuestion, updateQuestion, deleteQuestion,
    duplicateQuestion, reorderQuestions, addOption, updateOption, deleteOption,
    undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1,
  };
}
