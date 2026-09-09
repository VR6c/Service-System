import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select Date',
  className = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected date or fallback to today
  const parseSelectedDate = (val: string) => {
    if (val && /^\d{4}-\d{2}-\d{2}$/.exec(val)) {
      const [y, m, d] = val.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return null;
  };

  const selectedDateObj = parseSelectedDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Current view month & year state
  const [viewYear, setViewYear] = useState<number>(selectedDateObj?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDateObj?.getMonth() ?? today.getMonth());

  // Sync view when value changes externally
  useEffect(() => {
    if (selectedDateObj) {
      setViewYear(selectedDateObj.getFullYear());
      setViewMonth(selectedDateObj.getMonth());
    }
  }, [value]);

  // Handle Outside Click to Close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDate = (year: number, month: number, day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    handleSelectDate(y, m, d);
  };

  // Generate 42 cells (6 rows x 7 cols) with Monday start (0: Mon, 6: Sun)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

  // Day of week offset for Monday start: Sunday is 0 -> 6, Monday is 1 -> 0, etc.
  const rawDayOfWeek = firstDayOfMonth.getDay();
  const startOffset = rawDayOfWeek === 0 ? 6 : rawDayOfWeek - 1;

  const cells: Array<{
    year: number;
    month: number;
    day: number;
    isCurrentMonth: boolean;
    dateStr: string;
  }> = [];

  // Previous month padding days
  const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
  const prevMonthIndex = viewMonth === 0 ? 11 : viewMonth - 1;
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const dateStr = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ year: prevYear, month: prevMonthIndex, day, isCurrentMonth: false, dateStr });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ year: viewYear, month: viewMonth, day, isCurrentMonth: true, dateStr });
  }

  // Next month padding days to reach 42 cells (6 full weeks)
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
  const nextMonthIndex = viewMonth === 11 ? 0 : viewMonth + 1;
  let nextMonthDay = 1;
  while (cells.length < 42) {
    const dateStr = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(nextMonthDay).padStart(2, '0')}`;
    cells.push({ year: nextYear, month: nextMonthIndex, day: nextMonthDay, isCurrentMonth: false, dateStr });
    nextMonthDay++;
  }

  // Display text formatted
  const displayFormattedDate = selectedDateObj
    ? `${selectedDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : '';

  return (
    <div className={`relative font-sans select-none ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 mb-1">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      {/* Input Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-slate-50 border ${
          isOpen ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200'
        } rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 cursor-pointer transition-all shadow-2xs`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon className="w-4 h-4 text-sky-600 shrink-0" />
          <span className={`font-mono font-bold truncate ${value ? 'text-slate-900' : 'text-slate-400 font-normal'}`}>
            {value || placeholder}
          </span>
          {displayFormattedDate && (
            <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">
              ({displayFormattedDate})
            </span>
          )}
        </div>

        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-0.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-200/60 transition"
            title="Clear Date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ease-out ${isOpen ? 'rotate-90' : ''}`} />
        )}
      </div>

      {/* White Light Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-4 w-76 sm:w-80 animate-dropdown origin-top-left">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-slate-900 font-heading tracking-wide">
                {MONTH_NAMES[viewMonth]}
              </span>
              <span className="font-mono text-xs text-slate-500 font-bold">
                {viewYear}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Initials Row: M T W T F S S */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {WEEKDAY_INITIALS.map((dayInit, idx) => (
              <span key={idx} className="text-[11px] font-bold text-slate-400 py-1">
                {dayInit}
              </span>
            ))}
          </div>

          {/* Day Cells Grid with full border layout matching screenshot */}
          <div className="rounded-xl overflow-hidden border border-slate-200 grid grid-cols-7 bg-slate-50/40">
            {cells.map((cell, idx) => {
              const isSelected = value === cell.dateStr;
              const isToday =
                cell.year === today.getFullYear() &&
                cell.month === today.getMonth() &&
                cell.day === today.getDate();

              const isRightEdge = (idx + 1) % 7 === 0;
              const isBottomEdge = idx >= 35;

              return (
                <div
                  key={cell.dateStr + '-' + idx}
                  className={`relative flex items-center justify-center h-10 select-none ${
                    !isRightEdge ? 'border-r border-slate-200/80' : ''
                  } ${!isBottomEdge ? 'border-b border-slate-200/80' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectDate(cell.year, cell.month, cell.day)}
                    className={`w-8 h-8 rounded-full text-xs transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white font-black shadow-md shadow-slate-900/20 scale-105'
                        : isToday
                        ? 'text-sky-600 font-extrabold hover:bg-sky-50'
                        : cell.isCurrentMonth
                        ? 'text-slate-900 font-extrabold hover:bg-slate-200/70'
                        : 'text-slate-400 font-medium hover:bg-slate-100/50'
                    }`}
                  >
                    {cell.day}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Footer Controls */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={handleSetToday}
              className="font-bold text-sky-600 hover:text-sky-700 transition cursor-pointer flex items-center gap-1"
            >
              <span>Today</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="font-bold text-slate-400 hover:text-red-600 transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
