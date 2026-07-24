"use client";
import React, { useEffect, useState } from 'react';
import { getAppraisalState, saveAppraisalState, type AppraisalStatus } from '@/data/griha-v6-appraisals';
import { getProjectDetails, sumSiteAreaTotal } from '@/data/building-typology';

interface Props {
  projectId: string;
  code: string;
  status?: AppraisalStatus | null;
}

const SQMT_PER_TREE = 80;

function num(v: string | undefined): number {
  return parseFloat(v || '') || 0;
}

export function TreePlantingCalculator({ projectId, code, status: _status }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const state = getAppraisalState(projectId, code);
    const calc = { ...state.calculator };
    if (!calc['siteArea']) {
      const total = sumSiteAreaTotal(getProjectDetails(projectId));
      if (total > 0) calc['siteArea'] = String(total);
    }
    setValues(calc);
  }, [projectId, code]);

  const update = (field: string, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    saveAppraisalState(projectId, code, { calculator: next });
  };

  const siteArea = num(values['siteArea']);
  const treesRequired = siteArea > 0 ? Math.ceil(siteArea / SQMT_PER_TREE) : 0;

  const row = (letter: string, label: string, control: React.ReactNode) => (
    <tr>
      <td className="w-8 text-center font-semibold text-muted-foreground">{letter}</td>
      <td>{label}</td>
      <td className="w-44">{control}</td>
    </tr>
  );

  const computed = (text: string, highlight = false) => (
    <div className={`flex h-8 items-center justify-end rounded-md border border-input bg-muted/50 px-2 text-sm font-semibold ${highlight ? 'text-green-600' : ''}`}>
      {text}
    </div>
  );

  return (
    <table className="w-full text-sm">
      <tbody className="[&>tr>td]:py-2 [&>tr>td]:px-2 [&>tr]:border-b [&>tr]:border-border last:[&>tr]:border-0">
        {row(
          'A',
          'Site Area (m²)',
          <input
            type="number"
            min={0}
            step="any"
            placeholder="0"
            value={values['siteArea'] || ''}
            onChange={e => update('siteArea', e.target.value)}
            className="w-full h-8 px-2 text-sm text-right rounded-md border border-input bg-background outline-none focus:ring-1 focus:ring-ring"
          />,
        )}
        {row(
          'B',
          'Trees Required = A ÷ 80 (GRIHA norm)',
          computed(treesRequired > 0 ? String(treesRequired) : '—', treesRequired > 0),
        )}
      </tbody>
    </table>
  );
}
