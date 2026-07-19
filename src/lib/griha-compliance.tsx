import { Badge } from '@/components/ui/badge';

/** Compliance pill matching the criterion table's styling — shared so appraisal pages look identical. */
export function complianceBadge(type: string) {
  if (type === 'Mandatory')        return <Badge variant="mandatory">Mandatory</Badge>;
  if (type === 'Partly Mandatory') return <Badge variant="partly-mandatory">Partly Mandatory</Badge>;
  return <Badge variant="optional">Optional</Badge>;
}

/** Row background tint matching the criterion table's styling — shared so appraisal pages look identical. */
export function rowClass(type: string) {
  if (type === 'Mandatory')        return 'row-mandatory';
  if (type === 'Partly Mandatory') return 'row-partly';
  return '';
}
