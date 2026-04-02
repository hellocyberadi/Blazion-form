import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicFormClient } from "./client";

interface Props { params: Promise<{ slug: string }> }

export default async function PublicFormPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: form } = await supabase
    .from("forms")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!form) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("form_id", form.id)
    .order("order_index", { ascending: true });

  return (
    <PublicFormClient
      form={form}
      questions={(questions || []).filter(q => !["section_break"].includes(q.type) || true)}
    />
  );
}
