export type AppraisalStatus = 'attempting' | 'non-attempting' | 'later';

export type AppraisalComplianceType = 'Mandatory' | 'Optional';

export interface AppraisalMeta {
  code: string;
  title: string;
  criterionId: number;
  /** Max points for this appraisal. Undefined until provided per-appraisal. */
  points?: number;
  /** Whether this appraisal is Mandatory or Optional. Undefined until provided per-appraisal. */
  type?: AppraisalComplianceType;
}

/** Appraisal breakdown per criterion. Only criteria with entries here become accordions. */
export const CRITERION_APPRAISALS: Record<number, AppraisalMeta[]> = {
  1: [
    { code: '1.1.1', title: 'Project Approvals', criterionId: 1 },
  ],
};

export function getAppraisalMeta(code: string): AppraisalMeta | undefined {
  for (const list of Object.values(CRITERION_APPRAISALS)) {
    const found = list.find(a => a.code === code);
    if (found) return found;
  }
  return undefined;
}

export interface AppraisalState {
  status: AppraisalStatus | null;
  narrativeHtml: string;
}

const DEFAULT_STATE: AppraisalState = { status: null, narrativeHtml: '' };
const STORAGE_KEY = 'appraisals_v6';

function readStore(): Record<string, AppraisalState> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, AppraisalState>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getAppraisalState(code: string): AppraisalState {
  return readStore()[code] || DEFAULT_STATE;
}

export function saveAppraisalState(code: string, patch: Partial<AppraisalState>) {
  const store = readStore();
  store[code] = { ...(store[code] || DEFAULT_STATE), ...patch };
  writeStore(store);
}

/** Points contributed by an appraisal toward its criterion's total/target. */
export function appraisalContribution(a: AppraisalMeta, status: AppraisalStatus | null | undefined): number {
  if (status === 'attempting' || status === 'later') return a.points ?? 0;
  return 0;
}

export interface AppraisalTargetDisplay {
  text: string;
  colorClass: string;
}

/**
 * How to render an appraisal's target points, per user spec:
 * - Mandatory + Non-Attempting → "NC" in red (non-compliant)
 * - Mandatory + Attempting/Later → "M" in green (mandatory met)
 * - Optional + Non-Attempting → "0"
 * - Optional + Attempting/Later → the full points
 */
export function appraisalTargetDisplay(a: AppraisalMeta, status: AppraisalStatus | null | undefined): AppraisalTargetDisplay {
  const met = status === 'attempting' || status === 'later';
  if (a.type === 'Mandatory') {
    return met
      ? { text: 'M', colorClass: 'text-green-600' }
      : { text: 'NC', colorClass: 'text-red-500' };
  }
  return met
    ? { text: String(a.points ?? 0), colorClass: '' }
    : { text: '0', colorClass: '' };
}
