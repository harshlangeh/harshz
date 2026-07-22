"use client";
import React, { useEffect, useState } from 'react';
import { getAppraisalState, saveAppraisalState, type AppraisalStatus } from '@/data/griha-v6-appraisals';

interface Props {
  projectId: string;
  code: string;
  status?: AppraisalStatus | null;
}

const LIVEABILITY_OCCUPANCY = 'li_occupancy';
const LIVEABILITY_TREE_AREA = 'li_tree_area';
const LIVEABILITY_SHRUB_AREA = 'li_shrub_area';
const WASH_DISHWASHER_VOLUME = 'wash_dishwasher_vol';
const WASH_CLOTHES_VOLUME = 'wash_clothes_vol';

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
    setValues(state.calculator || {});
  }, [projectId, code]);

  const update = (field: string, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    saveAppraisalState(projectId, code, { calculator: next });
  };

  const hasLiveability = strategies.includes('liveability-index');
  const hasWashing = strategies.includes('washing-equipment');

  if (!hasLiveability && !hasWashing) {
    return (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Select &ldquo;Liveability Index&rdquo; or &ldquo;Washing Equipment Conservation&rdquo; in the Narrative
        section to activate the relevant calculators.
      </div>
    );
  }

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

  // Liveability Index
  const occupancy = num(values[LIVEABILITY_OCCUPANCY]);
  const treeArea = num(values[LIVEABILITY_TREE_AREA]);
  const shrubArea = num(values[LIVEABILITY_SHRUB_AREA]);
  const liveabilityIndex = occupancy > 0 ? (treeArea + shrubArea) / occupancy : 0;
  const liveabilityMet = liveabilityIndex >= LIVEABILITY_BENCHMARK;

  // Washing Equipment
  const dishwasherVol = num(values[WASH_DISHWASHER_VOLUME]);
  const clothesVol = num(values[WASH_CLOTHES_VOLUME]);
  const dishwasherOk = dishwasherVol > 0 && dishwasherVol < 24.6;
  const clothesOk = clothesVol > 0 && clothesVol < 35.96;

  return (
    <div className="space-y-6">
      {hasLiveability && (
        <div>
          <p className="text-sm font-semibold mb-3">Liveability Index Calculator</p>
          <table className="w-full text-sm">
            <tbody className="[&>tr>td]:py-2 [&>tr>td]:px-2 [&>tr]:border-b [&>tr]:border-border last:[&>tr]:border-0">
              {row('A', 'Fixed occupancy of the building (persons)', numberInput(LIVEABILITY_OCCUPANCY))}
              {row('B', 'Tree canopy area on site (m²)', numberInput(LIVEABILITY_TREE_AREA))}
              {row('C', 'Shrub bed area on site (m²)', numberInput(LIVEABILITY_SHRUB_AREA))}
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
      )}

      {hasWashing && (
        <div>
          <p className="text-sm font-semibold mb-3">Washing Equipment Compliance</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-2 py-2 text-left font-medium text-muted-foreground">Equipment</th>
                <th className="px-2 py-2 text-left font-medium text-muted-foreground">GRIHA Limit</th>
                <th className="px-2 py-2 text-left font-medium text-muted-foreground w-44">Project Value</th>
                <th className="px-2 py-2 text-left font-medium text-muted-foreground w-28">Compliance</th>
              </tr>
            </thead>
            <tbody className="[&>tr>td]:py-2 [&>tr>td]:px-2 [&>tr]:border-b [&>tr]:border-border last:[&>tr]:border-0">
              <tr>
                <td>Dishwasher</td>
                <td className="text-muted-foreground">&lt; 24.6 L/cycle</td>
                <td>
                  <div className="flex items-center border border-input rounded-md focus-within:ring-1 focus-within:ring-ring overflow-hidden bg-background">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={values[WASH_DISHWASHER_VOLUME] || ''}
                      onChange={e => update(WASH_DISHWASHER_VOLUME, e.target.value)}
                      className="flex-1 h-8 px-2 text-sm text-right bg-transparent outline-none"
                    />
                    <span className="pr-2 text-xs text-muted-foreground whitespace-nowrap">L/cycle</span>
                  </div>
                </td>
                <td>
                  {dishwasherVol > 0 ? (
                    <span className={`text-sm font-semibold ${dishwasherOk ? 'text-green-600' : 'text-red-500'}`}>
                      {dishwasherOk ? 'COMPLIANT' : 'NON-COMPLIANT'}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
              <tr>
                <td>Clothes Washer</td>
                <td className="text-muted-foreground">&lt; 35.96 L/cycle/cu.ft</td>
                <td>
                  <div className="flex items-center border border-input rounded-md focus-within:ring-1 focus-within:ring-ring overflow-hidden bg-background">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="0"
                      value={values[WASH_CLOTHES_VOLUME] || ''}
                      onChange={e => update(WASH_CLOTHES_VOLUME, e.target.value)}
                      className="flex-1 h-8 px-2 text-sm text-right bg-transparent outline-none"
                    />
                    <span className="pr-2 text-xs text-muted-foreground whitespace-nowrap">L/cy/cu.ft</span>
                  </div>
                </td>
                <td>
                  {clothesVol > 0 ? (
                    <span className={`text-sm font-semibold ${clothesOk ? 'text-green-600' : 'text-red-500'}`}>
                      {clothesOk ? 'COMPLIANT' : 'NON-COMPLIANT'}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
