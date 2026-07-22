"use client";
import React, { useEffect, useState } from 'react';
import { getAppraisalState, saveAppraisalState, type AppraisalStatus } from '@/data/griha-v6-appraisals';
import { scopedKey } from '@/lib/projects';

interface Props {
  projectId: string;
  code: string;
  status?: AppraisalStatus | null;
}

const LIVEABILITY_OCCUPANCY = 'li_occupancy';
const LIVEABILITY_TREE_AREA = 'li_tree_area';
const LIVEABILITY_SHRUB_AREA = 'li_shrub_area';

const LIVEABILITY_BENCHMARK = 9; // m² per person

function num(v: string | undefined): number {
  return parseFloat(v || '') || 0;
}

export function InnovationCalculator({ projectId, code }: Props) {
  const [strategies, setStrategies] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const state = getAppraisalState(projectId, code);
    setStrategies(state.strategies || []);
    const calc = { ...state.calculator };

    // Prefill occupancy and shrub bed area from global project_info if not already set
    try {
      const info = JSON.parse(localStorage.getItem(scopedKey(projectId, 'project_info')) || '{}');
      if (!calc[LIVEABILITY_OCCUPANCY] && info.occupancyFixed) {
        calc[LIVEABILITY_OCCUPANCY] = info.occupancyFixed;
      }
      if (!calc[LIVEABILITY_SHRUB_AREA] && info.shrubBedArea) {
        calc[LIVEABILITY_SHRUB_AREA] = info.shrubBedArea;
      }
    } catch {
      // ignore localStorage errors
    }

    setValues(calc);
  }, [projectId, code]);

  const update = (field: string, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    saveAppraisalState(projectId, code, { calculator: next });
  };

  const hasLiveability = strategies.includes('liveability-index');

  if (!hasLiveability) {
    return (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Select &ldquo;Liveability Index&rdquo; in the Narrative section to activate this calculator.
      </div>
    );
  }

  const computedCell = (text: string, colorClass = '') => (
    <div
      className={`flex h-8 items-center justify-end rounded-md border border-input bg-muted/50 px-2 text-sm font-semibold ${colorClass}`}
    >
      {text}
    </div>
  );

  const row = (letter: string, label: string, control: React.ReactNode) => (
    <tr>
      <td className="w-8 text-center font-semibold text-muted-foreground">{letter}</td>
      <td>{label}</td>
      <td className="w-44">{control}</td>
    </tr>
  );

  const numberInput = (field: string, placeholder = '0') => (
    <input
      type="number"
      min={0}
      step="any"
      placeholder={placeholder}
      value={values[field] || ''}
      onChange={e => update(field, e.target.value)}
      className="w-full h-8 px-2 text-sm text-right rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-ring"
    />
  );

  const occupancy = num(values[LIVEABILITY_OCCUPANCY]);
  const treeArea = num(values[LIVEABILITY_TREE_AREA]);
  const shrubArea = num(values[LIVEABILITY_SHRUB_AREA]);
  const liveabilityIndex = occupancy > 0 ? (treeArea + shrubArea) / occupancy : 0;
  const liveabilityMet = liveabilityIndex >= LIVEABILITY_BENCHMARK;

  return (
    <div>
      <p className="text-sm font-semibold mb-3">Liveability Index Calculator</p>
      <table className="w-full text-sm">
        <tbody className="[&>tr>td]:py-2 [&>tr>td]:px-2 [&>tr]:border-b [&>tr]:border-border last:[&>tr]:border-0">
          {row('A', 'Fixed occupancy of the building (persons) — from Project Dashboard', numberInput(LIVEABILITY_OCCUPANCY))}
          {row('B', 'Tree canopy area on site (m²)', numberInput(LIVEABILITY_TREE_AREA))}
          {row('C', 'Shrub bed area on site (m²) — from Project Dashboard', numberInput(LIVEABILITY_SHRUB_AREA))}
          {row(
            'D',
            'Total green area (B + C) (m²)',
            computedCell(occupancy > 0 ? (treeArea + shrubArea).toFixed(2) : '—'),
          )}
          {row(
            'E',
            `Liveability Index (D ÷ A) — benchmark ≥ ${LIVEABILITY_BENCHMARK} m²/person`,
            computedCell(
              occupancy > 0 ? liveabilityIndex.toFixed(2) : '—',
              occupancy > 0 ? (liveabilityMet ? 'text-green-600' : 'text-red-500') : '',
            ),
          )}
          {row(
            'F',
            'Meets Liveability Index benchmark?',
            occupancy > 0
              ? computedCell(liveabilityMet ? 'YES' : 'NO', liveabilityMet ? 'text-green-600' : 'text-red-500')
              : computedCell('—'),
          )}
        </tbody>
      </table>
    </div>
  );
}
