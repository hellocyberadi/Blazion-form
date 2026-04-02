import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResponsesPageClient } from "./client";

interface Props { params: Promise<{ id: string }> }

export default async function ResponsesPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: form } = await supabase.from("forms").select("*").eq("id", id).eq("user_id", user.id).single();
  if (!form) notFound();

  const { data: questions } = await supabase.from("questions").select("*").eq("form_id", id).order("order_index");
  const { data: responses, count } = await supabase
    .from("responses")
    .select("*, answers(*)", { count: "exact" })
    .eq("form_id", id)
    .order("submitted_at", { ascending: false })
    .limit(50);

  return (
    <ResponsesPageClient
      form={form}
      questions={questions || []}
      initialResponses={responses || []}
      totalCount={count || 0}
    />
  );
}
