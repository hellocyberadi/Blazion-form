"use client";

import { useMemo, useState, useEffect } from "react";
import { FormConfig, Question, QuestionType, FormTheme } from "@/types/form";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_THEME: FormTheme = {
  primaryColor: "#002e2c",
  backgroundColor: "#fcf9f1",
  fontFamily: "--font-inter",
  borderRadius: "0.5rem",
  darkMode: false,
};

const INITIAL_FORM: FormConfig = {
  id: "new-form",
  title: "Untitled Form",
  description: "Give your form a description...",
  questions: [],
  theme: DEFAULT_THEME,
  settings: {
    allowAiSummary: true,
    collectEmail: false,
  },
};

export const useFormBuilder = (initialData?: FormConfig) => {
  const [form, setForm] = useState<FormConfig>(initialData || INITIAL_FORM);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Persistence to localstorage
  useEffect(() => {
    const saved = localStorage.getItem(`blazion-form-${form.id}`);
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load form from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(`blazion-form-${form.id}`, JSON.stringify(form));
  }, [form]);

  const addQuestion = (type: QuestionType, initialData?: Partial<Question>) => {
    const newQuestion: Question = {
      id: uuidv4(),
      type,
      label: initialData?.label || `New ${type.replace("_", " ")}`,
      required: initialData?.required || false,
      placeholder: initialData?.placeholder || "Type your placeholder here...",
      options: initialData?.options || (type === "mcq" || type === "checkbox" || type === "dropdown" ? ["Option 1"] : undefined),
      ...initialData,
    };

    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setSelectedQuestionId(newQuestion.id);
  };

  const removeQuestion = (id: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
    if (selectedQuestionId === id) setSelectedQuestionId(null);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
  };

  const reorderQuestions = (startIndex: number, endIndex: number) => {
    const result = Array.from(form.questions);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    setForm((prev) => ({
      ...prev,
      questions: result,
    }));
  };

  const updateFormMetadata = (updates: Partial<FormConfig>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const updateTheme = (updates: Partial<FormTheme>) => {
    setForm((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...updates },
    }));
  };

  const selectedQuestion = useMemo(() => {
    return form.questions.find((q) => q.id === selectedQuestionId) || null;
  }, [form.questions, selectedQuestionId]);

  return {
    form,
    selectedQuestionId,
    setSelectedQuestionId,
    selectedQuestion,
    addQuestion,
    removeQuestion,
    updateQuestion,
    reorderQuestions,
    updateFormMetadata,
    updateTheme,
  };
};
