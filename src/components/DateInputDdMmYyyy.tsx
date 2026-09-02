import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface DateInputDdMmYyyyProps {
  value: string; // Expected format: ISO 'YYYY-MM-DD'
  onChange: (isoValue: string) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  id?: string;
}

// Convert YYYY-MM-DD -> DD/MM/YYYY
export const isoToDdMmYyyy = (iso: string): string => {
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
};

// Convert DD/MM/YYYY -> YYYY-MM-DD
export const ddMmYyyyToIso = (dmy: string): string => {
  const clean = dmy.replace(/\D/g, '');
  if (clean.length === 8) {
    const day = clean.slice(0, 2);
    const month = clean.slice(2, 4);
    const year = clean.slice(4, 8);
    const dNum = parseInt(day, 10);
    const mNum = parseInt(month, 10);
    const yNum = parseInt(year, 10);
    if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31 && yNum >= 1900 && yNum <= 2100) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  return '';
};

// Mask input value to DD/MM/YYYY as user types
export const formatAsDdMmYyyy = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const DateInputDdMmYyyy: React.FC<DateInputDdMmYyyyProps> = ({
  value,
  onChange,
  required = false,
  className = '',
  placeholder = 'dd/mm/yyyy',
  id,
}) => {
  const [displayText, setDisplayText] = useState(() => isoToDdMmYyyy(value));
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayText(isoToDdMmYyyy(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAsDdMmYyyy(e.target.value);
    setDisplayText(formatted);

    const iso = ddMmYyyyToIso(formatted);
    if (iso) {
      onChange(iso);
    } else if (formatted === '') {
      onChange('');
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value;
    if (iso) {
      onChange(iso);
      setDisplayText(isoToDdMmYyyy(iso));
    }
  };

  const handleBlur = () => {
    if (value) {
      setDisplayText(isoToDdMmYyyy(value));
    } else {
      setDisplayText('');
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <Input
        id={id}
        type="text"
        value={displayText}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        maxLength={10}
        className={`pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => {
          if (hiddenDateRef.current) {
            if (typeof hiddenDateRef.current.showPicker === 'function') {
              hiddenDateRef.current.showPicker();
            } else {
              hiddenDateRef.current.click();
            }
          }
        }}
        className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
        title="Open calendar"
      >
        <Calendar className="w-4 h-4" />
      </button>
      <input
        ref={hiddenDateRef}
        type="date"
        value={value || ''}
        onChange={handleNativePickerChange}
        className="sr-only opacity-0 w-0 h-0 absolute pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
};

export default DateInputDdMmYyyy;
