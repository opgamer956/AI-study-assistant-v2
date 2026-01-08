import { StudyMode, Language, Extension } from './types';

export const GEMINI_API_KEY = process.env.API_KEY || '';

// Models
export const MODEL_FAST = 'gemini-3-flash-preview';
export const MODEL_COMPLEX = 'gemini-3-pro-preview';
export const MODEL_TTS = 'gemini-2.5-flash-preview-tts';
export const MODEL_IMAGE = 'gemini-2.5-flash-image';

// Audio Settings
export const AUDIO_SAMPLE_RATE_INPUT = 16000;
export const AUDIO_SAMPLE_RATE_OUTPUT = 24000;

export const SYSTEM_INSTRUCTION = `
You are the "NCTB AI Study & Exam Guidance Assistant" for Bangladesh.
Your mission is to help students (Class 1-12) learn better and perform better in exams (SSC, HSC, School Exams) based strictly on the NCTB syllabus.

CORE PROTOCOL: UNIVERSAL SUBJECT RECOGNITION & MAPPING (#1)
Automatically detect the Class, Subject, Chapter, and Topic from the user's input.
Supported Subjects: Bangla, English, Math, Physics, Chemistry, Biology, ICT, BGS, Religion, History, Geography, Civics, Finance, etc.

SUBJECT-SPECIFIC BEHAVIOR RULES (#2):
1.  **Mathematics/Physics/Accounting**: 
    - Provide Step-by-Step solutions.
    - Show formula first, then substitution, then result.
    - Point out common calculation errors (#3).
2.  **Biology/Science**: 
    - Focus on Definitions, Diagrams (describe them), and Cause-Effect.
    - Use flowcharts for processes (e.g., Digestion, Photosynthesis).
3.  **English/Bangla (Language)**: 
    - Focus on Grammar, Sentence Structure, and Vocabulary.
    - For creative questions, provide structured paragraphing (#4).
4.  **Social Science/History/BGS**:
    - Focus on Dates, Key Events, and Linking Facts.
    - Explain the "Why" and "Result" of events.

ETHICS & SAFETY (#12):
- NEVER assist with cheating, copying during exams, or leaking exam questions.
- If asked to write an assignment, provide guidelines/structure/examples, but DO NOT write the full assignment for them.
- Do not handle personal identity documents.

TONE & VOICE:
- Adapt to the user's language (Bangla/English).
- Calm, friendly, supportive.
- Write in short sentences suitable for Text-to-Speech (#5).

OUTPUT FORMATS (Use strictly based on context):
- Topic / বিষয়
- Explanation / ব্যাখ্যা
- Key Formulas/Facts / সূত্র ও তথ্য
- Exam Probables / পরীক্ষায় আসতে পারে
- Strategy / পরামর্শ
`;

export const MODE_LABELS: Record<StudyMode, Record<Language, string>> = {
  [StudyMode.EXPLANATION]: { bn: '📖 ব্যাখ্যা', en: '📖 Explanation' },
  [StudyMode.TEXTBOOK]: { bn: '📘 পাঠ্যবই', en: '📘 Textbook' },
  [StudyMode.SUMMARY]: { bn: '📝 সারাংশ', en: '📝 Summary' },
  [StudyMode.QUIZ]: { bn: '❓ কুইজ', en: '❓ Quiz' },
  [StudyMode.RECALL]: { bn: '🧠 রিকল', en: '🧠 Active Recall' },
  [StudyMode.COACH]: { bn: '✍️ উত্তর লিখন', en: '✍️ Answer Coach' },
  [StudyMode.STUDY_PLAN]: { bn: '📅 রুটিন', en: '📅 Plan' },
  [StudyMode.VOICE_TUTOR]: { bn: '🎧 টিউটর', en: '🎧 Voice Tutor' },
  [StudyMode.ANALYSIS]: { bn: '📊 বিশ্লেষণ', en: '📊 Analysis' },
  [StudyMode.STRATEGY]: { bn: '🎯 কৌশল', en: '🎯 Strategy' },
  [StudyMode.TUTOR]: { bn: '🤩 টিউটার', en: '🤩 Fun Tutor' },
  [StudyMode.IMAGE_GENERATION]: { bn: '🎨 ছবি আঁকা', en: '🎨 Image Gen' },
};

