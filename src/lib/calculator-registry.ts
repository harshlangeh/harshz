"use client";
import type { AppraisalStatus } from '@/data/griha-v6-appraisals';
import { getAppraisalState } from '@/data/griha-v6-appraisals';
import { TreePreservationCalculator } from '@/components/calculators/TreePreservationCalculator';
import { InnovationCalculator } from '@/components/calculators/InnovationCalculator';
import { WaterFactorCalculator } from '@/components/calculators/WaterFactorCalculator';
import type React from 'react';

export type CalcStatus = 'pass' | 'fail' | 'pending';

export interface CalcSummary {
  result: string;
  status: CalcStatus;
  points?: number;
  maxPoints?: number;
  compliance?: string;
}

export interface CalcRegistration {
  id: string;
  title: string;
  description: string;
  rating: string;
  ratingLabel: string;
  criterionCode: string;
  criterionLabel: string;
  criterionPath: (projectId: string) => string;
  Component: React.ComponentType<{ projectId: string; code: string; status?: AppraisalStatus | null }>;
  getSummary: (projectId: string) => CalcSummary;
}

export const CALCULATOR_REGISTRY: CalcRegistration[] = [
  {
    id: 'tree-preservation',
    title: 'Tree Preservation',
    description: 'Mandatory check — 1 preserved tree per 125 m² site area, 1:3 replant ratio for cut trees',
    rating: 'griha-v6',
    ratingLabel: 'GRIHA V6',
    criterionCode: '1.1.2',
    criterionLabel: 'Criterion 1 · Green Infrastructure',
    criterionPath: (p) => `/project/${p}/griha-v6/appraisal/1.1.2`,
    Component: TreePreservationCalculator,
    getSummary: (projectId) => {
      const state = getAppraisalState(projectId, '1.1.2');
      const calc = state.calculator || {};
      const isExempted = state.status === 'exempted' || calc.hasExistingTrees === 'No';
      if (isExempted) return { result: 'EXEMPTED', status: 'pass', compliance: 'Exempted' };
      const siteArea = parseFloat(calc.siteArea || '') || 0;
      if (!siteArea) return { result: '—', status: 'pending' };
      const preserved = parseFloat(calc.existingTreesPreserved || '') || 0;
      const cut = parseFloat(calc.existingTreesCut || '') || 0;
      const transplanted = parseFloat(calc.treesTransplanted || '') || 0;
      const required = siteArea / 125;
      const total = preserved + cut * 3 + transplanted;
      const pass = required > 0 && total >= required;
      return {
        result: pass ? 'COMPLIANT' : 'NON-COMPLIANT',
        status: pass ? 'pass' : 'fail',
        compliance: pass ? 'Compliant' : 'Non-Compliant',
      };
    },
  },
  {
    id: 'liveability-index',
    title: 'Liveability Index',
    description: 'Minimum 9 m² of green space (tree canopy + shrub bed) per capita — active when this strategy is selected in Narrative',
    rating: 'griha-v6',
    ratingLabel: 'GRIHA V6',
    criterionCode: '30.1.1',
    criterionLabel: 'Criterion 30 · Innovation',
    criterionPath: (p) => `/project/${p}/griha-v6/appraisal/30.1.1`,
    Component: InnovationCalculator,
    getSummary: (projectId) => {
      const state = getAppraisalState(projectId, '30.1.1');
      const isSelected = (state.strategies || []).includes('liveability-index');
      if (!isSelected) return { result: '—', status: 'pending' };
      const calc = state.calculator || {};
      const occupancy = parseFloat(calc['li_occupancy'] || '') || 0;
      const treeArea = parseFloat(calc['li_tree_area'] || '') || 0;
      const shrubArea = parseFloat(calc['li_shrub_area'] || '') || 0;
      if (!occupancy) return { result: '—', status: 'pending' };
      const index = (treeArea + shrubArea) / occupancy;
      const pass = index >= 9;
      return {
        result: pass ? 'COMPLIANT' : `${index.toFixed(1)} m²/pp`,
        status: pass ? 'pass' : 'fail',
        compliance: pass ? 'Compliant (≥ 9 m²/pp)' : 'Non-Compliant (< 9 m²/pp)',
      };
    },
  },
  {
    id: 'water-factor-limit',
    title: 'Water Factor Limit',
    description: 'Dishwasher < 24.6 L/cycle · Clothes washer < 35.96 L/cycle/cu.ft — active when this strategy is selected in Narrative',
    rating: 'griha-v6',
    ratingLabel: 'GRIHA V6',
    criterionCode: '30.1.1',
    criterionLabel: 'Criterion 30 · Innovation',
    criterionPath: (p) => `/project/${p}/griha-v6/appraisal/30.1.1`,
    Component: WaterFactorCalculator,
    getSummary: (projectId) => {
      const state = getAppraisalState(projectId, '30.1.1');
      const isSelected = (state.strategies || []).includes('water-factor-limit');
      if (!isSelected) return { result: '—', status: 'pending' };
      const calc = state.calculator || {};
      const dishwasherVol = parseFloat(calc['wash_dishwasher_vol'] || '') || 0;
      const clothesVol = parseFloat(calc['wash_clothes_vol'] || '') || 0;
      if (!dishwasherVol && !clothesVol) return { result: '—', status: 'pending' };
      const dishwasherOk = !dishwasherVol || dishwasherVol < 24.6;
      const clothesOk = !clothesVol || clothesVol < 35.96;
      const pass = dishwasherOk && clothesOk;
      return {
        result: pass ? 'COMPLIANT' : 'NON-COMPLIANT',
        status: pass ? 'pass' : 'fail',
        compliance: pass ? 'Compliant' : 'Non-Compliant',
      };
    },
  },
];

export function getCalculatorsForCriterion(rating: string, criterionCode: string): CalcRegistration[] {
  return CALCULATOR_REGISTRY.filter(c => c.rating === rating && c.criterionCode === criterionCode);
}
