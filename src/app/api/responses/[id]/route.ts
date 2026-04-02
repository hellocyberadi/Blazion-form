import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params { params: Promise<{ id: string }> }

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  // Verify ownership through form
  const { data: resp } = await supabase
    .from("responses")
    .select("id, forms(user_id)")
    .eq("id", id)
    .single();

  const respWithOwner = resp as { id: string; forms: { user_id: string } } | null;
  if (!respWithOwner || respWithOwner.forms?.user_id !== user.id) {
    return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("responses").delete().eq("id", id);
  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });
  return NextResponse.json({ data: { deleted: true }, error: null });
}
