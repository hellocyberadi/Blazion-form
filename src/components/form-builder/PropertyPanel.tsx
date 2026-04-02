"use client";

import { useState } from "react";
import { X, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUESTION_TYPE_META } from "@/lib/constants";
import type { Question, QuestionOption, LogicRule } from "@/types";
import { LogicPanel } from "./LogicPanel";

interface PropertyPanelProps {
  question: Question | null;
  questions: Question[];
  onUpdate: (id: string, updates: Partial<Question>) => void;
  onAddOption: (questionId: string) => void;
  onUpdateOption: (questionId: string, optionId: string, updates: Partial<QuestionOption>) => void;
  onDeleteOption: (questionId: string, optionId: string) => void;
  onClose: () => void;
}

export function PropertyPanel({ question, questions, onUpdate, onAddOption, onUpdateOption, onDeleteOption, onClose }: PropertyPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'logic'>('content');

  if (!question) {
    return (
      <div className="h-full bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 bg-[#f6f3eb] rounded-2xl flex items-center justify-center mb-3">
          <span className="text-2xl">👈</span>
        </div>
        <p className="text-sm font-medium text-[#1c1c17] mb-1">Select a question</p>
        <p className="text-xs text-[#707978]">Click any question to edit its properties</p>
      </div>
    );
  }

  const meta = QUESTION_TYPE_META[question.type];
  const hasOptions = ["multiple_choice", "checkboxes", "dropdown", "image_choice"].includes(question.type);
  const hasRatingSettings = question.type === "rating";
  const hasFileSettings = question.type === "file_upload";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#f6f3eb] flex items-center justify-center">
            <meta.icon className="h-3.5 w-3.5 text-[#002e2c]" />
          </div>
          <span className="text-sm font-semibold text-[#1c1c17]">{meta.label}</span>
        </div>
        <button onClick={onClose} className="text-[#707978] hover:text-[#002e2c] transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      {!["welcome_screen", "end_screen"].includes(question.type) && (
        <div className="px-4 border-b border-[rgba(191,200,199,0.2)] flex gap-4">
          <button
            onClick={() => setActiveTab('content')}
            className={cn("pb-2 text-sm font-semibold border-b-2 transition-colors", activeTab === 'content' ? "border-[#002e2c] text-[#002e2c]" : "border-transparent text-[#707978] hover:text-[#1c1c17]")}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('logic')}
            className={cn("pb-2 text-sm font-semibold border-b-2 transition-colors", activeTab === 'logic' ? "border-[#002e2c] text-[#002e2c]" : "border-transparent text-[#707978] hover:text-[#1c1c17]")}
          >
            Logic
          </button>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'logic' && !["welcome_screen", "end_screen"].includes(question.type) ? (
          <LogicPanel 
            question={question} 
            questions={questions} 
            onUpdate={(logic) => onUpdate(question.id, { logic })} 
          />
        ) : (
          <>
            {/* Question label */}
        <div>
          <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-1.5">Question Label</label>
          <textarea
            value={question.title}
            onChange={e => onUpdate(question.id, { title: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] resize-none outline-none focus:ring-2 focus:ring-[#002e2c]"
          />
        </div>

        {/* Description */}
        {question.type !== "section_break" && (
          <div>
            <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-1.5">Description (optional)</label>
            <textarea
              value={question.description || ""}
              onChange={e => onUpdate(question.id, { description: e.target.value || null })}
              rows={2}
              placeholder="Add helper text..."
              className="w-full px-3 py-2 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] resize-none outline-none focus:ring-2 focus:ring-[#002e2c] placeholder:text-[#bfc8c7]"
            />
          </div>
        )}

        {/* Placeholder for text types */}
        {["short_text", "long_text", "email", "phone", "number"].includes(question.type) && (
          <div>
            <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-1.5">Placeholder Text</label>
            <input
              value={question.placeholder || ""}
              onChange={e => onUpdate(question.id, { placeholder: e.target.value || null })}
              placeholder="e.g. Enter your name..."
              className="w-full px-3 py-2 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c] placeholder:text-[#bfc8c7]"
            />
          </div>
        )}

        {/* Options editor */}
        {hasOptions && (
          <div>
            <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-2">Options</label>
            <div className="space-y-4">
              {(question.options || []).map((opt, i) => (
                <div key={opt.id} className="space-y-2 pb-3 border-b border-[rgba(191,200,199,0.2)] last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#707978] w-5 flex-shrink-0">{i + 1}.</span>
                    <input
                      value={opt.label}
                      onChange={e => onUpdateOption(question.id, opt.id, { label: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
                    />
                    <button
                      onClick={() => onDeleteOption(question.id, opt.id)}
                      disabled={(question.options?.length || 0) <= 1}
                      className="text-[#bfc8c7] hover:text-red-500 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {question.type === 'image_choice' && (
                    <div className="pl-7">
                      <input
                        value={opt.imageUrl || ""}
                        onChange={e => onUpdateOption(question.id, opt.id, { imageUrl: e.target.value })}
                        placeholder="Image URL..."
                        className="w-full px-3 py-1.5 rounded-lg border border-[rgba(191,200,199,0.5)] text-xs text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => onAddOption(question.id)}
              className="mt-2 flex items-center gap-1.5 text-xs text-[#002e2c] font-semibold hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add Option
            </button>
          </div>
        )}

        {/* Rating settings */}
        {hasRatingSettings && (
          <div>
            <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-2">Rating Scale</label>
            <div className="grid grid-cols-2 gap-2">
              {(["min", "max"] as const).map(key => (
                <div key={key}>
                  <label className="text-xs text-[#707978] mb-1 block capitalize">{key}</label>
                  <input
                    type="number"
                    value={question.settings?.[key] ?? (key === "min" ? 1 : 5)}
                    onChange={e => onUpdate(question.id, { settings: { ...question.settings, [key]: parseInt(e.target.value) || 0 } })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
                    min={key === "min" ? 1 : 2}
                    max={key === "max" ? 10 : 9}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slider settings */}
        {question.type === 'slider' && (
          <div>
            <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-2">Slider Range</label>
            <div className="grid grid-cols-2 gap-2">
              {(["min", "max", "step"] as const).map(key => (
                <div key={key}>
                  <label className="text-xs text-[#707978] mb-1 block capitalize">{key}</label>
                  <input
                    type="number"
                    value={question.settings?.[key] ?? (key === "min" ? 0 : key === "max" ? 100 : 1)}
                    onChange={e => onUpdate(question.id, { settings: { ...question.settings, [key]: parseInt(e.target.value) || 0 } })}
                    className="w-full px-3 py-1.5 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matrix settings */}
        {question.type === 'matrix' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-2">Rows (comma separated)</label>
              <textarea
                value={(question.settings?.matrixRows || ['Row 1', 'Row 2']).join(', ')}
                onChange={e => onUpdate(question.id, { settings: { ...question.settings, matrixRows: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
                className="w-full px-3 py-1.5 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-2">Columns (comma separated)</label>
              <textarea
                value={(question.settings?.matrixColumns || ['Col 1', 'Col 2']).join(', ')}
                onChange={e => onUpdate(question.id, { settings: { ...question.settings, matrixColumns: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })}
                className="w-full px-3 py-1.5 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="allowMultiSelect"
                checked={question.settings?.matrixMultipleChoice || false}
                onChange={e => onUpdate(question.id, { settings: { ...question.settings, matrixMultipleChoice: e.target.checked } })}
              />
              <label htmlFor="allowMultiSelect" className="text-sm text-[#1c1c17]">Allow multiple selections per row</label>
            </div>
          </div>
        )}

        {/* NPS Settings */}
        {question.type === 'nps' && (
          <div>
            <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-2">Labels</label>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-[#707978] mb-1 block">Low end label (0)</label>
                <input
                  value={question.settings?.npsLowLabel || 'Not likely at all'}
                  onChange={e => onUpdate(question.id, { settings: { ...question.settings, npsLowLabel: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
                />
              </div>
              <div>
                <label className="text-xs text-[#707978] mb-1 block">High end label (10)</label>
                <input
                  value={question.settings?.npsHighLabel || 'Extremely likely'}
                  onChange={e => onUpdate(question.id, { settings: { ...question.settings, npsHighLabel: e.target.value } })}
                  className="w-full px-3 py-1.5 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Address Settings */}
        {question.type === 'address' && (
          <div>
            <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-2">Address Fields</label>
            <div className="space-y-2">
              {(['line2', 'city', 'state', 'zip', 'country'] as const).map(part => (
                <div key={part} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id={`address_part_${part}`}
                    checked={question.settings?.addressParts?.[part] !== false}
                    onChange={e => onUpdate(question.id, { 
                      settings: { 
                        ...question.settings, 
                        addressParts: { ...(question.settings?.addressParts || {}), [part]: e.target.checked }
                      } 
                    })}
                  />
                  <label htmlFor={`address_part_${part}`} className="text-sm text-[#1c1c17] capitalize">{part === 'line2' ? 'Address Line 2' : part}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File upload settings */}
        {hasFileSettings && (
          <div>
            <label className="block text-xs font-semibold text-[#404847] uppercase tracking-wide mb-2">Accepted File Types</label>
            <input
              value={question.settings?.accept || ""}
              onChange={e => onUpdate(question.id, { settings: { ...question.settings, accept: e.target.value } })}
              placeholder="e.g. .pdf, .jpg, image/*"
              className="w-full px-3 py-2 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c] placeholder:text-[#bfc8c7]"
            />
          </div>
        )}

        {/* Required toggle */}
        {!["section_break", "statement", "welcome_screen", "end_screen"].includes(question.type) && (
          <div className="flex items-center justify-between py-3 border-t border-[rgba(191,200,199,0.2)]">
            <div>
              <div className="text-sm font-medium text-[#1c1c17]">Required</div>
              <div className="text-xs text-[#707978]">Respondent must answer this</div>
            </div>
            <button
              onClick={() => onUpdate(question.id, { is_required: !question.is_required })}
              className="flex-shrink-0"
            >
              {question.is_required
                ? <ToggleRight className="h-6 w-6 text-[#002e2c]" />
                : <ToggleLeft className="h-6 w-6 text-[#bfc8c7]" />}
            </button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
