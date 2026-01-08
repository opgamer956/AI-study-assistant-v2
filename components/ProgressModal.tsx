import React from 'react';
import { ChatSession, Language } from '../types';
import { UI_TEXT } from '../constants';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChatSession[];
  language: Language;
  themeColor: string;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  history,
  language,
  themeColor
}) => {
  if (!isOpen) return null;

  const t = UI_TEXT[language];

  // --- STATS CALCULATION ---
  const totalSessions = history.length;
  // Estimate topics (1 topic per 2 messages approx)
  const totalMessages = history.reduce((acc, sess) => acc + sess.messages.length, 0);
  const topicsEstimate = Math.ceil(totalMessages / 2); 
  const lastActive = history.length > 0 
    ? new Date(Math.max(...history.map(h => h.timestamp))).toLocaleDateString()
    : 'N/A';

  // --- CHART DATA PREPARATION ---
  // Get last 7 days activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    return d;
  }).reverse();

  const activityData = last7Days.map(date => {
    const count = history.filter(session => {
      const sessionDate = new Date(session.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === date.getTime();
    }).length;
    
    // Format Label (e.g., "Mon")
    const label = date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
    return { label, count };
  });

  const maxCount = Math.max(...activityData.map(d => d.count), 1); // Avoid div by zero
  const chartHeight = 100;
  
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden dark:bg-gray-900 animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-${themeColor}-600 text-white transition-colors duration-300`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            📊 {t.progressTitle}
          </h2>
          <button onClick={onClose} className={`hover:bg-${themeColor}-700 p-1 rounded transition-colors hover:rotate-90 duration-300`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] scrollbar-hide">
           
           {/* Summary Cards */}
           <div className="grid grid-cols-2 gap-3">
             <div className={`bg-${themeColor}-50 p-4 rounded-xl border border-${themeColor}-100 dark:bg-${themeColor}-900/20 dark:border-${themeColor}-800 transition-transform hover:scale-105 duration-300`}>
               <div className={`text-3xl font-bold text-${themeColor}-700 dark:text-${themeColor}-400`}>{totalSessions}</div>
               <div className={`text-xs text-${themeColor}-600 uppercase font-bold mt-1 dark:text-${themeColor}-500`}>{t.totalChats}</div>
             </div>
             
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 transition-transform hover:scale-105 duration-300">
               <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{topicsEstimate}</div>
               <div className="text-xs text-blue-600 uppercase font-bold mt-1 dark:text-blue-500">{t.topicsCovered}</div>
             </div>
           </div>

           {/* Activity Chart */}
           <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700">
             <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 dark:text-gray-400">Activity (Last 7 Days)</h3>
             
             <div className="flex items-end justify-between h-32 gap-2">
               {activityData.map((data, index) => {
                 const heightPercent = (data.count / maxCount) * 100;
                 return (
                   <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
                     <div className="relative w-full flex justify-center group h-full items-end">
                       {/* Tooltip */}
                       <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded animate-fade-in-up">
                         {data.count}
                       </div>
                       {/* Bar */}
                       <div 
                         style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                         className={`w-full max-w-[20px] rounded-t-sm transition-all duration-1000 ease-out ${
                           data.count > 0 
                             ? `bg-${themeColor}-500 dark:bg-${themeColor}-400 group-hover:opacity-80` 
                             : 'bg-gray-100 dark:bg-gray-700'
                         }`}
                       />
                     </div>
                     <span className="text-[10px] text-gray-400 mt-2 font-medium">{data.label}</span>
                   </div>
                 );
               })}
             </div>
           </div>

           <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex justify-between items-center dark:bg-purple-900/20 dark:border-purple-800 transition-transform hover:scale-105 duration-300">
             <div>
               <div className="text-sm font-bold text-purple-700 dark:text-purple-400">{lastActive}</div>
               <div className="text-xs text-purple-600 uppercase font-bold dark:text-purple-500">{t.lastActive}</div>
             </div>
             <div className="text-2xl animate-pulse">📅</div>
           </div>
           
           <div className="text-center text-xs text-gray-400 mt-2 dark:text-gray-500">
             {t.aboutText}
           </div>
        </div>
      </div>
    </div>
  );
};