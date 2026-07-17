"use client";
import React from 'react';
import type { AppraisalStatus } from '@/data/griha-v6-appraisals';

const OPTIONS: { value: AppraisalStatus; label: string }[] = [
  { value: 'attempting', label: 'Attempting' },
  { value: 'non-attempting', label: 'Non-Attempting' },
  { value: 'later', label: 'Later' },
];

const EXEMPT_OPTION: { value: AppraisalStatus; label: string } = { value: 'exempted', label: 'Exempted' };

interface Props {
  name: string;
  value: AppraisalStatus | null;
  onChange: (value: AppraisalStatus) => void;
  /** Offers a 4th "Exempted" option (applicability check) — only for appraisals that allow it. */
  exemptable?: boolean;
}

export function AttemptStatusRadio({ name, value, onChange, exemptable }: Props) {
  const options = exemptable ? [...OPTIONS, EXEMPT_OPTION] : OPTIONS;
  return (
    <div className="flex flex-wrap gap-4">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-primary h-3.5 w-3.5 cursor-pointer"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
