"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, Sparkles, FileText } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";
import { generateSlug } from "@/lib/utils";
import TEMPLATES from "@/lib/templates.json";
import type { Template } from "@/types";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState<string | null>(null);

  const filtered = (TEMPLATES as Template[]).filter(t =>
    (category === "All" || t.category === category) &&
    (!search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleUseTemplate = async (template: Template) => {
    setCreating(template.id);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: form, error } = await supabase.from("forms").insert({
      user_id: user.id,
      title: template.name,
      slug: generateSlug(template.name),
    }).select().single();

    if (error || !form) { toast.error("Failed to create form"); setCreating(null); return; }

    if (template.questions.length > 0) {
      const questions = template.questions.map((q, i) => ({ ...q, form_id: form.id, order_index: i }));
      await supabase.from("questions").insert(questions);
    }

    toast.success("Form created from template!");
    router.push(`/forms/${form.id}/edit`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl text-[#1c1c17]">Templates</h1>
        <p className="text-[#404847] mt-1">Start from a pre-built form and customize it.</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707978]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full max-w-md pl-9 pr-4 py-2.5 rounded-xl border border-[rgba(191,200,199,0.5)] bg-white text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TEMPLATE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all border", category === cat ? "bg-[#002e2c] text-white border-[#002e2c]" : "border-[rgba(191,200,199,0.5)] text-[#404847] hover:border-[#002e2c] hover:text-[#002e2c]")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-10 w-10 text-[#404847] mx-auto mb-3 opacity-50" />
          <p className="text-[#404847]">No templates found for &quot;{search}&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(template => (
            <div key={template.id} className="bg-white rounded-2xl border border-[rgba(191,200,199,0.3)] overflow-hidden hover:shadow-md transition-all group">
              {/* Cover */}
              <div className="h-28 flex items-center justify-center" style={{ backgroundColor: template.coverColor }}>
                <FileText className="h-10 w-10 text-white opacity-50" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold text-[#002e2c] bg-[#002e2c]/10 px-2 py-0.5 rounded-full">{template.category}</span>
                    <h3 className="font-heading font-bold text-[#1c1c17] mt-2">{template.name}</h3>
                  </div>
                  <span className="text-xs text-[#707978] flex-shrink-0 ml-2">{template.questionCount} questions</span>
                </div>
                <p className="text-xs text-[#404847] mb-4 line-clamp-2">{template.description}</p>
                <button
                  onClick={() => handleUseTemplate(template)}
                  disabled={creating === template.id}
                  className="w-full py-2.5 rounded-xl bg-[#002e2c] text-white text-sm font-semibold hover:bg-[#004643] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {creating === template.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-[#f9bc60]" />}
                  {creating === template.id ? "Creating..." : "Use Template"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
