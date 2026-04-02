import { QuestionType } from '@/types';
import {
  Type, AlignLeft, Hash, Mail, Phone, CheckSquare,
  List, ChevronDown, Calendar, Clock, Upload, Star,
  Minus, MessageSquare, RadioIcon, Image as ImageIcon, SlidersHorizontal,
  Grid3X3, PenTool, MapPin, Smile, PanelTop, PanelBottom
} from 'lucide-react';

export const QUESTION_TYPE_META: Record<QuestionType, {
  label: string;
  icon: typeof Type;
  group: string;
  description: string;
}> = {
  short_text:      { label: 'Short Text',       icon: Type,          group: 'Basic',     description: 'Single line text input' },
  long_text:       { label: 'Long Text',         icon: AlignLeft,     group: 'Basic',     description: 'Multi-line text area' },
  number:          { label: 'Number',            icon: Hash,          group: 'Basic',     description: 'Numeric input' },
  email:           { label: 'Email',             icon: Mail,          group: 'Basic',     description: 'Email address input' },
  phone:           { label: 'Phone',             icon: Phone,         group: 'Basic',     description: 'Indian phone number (+91)' },
  multiple_choice: { label: 'Multiple Choice',   icon: RadioIcon,     group: 'Choice',    description: 'Single select radio buttons' },
  checkboxes:      { label: 'Checkboxes',        icon: CheckSquare,   group: 'Choice',    description: 'Multiple select checkboxes' },
  dropdown:        { label: 'Dropdown',          icon: ChevronDown,   group: 'Choice',    description: 'Select from dropdown' },
  date:            { label: 'Date',              icon: Calendar,      group: 'Date & Time', description: 'Date picker (DD/MM/YYYY)' },
  time:            { label: 'Time',              icon: Clock,         group: 'Date & Time', description: '12-hour time picker' },
  file_upload:     { label: 'File Upload',       icon: Upload,        group: 'Advanced',  description: 'Drag & drop file upload' },
  rating:          { label: 'Star Rating',       icon: Star,          group: 'Advanced',  description: '1-5 star rating' },
  section_break:   { label: 'Section Break',     icon: Minus,         group: 'Advanced',  description: 'Visual separator with title' },
  statement:       { label: 'Statement',         icon: MessageSquare, group: 'Advanced',  description: 'Text block / instructions' },
  image_choice:    { label: 'Image Choice',      icon: ImageIcon,     group: 'Choice',    description: 'Select from images' },
  slider:          { label: 'Slider',            icon: SlidersHorizontal,group: 'Advanced', description: 'Range slider' },
  matrix:          { label: 'Grid / Matrix',     icon: Grid3X3,       group: 'Advanced',  description: 'Multiple rows/columns' },
  signature:       { label: 'Signature',         icon: PenTool,       group: 'Special',   description: 'Digital signature pad' },
  address:         { label: 'Address',           icon: MapPin,        group: 'Special',   description: 'Structured address fields' },
  nps:             { label: 'NPS',               icon: Smile,         group: 'Special',   description: 'Net Promoter Score (0-10)' },
  welcome_screen:  { label: 'Welcome Screen',    icon: PanelTop,      group: 'Layout',    description: 'Form landing page' },
  end_screen:      { label: 'End Screen',        icon: PanelBottom,   group: 'Layout',    description: 'Thank you page' },
};

export const QUESTION_GROUPS = ['Basic', 'Choice', 'Date & Time', 'Advanced', 'Special', 'Layout'];

// Ordered list for sidebar display
export const ORDERED_QUESTION_TYPES: QuestionType[] = [
  'short_text', 'long_text', 'number', 'email', 'phone',
  'multiple_choice', 'image_choice', 'checkboxes', 'dropdown',
  'date', 'time',
  'file_upload', 'rating', 'slider', 'matrix', 'section_break', 'statement',
  'signature', 'address', 'nps',
  'welcome_screen', 'end_screen',
];

export const DEFAULT_FORM_THEME = {
  primaryColor: '#002e2c',
  backgroundColor: '#fcf9f1',
  textColor: '#1c1c17',
  buttonColor: '#f9bc60',
  fontFamily: 'Inter',
  borderRadius: '8px',
};

export const DEFAULT_FORM_SETTINGS = {
  isActive: true,
  requireLogin: false,
  allowMultipleResponses: true,
  showProgressBar: true,
  redirectUrl: null,
  passwordProtected: false,
  password: null,
  responseLimit: null,
  expiresAt: null,
  notifyOnResponse: false,
};

export const TEMPLATE_CATEGORIES = [
  'All', 'HR', 'Business', 'Events', 'Education',
  'Personal', 'Healthcare', 'Government', 'Feedback',
];

export const THEME_PRESETS = [
  { name: 'Blazion Default', primaryColor: '#002e2c', backgroundColor: '#fcf9f1', textColor: '#1c1c17', buttonColor: '#f9bc60', fontFamily: 'Inter', borderRadius: '8px' },
  { name: 'Sand', primaryColor: '#004643', backgroundColor: '#F0EDE5', textColor: '#002220', buttonColor: '#F9BC60', fontFamily: 'Inter', borderRadius: '8px' },
  { name: 'Ocean', primaryColor: '#0369a1', backgroundColor: '#f0f9ff', textColor: '#0c4a6e', buttonColor: '#38bdf8', fontFamily: 'Inter', borderRadius: '8px' },
  { name: 'Forest', primaryColor: '#15803d', backgroundColor: '#f0fdf4', textColor: '#14532d', buttonColor: '#86efac', fontFamily: 'Inter', borderRadius: '8px' },
  { name: 'Sunset', primaryColor: '#c2410c', backgroundColor: '#fff7ed', textColor: '#7c2d12', buttonColor: '#fb923c', fontFamily: 'Inter', borderRadius: '8px' },
  { name: 'Purple', primaryColor: '#7c3aed', backgroundColor: '#faf5ff', textColor: '#4c1d95', buttonColor: '#c4b5fd', fontFamily: 'Inter', borderRadius: '8px' },
  { name: 'Pink', primaryColor: '#be185d', backgroundColor: '#fdf2f8', textColor: '#831843', buttonColor: '#f9a8d4', fontFamily: 'Inter', borderRadius: '8px' },
  { name: 'Minimal', primaryColor: '#111827', backgroundColor: '#ffffff', textColor: '#111827', buttonColor: '#374151', fontFamily: 'Inter', borderRadius: '4px' },
  { name: 'Saffron', primaryColor: '#b45309', backgroundColor: '#fffbeb', textColor: '#78350f', buttonColor: '#fbbf24', fontFamily: 'Inter', borderRadius: '8px' },
  { name: 'Tricolor', primaryColor: '#15803d', backgroundColor: '#fff7ed', textColor: '#1c1c17', buttonColor: '#f97316', fontFamily: 'Inter', borderRadius: '8px' },
];

export const FONT_OPTIONS = ['Inter', 'Plus Jakarta Sans', 'Poppins', 'Nunito', 'Roboto'];

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
