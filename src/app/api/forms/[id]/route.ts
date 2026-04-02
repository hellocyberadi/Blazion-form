import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: form, error } = await supabase
    .from("forms")
    .select("*, questions(*)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 404 });
  return NextResponse.json({ data: form, error: null });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: form } = await supabase.from("forms").select("user_id").eq("id", id).single();
  if (!form || form.user_id !== user.id) return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

  const updates = await request.json();
  const { data, error } = await supabase
    .from("forms")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  return NextResponse.json({ data, error: null });
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const { data: form } = await supabase.from("forms").select("user_id").eq("id", id).single();
  if (!form || form.user_id !== user.id) return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("forms").delete().eq("id", id);
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  return NextResponse.json({ data: { deleted: true }, error: null });
}
