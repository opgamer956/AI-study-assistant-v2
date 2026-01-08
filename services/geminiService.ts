import { GoogleGenAI, Modality, Type } from "@google/genai";
import { 
  SYSTEM_INSTRUCTION, 
  MODEL_FAST, 
  MODEL_COMPLEX,
  MODEL_TTS,
  MODEL_IMAGE
} from '../constants';
import { StudyMode, Language } from '../types';
import { base64ToUint8Array } from './audioUtils';

// Guidelines Requirement: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// Use this process.env.API_KEY string directly when initializing the @google/genai client instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateOptions {
  prompt: string;
  image?: string; // Base64 string without data prefix
  mode: StudyMode;
  language: Language;
  extensions?: Record<string, boolean>;
}

export const generateStudyContent = async ({
  prompt,
  image,
  mode,
  language,
  extensions = {}
}: GenerateOptions): Promise<{ text: string, generatedImages?: string[] }> => {
  try {
    // --- SPECIAL HANDLING FOR IMAGE GENERATION MODE ---
    if (mode === StudyMode.IMAGE_GENERATION) {
        return await generateImageContent(prompt, image);
    }

    // --- STANDARD TEXT GENERATION ---
    // Select model based on complexity needed
    let modelName = MODEL_FAST;
    let thinkingBudget = 0;

    // Use Pro model for complex tasks
    if (
      mode === StudyMode.STRATEGY || 
      mode === StudyMode.ANALYSIS || 
      mode === StudyMode.STUDY_PLAN || 
      mode === StudyMode.COACH || // Answer Coach needs reasoning
      image ||
      extensions['subject_master'] || // Deep subject logic needs Pro
      extensions['cross_connect']     // Connecting concepts needs broad knowledge
    ) {
      modelName = MODEL_COMPLEX;
      // Enable thinking for deep analysis
      if (mode === StudyMode.STRATEGY || mode === StudyMode.ANALYSIS || extensions['cross_connect']) {
         thinkingBudget = 2048; 
      }
    }

    const parts: any[] = [];
    
    // Add image if present (Multimodal Text Gen)
    if (image) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: image
        }
      });
    }

    // --- CONSTRUCT PROMPT BASED ON MODES & EXTENSIONS ---
    
    let finalPrompt = `[CURRENT MODE: ${mode}]\n`;
    
    // Mode Specific Instructions
    switch (mode) {
      case StudyMode.TEXTBOOK:
        finalPrompt += "Instruction: Identify the specific Chapter/Topic from the NCTB textbook. Explain strictly what is in the book. Do not go outside the syllabus.\n";
        break;
      case StudyMode.COACH:
        finalPrompt += "Instruction: Teach the student HOW to write the answer for exams (MCQ/Creative). Mention mandatory keywords, structure, and length. (#4)\n";
        break;
      case StudyMode.RECALL:
        finalPrompt += "Instruction: Do not explain immediately. Ask the student a question first to test their memory. Then provide feedback. (#7)\n";
        break;
      case StudyMode.STRATEGY:
        finalPrompt += "Instruction: Provide time management tips and exam hall strategy.\n";
        break;
      case StudyMode.STUDY_PLAN:
        finalPrompt += "Instruction: Create a balanced study routine. Allocate more time for calculation-heavy subjects and shorter, frequent sessions for languages. (#6)\n";
        break;
      case StudyMode.TUTOR:
        finalPrompt += "Instruction: Act as a high-energy, super fun AI Tutor! 🤩 Use lots of emojis, be expressive, and make learning exciting! 🚀 Forget the 'no emojis' rule. Use slang if it fits. Be like a cool big brother/sister. 😎\n";
        break;
    }

    // Extension Specific Instructions
    if (extensions['subject_master']) {
      finalPrompt += "Extension Active: SUBJECT MASTER. Detect the subject (Math/Science/Arts). Apply specific teaching style: Step-by-step for Math; Diagrams/Definitions for Science; Grammar/Structure for Language. (#2, #3, #9)\n";
    }
    if (extensions['cross_connect']) {
      finalPrompt += "Extension Active: CROSS CONNECT. Show connections between this topic and other subjects (e.g., how Math is used in Physics here). (#14)\n";
    }
    if (extensions['adaptive_learning']) {
      finalPrompt += "Extension Active: ADAPTIVE LEARNING. Detect the user's Class/Level. If Class 1-5, use very simple language. If 9-12, use analytical depth. (#2, #14)\n";
    }
    if (extensions['mistake_analysis']) {
      finalPrompt += "Extension Active: MISTAKE ANALYSIS. If the user provided an answer, analyze WHY it might be wrong (Conceptual vs Careless). (#3)\n";
    }
    if (extensions['priority_analyzer']) {
      finalPrompt += "Extension Active: PRIORITY ANALYZER. Mention if this topic is High/Medium/Low priority for Board Exams. (#8)\n";
    }
    if (extensions['mental_health']) {
      finalPrompt += "Extension Active: MENTAL SUPPORT. Be extra supportive. If stress is detected, offer a short calming tip. (#10)\n";
    }
    if (extensions['competitive_mode']) {
      finalPrompt += "Extension Active: COMPETITIVE MODE. Focus on speed, shortcuts, and accuracy for admission tests. (#15)\n";
    }
    if (extensions['smart_notes']) {
      finalPrompt += "Extension Active: SMART NOTES. At the end of the response, provide a separate section titled '📝 Offline Notes / নোট' containing a concise summary of the key points, formulas, or definitions for quick revision. (#11)\n";
    }
    if (extensions['exam_mode']) {
      finalPrompt += "Extension Active: EXAM MODE. Direct answers only. No greetings.\n";
    }

    finalPrompt += `\nUSER PROMPT: ${prompt}`;

    if (image) {
      finalPrompt += "\nAnalyze this image. If it's a question, solve it. If it's text, explain it within the NCTB context.";
    }

    // Add language instruction
    if (language === 'bn') {
      finalPrompt += "\n\nIMPORTANT: Please reply primarily in Bengali (Bangla).";
    } else {
      finalPrompt += "\n\nIMPORTANT: Please reply primarily in English.";
    }

    parts.push({ text: finalPrompt });

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [],
    };

    // Add search grounding for general queries to get up-to-date info
    if (mode === StudyMode.STRATEGY || mode === StudyMode.EXPLANATION || mode === StudyMode.TEXTBOOK) {
        config.tools.push({ googleSearch: {} });
    }

    if (thinkingBudget > 0) {
        config.thinkingConfig = { thinkingBudget };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config,
    });

    return { text: response.text || "Sorry, I could not generate a response." };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Handles Image Generation using gemini-2.5-flash-image
 * Supports Text-to-Image and Image-to-Image (Editing)
 */
