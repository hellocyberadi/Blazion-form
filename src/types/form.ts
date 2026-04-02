export type QuestionType =
  | "short_text"
  | "long_text"
  | "mcq"
  | "checkbox"
  | "dropdown"
  | "date"
  | "time"
  | "file_upload"
  | "rating"
  | "payment"
  | "aadhaar"
  | "pan"
  | "indian_phone"
  | "pincode"
  | "location_selector"
  | "voice_input";

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For MCQ/Dropdown
  helpText?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  metadata?: Record<string, any>; // For specialized fields like UPI ID or specific Aadhaar rules
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: string;
  darkMode: boolean;
}

export interface FormConfig {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  theme: FormTheme;
  settings: {
    allowAiSummary: boolean;
    collectEmail: boolean;
    limitResponses?: number;
    expiryDate?: string;
  };
}
