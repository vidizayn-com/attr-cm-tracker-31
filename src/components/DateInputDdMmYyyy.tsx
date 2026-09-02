import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface DateInputDdMmYyyyProps {
  value: string; // Expected format: ISO 'YYYY-MM-DD' or 'DD/MM/YYYY'
  onChange?: (isoValue: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  id?: string;
}

// Convert YYYY-MM-DD -> DD/MM/YYYY
export const isoToDdMmYyyy = (iso: string): string => {
  if (!iso) return '';
  if (iso.includes('/')) return iso;
  const cleanIso = iso.includes('T') ? iso.split('T')[0] : iso;
  const parts = cleanIso.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts;
    if (y.length === 4) {
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  return iso;
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
  disabled = false,
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
    if (disabled) return;
    const formatted = formatAsDdMmYyyy(e.target.value);
    setDisplayText(formatted);

    const iso = ddMmYyyyToIso(formatted);
    if (onChange) {
      if (iso) {
        onChange(iso);
      } else if (formatted === '') {
        onChange('');
      }
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const iso = e.target.value;
    if (iso && onChange) {
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
        disabled={disabled}
        maxLength={10}
        className={`pr-10 ${className}`}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (hiddenDateRef.current) {
            if (typeof hiddenDateRef.current.showPicker === 'function') {
              hiddenDateRef.current.showPicker();
            } else {
              hiddenDateRef.current.click();
            }
          }
        }}
        className={`absolute right-3 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        title="Open calendar"
      >
        <Calendar className="w-4 h-4" />
      </button>
      <input
        ref={hiddenDateRef}
        type="date"
        value={value || ''}
        onChange={handleNativePickerChange}
        disabled={disabled}
        className="sr-only opacity-0 w-0 h-0 absolute pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
};

export default DateInputDdMmYyyy;
