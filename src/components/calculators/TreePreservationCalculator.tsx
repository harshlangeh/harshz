"use client";
import React, { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getAppraisalState, saveAppraisalState } from '@/data/griha-v6-appraisals';
import { getProjectDetails } from '@/data/building-typology';
import { sumAreas } from '@/components/AreaList';
import type { CalculatorProps, CalculatorSummary } from '@/types/calculator';

const FIELDS = {
  siteArea: 'siteArea',
  hasExistingTrees: 'hasExistingTrees',
  existingTreesPrior: 'existingTreesPrior',
  existingTreesPreserved: 'existingTreesPreserved',
  existingTreesCut: 'existingTreesCut',
  treesTransplanted: 'treesTransplanted',
} as const;

const APPRAISAL_CODE = '1.1.2';
const SQM_PER_REQUIRED_TREE = 125;
const REPLANT_RATIO = 3;

function num(v: string | undefined): number {
  return parseFloat(v || '') || 0;
}

export function getTreePreservationSummary(projectId: string): CalculatorSummary {
  if (typeof window === 'undefined') return { status: 'pending', headline: 'Loading…' };
  const state = getAppraisalState(projectId, APPRAISAL_CODE);
  const calc = state.calculator || {};

  if (state.status === 'exempted' || calc[FIELDS.hasExistingTrees] === 'No') {
    return { status: 'exempted', headline: 'Exempted', subtext: 'No existing trees on site' };
  }
  const siteArea = num(calc[FIELDS.siteArea]);
  if (siteArea === 0) {
    return { status: 'pending', headline: 'Enter site area', subtext: 'Awaiting inputs' };
  }
  const cut = num(calc[FIELDS.existingTreesCut]);
  const preserved = num(calc[FIELDS.existingTreesPreserved]);
  const transplanted = num(calc[FIELDS.treesTransplanted]);
  const planted = cut * REPLANT_RATIO;
  const required = siteArea / SQM_PER_REQUIRED_TREE;
  const total = preserved + planted + transplanted;
  const met = required > 0 && total >= required;
  return {
    status: met ? 'compliant' : 'non-compliant',
    headline: `${total.toFixed(0)} / ${required.toFixed(0)} trees`,
    subtext: met ? 'Threshold met (Mandatory)' : 'Threshold not met',
  };
}

export function TreePreservationCalculator({ projectId, code, status, onValueChange }: CalculatorProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const state = getAppraisalState(projectId, code);
    const calc = state.calculator || {};
    if (!calc[FIELDS.siteArea]) {
      const siteAreaTotal = sumAreas(getProjectDetails(projectId).siteAreas);
      if (siteAreaTotal > 0) calc[FIELDS.siteArea] = String(siteAreaTotal);
    }
    setValues(calc);
  }, [projectId, code]);

  const update = (field: string, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    saveAppraisalState(projectId, code, { calculator: next });
    onValueChange?.();
  };

  const isExempted = status === 'exempted' || values[FIELDS.hasExistingTrees] === 'No';

  const cut = num(values[FIELDS.existingTreesCut]);
  const preserved = num(values[FIELDS.existingTreesPreserved]);
  const transplanted = num(values[FIELDS.treesTransplanted]);
  const siteArea = num(values[FIELDS.siteArea]);
  const planted = cut * REPLANT_RATIO;
  const required = isExempted ? 0 : siteArea / SQM_PER_REQUIRED_TREE;
  const total = preserved + planted + transplanted;
  const met = required > 0 && total >= required;

  const numberInput = (field: string, placeholder = '0') => (
    <input
      type="number" min={0} step="any" placeholder={placeholder}
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
        {row('A', 'Site area (sq m)', numberInput(FIELDS.siteArea))}
        {row(
          'B',
          'Are there any existing mature trees on site?',
          <Select value={values[FIELDS.hasExistingTrees] || ''} onValueChange={v => update(FIELDS.hasExistingTrees, v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>,
        )}
        {!isExempted && (
          <>
            {row('C', 'Existing mature trees on site prior to construction', numberInput(FIELDS.existingTreesPrior))}
            {row('D', 'Existing mature trees preserved on site', numberInput(FIELDS.existingTreesPreserved))}
            {row('E', 'Existing mature trees cut on site', numberInput(FIELDS.existingTreesCut))}
            {row('F', 'New trees planted of native/naturalized species (1:3 ratio)', computed(String(planted)))}
            {row('G', 'Trees transplanted successfully on site', numberInput(FIELDS.treesTransplanted))}
            {row('H', 'Trees required per GRIHA norm', computed(required ? required.toFixed(0) : '—'))}
            {row('I', 'Total trees preserved (D + F + G)', computed(String(total)))}
          </>
        )}
        {row(
          'J',
          'Meets GRIHA tree preservation threshold (Mandatory)?',
          isExempted
            ? computed('EXEMPTED', 'text-amber-500')
            : computed(
                required ? (met ? 'YES' : 'NO') : '—',
                required ? (met ? 'text-green-600' : 'text-red-500') : '',
              ),
        )}
      </tbody>
    </table>
  );
}
