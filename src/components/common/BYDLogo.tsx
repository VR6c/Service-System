import React from 'react';

interface BYDLogoProps {
  variant?: 'red' | 'white' | 'dark';
  className?: string;
  showSubtext?: boolean;
}

export const BYDLogo: React.FC<BYDLogoProps> = ({
  variant = 'red',
  className = 'h-8',
  showSubtext = false
}) => {
  const primaryColor = variant === 'white' ? '#FFFFFF' : variant === 'dark' ? '#0F172A' : '#E31B23';

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`flex items-center ${className}`}>
        <svg
          viewBox="0 0 740 230"
          className="h-full w-auto filter drop-shadow-2xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Letter B */}
          <path
            d="M 40 50 H 165 C 205 50 205 115 165 115 H 40 H 165 C 205 115 205 180 165 180 H 40"
            stroke={primaryColor}
            strokeWidth="24"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />

          {/* Letter Y */}
          <path
            d="M 275 50 H 330 C 365 50 370 70 370 100 V 180 M 465 50 H 410 C 375 50 370 70 370 100"
            stroke={primaryColor}
            strokeWidth="24"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />

          {/* Letter D */}
          <path
            d="M 535 50 H 635 C 705 50 705 180 635 180 H 535"
            stroke={primaryColor}
            strokeWidth="24"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showSubtext && (
        <div className="flex flex-col border-l border-slate-700/60 pl-3">
          <span className={`text-[11px] font-black uppercase tracking-widest font-heading ${variant === 'white' ? 'text-white' : 'text-slate-900'}`}>
            SALES & SERVICE
          </span>
          <span className="text-[9px] tracking-widest uppercase font-semibold text-slate-500">
            Build Your Dreams
          </span>
        </div>
      )}
    </div>
  );
};



