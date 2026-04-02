import { useState } from "react";
import { Plus, Trash2, ChevronDown, MoveRight } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import type { Question, LogicRule, LogicCondition, LogicAction } from "@/types";

interface LogicPanelProps {
  question: Question;
  questions: Question[];
  onUpdate: (logic: LogicRule[]) => void;
}

export function LogicPanel({ question, questions, onUpdate }: LogicPanelProps) {
  const rules = question.logic || [];

  const addRule = () => {
    const newRule: LogicRule = {
      id: uuidv4(),
      conditionType: "all",
      conditions: [
        { questionId: question.id, operator: "equals", value: "" }
      ],
      actions: [
        { type: "show", targetQuestionId: "" }
      ]
    };
    onUpdate([...rules, newRule]);
  };

  const updateRule = (id: string, updates: Partial<LogicRule>) => {
    onUpdate(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRule = (id: string) => {
    onUpdate(rules.filter(r => r.id !== id));
  };

  const addCondition = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    updateRule(ruleId, {
      conditions: [...rule.conditions, { questionId: question.id, operator: "equals", value: "" }]
    });
  };

  const updateCondition = (ruleId: string, index: number, updates: Partial<LogicCondition>) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    const newConditions = [...rule.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    updateRule(ruleId, { conditions: newConditions });
  };

  const deleteCondition = (ruleId: string, index: number) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    const newConditions = rule.conditions.filter((_, i) => i !== index);
    updateRule(ruleId, { conditions: newConditions });
  };

  const updateAction = (ruleId: string, index: number, updates: Partial<LogicAction>) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    const newActions = [...rule.actions];
    newActions[index] = { ...newActions[index], ...updates };
    updateRule(ruleId, { actions: newActions });
  };

  const operators = [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Does not equal" },
    { value: "contains", label: "Contains" },
    { value: "is_empty", label: "Is empty" },
    { value: "greater_than", label: "Greater than" },
    { value: "less_than", label: "Less than" },
  ];

  const actionTypes = [
    { value: "show", label: "Show" },
    { value: "hide", label: "Hide" },
    { value: "jump_to", label: "Jump to" },
    { value: "end_form", label: "End form" },
  ];

  // We exclude the current question from being a target for show/hide if it doesn't make sense, but for maximum flexibility we list all.
  const targetQuestions = questions.filter(q => q.type !== "section_break" && q.type !== "statement" && q.type !== "welcome_screen" && q.type !== "end_screen");

  return (
    <div className="space-y-6">
      {rules.length === 0 ? (
        <div className="text-center py-6 bg-[#f6f3eb] rounded-xl border border-[rgba(191,200,199,0.3)]">
          <MoveRight className="h-6 w-6 text-[#bfc8c7] mx-auto mb-2" />
          <p className="text-sm text-[#707978] mb-4">No logic rules added yet.</p>
          <button
            onClick={addRule}
            className="text-xs font-semibold bg-white border border-[rgba(191,200,199,0.5)] px-3 py-1.5 rounded-lg text-[#002e2c] shadow-sm hover:bg-[#f6f3eb] transition-colors"
          >
            Add Rule
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule, ruleIndex) => (
            <div key={rule.id} className="bg-[#fcf9f1] rounded-xl border border-[rgba(191,200,199,0.5)] p-4 shadow-sm relative group">
              <button
                onClick={() => deleteRule(rule.id)}
                className="absolute top-2 right-2 p-1.5 text-[#bfc8c7] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="mb-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#002e2c] uppercase">If</span>
                  {rule.conditions.length > 1 && (
                    <select
                      value={rule.conditionType}
                      onChange={e => updateRule(rule.id, { conditionType: e.target.value as "all" | "any" })}
                      className="text-xs font-semibold bg-white border border-[rgba(191,200,199,0.5)] rounded-md px-2 py-1 outline-none text-[#1c1c17]"
                    >
                      <option value="all">ALL of</option>
                      <option value="any">ANY of</option>
                    </select>
                  )}
                </div>

                {rule.conditions.map((cond, cIndex) => (
                  <div key={cIndex} className="bg-white p-3 rounded-lg border border-[rgba(191,200,199,0.4)] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <select
                        value={cond.questionId}
                        onChange={e => updateCondition(rule.id, cIndex, { questionId: e.target.value })}
                        className="w-full text-xs font-medium bg-transparent outline-none truncate pr-2 text-[#404847]"
                      >
                        {questions.map(q => (
                          <option key={q.id} value={q.id}>{q.title || "Untitled"}</option>
                        ))}
                      </select>
                      {rule.conditions.length > 1 && (
                        <button onClick={() => deleteCondition(rule.id, cIndex)} className="text-[#bfc8c7] hover:text-red-500">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <select
                        value={cond.operator}
                        onChange={e => updateCondition(rule.id, cIndex, { operator: e.target.value as LogicCondition['operator'] })}
                        className="flex-shrink-0 w-[100px] text-xs bg-[#f6f3eb] border border-[rgba(191,200,199,0.3)] rounded-md px-2 py-1.5 outline-none text-[#1c1c17]"
                      >
                        {operators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                      </select>
                      
                      {cond.operator !== "is_empty" && (
                        <input
                          type="text"
                          value={cond.value}
                          onChange={e => updateCondition(rule.id, cIndex, { value: e.target.value })}
                          placeholder="Value..."
                          className="flex-1 text-xs px-2 py-1.5 border border-[rgba(191,200,199,0.3)] rounded-md outline-none focus:border-[#002e2c]"
                        />
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addCondition(rule.id)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#707978] hover:text-[#002e2c] transition-colors"
                >
                  <Plus className="h-3 w-3" /> Add Condition
                </button>
              </div>

              <div className="border-t border-[rgba(191,200,199,0.3)] pt-3 space-y-2">
                <span className="text-xs font-bold text-[#002e2c] uppercase">Then</span>
                
                {rule.actions.map((act, aIndex) => (
                  <div key={aIndex} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-[rgba(191,200,199,0.4)]">
                    <select
                      value={act.type}
                      onChange={e => updateAction(rule.id, aIndex, { type: e.target.value as LogicAction['type'] })}
                      className="text-xs font-medium bg-[#f6f3eb] border border-[rgba(191,200,199,0.3)] rounded-md px-2 py-1.5 outline-none text-[#1c1c17]"
                    >
                      {actionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    
                    {act.type !== "end_form" && (
                      <select
                        value={act.targetQuestionId || ""}
                        onChange={e => updateAction(rule.id, aIndex, { targetQuestionId: e.target.value })}
                        className="flex-1 w-0 text-xs font-medium bg-transparent outline-none truncate pr-2 text-[#404847]"
                      >
                        <option value="">Select question...</option>
                        {targetQuestions.map(q => (
                          <option key={q.id} value={q.id}>{q.title || "Untitled"}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={addRule}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[rgba(191,200,199,0.5)] text-xs font-semibold text-[#404847] hover:border-[#002e2c] hover:text-[#002e2c] transition-colors bg-white mt-4"
          >
            <Plus className="h-4 w-4" /> Add Rule
          </button>
        </div>
      )}
    </div>
  );
}

// Missing imports patch for components using X
import { X } from "lucide-react";
