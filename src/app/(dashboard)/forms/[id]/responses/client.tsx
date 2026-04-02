"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Trash2, Search, BarChart2, List, Eye, X, Calendar, User } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatDateTimeIST } from "@/lib/utils";
import type { Form, Question, FormResponse, Answer } from "@/types";

interface Props {
  form: Form;
  questions: Question[];
  initialResponses: FormResponse[];
  totalCount: number;
}

export function ResponsesPageClient({ form, questions, initialResponses, totalCount }: Props) {
  const [responses, setResponses] = useState<FormResponse[]>(initialResponses);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "charts">("table");

  const filterable = questions.filter(q => !["section_break", "statement"].includes(q.type));

  const getAnswerValue = (response: FormResponse, questionId: string): string => {
    const answer = (response.answers || []).find((a: Answer) => a.question_id === questionId);
    if (!answer) return "—";
    if (answer.values && answer.values.length > 0) return answer.values.join(", ");
    return answer.value || "—";
  };

  const handleDeleteResponse = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("responses").delete().eq("id", id);
    if (error) { toast.error("Failed to delete response"); return; }
    setResponses(prev => prev.filter(r => r.id !== id));
    if (selectedResponse?.id === id) setSelectedResponse(null);
    toast.success("Response deleted");
  };

  const exportToExcel = () => {
    const rows = responses.map(r => {
      const row: Record<string, string> = {
        "Submitted At": formatDateTimeIST(r.submitted_at),
        "Email": r.respondent_email || "",
      };
      filterable.forEach(q => { row[q.title] = getAnswerValue(r, q.id); });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Responses");
    XLSX.writeFile(wb, `${form.title || "responses"}.xlsx`);
    toast.success("Exported to Excel!");
  };

  const filtered = responses.filter(r =>
    !search ||
    r.respondent_email?.toLowerCase().includes(search.toLowerCase()) ||
    (r.answers || []).some((a: Answer) => a.value?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(191,200,199,0.3)] px-8 py-5 flex items-center gap-4">
        <Link href={`/forms/${form.id}/edit`} className="text-[#707978] hover:text-[#002e2c] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading font-black text-xl text-[#1c1c17]">{form.title}</h1>
          <p className="text-sm text-[#404847]">{totalCount} response{totalCount !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-xl border border-[rgba(191,200,199,0.5)] overflow-hidden">
            {(["table", "charts"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-sm font-medium transition-colors capitalize flex items-center gap-1.5 ${view === v ? "bg-[#002e2c] text-white" : "text-[#404847] hover:bg-[#f6f3eb]"}`}>
                {v === "table" ? <List className="h-4 w-4" /> : <BarChart2 className="h-4 w-4" />}
                {v}
              </button>
            ))}
          </div>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-[#f6f3eb] border border-[rgba(191,200,199,0.5)] text-[#1c1c17] rounded-xl text-sm font-medium hover:bg-[#002e2c] hover:text-white transition-all">
            <Download className="h-4 w-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-[rgba(191,200,199,0.2)] px-8 py-4 grid grid-cols-4 gap-6">
        {[
          { label: "Total Responses", value: totalCount },
          { label: "This Week", value: responses.filter(r => new Date(r.submitted_at) > new Date(Date.now() - 7 * 86400000)).length },
          { label: "Today", value: responses.filter(r => new Date(r.submitted_at).toDateString() === new Date().toDateString()).length },
          { label: "With Email", value: responses.filter(r => r.respondent_email).length },
        ].map(stat => (
          <div key={stat.label}>
            <div className="text-2xl font-heading font-black text-[#1c1c17]">{stat.value}</div>
            <div className="text-xs text-[#707978]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707978]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search responses..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(191,200,199,0.5)] bg-white text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 bg-[#f6f3eb] rounded-2xl flex items-center justify-center mb-4">
                <BarChart2 className="h-7 w-7 text-[#404847]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1c1c17] mb-2">No responses yet</h3>
              <p className="text-sm text-[#404847]">Share your form to start collecting responses.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[rgba(191,200,199,0.3)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(191,200,199,0.2)]">
                      <th className="text-left text-xs font-bold text-[#707978] uppercase tracking-wide px-4 py-3">Submitted</th>
                      {filterable.slice(0, 3).map(q => (
                        <th key={q.id} className="text-left text-xs font-bold text-[#707978] uppercase tracking-wide px-4 py-3 max-w-[200px]">
                          {q.title.length > 20 ? q.title.substring(0, 20) + "…" : q.title}
                        </th>
                      ))}
                      <th className="px-4 py-3 w-20" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(response => (
                      <tr key={response.id} className="border-b border-[rgba(191,200,199,0.1)] hover:bg-[#f6f3eb] transition-colors cursor-pointer" onClick={() => setSelectedResponse(response)}>
                        <td className="px-4 py-3 text-sm text-[#404847] whitespace-nowrap">{formatDateTimeIST(response.submitted_at)}</td>
                        {filterable.slice(0, 3).map(q => (
                          <td key={q.id} className="px-4 py-3 text-sm text-[#1c1c17] max-w-[200px] truncate">
                            {getAnswerValue(response, q.id)}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={e => { e.stopPropagation(); setSelectedResponse(response); }} className="p-1.5 rounded hover:bg-[#e8e5dd] text-[#707978]">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); handleDeleteResponse(response.id); }} className="p-1.5 rounded hover:bg-red-50 text-[#707978] hover:text-red-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedResponse && (
          <div className="w-80 flex-shrink-0 bg-white border-l border-[rgba(191,200,199,0.3)] overflow-y-auto">
            <div className="p-4 border-b border-[rgba(191,200,199,0.2)] flex items-center justify-between">
              <h3 className="font-semibold text-[#1c1c17]">Response Detail</h3>
              <button onClick={() => setSelectedResponse(null)} className="text-[#707978] hover:text-[#002e2c]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4 text-xs text-[#707978]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDateTimeIST(selectedResponse.submitted_at)}</span>
              </div>
              {selectedResponse.respondent_email && (
                <div className="flex items-center gap-2 mb-4 text-xs text-[#707978]">
                  <User className="h-3.5 w-3.5" />
                  <span>{selectedResponse.respondent_email}</span>
                </div>
              )}
              <div className="space-y-4">
                {filterable.map(q => (
                  <div key={q.id}>
                    <div className="text-xs font-semibold text-[#707978] uppercase tracking-wide mb-1">{q.title}</div>
                    <div className="text-sm text-[#1c1c17] bg-[#f6f3eb] rounded-lg px-3 py-2">
                      {getAnswerValue(selectedResponse, q.id)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
