import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { data: q } = await supabase.from("questions").select("form_id, forms(user_id)").eq("id", id).single();
  const formWithUser = q as { form_id: string; forms: { user_id: string } } | null;
  if (!formWithUser || formWithUser.forms?.user_id !== user.id) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  const updates = await request.json();
  const { data, error } = await supabase.from("questions").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  return NextResponse.json({ data, error: null });
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { data: q } = await supabase.from("questions").select("form_id, order_index, forms(user_id)").eq("id", id).single();
  const qWithOwner = q as { form_id: string; order_index: number; forms: { user_id: string } } | null;
  if (!qWithOwner || qWithOwner.forms?.user_id !== user.id) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  await supabase.from("questions").delete().eq("id", id);

  // Re-index remaining questions
  const { data: remaining } = await supabase
    .from("questions")
    .select("id")
    .eq("form_id", qWithOwner.form_id)
    .order("order_index", { ascending: true });

  if (remaining) {
    await Promise.all(remaining.map((q, i) => supabase.from("questions").update({ order_index: i }).eq("id", q.id)));
  }

  return NextResponse.json({ data: { deleted: true }, error: null });
}
