"use client";

import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, closestCenter, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { QUESTION_TYPE_META } from "@/lib/constants";
import {
  GripVertical, Trash2, Copy, ChevronDown, ChevronUp,
  Star, CheckSquare, Type, AlignLeft, Hash, Mail, Phone,
  Calendar, Clock, Upload, Minus, MessageSquare, ChevronDownSquare,
  RadioIcon
} from "lucide-react";
import type { Question } from "@/types";

interface FormCanvasProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

function QuestionPreview({ question }: { question: Question }) {
  const meta = QUESTION_TYPE_META[question.type];

  if (question.type === "section_break") {
    return (
      <div className="py-2">
        <div className="h-px bg-[rgba(191,200,199,0.4)] mb-3" />
        <h3 className="font-heading font-bold text-lg text-[#1c1c17]">{question.title}</h3>
        {question.description && <p className="text-sm text-[#404847] mt-1">{question.description}</p>}
      </div>
    );
  }

  if (question.type === "statement") {
    return (
      <div className="bg-[#f6f3eb] rounded-xl p-4">
        <p className="text-[#1c1c17]">{question.title}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <meta.icon className="h-4 w-4 text-[#002e2c] flex-shrink-0" />
        <label className="font-medium text-[#1c1c17] text-sm">
          {question.title}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {question.description && <p className="text-xs text-[#707978] mb-2">{question.description}</p>}

      {/* Render input preview based on type */}
      {["short_text", "email", "phone", "number"].includes(question.type) && (
        <div className="h-10 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 flex items-center text-sm text-[#bfc8c7]">
          {question.placeholder || "Answer"}
        </div>
      )}
      {question.type === "long_text" && (
        <div className="h-20 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 py-2 text-sm text-[#bfc8c7]">
          {question.placeholder || "Long answer"}
        </div>
      )}
      {(question.type === "multiple_choice" || question.type === "checkboxes") && (
        <div className="space-y-2">
          {(question.options || []).slice(0, 4).map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2 text-sm text-[#404847]">
              <div className={cn("w-4 h-4 border border-[rgba(191,200,199,0.5)] flex-shrink-0", question.type === "multiple_choice" ? "rounded-full" : "rounded-sm")} />
              <span>{opt.label}</span>
            </div>
          ))}
          {(question.options?.length || 0) > 4 && <div className="text-xs text-[#707978]">+{(question.options?.length || 0) - 4} more options</div>}
        </div>
      )}
      {question.type === 'dropdown' && (
        <div className="h-10 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 flex items-center justify-between text-sm text-[#bfc8c7]">
          <span>Select an option</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      )}
      {question.type === 'image_choice' && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          {(question.options || []).slice(0, 4).map((opt) => (
            <div key={opt.id} className="border border-[rgba(191,200,199,0.5)] rounded-xl overflow-hidden bg-white">
              <div className="h-24 bg-[#f6f3eb] flex items-center justify-center text-xs text-[#bfc8c7]">
                {opt.imageUrl ? "Image" : "No Image"}
              </div>
              <div className="p-2 text-xs text-center text-[#404847] border-t border-[rgba(191,200,199,0.5)]">
                {opt.label}
              </div>
            </div>
          ))}
        </div>
      )}
      {question.type === 'slider' && (
        <div className="mt-4 pb-2">
          <div className="h-2 bg-[#ebe8e0] rounded-full relative">
            <div className="absolute left-1/2 -ml-2 -mt-1.5 w-5 h-5 rounded-full bg-white border-2 border-[#002e2c] shadow-sm"></div>
          </div>
          <div className="flex justify-between text-xs text-[#707978] mt-2">
            <span>{question.settings?.min || 0}</span>
            <span>{question.settings?.max || 100}</span>
          </div>
        </div>
      )}
      {question.type === 'matrix' && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                <th className="pb-2 font-medium text-[#707978]"></th>
                {(question.settings?.matrixColumns || ['Col 1', 'Col 2']).map((col: string, i: number) => (
                  <th key={i} className="pb-2 text-center font-medium text-[#707978] px-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(question.settings?.matrixRows || ['Row 1', 'Row 2']).map((row: string, rIdx: number) => (
                <tr key={rIdx} className="border-t border-[rgba(191,200,199,0.3)]">
                  <td className="py-2 pr-4 text-[#404847] whitespace-nowrap">{row}</td>
                  {(question.settings?.matrixColumns || ['Col 1', 'Col 2']).map((_: any, cIdx: number) => (
                    <td key={cIdx} className="py-2 text-center text-[#bfc8c7]">
                      <div className="w-4 h-4 mx-auto rounded-full border border-[rgba(191,200,199,0.5)]"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {question.type === 'address' && (
        <div className="space-y-2 mt-2">
          <div className="h-10 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 flex items-center text-sm text-[#bfc8c7]">
            Street Address
          </div>
          {question.settings?.addressParts?.line2 !== false && (
            <div className="h-10 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 flex items-center text-sm text-[#bfc8c7]">
              Apartment, suite, etc.
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 flex items-center text-sm text-[#bfc8c7]">
              City
            </div>
            {question.settings?.addressParts?.state !== false && (
              <div className="h-10 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 flex items-center text-sm text-[#bfc8c7]">
                State / Province
              </div>
            )}
            <div className="h-10 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 flex items-center text-sm text-[#bfc8c7]">
              Postal / Zip Code
            </div>
            {question.settings?.addressParts?.country !== false && (
              <div className="h-10 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 flex items-center text-sm text-[#bfc8c7]">
                Country
              </div>
            )}
          </div>
        </div>
      )}
      {question.type === 'signature' && (
        <div className="h-24 mt-2 rounded-lg border-2 border-dashed border-[rgba(191,200,199,0.5)] bg-white flex flex-col items-center justify-center text-[#bfc8c7]">
          <span className="text-xs font-mono uppercase tracking-widest border-b border-[#bfc8c7] pb-1 inline-block">Draw Signature Here</span>
        </div>
      )}
      {question.type === 'nps' && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-1 justify-between flex-wrap">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <div key={n} className="w-8 h-8 rounded border border-[rgba(191,200,199,0.5)] flex items-center justify-center text-sm text-[#404847] hover:bg-[#f6f3eb]">
                {n}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-[#707978]">
            <span>{question.settings?.npsLowLabel || 'Not likely at all'}</span>
            <span>{question.settings?.npsHighLabel || 'Extremely likely'}</span>
          </div>
        </div>
      )}
      {question.type === "date" && (
        <div className="h-10 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 flex items-center text-sm text-[#bfc8c7]">
          DD/MM/YYYY
        </div>
      )}
      {question.type === "time" && (
        <div className="h-10 rounded-lg border border-[rgba(191,200,199,0.5)] bg-white px-3 flex items-center text-sm text-[#bfc8c7]">
          HH:MM AM/PM
        </div>
      )}
      {question.type === "rating" && (
        <div className="flex gap-1">
          {Array.from({ length: question.settings?.max || 5 }).map((_, i) => (
            <Star key={i} className="h-6 w-6 text-[#bfc8c7]" />
          ))}
        </div>
      )}
      {question.type === "file_upload" && (
        <div className="h-20 rounded-lg border-2 border-dashed border-[rgba(191,200,199,0.5)] flex items-center justify-center text-sm text-[#bfc8c7]">
          Click or drag to upload
        </div>
      )}
      {question.type === "welcome_screen" && (
        <div className="flex justify-center mt-4">
          <div className="bg-[#002e2c] text-white px-6 py-2 rounded-lg text-sm font-medium">
            Start Form
          </div>
        </div>
      )}
      {question.type === "end_screen" && (
        <div className="flex justify-center mt-4">
          <div className="h-8 w-24 bg-green-500 text-white flex items-center justify-center rounded-full text-xs font-medium">
            Submitted ✅
          </div>
        </div>
      )}
    </div>
  );
}

function SortableQuestion({ question, isSelected, onSelect, onDelete, onDuplicate }: {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "rounded-xl border-2 p-4 cursor-pointer transition-all bg-white hover:border-[#002e2c]/30 group",
        isSelected ? "border-[#002e2c] shadow-md" : "border-transparent shadow-sm hover:shadow-md"
      )}
    >
      <div className="flex gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-[#bfc8c7] hover:text-[#002e2c] transition-colors opacity-0 group-hover:opacity-100"
          onClick={e => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Question Number */}
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f6f3eb] flex items-center justify-center mt-0.5">
          <span className="text-xs font-bold text-[#404847]">{question.order_index + 1}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <QuestionPreview question={question} />
        </div>

        {/* Actions */}
        {isSelected && (
          <div className="flex-shrink-0 flex flex-col gap-1" onClick={e => e.stopPropagation()}>
            <button onClick={onDuplicate} className="p-1.5 rounded-lg hover:bg-[#f6f3eb] text-[#404847] hover:text-[#002e2c] transition-colors">
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-[#404847] hover:text-red-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function FormCanvas({ questions, selectedId, onSelect, onDelete, onDuplicate, onReorder }: FormCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const fromIndex = questions.findIndex(q => q.id === active.id);
    const toIndex = questions.findIndex(q => q.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) onReorder(fromIndex, toIndex);
  };

  const activeQuestion = activeId ? questions.find(q => q.id === activeId) : null;

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <div className="w-20 h-20 bg-[#f6f3eb] rounded-2xl flex items-center justify-center mb-5">
          <Type className="h-10 w-10 text-[#404847]" />
        </div>
        <h3 className="font-heading font-bold text-xl text-[#1c1c17] mb-2">Start adding questions</h3>
        <p className="text-sm text-[#404847] max-w-xs">Click on a question type from the left panel, or use the AI generator to create your form instantly.</p>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 p-6">
          {questions.map(q => (
            <SortableQuestion
              key={q.id}
              question={q}
              isSelected={selectedId === q.id}
              onSelect={() => onSelect(q.id)}
              onDelete={() => onDelete(q.id)}
              onDuplicate={() => onDuplicate(q.id)}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeQuestion && (
          <div className="rounded-xl border-2 border-[#002e2c] p-4 bg-white shadow-xl opacity-90">
            <QuestionPreview question={activeQuestion} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
