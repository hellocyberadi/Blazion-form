"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search, LayoutGrid, List, Filter, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { FormCard } from "@/components/dashboard/FormCard";
import type { Form } from "@/types";

type SortOption = "newest" | "oldest" | "az" | "za";
type FilterTab = "all" | "active" | "inactive";

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});

  const fetchForms = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load forms"); return; }
    setForms(data || []);

    const ids = (data || []).map(f => f.id);
    if (ids.length > 0) {
      const { data: rc } = await supabase.from("responses").select("form_id").in("form_id", ids);
      const counts: Record<string, number> = {};
      (rc || []).forEach(r => { counts[r.form_id] = (counts[r.form_id] || 0) + 1; });
      setResponseCounts(counts);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("forms").delete().eq("id", id);
    if (error) { toast.error("Failed to delete form"); return; }
    toast.success("Form deleted");
    setForms(prev => prev.filter(f => f.id !== id));
  };

  const handleDuplicate = async (form: Form) => {
    const supabase = createClient();
    const { data: newForm, error } = await supabase
      .from("forms")
      .insert({
        user_id: form.user_id,
        title: `${form.title} (Copy)`,
        description: form.description,
        theme: form.theme,
        settings: form.settings,
        thank_you_message: form.thank_you_message,
        slug: `${form.slug || "form"}-copy-${Date.now().toString(36)}`,
      })
      .select()
      .single();
    if (error || !newForm) { toast.error("Failed to duplicate"); return; }

    // Copy questions
    const { data: questions } = await supabase.from("questions").select("*").eq("form_id", form.id).order("order_index");
    if (questions && questions.length > 0) {
      await supabase.from("questions").insert(questions.map(q => ({ ...q, id: undefined, form_id: newForm.id, created_at: undefined })));
    }
    toast.success("Form duplicated!");
    fetchForms();
  };

  const filtered = forms
    .filter(f => {
      if (filter === "active") return f.is_published;
      if (filter === "inactive") return !f.is_published;
      return true;
    })
    .filter(f => !search || f.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "az") return a.title.localeCompare(b.title);
      return b.title.localeCompare(a.title);
    });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-black text-3xl text-[#1c1c17]">My Forms</h1>
          <p className="text-[#404847] mt-1">{forms.length} form{forms.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          href="/forms/new"
          className="flex items-center gap-2 bg-[#002e2c] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#004643] transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create New Form
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707978]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search forms..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(191,200,199,0.5)] bg-white text-[#1c1c17] placeholder:text-[#bfc8c7] outline-none focus:ring-2 focus:ring-[#002e2c] text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as SortOption)}
          className="px-3 py-2.5 rounded-xl border border-[rgba(191,200,199,0.5)] bg-white text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c] cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
        </select>
        <div className="flex rounded-xl border border-[rgba(191,200,199,0.5)] overflow-hidden bg-white">
          {(["grid", "list"] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)} className={`px-3 py-2.5 text-sm transition-colors ${viewMode === v ? "bg-[#002e2c] text-white" : "text-[#404847] hover:bg-[#f6f3eb]"}`}>
              {v === "grid" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 bg-[#f6f3eb] p-1 rounded-xl w-fit">
        {(["all", "active", "inactive"] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filter === tab ? "bg-white text-[#1c1c17] shadow-sm" : "text-[#404847] hover:text-[#1c1c17]"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#002e2c]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[rgba(191,200,199,0.5)] p-16 text-center">
          <div className="w-14 h-14 bg-[#f6f3eb] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7 text-[#404847]" />
          </div>
          <h3 className="font-heading font-bold text-lg text-[#1c1c17] mb-2">
            {search ? "No forms match your search" : "No forms yet"}
          </h3>
          <p className="text-[#404847] text-sm mb-6">
            {search ? "Try a different search term." : "Create your first form and start collecting responses."}
          </p>
          {!search && (
            <Link href="/forms/new" className="inline-flex items-center gap-2 bg-[#002e2c] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#004643] transition-colors">
              <Plus className="h-4 w-4" /> Create Form
            </Link>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
          {filtered.map(form => (
            <FormCard
              key={form.id}
              form={form}
              responseCount={responseCounts[form.id] || 0}
              viewMode={viewMode}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
