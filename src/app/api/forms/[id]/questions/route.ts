import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Question } from "@/types";

interface Params { params: Promise<{ id: string }> }

async function verifyOwnership(supabase: Awaited<ReturnType<typeof createClient>>, formId: string, userId: string) {
  const { data } = await supabase.from("forms").select("user_id").eq("id", formId).single();
  return data?.user_id === userId;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("form_id", id)
    .order("order_index", { ascending: true });

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  return NextResponse.json({ data, error: null });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const isOwner = await verifyOwnership(supabase, id, user.id);
  if (!isOwner) return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { data: lastQ } = await supabase
    .from("questions")
    .select("order_index")
    .eq("form_id", id)
    .order("order_index", { ascending: false })
    .limit(1)
    .single();

  const orderIndex = (lastQ?.order_index ?? -1) + 1;

  const { data, error } = await supabase
    .from("questions")
    .insert({ ...body, form_id: id, order_index: orderIndex })
    .select()
    .single();

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  return NextResponse.json({ data, error: null }, { status: 201 });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const isOwner = await verifyOwnership(supabase, id, user.id);
  if (!isOwner) return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

  const { questions }: { questions: Partial<Question>[] } = await request.json();

  // Bulk update order indices
  const updates = questions.map(async (q, i) => {
    if (!q.id) return;
    return supabase.from("questions").update({ order_index: i }).eq("id", q.id);
  });
  await Promise.all(updates);

  return NextResponse.json({ data: { reordered: true }, error: null });
}
