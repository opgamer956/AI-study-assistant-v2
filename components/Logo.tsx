import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none"
    >
      {/* Circle Background (Bangladesh Green) */}
      <circle cx="50" cy="50" r="45" fill="#006a4e" />
      
      {/* Red Circle (Sun/Bangladesh Flag reference) positioned slightly offset like the flag, but centered for logo balance */}
      <circle cx="50" cy="50" r="20" fill="#f42a41" />
      
      {/* Open Book Icon (Education) - White Overlay */}
      <path 
        d="M30 50 C 30 50, 45 55, 50 50 C 55 55, 70 50, 70 50 V 75 C 70 75, 55 80, 50 75 C 45 80, 30 75, 30 75 Z" 
        fill="white" 
        stroke="white" 
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Digital Nodes/AI Connections (Subtle overlay on the red) */}
      <circle cx="50" cy="35" r="3" fill="white" />
      <line x1="50" y1="35" x2="35" y2="45" stroke="white" strokeWidth="2" />
      <line x1="50" y1="35" x2="65" y2="45" stroke="white" strokeWidth="2" />
      <circle cx="35" cy="45" r="2" fill="white" />
      <circle cx="65" cy="45" r="2" fill="white" />
    </svg>
  );
};