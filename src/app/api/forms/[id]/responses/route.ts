import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify ownership
  const { data: form } = await supabase.from("forms").select("user_id").eq("id", id).single();
  if (!form || (user && form.user_id !== user.id)) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const search = url.searchParams.get("search") || "";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let query = supabase
    .from("responses")
    .select("*, answers(*)", { count: "exact" })
    .eq("form_id", id)
    .order("submitted_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (from) query = query.gte("submitted_at", from);
  if (to) query = query.lte("submitted_at", to);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  return NextResponse.json({ data, count, error: null });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  
  // Public endpoint — no auth required
  const supabase = await createClient();

  // Verify form is active and published
  const { data: form } = await supabase
    .from("forms")
    .select("is_published, settings")
    .eq("id", id)
    .single();

  if (!form || !form.is_published) {
    return NextResponse.json({ data: null, error: "Form not found or inactive" }, { status: 404 });
  }

  const settings = form.settings as { isActive?: boolean; expiresAt?: string | null; responseLimit?: number | null };
  if (settings?.isActive === false) {
    return NextResponse.json({ data: null, error: "This form is no longer accepting responses" }, { status: 403 });
  }
  if (settings?.expiresAt && new Date(settings.expiresAt) < new Date()) {
    return NextResponse.json({ data: null, error: "This form has expired" }, { status: 403 });
  }
  if (settings?.responseLimit) {
    const { count } = await supabase.from("responses").select("id", { count: "exact" }).eq("form_id", id);
    if (count && count >= settings.responseLimit) {
      return NextResponse.json({ data: null, error: "Response limit reached" }, { status: 403 });
    }
  }

  const { answers, respondent_email, metadata } = await request.json();

  const { data: response, error: respError } = await supabase
    .from("responses")
    .insert({ form_id: id, respondent_email, metadata: metadata || {} })
    .select()
    .single();

  if (respError) return NextResponse.json({ data: null, error: respError.message }, { status: 500 });

  if (answers && answers.length > 0) {
    const answerRows = answers.map((a: { question_id: string; value?: string; values?: string[]; file_url?: string }) => ({
      response_id: response.id,
      question_id: a.question_id,
      value: a.value,
      values: a.values,
      file_url: a.file_url,
    }));
    await supabase.from("answers").insert(answerRows);
  }

  return NextResponse.json({ data: response, error: null }, { status: 201 });
}
