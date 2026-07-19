"use client";
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getAppraisalState, saveAppraisalState } from '@/data/griha-v6-appraisals';
import { getProjectDetails } from '@/data/building-typology';
import { sumAreas } from '@/components/AreaList';

interface Props {
  code: string;
}

const FIELDS = {
  siteArea: 'siteArea',
  hasExistingTrees: 'hasExistingTrees',
  existingTreesPrior: 'existingTreesPrior',
  existingTreesPreserved: 'existingTreesPreserved',
  existingTreesCut: 'existingTreesCut',
  treesTransplanted: 'treesTransplanted',
} as const;

/** GRIHA norm used for the site-area-based tree requirement: 1 tree per 125 sq.m of site area. */
const SQM_PER_REQUIRED_TREE = 125;
/** Replacement ratio for every mature tree cut: 1 cut → 3 new native/naturalized trees planted. */
const REPLANT_RATIO = 3;

function num(v: string | undefined): number {
  return parseFloat(v || '') || 0;
}

export function TreePreservationCalculator({ code }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const state = getAppraisalState(code);
    const calc = state.calculator || {};
    if (!calc[FIELDS.siteArea]) {
      // Prefill site area from Project Details, same convention as the rest of the app.
      const siteAreaTotal = sumAreas(getProjectDetails().siteAreas);
      if (siteAreaTotal > 0) calc[FIELDS.siteArea] = String(siteAreaTotal);
    }
    setValues(calc);
  }, [code]);

  const update = (field: string, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    saveAppraisalState(code, { calculator: next });
  };

  const existingTreesCut = num(values[FIELDS.existingTreesCut]);
  const existingTreesPreserved = num(values[FIELDS.existingTreesPreserved]);
  const treesTransplanted = num(values[FIELDS.treesTransplanted]);
  const siteArea = num(values[FIELDS.siteArea]);

  // F — new trees required to replant, per the 1:3 replacement ratio for cut mature trees.
  const treesPlanted = existingTreesCut * REPLANT_RATIO;
  // H — GRIHA site-area-based tree requirement.
  const requiredTrees = siteArea / SQM_PER_REQUIRED_TREE;
  // I — total preserved via a combination of preservation, replanting and transplanting.
  const totalPreserved = existingTreesPreserved + treesPlanted + treesTransplanted;
  // J — mandatory threshold check.
  const meetsThreshold = requiredTrees > 0 && totalPreserved >= requiredTrees;

  const row = (
    letter: string,
    label: string,
    control: React.ReactNode,
  ) => (
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

  const computedCell = (text: string, colorClass = '') => (
    <div className={`flex h-8 items-center justify-end rounded-md border border-input bg-muted/50 px-2 text-sm font-semibold ${colorClass}`}>
      {text}
    </div>
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
        {row('C', 'Number of existing mature trees on site prior to construction', numberInput(FIELDS.existingTreesPrior))}
        {row('D', 'Number of existing mature trees preserved on site', numberInput(FIELDS.existingTreesPreserved))}
        {row('E', 'Number of existing mature trees cut on site', numberInput(FIELDS.existingTreesCut))}
        {row(
          'F',
          'Number of new trees planted of native/naturalized species (in the ratio of 1:3)',
          computedCell(String(treesPlanted)),
        )}
        {row('G', 'Number of trees transplanted successfully on site', numberInput(FIELDS.treesTransplanted))}
        {row('H', 'Number of trees as per GRIHA requirement', computedCell(requiredTrees ? requiredTrees.toFixed(0) : '—'))}
        {row('I', 'Total number of trees preserved using a combination of strategies', computedCell(String(totalPreserved)))}
        {row(
          'J',
          'Does the project meet the GRIHA tree preservation threshold (Mandatory)?',
          computedCell(
            requiredTrees ? (meetsThreshold ? 'YES' : 'NO') : '—',
            requiredTrees ? (meetsThreshold ? 'text-green-600' : 'text-red-500') : '',
          ),
        )}
      </tbody>
    </table>
  );
}
