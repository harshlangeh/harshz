import { scopedKey } from '@/lib/projects';

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
    { code: '1.1.1', title: 'Project Approvals', criterionId: 1, type: 'Mandatory' },
    { code: '1.1.2', title: 'Tree Preservation', criterionId: 1, type: 'Mandatory', exemptable: true },
    { code: '1.1.3', title: 'One Tree for Every 80 sqm', criterionId: 1, points: 1, type: 'Optional' },
    { code: '1.1.4', title: 'Per Capita Gross Area Benchmark', criterionId: 1, points: 1, type: 'Optional' },
  ],
};

// Every other criterion (2–30) gets a placeholder first appraisal so it's clickable and has a
// working detail page too — titles, points, and compliance types to be provided per-appraisal later.
for (let id = 2; id <= 30; id++) {
  CRITERION_APPRAISALS[id] = [
    { code: `${id}.1.1`, title: 'Appraisal 1 (name pending)', criterionId: id },
  ];
}

// Override criterion 9 with the real CFC/HCFC/Halon-free appraisals (all Mandatory — no points).
CRITERION_APPRAISALS[9] = [
  { code: '9.1.1', title: 'CFC and HCFC Free HVAC Insulation', criterionId: 9, type: 'Mandatory' },
  { code: '9.1.2', title: 'CFC and HCFC Free HVAC Refrigerant', criterionId: 9, type: 'Mandatory' },
  { code: '9.1.3', title: 'Halon Free Fire Extinguishers', criterionId: 9, type: 'Mandatory' },
];

// Override criterion 18 with the real Organic Waste Converter appraisal.
CRITERION_APPRAISALS[18] = [
  { code: '18.1.1', title: 'Organic Waste Converter Capacity', criterionId: 18, points: 2, type: 'Optional', exemptable: true },
];

// Override criterion 24 with the real Differently Abled (DA) Facilities appraisal.
CRITERION_APPRAISALS[24] = [
  { code: '24.1.1', title: 'DA Facilities', criterionId: 24, points: 2, type: 'Optional' },
];

// Override criterion 27 with the real Commissioning appraisals.
CRITERION_APPRAISALS[27] = [
  { code: '27.1.1', title: 'HVAC, Lighting and Electrical Systems', criterionId: 27, points: 2, type: 'Optional' },
  { code: '27.1.2', title: 'Water and Waste Systems', criterionId: 27, points: 2, type: 'Optional' },
];

// Override criterion 29 with the real O&M Protocol appraisals (all Mandatory — no points).
CRITERION_APPRAISALS[29] = [
  { code: '29.1.1', title: 'O&M Service Group Formation', criterionId: 29, type: 'Mandatory' },
  { code: '29.1.2', title: 'Contract Document', criterionId: 29, type: 'Mandatory' },
  { code: '29.1.3', title: 'O&M Manuals', criterionId: 29, type: 'Mandatory' },
];

// Override criterion 30 with the real Innovation appraisal (1 pt per strategy, max 5).
CRITERION_APPRAISALS[30] = [
  { code: '30.1.1', title: '5 Innovative Strategies', criterionId: 30, points: 5, type: 'Optional' },
];

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
  /** Free-form key/value store for an appraisal's calculator inputs, if it has one. */
  calculator?: Record<string, string>;
  /** Selected strategy IDs for variable-scored appraisals (e.g. 30.1.1 Innovation). */
  strategies?: string[];
  /** Actual points earned for variable-scored appraisals; undefined means use meta.points. */
  earnedPoints?: number;
}

const DEFAULT_STATE: AppraisalState = { status: null, narrativeHtml: '', calculator: {} };
const STORAGE_KEY = 'appraisals_v6';

function readStore(projectId: string): Record<string, AppraisalState> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(scopedKey(projectId, STORAGE_KEY)) || '{}');
  } catch {
    return {};
  }
}

function writeStore(projectId: string, store: Record<string, AppraisalState>) {
  localStorage.setItem(scopedKey(projectId, STORAGE_KEY), JSON.stringify(store));
}

export function getAppraisalState(projectId: string, code: string): AppraisalState {
  return readStore(projectId)[code] || DEFAULT_STATE;
}

export function saveAppraisalState(projectId: string, code: string, patch: Partial<AppraisalState>) {
  const store = readStore(projectId);
  store[code] = { ...(store[code] || DEFAULT_STATE), ...patch };
  writeStore(projectId, store);
}

/**
 * Points contributed by an appraisal toward its criterion's total/target.
 * Mandatory appraisals never contribute — they're a compliance gate, not a point source.
 * Exempted appraisals contribute 0 — they're excluded from scoring entirely
 * (their points are instead removed from the criterion's max, see `criterionEffectiveMax`).
 */
/**
 * @param earnedPoints For variable-scored appraisals (e.g. 30.1.1), the actual points earned.
 *   When provided, overrides the meta.points cap.
 */
export function appraisalContribution(
  a: AppraisalMeta,
  status: AppraisalStatus | null | undefined,
  earnedPoints?: number,
): number {
  if (a.type === 'Mandatory') return 0;
  if (status === 'attempting' || status === 'later') {
    if (earnedPoints !== undefined) return Math.min(earnedPoints, a.points ?? 0);
    return a.points ?? 0;
  }
  return 0;
}

/** A criterion's max, reduced by the points of any Mandatory appraisal (never scored) or appraisal marked Exempted. */
export function criterionEffectiveMax(
  originalMax: number,
  appraisals: AppraisalMeta[],
  statuses: Record<string, AppraisalStatus | null | undefined>,
): number {
  const excluded = appraisals.reduce((sum, a) => {
    if (a.type === 'Mandatory') return sum + (a.points ?? 0);
    if (statuses[a.code] === 'exempted') return sum + (a.points ?? 0);
    return sum;
  }, 0);
  return originalMax - excluded;
}

export interface AppraisalDisplay {
  text: string;
  colorClass: string;
}

/** How to render an appraisal's own max-points badge — "M" for Mandatory (never scored, shown in black), "Ex" in gold once exempted. */
export function appraisalMaxDisplay(a: AppraisalMeta, status: AppraisalStatus | null | undefined): AppraisalDisplay {
  if (a.type === 'Mandatory') return { text: 'M', colorClass: 'text-foreground' };
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
