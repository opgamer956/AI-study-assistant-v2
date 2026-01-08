
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export type Language = 'bn' | 'en';

export enum StudyMode {
  EXPLANATION = 'explanation', // 📖 EXPLANATION MODE
  TEXTBOOK = 'textbook',       // 📘 TEXTBOOK NAV (#1)
  SUMMARY = 'summary',         // 📝 SUMMARY MODE
  QUIZ = 'quiz',               // ❓ QUIZ MODE
  RECALL = 'recall',           // 🧠 ACTIVE RECALL (#7)
  COACH = 'coach',             // ✍️ ANSWER COACH (#4)
  STUDY_PLAN = 'study_plan',   // 📅 STUDY PLAN (#6)
  VOICE_TUTOR = 'voice_tutor', // 🎧 VOICE TUTOR (#5)
  ANALYSIS = 'analysis',       // 📊 WEAK-AREA ANALYSIS
  STRATEGY = 'strategy',       // 🎯 STRATEGY (#9)
  TUTOR = 'tutor',             // 🤩 FUN TUTOR MODE
  IMAGE_GENERATION = 'image_generation', // 🎨 AI IMAGE GENERATOR
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string; // Base64 (User Input)
  generatedImages?: string[]; // Array of Base64 strings (AI Output)
  audio?: boolean; // If true, this message has associated audio data
  audioData?: Uint8Array; // Raw PCM data for playback
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: Message[];
  mode: StudyMode;
}

export interface Extension {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  icon: string;
}

export interface AppState {
  messages: Message[];
  isLoading: boolean;
  currentMode: StudyMode;
  input: string;
}

export interface GeminiConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
}
