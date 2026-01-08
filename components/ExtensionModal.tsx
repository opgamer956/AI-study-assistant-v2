import React from 'react';
import { Extension, Language } from '../types';
import { AVAILABLE_EXTENSIONS, UI_TEXT } from '../constants';

interface ExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  enabledExtensions: Record<string, boolean>;
  onToggle: (id: string) => void;
  language: Language;
  themeColor: string;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({
  isOpen,
  onClose,
  enabledExtensions,
  onToggle,
  language,
  themeColor
}) => {
  if (!isOpen) return null;

  const t = UI_TEXT[language];

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] dark:bg-gray-900 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-${themeColor}-600 text-white transition-colors duration-300`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            🧩 {t.extensionTitle}
          </h2>
          <button onClick={onClose} className={`hover:bg-${themeColor}-700 p-1 rounded transition-colors hover:rotate-90 duration-300`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {AVAILABLE_EXTENSIONS.map((ext, idx) => {
            const isEnabled = enabledExtensions[ext.id] || false;
            return (
              <div 
                key={ext.id} 
                className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                  isEnabled 
                    ? `border-${themeColor}-500 bg-${themeColor}-50 dark:bg-${themeColor}-900/20 dark:border-${themeColor}-700` 
                    : 'border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl animate-bounce-subtle">{ext.icon}</span>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100">{ext.name[language]}</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed dark:text-gray-400">
                      {ext.description[language]}
                    </p>
                  </div>
                  <button
                    onClick={() => onToggle(ext.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                      isEnabled
                        ? `bg-${themeColor}-600 text-white shadow-md`
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isEnabled ? t.enable : t.disable}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};