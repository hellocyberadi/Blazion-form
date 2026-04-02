import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateFormConfig = async (prompt: string) => {
  const fullPrompt = `
    You are an expert form builder AI. Based on the user description, generate a JSON configuration for a form.
    The output must strictly follow this JSON structure:
    {
      "title": "Form Title",
      "description": "Form Description",
      "questions": [
        {
          "id": "unique-id-1",
          "type": "short_text" | "long_text" | "mcq" | "checkbox" | "dropdown" | "date" | "aadhaar" | "pan" | "indian_phone" | "pincode",
          "label": "Question Label",
          "placeholder": "Placeholder text",
          "required": boolean,
          "options": ["Option 1", "Option 2"] // only for mcq, checkbox, dropdown
        }
      ]
    }

    User Description: ${prompt}
    
    Ensure the form uses Indian-specific field types where appropriate (Aadhaar, PAN, Indian Phone).
    Return ONLY the raw JSON.
  `;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not parse AI response as JSON");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
