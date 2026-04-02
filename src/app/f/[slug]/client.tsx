"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Star, ChevronDown, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getDeviceInfo } from "@/lib/utils";
import { evaluateFormLogic } from "@/lib/logicEvaluator";
import type { Form, Question, FormTheme } from "@/types";

interface Props { 
  form: Form; 
  questions: Question[];
  isPreview?: boolean;
}

interface AnswerMap { [questionId: string]: any }

function QuestionInput({
  question,
  value,
  onChange,
  theme,
}: {
  question: Question;
  value: any;
  onChange: (v: any) => void;
  theme: FormTheme;
}) {
  const inputClass = cn(
    "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
    "focus:ring-2 focus:ring-offset-0"
  );
  const inputStyle = {
    borderColor: "rgba(191,200,199,0.5)",
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    color: theme.textColor,
  };

  if (question.type === "section_break") {
    return (
      <div className="py-2 border-t" style={{ borderColor: "rgba(191,200,199,0.4)" }}>
        <h3 className="font-bold text-lg" style={{ color: theme.textColor }}>{question.title}</h3>
        {question.description && <p className="text-sm opacity-70 mt-1" style={{ color: theme.textColor }}>{question.description}</p>}
      </div>
    );
  }

  if (question.type === "statement") {
    return <p className="text-sm leading-relaxed opacity-80" style={{ color: theme.textColor }}>{question.title}</p>;
  }

  switch (question.type) {
    case "long_text":
      return <textarea value={(value as string) || ""} onChange={e => onChange(e.target.value)} rows={4} placeholder={question.placeholder || ""} className={inputClass} style={inputStyle} />;
    case "multiple_choice":
      return (
        <div className="space-y-2">
          {(question.options || []).map(opt => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
              <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", value === opt.value ? "border-[var(--form-primary)] bg-[var(--form-primary)]" : "border-[rgba(191,200,199,0.5)]")}>
                {value === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <input type="radio" value={opt.value} checked={value === opt.value} onChange={e => onChange(e.target.value)} className="sr-only" />
              <span className="text-sm" style={{ color: theme.textColor }}>{opt.label}</span>
            </label>
          ))}
        </div>
      );
    case "checkboxes":
      return (
        <div className="space-y-2">
          {(question.options || []).map(opt => {
            const checked = Array.isArray(value) && value.includes(opt.value);
            return (
              <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
                <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all", checked ? "border-[var(--form-primary)] bg-[var(--form-primary)]" : "border-[rgba(191,200,199,0.5)]")}>
                  {checked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                </div>
                <input type="checkbox" value={opt.value} checked={checked} onChange={e => {
                  const current = Array.isArray(value) ? value : [];
                  onChange(e.target.checked ? [...current, opt.value] : current.filter(v => v !== opt.value));
                }} className="sr-only" />
                <span className="text-sm" style={{ color: theme.textColor }}>{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    case "dropdown":
      return (
        <div className="relative">
          <select value={(value as string) || ""} onChange={e => onChange(e.target.value)} className={inputClass} style={{ ...inputStyle, appearance: "none" }}>
            <option value="">Select an option</option>
            {(question.options || []).map(opt => <option key={opt.id} value={opt.value}>{opt.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: theme.textColor }} />
        </div>
      );
    case "rating":
      const max = question.settings?.max || 5;
      const ratingVal = parseInt((value as string) || "0");
      return (
        <div className="flex gap-2">
          {Array.from({ length: max }).map((_, i) => (
            <button key={i} type="button" onClick={() => onChange(String(i + 1))} className="transition-transform hover:scale-110">
              <Star className={cn("h-8 w-8", i < ratingVal ? "fill-[#f9bc60] text-[#f9bc60]" : "text-[rgba(191,200,199,0.5)]")} />
            </button>
          ))}
        </div>
      );
    case "date":
      return <input type="date" value={(value as string) || ""} onChange={e => onChange(e.target.value)} className={inputClass} style={inputStyle} />;
    case "time":
      return <input type="time" value={(value as string) || ""} onChange={e => onChange(e.target.value)} className={inputClass} style={inputStyle} />;
    case "number":
      return <input type="number" value={(value as string) || ""} onChange={e => onChange(e.target.value)} placeholder={question.placeholder || ""} className={inputClass} style={inputStyle} />;
    case "email":
      return <input type="email" value={(value as string) || ""} onChange={e => onChange(e.target.value)} placeholder={question.placeholder || "you@example.com"} className={inputClass} style={inputStyle} />;
    case "phone":
      return <input type="tel" value={(value as string) || ""} onChange={e => onChange(e.target.value)} placeholder={question.placeholder || "+91 "} className={inputClass} style={inputStyle} />;
    case "file_upload":
      return (
        <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed cursor-pointer hover:opacity-80 transition-opacity" style={{ borderColor: "rgba(191,200,199,0.5)", borderRadius: theme.borderRadius }}>
          <Upload className="h-8 w-8 mb-2 opacity-40" style={{ color: theme.textColor }} />
          <span className="text-sm opacity-60" style={{ color: theme.textColor }}>Click to upload</span>
          <input type="file" onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0].name); }} className="sr-only" accept={question.settings?.accept} />
        </label>
      );
    case "image_choice":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(question.options || []).map(opt => (
            <label key={opt.id} className="cursor-pointer group">
              <div className={cn("border-2 rounded-xl overflow-hidden transition-all", value === opt.value ? "border-[var(--form-primary)]" : "border-[rgba(191,200,199,0.3)] hover:border-[rgba(191,200,199,0.7)]")}>
                <div className="h-40 bg-[#f6f3eb] flex items-center justify-center relative overflow-hidden">
                  {opt.imageUrl ? (
                    <img src={opt.imageUrl} alt={opt.label} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm opacity-40">No Image</span>
                  )}
                  {value === opt.value && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--form-primary)] rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="p-3 text-center text-sm font-medium" style={{ color: theme.textColor }}>
                  {opt.label}
                </div>
              </div>
              <input type="radio" value={opt.value} checked={value === opt.value} onChange={e => onChange(e.target.value)} className="sr-only" />
            </label>
          ))}
        </div>
      );
    case "slider":
      return (
        <div className="pt-6 pb-2 px-2">
          <input
            type="range"
            min={question.settings?.min || 0}
            max={question.settings?.max || 100}
            step={question.settings?.step || 1}
            value={value || question.settings?.min || 0}
            onChange={e => onChange(e.target.value)}
            className="w-full accent-[var(--form-primary)]"
          />
          <div className="flex justify-between mt-2 text-xs opacity-60" style={{ color: theme.textColor }}>
            <span>{question.settings?.min || 0}</span>
            <span>{question.settings?.max || 100}</span>
          </div>
        </div>
      );
    case "matrix":
      const rows = question.settings?.matrixRows || ["Row 1"];
      const columns = question.settings?.matrixColumns || ["Col 1"];
      const isMulti = question.settings?.matrixMultipleChoice || false;
      const matrixVal = value || {};

      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr>
                <th className="p-3 font-medium opacity-60 w-1/3"></th>
                {columns.map((col: string, i: number) => (
                  <th key={i} className="p-3 text-center font-medium opacity-60" style={{ color: theme.textColor }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: string, rIdx: number) => (
                <tr key={rIdx} className="border-t transition-colors hover:bg-black/5" style={{ borderColor: "rgba(191,200,199,0.2)" }}>
                  <td className="p-3 font-medium text-sm" style={{ color: theme.textColor }}>{row}</td>
                  {columns.map((col: string, cIdx: number) => {
                    const checked = isMulti ? !!matrixVal[row]?.includes(col) : matrixVal[row] === col;
                    return (
                      <td key={cIdx} className="p-3 text-center relative cursor-pointer" onClick={() => {
                        if (isMulti) {
                          const existing = matrixVal[row] || [];
                          const newVal = existing.includes(col) ? existing.filter((c: string) => c !== col) : [...existing, col];
                          onChange({ ...matrixVal, [row]: newVal });
                        } else {
                          onChange({ ...matrixVal, [row]: col });
                        }
                      }}>
                        <div className={cn(
                          "w-5 h-5 mx-auto flex items-center justify-center transition-all",
                          isMulti ? "rounded-md border-2" : "rounded-full border-2",
                          checked ? "border-[var(--form-primary)] bg-[var(--form-primary)]" : "border-[rgba(191,200,199,0.5)]"
                        )}>
                          {checked && (
                            isMulti ? <CheckCircle2 className="h-3.5 w-3.5 text-white" /> : <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "signature":
      return (
        <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed relative bg-[rgba(255,255,255,0.5)]" style={{ borderColor: "rgba(191,200,199,0.5)", borderRadius: theme.borderRadius }}>
          <div className="absolute inset-x-8 bottom-12 border-b-2 border-[rgba(191,200,199,0.3)]"></div>
          {value ? (
            <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl italic opacity-80" style={{ color: theme.textColor }}>
              {value}
            </div>
          ) : (
            <span className="text-sm opacity-40 font-mono tracking-widest uppercase mb-4" style={{ color: theme.textColor }}>Sign Here (Demo: Type Name)</span>
          )}
          <input 
            type="text" 
            placeholder="Type your signature..." 
            value={value || ""} 
            onChange={e => onChange(e.target.value)}
            className="absolute bottom-2 w-3/4 max-w-xs px-3 py-1.5 text-sm text-center border rounded-lg outline-none bg-white shadow-sm"
          />
        </div>
      );
    case "address":
      const addrVal = value || {};
      const parts = question.settings?.addressParts || {};
      return (
        <div className="space-y-3">
          <input type="text" placeholder="Street Address" value={addrVal.line1 || ""} onChange={e => onChange({ ...addrVal, line1: e.target.value })} className={inputClass} style={inputStyle} />
          {parts.line2 !== false && (
            <input type="text" placeholder="Apartment, suite, etc." value={addrVal.line2 || ""} onChange={e => onChange({ ...addrVal, line2: e.target.value })} className={inputClass} style={inputStyle} />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="City" value={addrVal.city || ""} onChange={e => onChange({ ...addrVal, city: e.target.value })} className={inputClass} style={inputStyle} />
            {parts.state !== false && (
              <input type="text" placeholder="State / Province" value={addrVal.state || ""} onChange={e => onChange({ ...addrVal, state: e.target.value })} className={inputClass} style={inputStyle} />
            )}
            <input type="text" placeholder="Postal / Zip Code" value={addrVal.zip || ""} onChange={e => onChange({ ...addrVal, zip: e.target.value })} className={inputClass} style={inputStyle} />
            {parts.country !== false && (
              <input type="text" placeholder="Country" value={addrVal.country || ""} onChange={e => onChange({ ...addrVal, country: e.target.value })} className={inputClass} style={inputStyle} />
            )}
          </div>
        </div>
      );
    case "nps":
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-between">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={cn(
                  "flex-1 sm:flex-none aspect-square sm:aspect-auto sm:w-10 sm:h-12 rounded-lg border-2 flex items-center justify-center font-semibold text-lg sm:text-base transition-all hover:-translate-y-1",
                  value === n ? "border-[var(--form-primary)] bg-[var(--form-primary)] text-white shadow-md" : "border-[rgba(191,200,199,0.3)] bg-white hover:bg-[rgba(191,200,199,0.1)]"
                )}
                style={{ color: value === n ? "white" : theme.textColor }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs opacity-60 font-medium px-1" style={{ color: theme.textColor }}>
            <span>0 - {question.settings?.npsLowLabel || 'Not likely at all'}</span>
            <span>10 - {question.settings?.npsHighLabel || 'Extremely likely'}</span>
          </div>
        </div>
      );
    default:
      return <input type="text" value={(value as string) || ""} onChange={e => onChange(e.target.value)} placeholder={question.placeholder || ""} className={inputClass} style={inputStyle} />;
  }
}

export function PublicFormClient({ form, questions, isPreview = false }: Props) {
  const welcomeScreen = questions.find(q => q.type === "welcome_screen");
  const endScreen = questions.find(q => q.type === "end_screen");
  const regularQuestions = questions.filter(q => !["welcome_screen", "end_screen"].includes(q.type));

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(!welcomeScreen);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const theme = form.theme;
  const settings = form.settings;
  
  const { visibleQuestionIds } = evaluateFormLogic(regularQuestions, answers);
  const logicallyVisibleQuestions = regularQuestions.filter(q => visibleQuestionIds.has(q.id));
  const visibleQuestions = logicallyVisibleQuestions.filter(q => q.type !== "section_break" && q.type !== "statement");
  
  const answered = Object.keys(answers).filter(id => visibleQuestionIds.has(id)).length;
  const progress = visibleQuestions.length > 0 ? Math.round((answered / visibleQuestions.length) * 100) : 0;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    logicallyVisibleQuestions.forEach(q => {
      if (q.is_required && !["section_break", "statement"].includes(q.type)) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          newErrors[q.id] = "This field is required";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (isPreview) {
      toast.success("Preview mode: Form would be submitted successfully.");
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    try {
      const device = getDeviceInfo();
      const answersList = Object.entries(answers).map(([question_id, value]) => ({
        question_id,
        value: Array.isArray(value) ? undefined : value,
        values: Array.isArray(value) ? value : undefined,
      }));

      const res = await fetch(`/api/forms/${form.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersList, metadata: device }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSubmitted(true);
      if (settings.redirectUrl) window.location.href = settings.redirectUrl;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    if (endScreen) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily }}>
          <div className="max-w-2xl w-full text-center">
            <h1 className="font-bold text-4xl md:text-5xl mb-6" style={{ color: theme.textColor }}>{endScreen.title}</h1>
            {endScreen.description && <p className="text-lg md:text-xl opacity-80" style={{ color: theme.textColor }}>{endScreen.description}</p>}
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily }}>
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-md border border-[rgba(191,200,199,0.3)]">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="font-bold text-2xl mb-3" style={{ color: theme.textColor }}>{form.thank_you_message}</h2>
          <p className="text-sm opacity-60" style={{ color: theme.textColor }}>Your response has been recorded.</p>
        </div>
      </div>
    );
  }

  if (!started && welcomeScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily }}>
        <div className="max-w-2xl w-full text-center">
          <h1 className="font-bold text-4xl md:text-5xl mb-6" style={{ color: theme.textColor }}>{welcomeScreen.title || form.title}</h1>
          <p className="text-lg md:text-xl opacity-80 mb-10" style={{ color: theme.textColor }}>{welcomeScreen.description || form.description}</p>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-2 transition-transform hover:scale-105"
            style={{ backgroundColor: theme.buttonColor, color: "#1c1c17", borderRadius: theme.borderRadius }}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily }}>
      {/* Progress bar */}
      {settings.showProgressBar && (
        <div className="fixed top-0 left-0 right-0 h-1 z-10" style={{ backgroundColor: "rgba(191,200,199,0.3)" }}>
          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: theme.primaryColor }} />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Form Header */}
        <div className="mb-8">
          <h1 className="font-bold text-3xl mb-3" style={{ color: theme.textColor }}>{form.title}</h1>
          {form.description && <p className="text-base opacity-70" style={{ color: theme.textColor }}>{form.description}</p>}
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {logicallyVisibleQuestions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(191,200,199,0.3)]" style={{ borderRadius: theme.borderRadius }}>
              {!["section_break", "statement"].includes(q.type) && (
                <label className="block font-semibold text-base mb-3" style={{ color: theme.textColor }}>
                  {q.title}
                  {q.is_required && <span style={{ color: "#ef4444" }} className="ml-1">*</span>}
                </label>
              )}
              {q.description && !["section_break", "statement"].includes(q.type) && (
                <p className="text-sm opacity-60 mb-3" style={{ color: theme.textColor }}>{q.description}</p>
              )}
              <QuestionInput
                question={q}
                value={answers[q.id]}
                onChange={(val) => {
                  setAnswers(prev => ({ ...prev, [q.id]: val }));
                  if (errors[q.id]) setErrors(prev => { const n = { ...prev }; delete n[q.id]; return n; });
                }}
                theme={theme}
              />
              {errors[q.id] && <p className="mt-2 text-xs text-red-500">{errors[q.id]}</p>}
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-4 rounded-xl font-bold text-base flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: theme.buttonColor, color: "#1c1c17", borderRadius: theme.borderRadius }}
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {submitting ? "Submitting..." : "Submit Form"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs opacity-40" style={{ color: theme.textColor }}>Powered by Blazion Forms</p>
        </div>
      </div>
    </div>
  );
}
