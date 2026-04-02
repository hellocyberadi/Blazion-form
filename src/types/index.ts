// ── Question Types ────────────────────────────────────────────────────────────
export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'date'
  | 'time'
  | 'number'
  | 'email'
  | 'phone'
  | 'file_upload'
  | 'rating'
  | 'section_break'
  | 'statement'
  | 'image_choice'
  | 'slider'
  | 'matrix'
  | 'signature'
  | 'address'
  | 'nps'
  | 'welcome_screen'
  | 'end_screen';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  imageUrl?: string;
}

export interface QuestionSettings {
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  maxSize?: number;
  allowMultiple?: boolean;
  matrixRows?: string[];
  matrixColumns?: string[];
  matrixMultipleChoice?: boolean;
  npsLowLabel?: string;
  npsHighLabel?: string;
  addressParts?: {
    line2?: boolean;
    city?: boolean;
    state?: boolean;
    zip?: boolean;
    country?: boolean;
  };
}

export interface LogicCondition {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'greater_than' | 'less_than';
  value: string;
}

export interface LogicAction {
  type: 'show' | 'hide' | 'jump_to' | 'end_form';
  targetQuestionId?: string;
}

export interface LogicRule {
  id: string;
  conditions: LogicCondition[];
  conditionType: 'all' | 'any';
  actions: LogicAction[];
}

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string | null;
  placeholder?: string | null;
  is_required: boolean;
  order_index: number;
  options?: QuestionOption[] | null;
  settings?: QuestionSettings | null;
  logic?: LogicRule[] | null;
  created_at?: string;
}

// ── Form ─────────────────────────────────────────────────────────────────────
export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface FormSettings {
  isActive: boolean;
  requireLogin: boolean;
  allowMultipleResponses: boolean;
  showProgressBar: boolean;
  redirectUrl: string | null;
  passwordProtected: boolean;
  password: string | null;
  responseLimit: number | null;
  expiresAt: string | null;
  notifyOnResponse?: boolean;
}

export interface Form {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  cover_image_url?: string | null;
  logo_url?: string | null;
  theme: FormTheme;
  settings: FormSettings;
  thank_you_message: string;
  is_published: boolean;
  slug?: string | null;
  folder_id?: string | null;
  workspace_id?: string | null;
  is_starred?: boolean;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  questions?: Question[];
  _count?: { responses: number };
}

// ── Responses ─────────────────────────────────────────────────────────────────
export interface ResponseMetadata {
  browser?: string;
  os?: string;
  device?: string;
  ip_country?: string;
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  value?: string | null;
  values?: string[] | null;
  file_url?: string | null;
  created_at: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  respondent_email?: string | null;
  metadata: ResponseMetadata;
  submitted_at: string;
  answers?: Answer[];
}

// ── Profile ───────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

// ── Builder ───────────────────────────────────────────────────────────────────
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type BuilderTab = 'build' | 'design' | 'settings' | 'preview';

export interface HistoryEntry {
  title: string;
  description: string | null | undefined;
  questions: Question[];
  theme: FormTheme;
  settings: FormSettings;
  thank_you_message: string;
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface UploadResult {
  url: string;
  path: string;
}

// ── Templates ─────────────────────────────────────────────────────────────────
export type TemplateQuestion = Omit<Question, 'id' | 'form_id' | 'created_at'>;

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  coverColor: string;
  questionCount: number;
  questions: TemplateQuestion[];
}
