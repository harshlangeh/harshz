"use client";
import React, { useEffect, useState } from 'react';
import { getAppraisalState, saveAppraisalState, type AppraisalStatus } from '@/data/griha-v6-appraisals';

interface Props {
  projectId: string;
  code: string;
  status?: AppraisalStatus | null;
}

const WASH_DISHWASHER_VOLUME = 'wash_dishwasher_vol';
const WASH_CLOTHES_VOLUME = 'wash_clothes_vol';

function num(v: string | undefined): number {
  return parseFloat(v || '') || 0;
}

export function WaterFactorCalculator({ projectId, code }: Props) {
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

  const hasWaterFactor = strategies.includes('water-factor-limit');

  if (!hasWaterFactor) {
    return (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Select &ldquo;Water Factor Limit for Clothes and Dishes&rdquo; in the Narrative section to activate this calculator.
      </div>
    );
  }

  const dishwasherVol = num(values[WASH_DISHWASHER_VOLUME]);
  const clothesVol = num(values[WASH_CLOTHES_VOLUME]);
  const dishwasherOk = dishwasherVol > 0 && dishwasherVol < 24.6;
  const clothesOk = clothesVol > 0 && clothesVol < 35.96;

  return (
    <div>
      <p className="text-sm font-semibold mb-3">Water Factor Limit — Compliance</p>
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
  );
}
