import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Small "why am I filling this in" hint, shown next to a field label. Reused
// across the patient add/edit forms instead of repeating the same
// Tooltip/TooltipTrigger/TooltipContent markup at every field.
const FieldTooltip: React.FC<{ text: string }> = ({ text }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        className="inline-flex text-slate-400 hover:text-slate-600 align-middle"
        aria-label="More information"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs text-xs leading-relaxed">
      {text}
    </TooltipContent>
  </Tooltip>
);

export default FieldTooltip;