async function generateImageContent(prompt: string, inputImage?: string): Promise<{ text: string, generatedImages?: string[] }> {
    const parts: any[] = [];
    
    // If input image exists, it's an editing task or variation
    if (inputImage) {
        parts.push({
            inlineData: {
                data: inputImage,
                mimeType: 'image/jpeg'
            }
        });
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: MODEL_IMAGE,
        contents: { parts },
        config: {
            imageConfig: {
                aspectRatio: "1:1",
                // generatedImageCount: 1 // Not available in config for this model type based on docs, usually defaults to 1 or controlled via SDK
            }
        }
    });

    const generatedImages: string[] = [];
    let textResponse = "";

    // Iterate through candidates and parts to find images and text
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                generatedImages.push(part.inlineData.data);
            } else if (part.text) {
                textResponse += part.text;
            }
        }
    }

    return {
        text: textResponse || (generatedImages.length > 0 ? "Here is the generated image." : "Failed to generate image."),
        generatedImages
    };
}

export const generateSpeech = async (text: string): Promise<Uint8Array | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' or 'Fenrir' usually sound good
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64ToUint8Array(base64Audio);
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType, // Use dynamic mimeType from the recording
              data: audioBase64
            }
          },
          { text: "Transcribe this audio exactly as spoken." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    throw error;
  }
};