import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
}

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const PERIODS = ['AM', 'PM'];

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select Time'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value (e.g., "08:30 AM")
  const parseTime = (val: string) => {
    const match = (val || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      const h = match[1].padStart(2, '0');
      const m = match[2];
      const p = match[3].toUpperCase();
      return { hour: HOURS.includes(h) ? h : '08', minute: MINUTES.includes(m) ? m : '00', period: p };
    }
    return { hour: '08', minute: '30', period: 'AM' };
  };

  const current = parseTime(value);

  const handleSelect = (hour: string, minute: string, period: string) => {
    const formatted = `${hour}:${minute} ${period}`;
    onChange(formatted);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative font-sans" ref={containerRef}>
      {label && <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>}

      {/* Button Trigger Header matching Picture File 2 */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-slate-50 border ${
          isOpen ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200'
        } rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 cursor-pointer transition-all shadow-2xs select-none`}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="font-bold text-slate-900">{value || placeholder}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </div>

      {/* Time Picker Popover Dropdown matching Picture File 2 */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-3 w-72 text-xs select-none">
          <div className="grid grid-cols-3 gap-2 divide-x divide-slate-100 text-center">
            {/* HOUR Column */}
            <div className="pr-1 space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                HOUR
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {HOURS.map((h) => {
                  const isSelected = current.hour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelect(h, current.minute, current.period)}
                      className={`w-full py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#0088CC] text-white shadow-md shadow-sky-500/30'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MIN Column */}
            <div className="px-1 space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                MIN
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 px-1 custom-scrollbar">
                {MINUTES.map((m) => {
                  const isSelected = current.minute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelect(current.hour, m, current.period)}
                      className={`w-full py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#0088CC] text-white shadow-md shadow-sky-500/30'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AM/PM Column */}
            <div className="pl-1 space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                AM/PM
              </p>
              <div className="space-y-1.5 pt-1">
                {PERIODS.map((p) => {
                  const isSelected = current.period === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelect(current.hour, current.minute, p)}
                      className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#0088CC] text-white shadow-md shadow-sky-500/30'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
