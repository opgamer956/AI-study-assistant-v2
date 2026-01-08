import { ChatSession } from '../types';
import LZString from 'lz-string';

const HISTORY_KEY = 'nctb_chat_history';
const EXTENSIONS_KEY = 'nctb_extensions';
const MAX_SESSIONS = 20; // Increased limit due to compression
const MAX_MESSAGES_PER_SESSION = 30; 

export const getHistory = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    // Migration Strategy: Check if it looks like JSON (starts with [) or compressed string
    let parsedData;
    if (stored.trim().startsWith('[')) {
      // It's old uncompressed JSON
      parsedData = JSON.parse(stored);
    } else {
      // It's compressed
      const decompressed = LZString.decompressFromUTF16(stored);
      parsedData = decompressed ? JSON.parse(decompressed) : [];
    }
    return parsedData;
  } catch (e) {
    console.error("Failed to load history", e);
    // Fallback: if data is corrupted, return empty to prevent app crash
    return [];
  }
};

export const saveHistory = (history: ChatSession[]) => {
  // 1. Keep only the last N sessions
  let sessionsToSave = history.slice(-MAX_SESSIONS);

  // 2. Optimization Function: Strip heavy data and truncate messages
  const optimize = (sessions: ChatSession[]) => sessions.map(session => ({
    ...session,
    messages: session.messages
      .slice(-MAX_MESSAGES_PER_SESSION) // Keep only recent messages
      .map(msg => {
        // Destructure to separate heavy fields
        const { image, audioData, ...rest } = msg;
        return {
          ...rest,
          // Explicitly exclude these from localStorage
          image: undefined, 
          audioData: undefined 
        };
      })
  }));

  let optimizedHistory = optimize(sessionsToSave);

  try {
    // 3. Compress the data
    const stringData = JSON.stringify(optimizedHistory);
    const compressedData = LZString.compressToUTF16(stringData);
    
    localStorage.setItem(HISTORY_KEY, compressedData);
  } catch (e) {
    // 4. Emergency Cleanup Strategy
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
       console.warn("Storage quota exceeded. Attempting to clear old data...");
       
       // Strategy: Remove sessions one by one from the start (oldest) until it fits
       while (optimizedHistory.length > 0) {
         optimizedHistory.shift(); // Remove oldest session
         try {
            const reducedString = JSON.stringify(optimizedHistory);
            const reducedCompressed = LZString.compressToUTF16(reducedString);
            localStorage.setItem(HISTORY_KEY, reducedCompressed);
            console.log("Recovered from quota error by removing old sessions.");
            return; // Success
         } catch (retryError) {
           continue; // Still too big, try removing another
         }
       }
       console.error("Failed to save history even after clearing.");
    } else {
       console.error("Failed to save history", e);
    }
  }
};

export const getExtensions = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(EXTENSIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to load extensions", e);
    return {};
  }
};

export const saveExtensions = (extensions: Record<string, boolean>) => {
  try {
    localStorage.setItem(EXTENSIONS_KEY, JSON.stringify(extensions));
  } catch (e) {
    console.error("Failed to save extensions", e);
  }
};