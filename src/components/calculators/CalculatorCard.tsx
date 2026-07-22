"use client";
import React from 'react';
import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import type { CalcSummary } from '@/lib/calculator-registry';

interface Props {
  title: string;
  description: string;
  summary: CalcSummary;
  criterionLabel: string;
  ratingLabel: string;
  onClick: () => void;
}

export function CalculatorCard({ title, description, summary, criterionLabel, ratingLabel, onClick }: Props) {
  const StatusIcon = summary.status === 'pass'
    ? CheckCircle2
    : summary.status === 'fail'
      ? XCircle
      : MinusCircle;

  const iconColor = summary.status === 'pass'
    ? 'text-green-600'
    : summary.status === 'fail'
      ? 'text-red-500'
      : 'text-muted-foreground';

  const resultColor = summary.status === 'pass'
    ? 'text-green-600'
    : summary.status === 'fail'
      ? 'text-red-500'
      : 'text-muted-foreground';

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-card p-4 hover:border-primary hover:shadow-sm transition-all flex flex-col gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug flex-1">{title}</p>
        <StatusIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>

      <div className="mt-auto space-y-1">
        <p className={`text-base font-bold ${resultColor}`}>{summary.result}</p>
        {summary.points !== undefined && (
          <p className="text-xs text-muted-foreground">
            Points: <span className="font-semibold text-foreground">{summary.points} / {summary.maxPoints}</span>
          </p>
        )}
        {summary.compliance && (
          <p className="text-xs text-muted-foreground">
            Compliance: <span className={`font-semibold ${resultColor}`}>{summary.compliance}</span>
          </p>
        )}
      </div>

      <div className="border-t border-border pt-2 space-y-0.5">
        <p className="text-xs text-muted-foreground">{criterionLabel}</p>
        <p className="text-xs text-muted-foreground/60">{ratingLabel}</p>
      </div>
    </button>
  );
}
