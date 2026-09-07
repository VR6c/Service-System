import React from 'react';

interface DENZALogoProps {
  variant?: 'blue' | 'white' | 'dark';
  className?: string;
  showSubtext?: boolean;
}

export const DENZALogo: React.FC<DENZALogoProps> = ({
  variant = 'blue',
  className = 'h-8',
  showSubtext = false
}) => {
  const primaryColor = variant === 'white' ? '#FFFFFF' : variant === 'dark' ? '#0F172A' : '#0284C7';
  const accentColor = variant === 'white' ? '#93C5FD' : '#38BDF8';

  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`flex items-center ${className}`}>
        <svg viewBox="0 0 280 80" className="h-full w-auto filter drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="denzaBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
          </defs>

          {/* DENZA Diamond / Drop Emblem */}
          <g transform="translate(10, 10)">
            <path
              d="M30 0L60 30L30 60L0 30L30 0Z"
              fill={variant === 'white' ? '#FFFFFF' : 'url(#denzaBlueGrad)'}
            />
            <path
              d="M30 12L48 30L30 48L12 30L30 12Z"
              fill={accentColor}
              opacity="0.85"
            />
          </g>

          {/* DENZA Typography */}
          <g fill={primaryColor} transform="translate(85, 0)">
            <path d="M0 20H20C32 20 40 28 40 40C40 52 32 60 20 60H0V20ZM10 29V51H20C27 51 30 46 30 40C30 34 27 29 20 29H10Z" />
            <path d="M48 20H78V29H58V35H74V44H58V51H78V60H48V20Z" />
            <path d="M86 20H96L116 46V20H126V60H116L96 34V60H86V20Z" />
            <path d="M134 20H164V28L145 51H165V60H134V52L153 29H134V20Z" />
            <path d="M182 20H193L211 60H200L196 50H179L175 60H164L182 20ZM187 29L182 42H193L187 29Z" />
          </g>
        </svg>
      </div>

      {showSubtext && (
        <div className="flex flex-col border-l border-slate-700/60 pl-3">
          <span className={`text-[11px] font-black uppercase tracking-widest font-heading ${variant === 'white' ? 'text-white' : 'text-slate-900'}`}>
            LUXURY EV SERVICE
          </span>
          <span className="text-[9px] tracking-widest uppercase font-semibold text-slate-500">
            DENZA Executive Care
          </span>
        </div>
      )}
    </div>
  );
};
