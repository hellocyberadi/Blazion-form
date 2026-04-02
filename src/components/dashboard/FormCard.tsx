"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MoreVertical, Edit2, Share2, Copy, BarChart2, Trash2,
  Eye, Calendar, MessageSquare
} from "lucide-react";
import { formatDateIST } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Form } from "@/types";

interface FormCardProps {
  form: Form;
  responseCount: number;
  viewMode: "grid" | "list";
  onDelete: (id: string) => void;
  onDuplicate: (form: Form) => void;
}

export function FormCard({ form, responseCount, viewMode, onDelete, onDuplicate }: FormCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl border border-[rgba(191,200,199,0.3)] px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-all">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Link href={`/forms/${form.id}/edit`} className="font-semibold text-[#1c1c17] hover:underline truncate">{form.title}</Link>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${form.is_published ? "bg-green-50 text-green-700" : "bg-[#f1eee6] text-[#404847]"}`}>
              {form.is_published ? "Active" : "Draft"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#707978]">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateIST(form.created_at)}</span>
            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{responseCount} responses</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/forms/${form.id}/edit`} className="p-2 rounded-lg hover:bg-[#f6f3eb] text-[#404847] hover:text-[#002e2c] transition-colors"><Edit2 className="h-4 w-4" /></Link>
          <Link href={`/forms/${form.id}/responses`} className="p-2 rounded-lg hover:bg-[#f6f3eb] text-[#404847] hover:text-[#002e2c] transition-colors"><BarChart2 className="h-4 w-4" /></Link>
          <Link href={`/forms/${form.id}/share`} className="p-2 rounded-lg hover:bg-[#f6f3eb] text-[#404847] hover:text-[#002e2c] transition-colors"><Share2 className="h-4 w-4" /></Link>
          <button onClick={() => onDelete(form.id)} className="p-2 rounded-lg hover:bg-red-50 text-[#404847] hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[rgba(191,200,199,0.3)] p-5 hover:shadow-md transition-all group relative">
      {confirmDelete && (
        <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center z-10 p-6 text-center">
          <Trash2 className="h-8 w-8 text-red-500 mb-3" />
          <p className="font-semibold text-[#1c1c17] mb-1">Delete this form?</p>
          <p className="text-xs text-[#404847] mb-4">This cannot be undone. All responses will be lost.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-lg border border-[rgba(191,200,199,0.5)] text-sm font-medium text-[#404847] hover:bg-[#f6f3eb] transition-colors">Cancel</button>
            <button onClick={() => { onDelete(form.id); setConfirmDelete(false); }} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">Delete</button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#f6f3eb] flex items-center justify-center flex-shrink-0">
          <span className="text-lg">📋</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${form.is_published ? "bg-green-50 text-green-700" : "bg-[#f1eee6] text-[#404847]"}`}>
            {form.is_published ? "Active" : "Draft"}
          </span>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-[#f6f3eb] text-[#404847] transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 bg-white rounded-xl border border-[rgba(191,200,199,0.3)] shadow-lg py-1 z-30 w-44">
                  {[
                    { label: "Edit", icon: Edit2, href: `/forms/${form.id}/edit` },
                    { label: "Share", icon: Share2, href: `/forms/${form.id}/share` },
                    { label: "View Responses", icon: BarChart2, href: `/forms/${form.id}/responses` },
                    { label: "Preview", icon: Eye, href: form.slug ? `/f/${form.slug}` : "#", external: true },
                  ].map(action => (
                    <Link
                      key={action.label}
                      href={action.href}
                      target={action.external ? "_blank" : undefined}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#1c1c17] hover:bg-[#f6f3eb] transition-colors"
                    >
                      <action.icon className="h-3.5 w-3.5 text-[#404847]" /> {action.label}
                    </Link>
                  ))}
                  <div className="border-t border-[rgba(191,200,199,0.2)] my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); onDuplicate(form); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#1c1c17] hover:bg-[#f6f3eb] transition-colors w-full"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#404847]" /> Duplicate
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Link href={`/forms/${form.id}/edit`} className="font-heading font-bold text-[#1c1c17] hover:text-[#002e2c] transition-colors line-clamp-2 leading-tight">{form.title}</Link>
        {form.description && <p className="text-xs text-[#404847] mt-1 line-clamp-2">{form.description}</p>}
      </div>

      <div className="flex items-center justify-between text-xs text-[#707978] pt-3 border-t border-[rgba(191,200,199,0.2)]">
        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{responseCount} responses</span>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateIST(form.created_at)}</span>
      </div>
    </div>
  );
}
