import React, { useRef, useState } from 'react';
import { arrayBufferToBase64 } from '../services/audioUtils';
import { Language } from '../types';
import { UI_TEXT } from '../constants';

interface InputAreaProps {
  onSend: (text: string, image?: string) => void;
  isLoading: boolean;
  onAudioTranscript: (text: string) => void;
  language: Language;
  themeColor: string;
  placeholder: string;
  suggestions?: { label: Record<Language, string>; text: Record<Language, string> }[];
}

export const InputArea: React.FC<InputAreaProps> = ({ 
  onSend, 
  isLoading, 
  onAudioTranscript, 
  language, 
  themeColor, 
  placeholder,
  suggestions 
}) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const t = UI_TEXT[language];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data URL prefix
        const base64 = (reader.result as string).split(',')[1];
        setImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (!text.trim() && !image) return;
    onSend(text, image || undefined);
    setText('');
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine supported mime type (prefer webm, fallback to mp4 for Safari)
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'; 
          if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = ''; // Let browser decide default
          }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      alert(t.micError);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      mediaRecorderRef.current.onstop = async () => {
        // Use the actual mime type from the recorder or fallback
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            // Dispatch event with data AND mimeType
            const event = new CustomEvent('audio-input', { detail: { base64, mimeType } });
            window.dispatchEvent(event);
        };
        reader.readAsDataURL(blob);
        
        // Stop all tracks to release mic
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };
    }
  };

  return (
    <div className="bg-white border-t border-gray-100 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
      
      {/* Suggestion Chips */}
      {suggestions && suggestions.length > 0 && !image && !text && !isLoading && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide animate-slide-in-right">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onSend(s.text[language])}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 
                bg-${themeColor}-50 text-${themeColor}-700 border-${themeColor}-200 hover:bg-${themeColor}-100 hover:scale-105 active:scale-95
                dark:bg-${themeColor}-900/30 dark:text-${themeColor}-300 dark:border-${themeColor}-800 dark:hover:bg-${themeColor}-900/50
              `}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {s.label[language]}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 pt-2">
        {image && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg w-fit dark:bg-gray-700 animate-pop-in">
            <span className="text-xs text-gray-500 dark:text-gray-300">{t.imageAttached}</span>
            <button onClick={() => setImage(null)} className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform">✕</button>
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-3 text-gray-500 hover:text-${themeColor}-600 transition-all rounded-full hover:bg-gray-50 hover:scale-110 active:scale-90 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-${themeColor}-400`}
            title={t.uploadTitle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
          />

          <div className="relative flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              className={`w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-${themeColor}-500 resize-none max-h-32 min-h-[50px] scrollbar-hide dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors duration-300`}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-all hover:scale-110 active:scale-90 ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : `text-gray-500 hover:text-${themeColor}-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-${themeColor}-400`
            }`}
            title={t.voiceTitle}
          >
            {isRecording ? (
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
               </svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
               </svg>
            )}
          </button>

          <button
            onClick={handleSend}
            disabled={isLoading || (!text.trim() && !image)}
            className={`p-3 rounded-full transition-all hover:scale-110 active:scale-90 ${
              isLoading || (!text.trim() && !image)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : `bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 shadow-lg hover:shadow-xl`
            }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};