import React, { useState } from 'react';
import { StudyMode, Language, ChatSession } from '../types';
import { MODE_LABELS, UI_TEXT, MODE_CONFIG } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => void;
  currentMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  history: ChatSession[];
  onLoadSession: (session: ChatSession) => void;
  activeSessionId: string | null;
  onOpenExtensions: () => void;
  onOpenProgress: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  themeColor: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onClearChat, 
  currentMode, 
  onModeChange,
  language,
  onLanguageChange,
  history,
  onLoadSession,
  activeSessionId,
  onOpenExtensions,
  onOpenProgress,
  isDarkMode,
  onToggleDarkMode,
  themeColor
}) => {
  const t = UI_TEXT[language];
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history based on search query
  const filteredHistory = history.filter(session => 
    (session.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-500 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 w-72 h-full bg-white z-50 shadow-2xl transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col dark:bg-gray-900 dark:border-r dark:border-gray-700 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-${themeColor}-600 text-white shrink-0 transition-colors duration-300`}>
          <span className="font-bold text-lg animate-fade-in-up">{t.menu}</span>
          <button onClick={onClose} className={`hover:bg-${themeColor}-700 p-1 rounded transition-all hover:rotate-90`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
          
          {/* New Chat & Actions */}
          <div className="space-y-2">
            <button 
              onClick={() => {
                onClearChat();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-${themeColor}-50 hover:bg-${themeColor}-100 text-${themeColor}-800 rounded-lg transition-all border border-${themeColor}-100 hover:scale-[1.02] active:scale-95 dark:bg-${themeColor}-900/20 dark:text-${themeColor}-400 dark:border-${themeColor}-800 dark:hover:bg-${themeColor}-900/40`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="font-bold">{t.newChat}</span>
            </button>

            <button 
              onClick={() => {
                onOpenExtensions();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 hover:scale-[1.02] active:scale-95 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <span className="text-xl animate-bounce-subtle">🧩</span>
              <span className="font-medium">{t.extensions}</span>
            </button>

            <button 
              onClick={() => {
                onOpenProgress();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 hover:scale-[1.02] active:scale-95 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <span className="text-xl">📊</span>
              <span className="font-medium">{t.progress}</span>
            </button>
          </div>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* History Section */}
          <section>
             <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.history}</h3>
             </div>
             
             {/* Search Bar */}
             <div className="relative mb-3">
               <input 
                 type="text" 
                 placeholder="Search..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 rounded-md border-0 focus:ring-1 focus:ring-gray-300 transition-all focus:scale-[1.01] dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
               />
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 absolute left-2.5 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </div>

             <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
               {filteredHistory.length === 0 ? (
                 <div className="text-xs text-gray-400 italic px-2 animate-fade-in-up">
                   {history.length === 0 ? t.noHistory : 'No matches found'}
                 </div>
               ) : (
                 filteredHistory.slice().reverse().map((session) => (
                   <button
                     key={session.id}
                     onClick={() => {
                       onLoadSession(session);
                       onClose();
                     }}
                     className={`w-full text-left px-3 py-2 rounded-md text-sm truncate transition-all hover:translate-x-1 ${
                       activeSessionId === session.id
                         ? `bg-${themeColor}-50 text-${themeColor}-700 font-semibold dark:bg-${themeColor}-900/30 dark:text-${themeColor}-400`
                         : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                     }`}
                   >
                     {session.title || 'Untitled Chat'}
                   </button>
                 ))
               )}
             </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Language Selection */}
          <section>
             <h3 className="px-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.language}</h3>
             <div className="flex gap-2 p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
               <button 
                 onClick={() => onLanguageChange('bn')}
                 className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                   language === 'bn' 
                     ? `bg-white text-${themeColor}-600 shadow-sm transform scale-105 dark:bg-gray-700 dark:text-${themeColor}-400` 
                     : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                 }`}
               >
                 বাংলা
               </button>
               <button 
                 onClick={() => onLanguageChange('en')}
                 className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                   language === 'en' 
                     ? `bg-white text-${themeColor}-600 shadow-sm transform scale-105 dark:bg-gray-700 dark:text-${themeColor}-400` 
                     : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                 }`}
               >
                 English
               </button>
             </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-700" />
          
           {/* Dark Mode Toggle */}
          <section>
             <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t.darkMode}</span>
                <button 
                  onClick={onToggleDarkMode}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    isDarkMode ? `bg-${themeColor}-600` : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
             </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* Study Mode Selection */}
          <section>
            <h3 className="px-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.selectMode}</h3>
            <div className="space-y-1">
              {Object.values(StudyMode).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    onModeChange(mode);
                    onClose(); 
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all hover:translate-x-1 ${
                    currentMode === mode
                      ? `bg-${themeColor}-50 text-${themeColor}-700 font-semibold dark:bg-${themeColor}-900/30 dark:text-${themeColor}-400`
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{MODE_LABELS[mode][language]}</span> 
                  </div>
                </button>
              ))}
            </div>
          </section>

          <hr className="border-gray-100 dark:border-gray-700" />

          {/* About Section */}
          <section>
             <h3 className="px-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t.about}</h3>
             <p className="px-1 text-xs text-gray-500 leading-relaxed dark:text-gray-400">
               {t.aboutText}
             </p>
          </section>
        </div>
      </div>
    </>
  );
};