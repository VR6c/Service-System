import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type SelectOptionItem = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

export type SelectOption = SelectOptionItem | string;

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  direction?: 'down' | 'up';
  icon?: React.ReactNode;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
  name?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  direction = 'down',
  icon,
  label,
  size = 'md',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options array into SelectOptionItem array
  const normalizedOptions: SelectOptionItem[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((opt) => opt.value === value);
        const nextOpt = normalizedOptions[currentIndex + 1];
        if (nextOpt && !nextOpt.disabled) {
          onChange(nextOpt.value);
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex((opt) => opt.value === value);
        const prevOpt = normalizedOptions[currentIndex - 1];
        if (prevOpt && !prevOpt.disabled) {
          onChange(prevOpt.value);
        }
      }
    }
  };

  const handleSelect = (optValue: string, isDisabled?: boolean) => {
    if (isDisabled) return;
    onChange(optValue);
    setIsOpen(false);
  };

  // Size variations
  const sizeStyles = {
    sm: 'px-2 py-1 text-[11px]',
    md: 'px-3.5 py-2.5 text-xs',
    lg: 'px-4 py-3 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  };

  return (
    <div className={`relative inline-block w-full text-left font-sans ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor={id}>
          {label}
        </label>
      )}

      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl font-bold transition cursor-pointer hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed ${
          sizeStyles[size]
        } ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : <span className="text-slate-400 font-normal">{placeholder}</span>}
          </span>
        </div>
        <ChevronDown
          className={`${iconSizes[size]} text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 ${
            direction === 'up' ? 'bottom-full mb-1.5' : 'mt-1'
          } ${menuClassName ? menuClassName : 'w-full min-w-[140px]'} bg-white border border-slate-200/90 rounded-xl shadow-xl py-1.5 max-h-60 overflow-y-auto focus:outline-none animate-pop-scale`}
          role="listbox"
        >
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 font-medium text-center">No options</div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value, opt.disabled)}
                  className={`px-3.5 py-2 text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                    opt.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
