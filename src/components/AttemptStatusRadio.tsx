"use client";
import React from 'react';
import type { AppraisalStatus } from '@/data/griha-v6-appraisals';

const OPTIONS: { value: AppraisalStatus; label: string }[] = [
  { value: 'attempting', label: 'Attempting' },
  { value: 'non-attempting', label: 'Non-Attempting' },
  { value: 'later', label: 'Later' },
];

interface Props {
  name: string;
  value: AppraisalStatus | null;
  onChange: (value: AppraisalStatus) => void;
}

export function AttemptStatusRadio({ name, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-4">
      {OPTIONS.map(opt => (
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
