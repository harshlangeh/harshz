"use client";
import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Calculator } from 'lucide-react';
import { CalculatorGrid } from '@/components/CalculatorGrid';
import { CALCULATOR_REGISTRY, type CalcRegistration } from '@/lib/calculator-registry';

export default function CalculatorsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = decodeURIComponent(params.projectId as string);

  const groups = useMemo(() => {
    const map = new Map<string, CalcRegistration[]>();
    for (const calc of CALCULATOR_REGISTRY) {
      const arr = map.get(calc.ratingLabel) ?? [];
      arr.push(calc);
      map.set(calc.ratingLabel, arr);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div className="container space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calculators</h1>
          <p className="text-sm text-muted-foreground">All configured calculators across rating systems</p>
        </div>
      </div>

      {groups.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No calculators have been configured yet.
        </div>
      )}

      {groups.map(([ratingLabel, calcs]) => (
        <div key={ratingLabel}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{ratingLabel}</h2>
          <CalculatorGrid projectId={projectId} calcs={calcs} />
        </div>
      ))}
    </div>
  );
}
