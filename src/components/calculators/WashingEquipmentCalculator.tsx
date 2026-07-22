"use client";
import React, { useEffect, useState } from 'react';
import { getAppraisalState, saveAppraisalState } from '@/data/griha-v6-appraisals';
import type { CalculatorProps, CalculatorSummary } from '@/types/calculator';

const DISHWASHER_VOL = 'wash_dishwasher_vol';
const CLOTHES_VOL = 'wash_clothes_vol';
const APPRAISAL_CODE = '30.1.1';

const DISHWASHER_LIMIT = 24.6;
const CLOTHES_LIMIT = 35.96;

function num(v: string | undefined): number {
  return parseFloat(v || '') || 0;
}

export function getWashingEquipmentSummary(projectId: string): CalculatorSummary {
  if (typeof window === 'undefined') return { status: 'pending', headline: 'Loading…' };
  const state = getAppraisalState(projectId, APPRAISAL_CODE);
  if (!state.strategies?.includes('washing-equipment')) {
    return { status: 'pending', headline: 'Not selected', subtext: 'Select "Washing Equipment Conservation" strategy first' };
  }
  const calc = state.calculator || {};
  const d = num(calc[DISHWASHER_VOL]);
  const c = num(calc[CLOTHES_VOL]);
  if (d === 0 && c === 0) {
    return { status: 'pending', headline: 'Enter specs', subtext: 'Equipment data required' };
  }
  const dOk = d === 0 || d < DISHWASHER_LIMIT;
  const cOk = c === 0 || c < CLOTHES_LIMIT;
  const allOk = dOk && cOk;
  const failCount = (!dOk ? 1 : 0) + (!cOk ? 1 : 0);
  const checkedCount = (d > 0 ? 1 : 0) + (c > 0 ? 1 : 0);
  return allOk
    ? { status: 'compliant', headline: 'All equipment compliant', subtext: `${checkedCount} type${checkedCount === 1 ? '' : 's'} checked` }
    : { status: 'non-compliant', headline: `${failCount} type${failCount === 1 ? '' : 's'} non-compliant`, subtext: 'Review specifications' };
}

export function WashingEquipmentCalculator({ projectId, code, onValueChange }: CalculatorProps) {
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

  if (!strategies.includes('washing-equipment')) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Select the <strong>Washing Equipment Conservation</strong> strategy in the Narrative section to activate this calculator.
      </p>
    );
  }

  const dVol = num(values[DISHWASHER_VOL]);
  const cVol = num(values[CLOTHES_VOL]);
  const dOk = dVol > 0 && dVol < DISHWASHER_LIMIT;
  const cOk = cVol > 0 && cVol < CLOTHES_LIMIT;

  const unitInput = (field: string, unit: string) => (
    <div className="flex items-center border border-input rounded-md focus-within:ring-1 focus-within:ring-ring overflow-hidden bg-background">
      <input
        type="number"
        min={0}
        step="any"
        placeholder="0"
        value={values[field] || ''}
        onChange={e => update(field, e.target.value)}
        className="flex-1 h-8 px-2 text-sm text-right bg-transparent outline-none"
      />
      <span className="pr-2 text-xs text-muted-foreground whitespace-nowrap">{unit}</span>
    </div>
  );

  const compliance = (vol: number, ok: boolean) =>
    vol > 0
      ? <span className={`text-sm font-semibold ${ok ? 'text-green-600' : 'text-red-500'}`}>{ok ? '✓ Compliant' : '✗ Non-compliant'}</span>
      : <span className="text-sm text-muted-foreground">—</span>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border">
          <th className="px-2 py-2 text-left font-medium text-muted-foreground">Equipment</th>
          <th className="px-2 py-2 text-left font-medium text-muted-foreground">GRIHA Limit</th>
          <th className="px-2 py-2 text-left font-medium text-muted-foreground w-44">Project Value</th>
          <th className="px-2 py-2 text-left font-medium text-muted-foreground">Status</th>
        </tr>
      </thead>
      <tbody className="[&>tr>td]:py-2 [&>tr>td]:px-2 [&>tr]:border-b [&>tr]:border-border last:[&>tr]:border-0">
        <tr>
          <td>Dishwasher</td>
          <td className="text-muted-foreground">&lt; {DISHWASHER_LIMIT} L/cycle</td>
          <td>{unitInput(DISHWASHER_VOL, 'L/cycle')}</td>
          <td>{compliance(dVol, dOk)}</td>
        </tr>
        <tr>
          <td>Clothes Washer</td>
          <td className="text-muted-foreground">&lt; {CLOTHES_LIMIT} L/cy/cu.ft</td>
          <td>{unitInput(CLOTHES_VOL, 'L/cy/cu.ft')}</td>
          <td>{compliance(cVol, cOk)}</td>
        </tr>
      </tbody>
    </table>
  );
}
