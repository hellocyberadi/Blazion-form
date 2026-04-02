import { NextRequest, NextResponse } from "next/server";
import { generateFormConfig } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const formConfig = await generateFormConfig(prompt);
    
    // Return the JSON config for the frontend to merge with current form state
    return NextResponse.json(formConfig);
  } catch (error: any) {
    console.error("API Error in generate-form:", error);
    return NextResponse.json({ 
      error: "Failed to generate form", 
      details: error?.message || "Internal server error"
    }, { status: 500 });
  }
}