export const MODE_CONFIG: Record<StudyMode, { 
    color: string; 
    icon: string; 
    welcome: Record<Language, string>;
    placeholder: Record<Language, string>;
    suggestions: { label: Record<Language, string>; text: Record<Language, string> }[];
}> = {
  [StudyMode.EXPLANATION]: { 
      color: 'emerald', 
      icon: '📖',
      welcome: { bn: "কোন বিষয়ে ব্যাখ্যা প্রয়োজন? অধ্যায় বা টপিকের নাম বলো।", en: "What topic needs explanation? Name the chapter or topic." },
      placeholder: { bn: "টপিক বা প্রশ্ন লিখুন...", en: "Enter topic or question..." },
      suggestions: [
        { label: { bn: 'সহজ ব্যাখ্যা', en: 'Simple Explain' }, text: { bn: 'এই বিষয়টি খুব সহজ করে বুঝিয়ে দাও।', en: 'Explain this topic in simple terms.' } },
        { label: { bn: 'উদাহরণ দাও', en: 'Give Example' }, text: { bn: 'বাস্তব জীবনের উদাহরণ দিয়ে বোঝাও।', en: 'Explain with a real-life example.' } },
        { label: { bn: 'বিস্তারিত', en: 'In-depth' }, text: { bn: 'এই টপিকের বিস্তারিত আলোচনা করো।', en: 'Provide a detailed explanation of this topic.' } }
      ]
  },
  [StudyMode.TEXTBOOK]: { 
      color: 'blue', 
      icon: '📘',
      welcome: { bn: "তোমার পাঠ্যবইয়ের কোন অংশ বুঝতে পারছ না? পৃষ্ঠা নম্বর বা টপিক বলো।", en: "Which part of your textbook is confusing? Mention page or topic." },
      placeholder: { bn: "পাঠ্যবইয়ের টপিক...", en: "Textbook topic..." },
      suggestions: [
        { label: { bn: 'মূল কথা', en: 'Key Points' }, text: { bn: 'এই অধ্যায়ের মূল কথাগুলো বলো।', en: 'What are the key points of this chapter?' } },
        { label: { bn: 'অনুশীলনী সমাধান', en: 'Exercise Solution' }, text: { bn: 'অনুশীলনীর প্রশ্নগুলোর সমাধান দাও।', en: 'Help me solve the exercise questions.' } },
        { label: { bn: 'সংজ্ঞা', en: 'Definitions' }, text: { bn: 'গুরুত্বপূর্ণ সংজ্ঞাগুলো তালিকা করো।', en: 'List the important definitions.' } }
      ]
  },
  [StudyMode.SUMMARY]: { 
      color: 'amber', 
      icon: '📝',
      welcome: { bn: "কোন বড় লেখা ছোট করে বুঝতে চাও? লেখাটি এখানে দাও।", en: "Need a summary? Paste the text or topic here." },
      placeholder: { bn: "বড় লেখা বা টপিক...", en: "Long text or topic..." },
      suggestions: [
        { label: { bn: 'বুলেট পয়েন্ট', en: 'Bullet Points' }, text: { bn: 'বুলেট পয়েন্ট আকারে সারাংশ দাও।', en: 'Summarize in bullet points.' } },
        { label: { bn: 'এক কথায়', en: 'In 1 Sentence' }, text: { bn: 'এক বাক্যে মূল ভাব বলো।', en: 'Summarize the main idea in one sentence.' } },
        { label: { bn: 'সারাংশ', en: 'Summary' }, text: { bn: 'বিষয়টির সারাংশ তৈরি করো।', en: 'Write a summary of this topic.' } }
      ]
  },
  [StudyMode.QUIZ]: { 
      color: 'violet', 
      icon: '❓',
      welcome: { bn: "কোন বিষয়ে কুইজ দিতে চাও? আমি প্রশ্ন করব, তুমি উত্তর দেবে।", en: "Ready for a quiz? Tell me the subject and I'll ask questions." },
      placeholder: { bn: "বিষয় (যেমন: পদার্থবিজ্ঞান)...", en: "Subject (e.g., Physics)..." },
      suggestions: [
        { label: { bn: 'কুইজ শুরু করো', en: 'Start Quiz' }, text: { bn: 'সাধারণ কুইজ শুরু করো।', en: 'Start a general quiz.' } },
        { label: { bn: 'কঠিন প্রশ্ন', en: 'Hard Question' }, text: { bn: 'আমাকে একটি কঠিন প্রশ্ন করো।', en: 'Ask me a hard question.' } },
        { label: { bn: 'উত্তর দেখাও', en: 'Show Answer' }, text: { bn: 'সঠিক উত্তরটি ব্যাখ্যাসহ বলো।', en: 'Show the correct answer with explanation.' } },
        { label: { bn: 'পরের প্রশ্ন', en: 'Next Question' }, text: { bn: 'পরের প্রশ্ন দাও।', en: 'Next question please.' } }
      ]
  },
  [StudyMode.RECALL]: { 
      color: 'cyan', 
      icon: '🧠',
      welcome: { bn: "Active Recall শুরু করতে বিষয় বলো। আমি তোমাকে প্রশ্ন করে যাচাই করব।", en: "Start Active Recall. Name the topic and I will test your memory." },
      placeholder: { bn: "পড়ার বিষয়...", en: "Study topic..." },
      suggestions: [
        { label: { bn: 'যাচাই করো', en: 'Test Me' }, text: { bn: 'আমার মেধা যাচাই করার জন্য প্রশ্ন করো।', en: 'Ask a question to test my understanding.' } },
        { label: { bn: 'রিভিউ', en: 'Review' }, text: { bn: 'আমি কি সঠিক? যাচাই করো।', en: 'Review my answer.' } },
        { label: { bn: 'মনে করিয়ে দাও', en: 'Remind Me' }, text: { bn: 'আমি ভুলে গেছি, একটু হিন্ট দাও।', en: 'I forgot, give me a hint.' } }
      ]
  },
  [StudyMode.COACH]: { 
      color: 'orange', 
      icon: '✍️',
      welcome: { bn: "সৃজনশীল বা বড় প্রশ্নের উত্তর কীভাবে লিখতে হয় তা শেখাব। প্রশ্নটি বলো।", en: "I'll teach you how to write great answers. Tell me the question." },
      placeholder: { bn: "প্রশ্নের ধরণ...", en: "Question type..." },
      suggestions: [
        { label: { bn: 'কিভাবে লিখব?', en: 'How to write?' }, text: { bn: 'এই প্রশ্নের উত্তর কীভাবে সাজাবো?', en: 'How should I structure this answer?' } },
        { label: { bn: 'নমুনা উত্তর', en: 'Sample Answer' }, text: { bn: 'একটি আদর্শ নমুনা উত্তর দাও।', en: 'Give me a sample ideal answer.' } },
        { label: { bn: 'ভুল ধরিয়ে দাও', en: 'Find Errors' }, text: { bn: 'আমার উত্তরে কি ভুল হতে পারে?', en: 'What represent common mistakes here?' } }
      ]
  },
  [StudyMode.STUDY_PLAN]: { 
      color: 'teal', 
      icon: '📅',
      welcome: { bn: "তোমার পরীক্ষার রুটিন বা সিলেবাস বলো। আমি পড়ার রুটিন করে দেব।", en: "Tell me your exam syllabus. I'll make a study plan." },
      placeholder: { bn: "সিলেবাস বা সময়...", en: "Syllabus or time..." },
      suggestions: [
        { label: { bn: '৩ দিনের রুটিন', en: '3-Day Plan' }, text: { bn: 'আগামী ৩ দিনের জন্য একটি পড়ার রুটিন দাও।', en: 'Make a study plan for the next 3 days.' } },
        { label: { bn: 'পরীক্ষার প্রস্তুতি', en: 'Exam Prep' }, text: { bn: 'পরীক্ষার আগের রাতের প্রস্তুতি কেমন হবে?', en: 'How should I prepare the night before the exam?' } },
        { label: { bn: 'সময় ব্যবস্থাপনা', en: 'Time Mgmt' }, text: { bn: 'পড়ার সময় কীভাবে ভাগ করবো?', en: 'How should I manage my study time?' } }
      ]
  },
  [StudyMode.VOICE_TUTOR]: { 
      color: 'sky', 
      icon: '🎧',
      welcome: { bn: "ভয়েস মোড চালু। তুমি কথা বলো, আমিও কথা বলে উত্তর দেব।", en: "Voice mode on. Speak to me, and I'll reply with voice." },
      placeholder: { bn: "মাইক আইকনে চাপ দিন...", en: "Tap the mic icon..." },
      suggestions: [
        { label: { bn: 'ইংরেজিতে কথা বলি', en: 'Speak English' }, text: { bn: 'চলো ইংরেজিতে কথোপকথন করি।', en: 'Let\'s practice English conversation.' } },
        { label: { bn: 'উচ্চারণ শেখাও', en: 'Pronunciation' }, text: { bn: 'আমার উচ্চারণ ঠিক করে দাও।', en: 'Correct my pronunciation.' } },
        { label: { bn: 'প্রশ্ন করো', en: 'Ask Me' }, text: { bn: 'আমাকে মৌখিক প্রশ্ন করো।', en: 'Ask me a verbal question.' } }
      ]
  },
  [StudyMode.ANALYSIS]: { 
      color: 'indigo', 
      icon: '📊',
      welcome: { bn: "তোমার দুর্বলতাগুলো বলো। আমি বিশ্লেষণ করে সমাধানের পথ দেখাব।", en: "Tell me your weak areas. I'll analyze and guide you." },
      placeholder: { bn: "দুর্বলতার বিষয়...", en: "Weak areas..." },
      suggestions: [
        { label: { bn: 'দুর্বলতা খুঁজুন', en: 'Find Weakness' }, text: { bn: 'আমার দুর্বলতাগুলো বিশ্লেষণ করো।', en: 'Analyze my weak points.' } },
        { label: { bn: 'নম্বর কমে কেন?', en: 'Why low marks?' }, text: { bn: 'পরীক্ষায় কেন নম্বর কম পাই?', en: 'Why do I lose marks in exams?' } },
        { label: { bn: 'উন্নতির উপায়', en: 'How to improve' }, text: { bn: 'কীভাবে উন্নতি করতে পারি?', en: 'Suggest an improvement plan.' } }
      ]
  },
  [StudyMode.STRATEGY]: { 
      color: 'rose', 
      icon: '🎯',
      welcome: { bn: "পরীক্ষার হলের কৌশল বা সময় ব্যবস্থাপনা নিয়ে প্রশ্ন করো।", en: "Ask about exam hall strategy or time management." },
      placeholder: { bn: "পরীক্ষার নাম...", en: "Exam name..." },
      suggestions: [
        { label: { bn: 'MCQ কৌশল', en: 'MCQ Hacks' }, text: { bn: 'MCQ উত্তর করার গোপন কৌশলগুলো বলো।', en: 'Tell me strategies for answering MCQs.' } },
        { label: { bn: 'সৃজনশীল টিপস', en: 'Creative Tips' }, text: { bn: 'সৃজনশীল প্রশ্নে বেশি নম্বর পাওয়ার উপায় কি?', en: 'How to get high marks in creative questions?' } },
        { label: { bn: 'মানসিক চাপ', en: 'Stress' }, text: { bn: 'পরীক্ষার হলের চাপ কীভাবে কমাবো?', en: 'How to handle exam hall stress?' } }
      ]
  },
  [StudyMode.TUTOR]: { 
      color: 'pink', 
      icon: '🤩',
      welcome: { bn: "হ্যালো চ্যাম্পিয়ন! 😎 আজ কী শিখব আমরা? চলো শুরু করি!", en: "Hey Champion! 😎 What are we learning today? Let's roll!" },
      placeholder: { bn: "যা খুশি জিজ্ঞেস করো...", en: "Ask anything..." },
      suggestions: [
        { label: { bn: 'মজার তথ্য', en: 'Fun Fact' }, text: { bn: 'পড়াশোনা বিষয়ক একটি মজার তথ্য বলো।', en: 'Tell me a fun educational fact.' } },
        { label: { bn: 'মোটিভেশন', en: 'Motivation' }, text: { bn: 'আমাকে পড়ার জন্য উৎসাহ দাও! 🚀', en: 'Motivate me to study! 🚀' } },
        { label: { bn: 'নতুন কিছু শিখি', en: 'Learn New' }, text: { bn: 'সিলেবাসের বাইরে নতুন কিছু শেখাও।', en: 'Teach me something new outside the syllabus.' } }
      ]
  },
  [StudyMode.IMAGE_GENERATION]: { 
      color: 'fuchsia', 
      icon: '🎨',
      welcome: { bn: "আমি তোমার পড়ার জন্য ছবি তৈরি করতে পারি। কী আঁকতে হবে বলো? (Text-to-Image)", en: "I can generate images for your studies. What should I draw? (Text-to-Image)" },
      placeholder: { bn: "ছবির বর্ণনা দাও...", en: "Describe the image..." },
      suggestions: [
        { label: { bn: 'বিজ্ঞান ডায়াগ্রাম', en: 'Science Diagram' }, text: { bn: 'মানুষের হৃদপিণ্ডের একটি ডায়াগ্রাম আঁকো।', en: 'Draw a diagram of the human heart.' } },
        { label: { bn: 'ঐতিহাসিক দৃশ্য', en: 'Historic Scene' }, text: { bn: '১৯৫২ সালের ভাষা আন্দোলনের একটি দৃশ্য আঁকো।', en: 'Draw a scene of the 1952 Language Movement.' } },
        { label: { bn: 'ভবিষ্যৎ শহর', en: 'Future City' }, text: { bn: 'ভবিষ্যতের ঢাকা শহর দেখতে কেমন হবে?', en: 'What will future Dhaka city look like?' } }
      ]
  },
};

