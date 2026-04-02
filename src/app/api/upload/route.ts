import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const bucket = (formData.get("bucket") as string) || "uploads";
  const folder = (formData.get("folder") as string) || user.id;

  if (!file) return NextResponse.json({ data: null, error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop() || "bin";
  const fileName = `${folder}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return NextResponse.json({ data: { url: publicUrl, path: fileName }, error: null }, { status: 201 });
}
