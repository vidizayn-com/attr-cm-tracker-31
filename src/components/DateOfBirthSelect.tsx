import React from 'react';

interface DateOfBirthSelectProps {
  value?: string | null;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const DateOfBirthSelect: React.FC<DateOfBirthSelectProps> = ({ value, onChange, disabled }) => {
  const parts = value ? value.split('-') : [];
  const year = parts[0] || '';
  const month = parts[1] || '';
  const day = parts[2] || '';

  const currentYear = new Date().getFullYear();
  // 120 years back
  const years = Array.from({ length: 120 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  
  // Calculate max days for the selected month/year
  const getDaysInMonth = (m: string, y: string) => {
    if (!m) return 31;
    const monthNum = parseInt(m, 10);
    const yearNum = y ? parseInt(y, 10) : 2000; // default to leap year to be safe if no year
    return new Date(yearNum, monthNum, 0).getDate();
  };

  const maxDays = getDaysInMonth(month, year);
  const days = Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, '0'));

  const handleChange = (type: 'year' | 'month' | 'day', val: string) => {
    let y = year, m = month, d = day;
    if (type === 'year') y = val;
    if (type === 'month') m = val;
    if (type === 'day') d = val;

    if (!y && !m && !d) {
      onChange('');
      return;
    }
    
    // Ensure selected day is not greater than the max days of the new month/year
    const newMaxDays = getDaysInMonth(m, y);
    if (d && parseInt(d, 10) > newMaxDays) {
        d = String(newMaxDays).padStart(2, '0');
    }

    onChange(`${y || new Date().getFullYear()}-${m || '01'}-${d || '01'}`);
  };

  return (
    <div className="flex gap-2 w-full">
      <select
        disabled={disabled}
        value={day}
        onChange={(e) => handleChange('day', e.target.value)}
        className="flex-1 h-10 px-2 border border-gray-300 rounded-md text-sm sm:text-base bg-white outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:text-gray-500"
      >
        <option value="">Day</option>
        {days.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      
      <select
        disabled={disabled}
        value={month}
        onChange={(e) => handleChange('month', e.target.value)}
        className="flex-1 h-10 px-2 border border-gray-300 rounded-md text-sm sm:text-base bg-white outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:text-gray-500"
      >
        <option value="">Month</option>
        {months.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <select
        disabled={disabled}
        value={year}
        onChange={(e) => handleChange('year', e.target.value)}
        className="flex-[1.2] h-10 px-2 border border-gray-300 rounded-md text-sm sm:text-base bg-white outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:text-gray-500"
      >
        <option value="">Year</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
};

export default DateOfBirthSelect;
