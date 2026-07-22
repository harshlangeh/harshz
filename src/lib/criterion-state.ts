import { scopedKey } from './projects';
import type { AppraisalStatus } from '@/data/griha-v6-appraisals';

export type CriterionStatus = AppraisalStatus;

export interface CriterionState {
  status: CriterionStatus | null;
  narrativeHtml: string;
}

export type RatingKey = 'v2019' | 'v2015' | 'igbc';

function storageKey(projectId: string, rating: RatingKey) {
  return scopedKey(projectId, `criteria_state_${rating}`);
}

function loadAll(projectId: string, rating: RatingKey): Record<string, CriterionState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(storageKey(projectId, rating));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCriterionState(
  projectId: string,
  rating: RatingKey,
  criterionId: string | number,
): CriterionState {
  const all = loadAll(projectId, rating);
  return all[String(criterionId)] ?? { status: null, narrativeHtml: '' };
}

export function saveCriterionState(
  projectId: string,
  rating: RatingKey,
  criterionId: string | number,
  patch: Partial<CriterionState>,
): void {
  const all = loadAll(projectId, rating);
  all[String(criterionId)] = { ...all[String(criterionId)] ?? { status: null, narrativeHtml: '' }, ...patch };
  localStorage.setItem(storageKey(projectId, rating), JSON.stringify(all));
}
