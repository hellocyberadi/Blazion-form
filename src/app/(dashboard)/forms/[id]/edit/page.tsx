"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Brain, ArrowLeft, Save, Eye, Share2, Loader2, RotateCcw, RotateCw, Sparkles, CheckCircle2, AlertCircle, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useFormBuilder } from "@/hooks/useFormBuilder";
import { FormCanvas } from "@/components/form-builder/FormCanvas";
import { QuestionToolbox } from "@/components/form-builder/QuestionToolbox";
import { PropertyPanel } from "@/components/form-builder/PropertyPanel";
import { ThemePanel } from "@/components/form-builder/ThemePanel";
import { PreviewPanel } from "@/components/form-builder/PreviewPanel";
import { cn } from "@/lib/utils";
import type { QuestionType, BuilderTab } from "@/types";

const TABS: { id: BuilderTab; label: string }[] = [
  { id: "build", label: "Build" },
  { id: "design", label: "Design" },
  { id: "settings", label: "Settings" },
  { id: "preview", label: "Preview" },
];

export default function FormEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BuilderTab>("build");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const {
    form, questions, selectedQuestion, selectedQuestionId,
    setSelectedQuestionId, saveStatus, loading,
    updateForm, addQuestion, updateQuestion, deleteQuestion,
    duplicateQuestion, reorderQuestions, addOption, updateOption, deleteOption,
    undo, redo, canUndo, canRedo,
  } = useFormBuilder(id);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.title) updateForm({ title: data.title, description: data.description });
      (data.questions || []).forEach((q: Partial<{ type: QuestionType; title: string }>) => {
        if (q.type) addQuestion(q.type);
      });
      setAiDialogOpen(false);
      setAiPrompt("");
      toast.success("Form generated with AI!");
    } catch (e) {
      toast.error("AI generation failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!form) return;
    const newPublished = !form.is_published;
    updateForm({ is_published: newPublished });
    toast.success(newPublished ? "Form published! 🎉" : "Form unpublished.");
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#fcf9f1]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#002e2c]" />
          <p className="text-sm text-[#404847]">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) return <div className="h-full flex items-center justify-center"><p className="text-[#404847]">Form not found.</p></div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b border-[rgba(191,200,199,0.3)] flex items-center gap-4 px-4 flex-shrink-0">
        <Link href="/forms" className="text-[#707978] hover:text-[#002e2c] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* Form Title */}
        <input
          value={form.title}
          onChange={e => updateForm({ title: e.target.value })}
          className="flex-1 max-w-xs font-heading font-bold text-[#1c1c17] bg-transparent border-none outline-none focus:bg-[#f6f3eb] px-2 py-1 rounded-lg transition-all text-sm"
        />

        {/* Tabs */}
        <div className="flex bg-[#f6f3eb] p-1 rounded-xl">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id ? "bg-white text-[#1c1c17] shadow-sm" : "text-[#404847] hover:text-[#1c1c17]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Save Status */}
        <div className="flex items-center gap-1.5 text-xs">
          {saveStatus === "saving" && <><Loader2 className="h-3.5 w-3.5 animate-spin text-[#707978]" /><span className="text-[#707978]">Saving...</span></>}
          {saveStatus === "saved" && <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /><span className="text-green-600">Saved</span></>}
          {saveStatus === "error" && <><AlertCircle className="h-3.5 w-3.5 text-red-500" /><span className="text-red-500">Save failed</span></>}
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button onClick={undo} disabled={!canUndo} className="p-2 rounded-lg hover:bg-[#f6f3eb] text-[#404847] disabled:opacity-30 transition-colors" title="Undo (Ctrl+Z)">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={redo} disabled={!canRedo} className="p-2 rounded-lg hover:bg-[#f6f3eb] text-[#404847] disabled:opacity-30 transition-colors" title="Redo (Ctrl+Y)">
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Preview */}
        {form.slug && (
          <Link href={`/f/${form.slug}`} target="_blank" className="p-2 rounded-lg hover:bg-[#f6f3eb] text-[#404847] hover:text-[#002e2c] transition-colors" title="Preview form">
            <Eye className="h-4 w-4" />
          </Link>
        )}

        {/* Share */}
        <Link href={`/forms/${id}/share`} className="p-2 rounded-lg hover:bg-[#f6f3eb] text-[#404847] hover:text-[#002e2c] transition-colors" title="Share form">
          <Share2 className="h-4 w-4" />
        </Link>

        {/* Publish Toggle */}
        <button
          onClick={handlePublishToggle}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
            form.is_published
              ? "bg-green-50 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              : "bg-[#002e2c] text-white hover:bg-[#004643]"
          )}
        >
          {form.is_published ? <><Globe className="h-4 w-4" /> Published</> : <><Lock className="h-4 w-4" /> Publish</>}
        </button>
      </div>

      {/* Builder Body */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "build" && (
          <>
            {/* Left: Toolbox */}
            <div className="w-60 flex-shrink-0 overflow-y-auto">
              <QuestionToolbox
                onAddQuestion={(type: QuestionType) => addQuestion(type)}
                onAIGenerate={() => setAiDialogOpen(true)}
              />
            </div>

            {/* Center: Canvas */}
            <div className="flex-1 overflow-y-auto bg-[#f6f3eb]">
              <div className="max-w-2xl mx-auto py-6">
                {/* Form Header */}
                <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-[rgba(191,200,199,0.3)]">
                  <input
                    value={form.title}
                    onChange={e => updateForm({ title: e.target.value })}
                    placeholder="Form title..."
                    className="font-heading font-black text-2xl text-[#1c1c17] w-full bg-transparent border-none outline-none mb-2"
                  />
                  <textarea
                    value={form.description || ""}
                    onChange={e => updateForm({ description: e.target.value || null })}
                    placeholder="Add a description (optional)..."
                    rows={2}
                    className="text-sm text-[#404847] w-full bg-transparent border-none outline-none resize-none"
                  />
                </div>

                <FormCanvas
                  questions={questions}
                  selectedId={selectedQuestionId}
                  onSelect={setSelectedQuestionId}
                  onDelete={deleteQuestion}
                  onDuplicate={duplicateQuestion}
                  onReorder={reorderQuestions}
                />
              </div>
            </div>

            <div className="w-72 flex-shrink-0 overflow-y-auto bg-white border-l border-[rgba(191,200,199,0.3)]">
              <PropertyPanel
                question={selectedQuestion}
                questions={questions}
                onUpdate={updateQuestion}
                onAddOption={addOption}
                onUpdateOption={updateOption}
                onDeleteOption={deleteOption}
                onClose={() => setSelectedQuestionId(null)}
              />
            </div>
          </>
        )}

        {activeTab === "design" && (
          <div className="flex-1 overflow-y-auto p-8 bg-[#f6f3eb]">
            <ThemePanel 
              theme={form.theme} 
              onUpdate={(themeOverrides) => updateForm({ theme: { ...form.theme, ...themeOverrides } })} 
            />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="font-heading font-bold text-xl text-[#1c1c17]">Form Settings</h2>

              <div className="bg-white rounded-2xl p-6 border border-[rgba(191,200,199,0.3)] space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1c1c17] mb-1.5">Thank You Message</label>
                  <textarea
                    value={form.thank_you_message}
                    onChange={e => updateForm({ thank_you_message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-[rgba(191,200,199,0.5)] text-sm outline-none focus:ring-2 focus:ring-[#002e2c]"
                  />
                </div>

                {[
                  { key: "allowMultipleResponses", label: "Allow Multiple Responses", desc: "Let respondents submit more than once" },
                  { key: "showProgressBar", label: "Show Progress Bar", desc: "Display completion progress at top" },
                  { key: "notifyOnResponse", label: "Email Notification", desc: "Notify me when I receive a new response" },
                ].map(({ key, label, desc }) => {
                  const val = (form.settings as unknown as Record<string, unknown>)[key] as boolean;
                  return (
                    <div key={key} className="flex items-center justify-between py-3 border-t border-[rgba(191,200,199,0.2)]">
                      <div>
                        <div className="text-sm font-medium text-[#1c1c17]">{label}</div>
                        <div className="text-xs text-[#707978]">{desc}</div>
                      </div>
                      <button
                        onClick={() => updateForm({ settings: { ...form.settings, [key]: !val } })}
                        className={cn("w-10 h-6 rounded-full transition-all flex items-center px-1", val ? "bg-[#002e2c] justify-end" : "bg-[#e5e2da] justify-start")}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[rgba(191,200,199,0.3)]">
                <label className="block text-sm font-semibold text-[#1c1c17] mb-1.5">Form URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#707978]">blazion.ai/f/</span>
                  <input
                    value={form.slug || ""}
                    onChange={e => updateForm({ slug: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-[rgba(191,200,199,0.5)] text-sm outline-none focus:ring-2 focus:ring-[#002e2c]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <PreviewPanel form={form} questions={questions} />
        )}
      </div>

      {/* AI Dialog */}
      {aiDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#002e2c] rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-[#f9bc60]" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1c1c17]">Generate with AI</h3>
                <p className="text-xs text-[#707978]">Describe your form and AI will build it</p>
              </div>
            </div>
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g. Create a job application form for a software engineer position with fields for work experience, skills, and portfolio link..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] resize-none outline-none focus:ring-2 focus:ring-[#002e2c] mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setAiDialogOpen(false)} className="flex-1 py-2.5 rounded-xl border border-[rgba(191,200,199,0.5)] text-sm font-medium text-[#404847] hover:bg-[#f6f3eb] transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#002e2c] text-white text-sm font-semibold hover:bg-[#004643] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {aiLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
