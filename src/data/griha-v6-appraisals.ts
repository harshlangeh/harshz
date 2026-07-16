export type AppraisalStatus = 'attempting' | 'non-attempting' | 'later' | 'exempted';

export type AppraisalComplianceType = 'Mandatory' | 'Optional';

export interface AppraisalMeta {
  code: string;
  title: string;
  criterionId: number;
  /** Max points for this appraisal. Undefined until provided per-appraisal. */
  points?: number;
  /** Whether this appraisal is Mandatory or Optional. Undefined until provided per-appraisal. */
  type?: AppraisalComplianceType;
  /** Whether the "Exempted" (applicability check) status is offered for this appraisal. Opt-in per appraisal. */
  exemptable?: boolean;
}

/** Appraisal breakdown per criterion. Only criteria with entries here become accordions. */
export const CRITERION_APPRAISALS: Record<number, AppraisalMeta[]> = {
  1: [
    { code: '1.1.1', title: 'Project Approvals', criterionId: 1 },
    { code: '1.1.2', title: 'Tree Preservation', criterionId: 1, type: 'Mandatory', exemptable: true },
  ],
};

// Every other criterion (2–30) gets a placeholder first appraisal so it's clickable and has a
// working detail page too — titles, points, and compliance types to be provided per-appraisal later.
for (let id = 2; id <= 30; id++) {
  CRITERION_APPRAISALS[id] = [
    { code: `${id}.1.1`, title: 'Appraisal 1 (name pending)', criterionId: id },
  ];
}

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

/**
 * Points contributed by an appraisal toward its criterion's total/target.
 * Exempted appraisals contribute 0 — they're excluded from scoring entirely
 * (their points are instead removed from the criterion's max, see `criterionEffectiveMax`).
 */
export function appraisalContribution(a: AppraisalMeta, status: AppraisalStatus | null | undefined): number {
  if (status === 'attempting' || status === 'later') return a.points ?? 0;
  return 0;
}

/** A criterion's max, reduced by the points of any of its appraisals marked Exempted. */
export function criterionEffectiveMax(
  originalMax: number,
  appraisals: AppraisalMeta[],
  statuses: Record<string, AppraisalStatus | null | undefined>,
): number {
  const exempted = appraisals.reduce(
    (sum, a) => sum + (statuses[a.code] === 'exempted' ? (a.points ?? 0) : 0), 0,
  );
  return originalMax - exempted;
}

export interface AppraisalDisplay {
  text: string;
  colorClass: string;
}

/** How to render an appraisal's own max-points badge — "Ex" in gold once exempted. */
export function appraisalMaxDisplay(a: AppraisalMeta, status: AppraisalStatus | null | undefined): AppraisalDisplay {
  if (status === 'exempted') return { text: 'Ex', colorClass: 'text-amber-500' };
  return { text: a.points !== undefined ? String(a.points) : '—', colorClass: '' };
}

/**
 * How to render an appraisal's target points, per user spec:
 * - Mandatory + Non-Attempting → "NC" in red (non-compliant)
 * - Mandatory + Attempting/Later/Exempted → "M" in green (mandatory met — exemption counts as compliant)
 * - Optional + Non-Attempting → "0"
 * - Optional + Attempting/Later → the full points
 * - Optional + Exempted → "Ex" in gold
 */
export function appraisalTargetDisplay(a: AppraisalMeta, status: AppraisalStatus | null | undefined): AppraisalDisplay {
  if (status === 'exempted') {
    return a.type === 'Mandatory'
      ? { text: 'M', colorClass: 'text-green-600' }
      : { text: 'Ex', colorClass: 'text-amber-500' };
  }
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