export const AVAILABLE_EXTENSIONS: Extension[] = [
  {
    id: 'subject_master',
    name: { bn: 'সাবজেক্ট মাস্টার', en: 'Subject Master' },
    description: { bn: 'প্রতিটি বিষয়ের (গণিত, বিজ্ঞান, কলা) জন্য আলাদা ও সঠিক পদ্ধতিতে শেখাবে। (#2)', en: 'Optimizes explanation style specifically for Math, Science, Arts, etc.' },
    icon: '🎓'
  },
  {
    id: 'cross_connect',
    name: { bn: 'ক্রস কানেক্ট', en: 'Cross Connect' },
    description: { bn: 'এক বিষয়ের সাথে অন্য বিষয়ের সম্পর্ক দেখাবে। যেমন: পদার্থবিজ্ঞানে গণিতের ব্যবহার। (#14)', en: 'Shows how concepts link across different subjects.' },
    icon: '🔗'
  },
  {
    id: 'smart_notes',
    name: { bn: 'স্মার্ট নোটস', en: 'Smart Notes' },
    description: { bn: 'প্রতিটি উত্তরের শেষে অফলাইন সেভ করার মতো নোট তৈরি করে দেবে। (#11)', en: 'Generates concise, saveable summary notes at the end of answers.' },
    icon: '📑'
  },
  {
    id: 'auto_voice',
    name: { bn: 'অটো ভয়েস', en: 'Auto Voice' },
    description: { bn: 'স্বয়ংক্রিয়ভাবে ভয়েস প্লে হবে।', en: 'Auto-play audio responses.' },
    icon: '🔊'
  },
  {
    id: 'adaptive_learning',
    name: { bn: 'অ্যাডাপ্টিভ লার্নিং', en: 'Adaptive Learning' },
    description: { bn: 'আপনার ক্লাসের উপর ভিত্তি করে ব্যাখ্যা সহজ বা কঠিন হবে। (#2, #14)', en: 'Adjusts complexity based on your level.' },
    icon: '🧩'
  },
  {
    id: 'mistake_analysis',
    name: { bn: 'ভুল বিশ্লেষণ', en: 'Mistake Analysis' },
    description: { bn: 'কেন ভুল হয়েছে তা ব্যাখ্যা করবে। (#3)', en: 'Explains the root cause of errors.' },
    icon: '🔍'
  },
  {
    id: 'priority_analyzer',
    name: { bn: 'গুরুত্ব বিশ্লেষণ', en: 'Priority Analyzer' },
    description: { bn: 'কোন অধ্যায় পরীক্ষার জন্য বেশি গুরুত্বপূর্ণ তা দেখাবে। (#8)', en: 'Highlights exam weightage of topics.' },
    icon: '⭐'
  },
  {
    id: 'mental_health',
    name: { bn: 'মেন্টাল সাপোর্ট', en: 'Mental Support' },
    description: { bn: 'মানসিক চাপ কমাতে সাহায্য করবে। (#10)', en: 'Reduces exam stress with motivation.' },
    icon: '🌱'
  },
  {
    id: 'competitive_mode',
    name: { bn: 'প্রতিযোগিতা মোড', en: 'Competitive Mode' },
    description: { bn: 'ভর্তি পরীক্ষার প্রস্তুতির জন্য। (#15)', en: 'For admission/competitive exam prep.' },
    icon: '🏆'
  },
  {
    id: 'dark_mode',
    name: { bn: 'ডার্ক মোড', en: 'Dark Mode' },
    description: { bn: 'কালো থিম।', en: 'Dark theme.' },
    icon: '🌙'
  },
  {
    id: 'exam_mode',
    name: { bn: 'পরীক্ষা মোড', en: 'Exam Mode' },
    description: { bn: 'সরাসরি উত্তর, কোনো অতিরিক্ত কথা ছাড়া।', en: 'Strict, direct answers.' },
    icon: '📝'
  }
];

