"use client";
import React, { useEffect, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getAppraisalState, saveAppraisalState, type AppraisalStatus } from '@/data/griha-v6-appraisals';
import { getProjectDetails } from '@/data/building-typology';
import { scopedKey } from '@/lib/projects';

interface Props {
  projectId: string;
  code: string;
  status?: AppraisalStatus | null;
}

interface Benchmark {
  min: number;
  max: number | null;
  unit: string;
  isHealthcare?: boolean;
}

export const TYPOLOGY_BENCHMARKS: Record<string, Benchmark> = {
  'Healthcare Facility': { min: 100, max: null, unit: 'm²/bed',    isHealthcare: true },
  'Hospitality':         { min: 35,  max: 60,   unit: 'm²/person' },
  'Institutional':       { min: 4,   max: 8,    unit: 'm²/person' },
  'Office':              { min: 5,   max: 10,   unit: 'm²/person' },
  'Residential':         { min: 12.5,max: 50,   unit: 'm²/person' },
  'Retail':              { min: 3,   max: 6,    unit: 'm²/person' },
  'Transit Terminal':    { min: 0.6, max: 6,    unit: 'm²/person' },
};

function num(v: string | undefined): number {
  return parseFloat(v || '') || 0;
}

export function PerCapitaAreaCalculator({ projectId, code, status: _status }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const state = getAppraisalState(projectId, code);
    const calc = { ...state.calculator };

    // Prefill typology from Project Details
    if (!calc['typology']) {
      const details = getProjectDetails(projectId);
      if (details.typologyCategory) calc['typology'] = details.typologyCategory;
    }

    // Prefill built-up area and occupancy from project_info
    try {
      const info = JSON.parse(localStorage.getItem(scopedKey(projectId, 'project_info')) || '{}');
      if (!calc['builtUpArea'] && info.builtUpArea) calc['builtUpArea'] = info.builtUpArea;
      if (!calc['occupancy']) {
        const fixed = parseFloat(info.occupancyFixed || '') || 0;
        const floating = parseFloat(info.occupancyFloating || '') || 0;
        if (fixed + floating > 0) calc['occupancy'] = String(fixed + floating);
      }
    } catch {}

    setValues(calc);
  }, [projectId, code]);

  const update = (field: string, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    saveAppraisalState(projectId, code, { calculator: next });
  };

  const typology = values['typology'] || '';
  const benchmark = typology ? TYPOLOGY_BENCHMARKS[typology] : null;
  const isHealthcare = benchmark?.isHealthcare ?? false;

  const builtUpArea = num(values['builtUpArea']);
  const denominator = isHealthcare ? num(values['beds']) : num(values['occupancy']);
  const perCapita = builtUpArea > 0 && denominator > 0 ? builtUpArea / denominator : 0;

  let compliance: { text: string; color: string } | null = null;
  if (benchmark && perCapita > 0) {
    if (perCapita < benchmark.min) {
      compliance = {
        text: `NON-COMPLIANT — below minimum benchmark of ${benchmark.min} ${benchmark.unit}`,
        color: 'text-red-500',
      };
    } else if (benchmark.max !== null && perCapita > benchmark.max) {
      compliance = {
        text: `NON-COMPLIANT — exceeds maximum benchmark of ${benchmark.max} m²/person`,
        color: 'text-red-500',
      };
    } else {
      compliance = { text: 'COMPLIANT', color: 'text-green-600' };
    }
  }

  const row = (letter: string, label: string, control: React.ReactNode) => (
    <tr>
      <td className="w-8 text-center font-semibold text-muted-foreground">{letter}</td>
      <td>{label}</td>
      <td className="w-52">{control}</td>
    </tr>
  );

  const computed = (text: string, colorClass = '') => (
    <div className={`flex h-8 items-center justify-end rounded-md border border-input bg-muted/50 px-2 text-sm font-semibold ${colorClass}`}>
      {text}
    </div>
  );

  const numInput = (field: string, placeholder = '0') => (
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

  return (
    <table className="w-full text-sm">
      <tbody className="[&>tr>td]:py-2 [&>tr>td]:px-2 [&>tr]:border-b [&>tr]:border-border last:[&>tr]:border-0">
        {row(
          'A',
          'Building Typology',
          <div className="space-y-2">
            <Select value={typology} onValueChange={v => update('typology', v)}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select typology" /></SelectTrigger>
              <SelectContent>
                {Object.keys(TYPOLOGY_BENCHMARKS).map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isHealthcare && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex-1">Number of Beds</span>
                {numInput('beds')}
              </div>
            )}
          </div>,
        )}
        {row('B', 'Total Built-up Area (m²) — excludes basement and parking', numInput('builtUpArea'))}
        {!isHealthcare && row('C', 'Total Occupancy (Fixed + Floating)', numInput('occupancy'))}
        {row(
          isHealthcare ? 'C' : 'D',
          'Per Capita Gross Area = B ÷ ' + (isHealthcare ? 'Beds' : 'C'),
          computed(perCapita > 0 ? `${perCapita.toFixed(2)} ${benchmark?.unit ?? 'm²/person'}` : '—'),
        )}
        {benchmark && row(
          isHealthcare ? 'D' : 'E',
          'GRIHA Benchmark (Table 1.1c)',
          computed(
            benchmark.max !== null
              ? `${benchmark.min} – ${benchmark.max} ${benchmark.unit}`
              : `≥ ${benchmark.min} ${benchmark.unit}`,
          ),
        )}
        {compliance && row(
          isHealthcare ? 'E' : 'F',
          'Compliance',
          <div className={`flex min-h-8 items-center justify-end rounded-md border border-input bg-muted/50 px-2 py-1 text-sm font-semibold leading-snug text-right ${compliance.color}`}>
            {compliance.text}
          </div>,
        )}
      </tbody>
    </table>
  );
}
