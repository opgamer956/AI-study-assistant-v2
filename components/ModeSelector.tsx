import React from 'react';
import { StudyMode } from '../types';
import { MODE_LABELS } from '../constants';

interface ModeSelectorProps {
  currentMode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
      <span className="w-full text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">Select Mode:</span>
      {Object.values(StudyMode).map((mode) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors duration-200 border ${
            currentMode === mode
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          {MODE_LABELS[mode]}
        </button>
      ))}
    </div>
  );
};