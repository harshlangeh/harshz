import type { AppraisalStatus } from '@/data/griha-v6-appraisals';

export type ComplianceStatus = 'compliant' | 'non-compliant' | 'pending' | 'exempted';

export interface CalculatorSummary {
  status: ComplianceStatus;
  /** Primary result shown on the card — e.g. "12.3 m²/person", "3/5 trees", "All compliant" */
  headline: string;
  /** Secondary note shown below the headline */
  subtext?: string;
  pointsAchieved?: number;
  pointsMax?: number;
}

export interface CalculatorProps {
  projectId: string;
  code: string;
  status: AppraisalStatus | null;
  /** Called after every value save so the wrapping CalculatorCard can refresh its summary. */
  onValueChange?: () => void;
}
