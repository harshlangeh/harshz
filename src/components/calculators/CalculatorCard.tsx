"use client";
import React, { useState, useCallback } from 'react';
import { ChevronDown, CheckCircle2, XCircle, Clock, MinusCircle } from 'lucide-react';
import type { CalculatorSummary, ComplianceStatus, CalculatorProps } from '@/types/calculator';
import type { AppraisalStatus } from '@/data/griha-v6-appraisals';

interface CalculatorCardProps {
  title: string;
  description: string;
  projectId: string;
  code: string;
  appraisalStatus: AppraisalStatus | null;
  getSummary: (projectId: string) => CalculatorSummary;
  Calculator: React.ComponentType<CalculatorProps>;
}

const STATUS: Record<ComplianceStatus, {
  Icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  badgeClass: string;
  label: string;
}> = {
  compliant: {
    Icon: CheckCircle2,
    iconClass: 'text-green-500',
    badgeClass: 'bg-green-50 text-green-700 dark:bg-green-950/60 dark:text-green-400 border border-green-200 dark:border-green-800',
    label: 'Compliant',
  },
  'non-compliant': {
    Icon: XCircle,
    iconClass: 'text-red-500',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-800',
    label: 'Non-Compliant',
  },
  pending: {
    Icon: Clock,
    iconClass: 'text-muted-foreground',
    badgeClass: 'bg-muted/60 text-muted-foreground border border-border',
    label: 'Pending',
  },
  exempted: {
    Icon: MinusCircle,
    iconClass: 'text-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    label: 'Exempted',
  },
};

export function CalculatorCard({
  title,
  description,
  projectId,
  code,
  appraisalStatus,
  getSummary,
  Calculator,
}: CalculatorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [summary, setSummary] = useState<CalculatorSummary>(() => getSummary(projectId));

  const refreshSummary = useCallback(() => {
    setSummary(getSummary(projectId));
  }, [projectId, getSummary]);

  const cfg = STATUS[summary.status];
  const { Icon } = cfg;

  const headlineColor =
    summary.status === 'compliant'
      ? 'text-green-600 dark:text-green-400'
      : summary.status === 'non-compliant'
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground';

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card hover:shadow-sm transition-shadow flex flex-col">
      {/* Card header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-2.5 p-3 text-left hover:bg-muted/30 transition-colors flex-1"
      >
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${cfg.iconClass}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{title}</p>
          <p className={`text-sm font-bold mt-0.5 truncate ${headlineColor}`}>{summary.headline}</p>
          {summary.subtext && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{summary.subtext}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-sm ${cfg.badgeClass}`}>
              {cfg.label}
            </span>
            {summary.pointsAchieved !== undefined && (
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{summary.pointsAchieved}</span>
                {summary.pointsMax !== undefined && ` / ${summary.pointsMax}`} pts
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform mt-0.5 ${expanded ? '' : '-rotate-90'}`}
        />
      </button>

      {/* Expanded body — full calculator */}
      {expanded && (
        <div className="border-t border-border p-3 bg-muted/10 overflow-x-auto">
          <p className="text-xs text-muted-foreground mb-3 italic">{description}</p>
          <Calculator
            projectId={projectId}
            code={code}
            status={appraisalStatus}
            onValueChange={refreshSummary}
          />
        </div>
      )}
    </div>
  );
}
