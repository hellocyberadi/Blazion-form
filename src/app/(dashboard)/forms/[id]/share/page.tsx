import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SharePageClient } from "./client";

interface Props { params: Promise<{ id: string }> }

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: form } = await supabase.from("forms").select("*").eq("id", id).eq("user_id", user.id).single();
  if (!form) notFound();

  return <SharePageClient form={form} />;
}
