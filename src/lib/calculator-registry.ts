"use client";
import type { AppraisalStatus } from '@/data/griha-v6-appraisals';
import { getAppraisalState } from '@/data/griha-v6-appraisals';
import { TreePreservationCalculator } from '@/components/calculators/TreePreservationCalculator';
import { InnovationCalculator } from '@/components/calculators/InnovationCalculator';
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
    id: 'innovation-strategies',
    title: 'Innovation Strategies',
    description: '1 point per innovative strategy selected in Narrative, capped at 5 points',
    rating: 'griha-v6',
    ratingLabel: 'GRIHA V6',
    criterionCode: '30.1.1',
    criterionLabel: 'Criterion 30 · Innovation',
    criterionPath: (p) => `/project/${p}/griha-v6/appraisal/30.1.1`,
    Component: InnovationCalculator,
    getSummary: (projectId) => {
      const state = getAppraisalState(projectId, '30.1.1');
      const count = Math.min((state.strategies || []).length, 5);
      return {
        result: `${count} / 5 pts`,
        status: count > 0 ? 'pass' : 'pending',
        points: count,
        maxPoints: 5,
      };
    },
  },
];

export function getCalculatorsForCriterion(rating: string, criterionCode: string): CalcRegistration[] {
  return CALCULATOR_REGISTRY.filter(c => c.rating === rating && c.criterionCode === criterionCode);
}
