"use client";
import React, { useEffect, useState } from 'react';
import { getAppraisalState, saveAppraisalState, type AppraisalStatus } from '@/data/griha-v6-appraisals';
import { getProjectDetails } from '@/data/building-typology';
import { sumAreas } from '@/components/AreaList';
import { scopedKey } from '@/lib/projects';

interface Props {
  projectId: string;
  code: string;
  status?: AppraisalStatus | null;
}

const F = {
  occupancy: 'owc_occupancy',
  landscape: 'owc_landscape',
  wasteRate: 'owc_waste_rate',
  leafLitter: 'owc_leaf_litter',
} as const;

function num(v: string | undefined): number {
  return parseFloat(v || '') || 0;
}

export function OWCCalculator({ projectId, code, status: _status }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const state = getAppraisalState(projectId, code);
    const calc = { ...state.calculator };

    if (!calc[F.occupancy]) {
      try {
        const info = JSON.parse(localStorage.getItem(scopedKey(projectId, 'project_info')) || '{}');
        const fixed = parseFloat(info.occupancyFixed || '') || 0;
        const floating = parseFloat(info.occupancyFloating || '') || 0;
        if (fixed + floating > 0) calc[F.occupancy] = String(fixed + floating);
      } catch {}
    }

    if (!calc[F.landscape]) {
      const landscape = sumAreas(getProjectDetails(projectId).siteAreaLandscape);
      if (landscape > 0) calc[F.landscape] = String(landscape);
    }

    if (!calc[F.wasteRate]) calc[F.wasteRate] = '0.2';
    if (!calc[F.leafLitter]) calc[F.leafLitter] = '67';

    setValues(calc);
  }, [projectId, code]);

  const update = (field: string, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    saveAppraisalState(projectId, code, { calculator: next });
  };

  const occupancy = num(values[F.occupancy]);
  const landscape = num(values[F.landscape]);
  const wasteRate = num(values[F.wasteRate]);
  const leafLitterGms = num(values[F.leafLitter]);
  const leafLitterKg = leafLitterGms / 1000;

  // E: Total daily building waste (Kg/day)
  const totalBuildingWaste = occupancy * wasteRate;
  // F: Organic fraction of building waste (40%)
  const buildingOrganicWaste = totalBuildingWaste * 0.4;
  // G: Landscape waste per year (Kg/year)
  const landscapeWasteYear = landscape * leafLitterKg;
  // H: Landscape waste per day (Kg/day)
  const landscapeWasteDay = landscapeWasteYear / 365;
  // I: Total OWC load capacity (Kg/day)
  const totalOwcCapacity = buildingOrganicWaste + landscapeWasteDay;
  // J: Applicability check — exempt if total < 50 Kg/day
  const isApplicable = totalOwcCapacity >= 50;

  const row = (letter: string, label: string, control: React.ReactNode) => (
    <tr>
      <td className="w-8 text-center font-semibold text-muted-foreground">{letter}</td>
      <td>{label}</td>
      <td className="w-44">{control}</td>
    </tr>
  );

  const numberInput = (field: string, placeholder = '0') => (
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

  const computed = (text: string, highlight = false) => (
    <div className={`flex h-8 items-center justify-end rounded-md border border-input bg-muted/50 px-2 text-sm font-semibold ${highlight ? 'text-primary' : ''}`}>
      {text}
    </div>
  );

  const fmt = (v: number) => v > 0 ? v.toFixed(2) : '—';

  return (
    <table className="w-full text-sm">
      <tbody className="[&>tr>td]:py-2 [&>tr>td]:px-2 [&>tr]:border-b [&>tr]:border-border last:[&>tr]:border-0">
        {row('A', 'Total Occupancy (persons)', numberInput(F.occupancy))}
        {row('B', 'Landscape Area (m²)', numberInput(F.landscape))}
        {row('C', 'Organic Waste Generation Rate (Kg/capita/day, NBC default 0.2)', numberInput(F.wasteRate, '0.2'))}
        {row('D', 'Leaf Litter Rate (gms/m²/year, GRIHA default 67)', numberInput(F.leafLitter, '67'))}
        {row('E', 'Total Daily Building Waste = A × C (Kg/day)', computed(fmt(totalBuildingWaste)))}
        {row('F', 'Building Organic Waste = E × 40% (Kg/day)', computed(fmt(buildingOrganicWaste)))}
        {row('G', 'Landscape Waste per Year = B × D/1000 (Kg/year)', computed(fmt(landscapeWasteYear)))}
        {row('H', 'Landscape Waste per Day = G ÷ 365 (Kg/day)', computed(fmt(landscapeWasteDay)))}
        {row('I', 'Required OWC Capacity = F + H (Kg/day)', computed(fmt(totalOwcCapacity), true))}
        {totalOwcCapacity > 0 && row(
          'J',
          'Applicability check — is total organic waste ≥ 50 Kg/day?',
          <div className={`flex h-8 items-center justify-end rounded-md border border-input bg-muted/50 px-2 text-sm font-semibold ${isApplicable ? 'text-green-600' : 'text-amber-500'}`}>
            {isApplicable ? 'APPLICABLE' : 'EXEMPT (< 50 Kg/day)'}
          </div>,
        )}
      </tbody>
    </table>
  );
}
