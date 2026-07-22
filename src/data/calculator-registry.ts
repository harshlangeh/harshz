import type { CalculatorSummary, CalculatorProps } from '@/types/calculator';
import { TreePreservationCalculator, getTreePreservationSummary } from '@/components/calculators/TreePreservationCalculator';
import { LiveabilityIndexCalculator, getLiveabilityIndexSummary } from '@/components/calculators/LiveabilityIndexCalculator';
import { WashingEquipmentCalculator, getWashingEquipmentSummary } from '@/components/calculators/WashingEquipmentCalculator';
import type React from 'react';

export interface CalculatorEntry {
  id: string;
  title: string;
  description: string;
  appraisalCode: string;
  criterionName: string;
  ratingSystem: string;
  getSummary: (projectId: string) => CalculatorSummary;
  component: React.ComponentType<CalculatorProps>;
}

export const CALCULATOR_REGISTRY: CalculatorEntry[] = [
  {
    id: 'tree-preservation',
    title: 'Tree Preservation',
    description: 'Checks the GRIHA site-area-based tree preservation threshold (1 tree per 125 sqm). Mandatory compliance gate.',
    appraisalCode: '1.1.2',
    criterionName: 'Green Infrastructure',
    ratingSystem: 'GRIHA V6',
    getSummary: getTreePreservationSummary,
    component: TreePreservationCalculator,
  },
  {
    id: 'liveability-index',
    title: 'Liveability Index',
    description: 'Computes green area per person (tree canopy + shrub area ÷ occupancy). Benchmark ≥ 9 m²/person.',
    appraisalCode: '30.1.1',
    criterionName: 'Innovation',
    ratingSystem: 'GRIHA V6',
    getSummary: getLiveabilityIndexSummary,
    component: LiveabilityIndexCalculator,
  },
  {
    id: 'washing-equipment',
    title: 'Washing Equipment Conservation',
    description: 'Verifies dishwasher (< 24.6 L/cycle) and clothes washer (< 35.96 L/cycle/cu.ft) water efficiency limits.',
    appraisalCode: '30.1.1',
    criterionName: 'Innovation',
    ratingSystem: 'GRIHA V6',
    getSummary: getWashingEquipmentSummary,
    component: WashingEquipmentCalculator,
  },
];

/** Returns all calculator entries for the given appraisal code. */
export function getCalculatorsForAppraisal(code: string): CalculatorEntry[] {
  return CALCULATOR_REGISTRY.filter(c => c.appraisalCode === code);
}
