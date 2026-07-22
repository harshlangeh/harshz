"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import { CalculatorCard } from '@/components/calculators/CalculatorCard';
import { getCalculatorsForCriterion, type CalcRegistration, type CalcSummary } from '@/lib/calculator-registry';
import type { AppraisalStatus } from '@/data/griha-v6-appraisals';

interface Props {
  projectId: string;
  status?: AppraisalStatus | null;
  /** Provide an explicit list (for the all-calculators page) OR use rating+criterionCode to filter the registry. */
  calcs?: CalcRegistration[];
  rating?: string;
  criterionCode?: string;
}

export function CalculatorGrid({ projectId, status, calcs: explicitCalcs, rating, criterionCode }: Props) {
  const calcs = explicitCalcs ?? (rating && criterionCode ? getCalculatorsForCriterion(rating, criterionCode) : []);
  const [summaries, setSummaries] = useState<Record<string, CalcSummary>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const refreshSummaries = useCallback(() => {
    const next: Record<string, CalcSummary> = {};
    for (const calc of calcs) {
      next[calc.id] = calc.getSummary(projectId);
    }
    setSummaries(next);
  }, [projectId, calcs]);

  useEffect(() => {
    refreshSummaries();
  }, [refreshSummaries]);

  const openCalc = calcs.find(c => c.id === openId) ?? null;

  const closeModal = () => {
    setOpenId(null);
    refreshSummaries();
  };

  if (calcs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No calculators are configured for this criterion yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {calcs.map(calc => (
          <CalculatorCard
            key={calc.id}
            title={calc.title}
            description={calc.description}
            summary={summaries[calc.id] ?? { result: '—', status: 'pending' }}
            criterionLabel={calc.criterionLabel}
            ratingLabel={calc.ratingLabel}
            onClick={() => setOpenId(calc.id)}
          />
        ))}
      </div>

      {openCalc && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-background rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{openCalc.criterionLabel} · {openCalc.ratingLabel}</p>
                <h2 className="text-base font-semibold">{openCalc.title}</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md hover:bg-muted transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-4">
              <openCalc.Component
                projectId={projectId}
                code={openCalc.criterionCode}
                status={status}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
