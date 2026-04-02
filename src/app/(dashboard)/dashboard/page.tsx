import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateIST, formatRelativeTime } from "@/lib/utils";
import {
  FileText, BarChart3, Zap, Plus, ArrowRight,
  TrendingUp, CheckCircle2
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: forms } = await supabase.from("forms").select("id, title, is_published, created_at, slug").eq("user_id", user.id).order("created_at", { ascending: false });
  
  const formIds = forms?.map(f => f.id) || [];
  const { data: responseCounts } = formIds.length > 0 
    ? await supabase.from("responses").select("form_id").in("form_id", formIds) 
    : { data: [] };

  const totalForms = forms?.length || 0;
  const totalResponses = responseCounts?.length || 0;
  const activeForms = forms?.filter(f => f.is_published).length || 0;
  const recentForms = forms?.slice(0, 4) || [];

  const responsesByForm = (responseCounts || []).reduce<Record<string, number>>((acc, r) => {
    acc[r.form_id] = (acc[r.form_id] || 0) + 1;
    return acc;
  }, {});

  const name = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Total Forms", value: totalForms, icon: FileText, color: "bg-[#002e2c]", iconColor: "text-[#f9bc60]" },
    { label: "Total Responses", value: totalResponses, icon: BarChart3, color: "bg-[#f9bc60]", iconColor: "text-[#002e2c]" },
    { label: "Active Forms", value: activeForms, icon: CheckCircle2, color: "bg-green-600", iconColor: "text-white" },
    { label: "Response Rate", value: totalForms > 0 ? `${Math.round((totalResponses / (totalForms * 10)) * 100)}%` : "—", icon: TrendingUp, color: "bg-[#2e6764]", iconColor: "text-white" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl text-[#1c1c17] mb-1">
          {greeting}, {name}! 👋
        </h1>
        <p className="text-[#404847]">Here&apos;s what&apos;s happening with your forms.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-[rgba(191,200,199,0.3)] shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <div className="text-2xl font-heading font-black text-[#1c1c17]">{stat.value}</div>
            <div className="text-sm text-[#404847] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Forms */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-[#1c1c17]">Recent Forms</h2>
        <Link href="/forms" className="text-sm text-[#002e2c] font-medium hover:underline flex items-center gap-1">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {recentForms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-[rgba(191,200,199,0.5)] p-12 text-center">
          <div className="w-14 h-14 bg-[#f6f3eb] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7 text-[#404847]" />
          </div>
          <h3 className="font-heading font-bold text-lg text-[#1c1c17] mb-2">No forms yet</h3>
          <p className="text-[#404847] text-sm mb-6">Create your first form to start collecting responses.</p>
          <Link href="/forms/new" className="inline-flex items-center gap-2 bg-[#002e2c] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#004643] transition-colors">
            <Plus className="h-4 w-4" /> Create Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {recentForms.map((form) => (
            <div key={form.id} className="bg-white rounded-2xl border border-[rgba(191,200,199,0.3)] p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1c1c17] truncate">{form.title}</h3>
                  <p className="text-xs text-[#707978] mt-0.5">Created {formatDateIST(form.created_at)}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ml-3 flex-shrink-0 ${form.is_published ? "bg-green-50 text-green-700" : "bg-[#f1eee6] text-[#404847]"}`}>
                  {form.is_published ? "Active" : "Draft"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#404847]">
                  <strong className="text-[#1c1c17]">{responsesByForm[form.id] || 0}</strong> responses
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/forms/${form.id}/edit`} className="text-xs text-[#002e2c] font-medium hover:underline">Edit</Link>
                  <Link href={`/forms/${form.id}/responses`} className="text-xs text-[#002e2c] font-medium hover:underline">Responses</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Create */}
      <Link href="/forms/new" className="flex items-center gap-4 bg-[#002e2c] rounded-2xl p-6 hover:bg-[#004643] transition-colors group">
        <div className="w-12 h-12 bg-[rgba(249,188,96,0.2)] rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap className="h-6 w-6 text-[#f9bc60]" />
        </div>
        <div className="flex-1">
          <div className="font-heading font-bold text-white mb-0.5">Create a new form</div>
          <div className="text-sm text-[#98d1cc]">Start from scratch or use the AI generator</div>
        </div>
        <ArrowRight className="h-5 w-5 text-[#f9bc60] transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
