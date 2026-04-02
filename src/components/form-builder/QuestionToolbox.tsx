"use client";

import { QUESTION_TYPE_META, QUESTION_GROUPS, ORDERED_QUESTION_TYPES } from "@/lib/constants";
import type { QuestionType } from "@/types";
import { Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionToolboxProps {
  onAddQuestion: (type: QuestionType) => void;
  onAIGenerate: () => void;
}

export function QuestionToolbox({ onAddQuestion, onAIGenerate }: QuestionToolboxProps) {
  return (
    <div className="h-full flex flex-col bg-white border-r border-[rgba(191,200,199,0.3)]">
      {/* AI Button */}
      <div className="p-4 border-b border-[rgba(191,200,199,0.2)]">
        <button
          onClick={onAIGenerate}
          className="w-full py-3 rounded-xl bg-[#002e2c] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#004643] transition-colors shadow-sm"
        >
          <Sparkles className="h-4 w-4 text-[#f9bc60]" />
          Generate with AI
        </button>
      </div>

      {/* Question Types */}
      <div className="flex-1 overflow-y-auto p-4">
        {QUESTION_GROUPS.map(group => {
          const types = ORDERED_QUESTION_TYPES.filter(t => QUESTION_TYPE_META[t].group === group);
          return (
            <div key={group} className="mb-5">
              <p className="text-xs font-bold text-[#707978] uppercase tracking-wider mb-2">{group}</p>
              <div className="space-y-1">
                {types.map(type => {
                  const meta = QUESTION_TYPE_META[type];
                  return (
                    <button
                      key={type}
                      onClick={() => onAddQuestion(type)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#f6f3eb] text-left transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#f6f3eb] group-hover:bg-[#002e2c]/10 flex items-center justify-center flex-shrink-0 transition-colors">
                        <meta.icon className="h-3.5 w-3.5 text-[#404847] group-hover:text-[#002e2c]" />
                      </div>
                      <span className="text-sm text-[#1c1c17] font-medium flex-1">{meta.label}</span>
                      <Plus className="h-3.5 w-3.5 text-[#bfc8c7] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
