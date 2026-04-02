import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";

export default async function NewFormPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Ensure profile exists
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) {
    await supabase.from("profiles").upsert({ id: user.id, email: user.email, full_name: user.user_metadata?.full_name });
  }

  const slug = generateSlug("untitled-form");
  const { data: form } = await supabase
    .from("forms")
    .insert({ user_id: user.id, title: "Untitled Form", slug })
    .select()
    .single();

  if (!form) redirect("/forms");

  redirect(`/forms/${form.id}/edit`);
}
