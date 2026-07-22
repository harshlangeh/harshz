"use client";
import React, { useEffect, useState } from 'react';
import { getAppraisalState, saveAppraisalState } from '@/data/griha-v6-appraisals';
import type { CalculatorProps, CalculatorSummary } from '@/types/calculator';

const OCCUPANCY = 'li_occupancy';
const TREE_AREA = 'li_tree_area';
const SHRUB_AREA = 'li_shrub_area';
const APPRAISAL_CODE = '30.1.1';
const BENCHMARK = 9;

function num(v: string | undefined): number {
  return parseFloat(v || '') || 0;
}

export function getLiveabilityIndexSummary(projectId: string): CalculatorSummary {
  if (typeof window === 'undefined') return { status: 'pending', headline: 'Loading…' };
  const state = getAppraisalState(projectId, APPRAISAL_CODE);
  if (!state.strategies?.includes('liveability-index')) {
    return { status: 'pending', headline: 'Not selected', subtext: 'Select "Liveability Index" strategy first' };
  }
  const calc = state.calculator || {};
  const occupancy = num(calc[OCCUPANCY]);
  if (occupancy === 0) {
    return { status: 'pending', headline: 'Enter inputs', subtext: 'Fixed occupancy required' };
  }
  const index = (num(calc[TREE_AREA]) + num(calc[SHRUB_AREA])) / occupancy;
  const compliant = index >= BENCHMARK;
  return {
    status: compliant ? 'compliant' : 'non-compliant',
    headline: `${index.toFixed(2)} m²/person`,
    subtext: `Benchmark ≥ ${BENCHMARK} m²/person`,
  };
}

export function LiveabilityIndexCalculator({ projectId, code, onValueChange }: CalculatorProps) {
  const [strategies, setStrategies] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const state = getAppraisalState(projectId, code);
    setStrategies(state.strategies || []);
    setValues(state.calculator || {});
  }, [projectId, code]);

  const update = (field: string, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    saveAppraisalState(projectId, code, { calculator: next });
    onValueChange?.();
  };

  if (!strategies.includes('liveability-index')) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Select the <strong>Liveability Index</strong> strategy in the Narrative section to activate this calculator.
      </p>
    );
  }

  const occupancy = num(values[OCCUPANCY]);
  const treeArea = num(values[TREE_AREA]);
  const shrubArea = num(values[SHRUB_AREA]);
  const index = occupancy > 0 ? (treeArea + shrubArea) / occupancy : 0;
  const compliant = index >= BENCHMARK;

  const numberInput = (field: string) => (
    <input
      type="number"
      min={0}
      step="any"
      placeholder="0"
      value={values[field] || ''}
      onChange={e => update(field, e.target.value)}
      className="w-full h-8 px-2 text-sm text-right rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-ring"
    />
  );

  const computed = (text: string, colorClass = '') => (
    <div className={`flex h-8 items-center justify-end rounded-md border border-input bg-muted/50 px-2 text-sm font-semibold ${colorClass}`}>
      {text}
    </div>
  );

  const row = (letter: string, label: string, ctrl: React.ReactNode) => (
    <tr key={letter}>
      <td className="w-8 text-center font-semibold text-muted-foreground">{letter}</td>
      <td>{label}</td>
      <td className="w-44">{ctrl}</td>
    </tr>
  );

  return (
    <table className="w-full text-sm">
      <tbody className="[&>tr>td]:py-2 [&>tr>td]:px-2 [&>tr]:border-b [&>tr]:border-border last:[&>tr]:border-0">
        {row('A', 'Fixed occupancy (persons)', numberInput(OCCUPANCY))}
        {row('B', 'Tree canopy area (m²)', numberInput(TREE_AREA))}
        {row('C', 'Shrub bed area (m²)', numberInput(SHRUB_AREA))}
        {row('D', 'Total green area — B + C (m²)', computed(occupancy > 0 ? (treeArea + shrubArea).toFixed(2) : '—'))}
        {row(
          'E',
          `Liveability Index — D ÷ A (benchmark ≥ ${BENCHMARK} m²/person)`,
          computed(
            occupancy > 0 ? index.toFixed(2) : '—',
            occupancy > 0 ? (compliant ? 'text-green-600' : 'text-red-500') : '',
          ),
        )}
        {row(
          'F',
          'Meets benchmark?',
          occupancy > 0
            ? computed(compliant ? 'YES' : 'NO', compliant ? 'text-green-600' : 'text-red-500')
            : computed('—'),
        )}
      </tbody>
    </table>
  );
}