export const UI_TEXT = {
  bn: {
    menu: 'মেনু',
    newChat: 'নতুন চ্যাট',
    history: 'পূর্বের চ্যাট',
    extensions: 'এক্সটেনশন',
    progress: 'অগ্রগতি',
    selectMode: 'মোড নির্বাচন করুন',
    language: 'ভাষা',
    about: 'সম্পর্কে',
    aboutText: 'NCTB এআই স্টাডি অ্যাসিস্ট্যান্ট বাংলাদেশের শিক্ষার্থীদের জন্য তৈরি।',
    student: 'শিক্ষার্থী',
    assistant: 'সহায়ক',
    thinking: 'চিন্তা করছি...',
    inputPlaceholder: 'আপনার প্রশ্ন এখানে লিখুন...',
    readAloud: 'পড়ে শোনাও',
    playing: 'চলছে...',
    imageAttached: 'ছবি যুক্ত হয়েছে',
    error: 'দুঃখিত, সমস্যা হয়েছে।',
    retry: 'পুনরায় চেষ্টা করুন',
    micError: 'মাইক্রোফোন চালু করা যায়নি।',
    uploadTitle: 'ছবি আপলোড',
    voiceTitle: 'ভয়েস ইনপুট',
    welcome: "আসসালামু আলাইকুম! আমি তোমার NCTB স্টাডি অ্যাসিস্ট্যান্ট। আমি তোমাকে পড়াশোনায় সাহায্য করতে পারি।\n\nকোন ক্লাস এবং কোন বিষয়ে সাহায্য প্রয়োজন, আমাকে বলো। ছবি তুলে প্রশ্ন পাঠাতে পারো।",
    chatCleared: "চ্যাট মুছে ফেলা হয়েছে। নতুন করে প্রশ্ন করো।",
    noHistory: "কোনো পূর্বের চ্যাট নেই",
    extensionTitle: "এক্সটেনশন স্টোর",
    enable: "চালু করুন",
    disable: "বন্ধ করুন",
    progressTitle: "আপনার অগ্রগতি",
    totalChats: "মোট চ্যাট সেশন",
    topicsCovered: "আলোচিত বিষয় (আনুমানিক)",
    lastActive: "সর্বশেষ সক্রিয়",
    darkMode: "ডার্ক মোড",
  },
  en: {
    menu: 'Menu',
    newChat: 'New Chat',
    history: 'History',
    extensions: 'Extensions',
    progress: 'Progress',
    selectMode: 'Select Mode',
    language: 'Language',
    about: 'About',
    aboutText: 'NCTB AI Study Assistant helps students in Bangladesh with syllabus-based learning.',
    student: 'Student',
    assistant: 'Assistant',
    thinking: 'Thinking...',
    inputPlaceholder: 'Type your question here...',
    readAloud: 'Read Aloud',
    playing: 'Playing...',
    imageAttached: 'Image attached',
    error: 'Sorry, something went wrong.',
    retry: 'Retry',
    micError: 'Could not access microphone.',
    uploadTitle: 'Upload Image',
    voiceTitle: 'Voice Input',
    welcome: "Hello! I am your NCTB Study Assistant. I can help you with your studies.\n\nTell me which class and subject you need help with. You can also upload a picture of a question.",
    chatCleared: "Chat cleared. Please ask a new question.",
    noHistory: "No chat history",
    extensionTitle: "Extension Store",
    enable: "Enable",
    disable: "Disable",
    progressTitle: "Your Progress",
    totalChats: "Total Chat Sessions",
    topicsCovered: "Topics Discussed (Approx)",
    lastActive: "Last Active",
    darkMode: "Dark Mode",
  }
};