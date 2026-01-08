import React, { useState } from 'react';
import { Message, Role, Language } from '../types';
import { playPcmAudio } from '../services/audioUtils';
import { UI_TEXT } from '../constants';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onImageClick?: (imageUrl: string) => void;
  language: Language;
  onRetry?: () => void;
  themeColor: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming, onImageClick, language, onRetry, themeColor }) => {
  const isUser = message.role === Role.USER;
  const [isPlaying, setIsPlaying] = useState(false);
  const t = UI_TEXT[language];

  const handlePlayAudio = async () => {
    if (message.audioData) {
      setIsPlaying(true);
      try {
        await playPcmAudio(message.audioData);
      } finally {
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in-up`}>
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
          isUser
            ? `bg-${themeColor}-600 text-white rounded-br-none`
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700'
        }`}
      >
        {/* Role Label */}
        <div className={`text-xs font-bold mb-2 transition-colors duration-300 ${isUser ? `text-${themeColor}-100` : `text-${themeColor}-600 dark:text-${themeColor}-400`}`}>
          {isUser ? t.student : `NCTB ${t.assistant}`}
        </div>

        {/* User Uploaded Image */}
        {message.image && (
          <div className="mb-3">
            <img 
              src={`data:image/jpeg;base64,${message.image}`} 
              alt="User upload" 
              className="max-h-48 rounded-lg border border-white/20 cursor-zoom-in hover:opacity-95 transition-opacity"
              onClick={() => onImageClick && onImageClick(`data:image/jpeg;base64,${message.image}`)}
            />
          </div>
        )}

        {/* AI Generated Images */}
        {message.generatedImages && message.generatedImages.length > 0 && (
           <div className="mb-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
             {message.generatedImages.map((imgData, idx) => (
                <div key={idx} className="relative group">
                    <img 
                        src={`data:image/png;base64,${imgData}`} 
                        alt="AI Generated" 
                        className="rounded-lg shadow-sm border border-gray-200 cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02]"
                        onClick={() => onImageClick && onImageClick(`data:image/png;base64,${imgData}`)}
                    />
                    <a 
                        href={`data:image/png;base64,${imgData}`} 
                        download={`nctb-gen-${Date.now()}.png`}
                        className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                        title="Download"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l3-3m-3 3h7.5" transform="rotate(-90 12 12) translate(0 1)" />
                        </svg>
                    </a>
                </div>
             ))}
           </div>
        )}

        {/* Text Content */}
        <div className={`prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed ${!isUser ? 'dark:prose-invert' : 'prose-invert'}`}>
          {message.text}
        </div>

        {/* Audio Button for Bot */}
        {!isUser && message.audioData && (
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className={`mt-3 flex items-center gap-2 px-3 py-1.5 bg-${themeColor}-50 hover:bg-${themeColor}-100 text-${themeColor}-700 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95 dark:bg-${themeColor}-900/30 dark:text-${themeColor}-400 dark:hover:bg-${themeColor}-900/50`}
          >
            {isPlaying ? (
              <>
                <span className="animate-pulse">🔊</span> {t.playing}
              </>
            ) : (
              <>
                <span>🔈</span> {t.readAloud}
              </>
            )}
          </button>
        )}

        {/* Error State with Retry */}
        {message.isError && (
          <div className="mt-2 flex items-center gap-3 animate-pulse">
            <div className="text-xs text-red-500 font-bold bg-red-50 p-1 rounded dark:bg-red-900/20 dark:text-red-400">
              {t.error}
            </div>
            {onRetry && (
              <button 
                onClick={onRetry}
                className="px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-sm flex items-center gap-1 hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                {t.retry}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};