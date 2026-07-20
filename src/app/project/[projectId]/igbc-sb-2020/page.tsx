"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DownloadSection } from '@/components/DownloadSection';
import { scopedKey } from '@/lib/projects';

const sections = [
  { id: 1, title: "Site Planning and Design", maxNew: 7, maxExisting: 7, criteria: [
    { id: "SPD MR 1",    name: "Local Building Regulations",           maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "SPD Credit 1", name: "Erosion and Sedimentation Control",   maxNew: 1, maxExisting: 1 },
    { id: "SPD Credit 2", name: "Sustainable Landscape",               maxNew: 3, maxExisting: 3 },
    { id: "SPD Credit 3", name: "Heat Island Reduction, Non-roof and Roof", maxNew: 2, maxExisting: 2 },
    { id: "SPD Credit 4", name: "Green Education",                     maxNew: 1, maxExisting: 1 },
  ]},
  { id: 2, title: "Water Conservation", maxNew: 8, maxExisting: 7, criteria: [
    { id: "WC MR 1",    name: "Rainwater Harvesting, Roof",            maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "WC MR 2",    name: "Water Efficient Plumbing Fixtures",     maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "WC Credit 1", name: "Rainwater Harvesting, Roof",           maxNew: 4, maxExisting: 3 },
    { id: "WC Credit 2", name: "Water Efficient Plumbing Fixtures",    maxNew: 3, maxExisting: 3 },
    { id: "WC Credit 3", name: "Water Metering",                       maxNew: 1, maxExisting: 1 },
  ]},
  { id: 3, title: "Energy Efficiency", maxNew: 20, maxExisting: 20, criteria: [
    { id: "EE MR 1",    name: "Minimum Energy Efficiency",             maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "EE Credit 1", name: "Passive Architecture",                 maxNew: 3, maxExisting: 3 },
    { id: "EE Credit 2", name: "Enhanced Energy Efficiency",           maxNew: 10, maxExisting: 10 },
    { id: "EE Credit 3", name: "On-site Renewable Energy",             maxNew: 5, maxExisting: 5 },
    { id: "EE Credit 4", name: "Energy Saving Appliances",             maxNew: 1, maxExisting: 1 },
    { id: "EE Credit 5", name: "Energy Metering",                      maxNew: 1, maxExisting: 1 },
  ]},
  { id: 4, title: "Building Materials and Resources", maxNew: 8, maxExisting: 1, criteria: [
    { id: "BMR MR 1",   name: "Segregation of Waste, Post-occupancy", maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "BMR Credit 1", name: "Green Procurement Policy",           maxNew: "NA", maxExisting: 1 },
    { id: "BMR Credit 2", name: "Use of Eco-labelled Building Materials, Products & Equipment", maxNew: 3, maxExisting: "NA" },
    { id: "BMR Credit 3", name: "Alternative Construction Technologies & Materials", maxNew: 3, maxExisting: "NA" },
    { id: "BMR Credit 4", name: "Alternate Wood-based Materials",     maxNew: 1, maxExisting: "NA" },
    { id: "BMR Credit 5", name: "Handling of Waste Materials, During Construction", maxNew: 1, maxExisting: "NA" },
  ]},
  { id: 5, title: "Health and Well-being", maxNew: 7, maxExisting: 5, criteria: [
    { id: "HWB MR 1",   name: "Minimum Fresh Air Ventilation",        maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "HWB MR 2",   name: "No Smoking Premises",                  maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "HWB Credit 1", name: "Daylighting",                        maxNew: 2, maxExisting: 2 },
    { id: "HWB Credit 2", name: "Low-emitting Materials",             maxNew: 1, maxExisting: "NA" },
    { id: "HWB Credit 3", name: "Eco-friendly Housekeeping Chemicals", maxNew: 1, maxExisting: 1 },
    { id: "HWB Credit 4", name: "Access to Quality Drinking Water",   maxNew: 1, maxExisting: 1 },
    { id: "HWB Credit 5", name: "Eco-friendly Refrigerants",          maxNew: 1, maxExisting: "NA" },
    { id: "HWB Credit 6", name: "Universal Design",                   maxNew: 1, maxExisting: 1 },
  ]},
  { id: 6, title: "Green Measures Beyond the Fence", maxNew: 4, maxExisting: 4, criteria: [
    { id: "GM Credit 1", name: "Green Measures Beyond the Fence",     maxNew: 4, maxExisting: 4 },
  ]},
  { id: 7, title: "Innovation and Performance", maxNew: 6, maxExisting: 6, criteria: [
    { id: "IP Credit 1", name: "Innovation in Design Process",        maxNew: 4, maxExisting: 4 },
    { id: "IP Credit 2", name: "Water and Energy Performance",        maxNew: "NA", maxExisting: 1 },
    { id: "IP Credit 3", name: "Green Measures Cost Analysis",        maxNew: 1, maxExisting: "NA" },
    { id: "IP Credit 4", name: "IGBC Accredited Professional",        maxNew: 1, maxExisting: 1 },
  ]},
];

const CERTIFICATION_LEVELS = [
  { label: "Certified", colorClass: "text-igbc-certified", min: { New: 30, Existing: 25 }, max: { New: 35, Existing: 29 } },
  { label: "Silver",    colorClass: "text-igbc-silver",    min: { New: 36, Existing: 30 }, max: { New: 41, Existing: 34 } },
  { label: "Gold",      colorClass: "text-igbc-gold",      min: { New: 42, Existing: 35 }, max: { New: 50, Existing: 42 } },
  { label: "Platinum",  colorClass: "text-igbc-platinum",  min: { New: 51, Existing: 43 }, max: { New: Infinity, Existing: Infinity } },
];

export default function IgbcSb2020Page() {
  const params = useParams<{ projectId: string }>();
  const projectId = decodeURIComponent(params.projectId as string);

  const [buildingType, setBuildingType] = useState<'New' | 'Existing'>('New');
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const proj = JSON.parse(localStorage.getItem(scopedKey(projectId, 'project_info')) || 'null');
    if (proj?.type === 'Existing') setBuildingType('Existing');
    const saved = localStorage.getItem(scopedKey(projectId, 'scores_igbc'));
    if (saved) setScores(JSON.parse(saved));
  }, [projectId]);

  const handleScore = (id: string, value: string, max: number) => {
    let n = parseInt(value);
    if (isNaN(n)) n = 0;
    n = Math.max(0, Math.min(max, n));
    const next = { ...scores, [id]: n };
    setScores(next);
  };

  const getMax = (c: { maxNew: number | string; maxExisting: number | string }) =>
    buildingType === 'New' ? c.maxNew : c.maxExisting;

  const sectionTotal = (section: typeof sections[0]) =>
    section.criteria.reduce((sum, c) => {
      const m = getMax(c);
      if (m === 'NA' || m === 'Mandatory') return sum;
      return sum + (scores[c.id] || 0);
    }, 0);

  const grandTotal = sections.reduce((sum, s) => sum + sectionTotal(s), 0);

  let level = "None";
  const bt = buildingType as 'New' | 'Existing';
  if (grandTotal >= (bt === 'New' ? 51 : 43))      level = "Platinum";
  else if (grandTotal >= (bt === 'New' ? 42 : 35)) level = "Gold";
  else if (grandTotal >= (bt === 'New' ? 36 : 30)) level = "Silver";
  else if (grandTotal >= (bt === 'New' ? 30 : 25)) level = "Certified";

  const levelBadgeVariant = (l: string) => {
    if (l === 'Certified') return 'certified';
    if (l === 'Silver')    return 'silver';
    if (l === 'Gold')      return 'gold';
    if (l === 'Platinum')  return 'platinum';
    return 'outline';
  };

  useEffect(() => {
    localStorage.setItem(scopedKey(projectId, 'scores_igbc'), JSON.stringify(scores));
    localStorage.setItem(scopedKey(projectId, 'stats_igbc'), JSON.stringify({ points: grandTotal, level }));
  }, [projectId, scores, grandTotal, level]);

  const totalPossible = sections.reduce((sum, s) => {
    const m = buildingType === 'New' ? s.maxNew : s.maxExisting;
    return sum + (typeof m === 'number' ? m : 0);
  }, 0);

  const downloadData = useMemo(() => {
    const bt = buildingType;
    return {
      ratingName: 'IGBC SB 2020',
      brandColor: '#0284c7',
      totalPoints: grandTotal,
      maxPoints: totalPossible,
      level,
      projectInfo: (() => {
        try {
          return JSON.parse(localStorage.getItem(scopedKey(projectId, 'project_info')) || '{}');
        } catch { return {}; }
      })(),
      sections: sections.map(s => {
        const sMax = bt === 'New' ? s.maxNew : s.maxExisting;
        return {
          title: s.title,
          maxPoints: typeof sMax === 'number' ? sMax : 0,
          sectionScore: s.criteria.reduce((sum, c) => {
            const cm = bt === 'New' ? c.maxNew : c.maxExisting;
            if (cm === 'NA' || cm === 'Mandatory') return sum;
            return sum + (scores[c.id] || 0);
          }, 0),
          criteria: s.criteria.map(c => {
            const cm = bt === 'New' ? c.maxNew : c.maxExisting;
            const isMandatory = cm === 'Mandatory';
            const isNA = cm === 'NA';
            return {
              no: c.id,
              name: c.name,
              maxPoints: isMandatory ? 'Mandatory' : isNA ? 'N/A' : cm,
              score: isMandatory ? 'Mandatory' : isNA ? 'N/A' : (scores[c.id] || 0),
            };
          }),
        };
      }),
    };
  }, [grandTotal, level, scores, buildingType, totalPossible]);

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-igbc-blue">IGBC SB 2020 Checklist</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your target points for each criterion below</p>
      </div>

      {/* Summary */}
      <Card className="mb-6 border-t-4 border-t-igbc-blue">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Total Score</p>
              <div className="text-4xl font-bold text-igbc-blue">
                {grandTotal}
                <span className="ml-1 text-base font-normal text-muted-foreground">/ {totalPossible} pts</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Certification Level</p>
              {level !== 'None'
                ? <Badge variant={levelBadgeVariant(level) as any} className="text-sm px-3 py-1">{level}</Badge>
                : <span className="text-muted-foreground text-sm flex items-center gap-1"><Award className="h-4 w-4 opacity-40" /> None yet</span>
              }
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Building Type</p>
              <div className="flex gap-1">
                <Button size="sm" variant={buildingType === 'New' ? 'default' : 'outline'} onClick={() => setBuildingType('New')}>New</Button>
                <Button size="sm" variant={buildingType === 'Existing' ? 'default' : 'outline'} onClick={() => setBuildingType('Existing')}>Existing</Button>
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Progress</p>
              <Progress value={totalPossible > 0 ? Math.min(100, Math.round((grandTotal / totalPossible) * 100)) : 0} indicatorClassName="bg-igbc-blue" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria table */}
      <Card className="mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-igbc-blue text-white">
                <th className="px-4 py-3 text-left font-semibold w-36">Credit ID</th>
                <th className="px-4 py-3 text-left font-semibold">Criterion</th>
                <th className="px-4 py-3 text-center font-semibold w-20">Max</th>
                <th className="px-4 py-3 text-center font-semibold w-24">Points</th>
              </tr>
            </thead>
            <tbody>
              {sections.map(section => {
                const sMax = buildingType === 'New' ? section.maxNew : section.maxExisting;
                return (
                  <React.Fragment key={section.id}>
                    <tr className="row-section border-b border-border">
                      <td className="px-4 py-2.5 font-semibold text-muted-foreground" colSpan={1}>{section.id}.</td>
                      <td className="px-4 py-2.5 font-semibold">{section.title}</td>
                      <td className="px-4 py-2.5 text-center font-semibold">{sMax}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-igbc-blue">{sectionTotal(section)}</td>
                    </tr>
                    {section.criteria.map(c => {
                      const m = getMax(c);
                      const isMandatory = m === 'Mandatory';
                      const isNA = m === 'NA';
                      return (
                        <tr key={c.id} className={`border-b border-border ${isMandatory ? 'row-mandatory' : ''} ${isNA ? 'opacity-50' : ''}`}>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">{c.id}</td>
                          <td className="px-4 py-2.5">{c.name}</td>
                          <td className="px-4 py-2.5 text-center">
                            {isMandatory ? <Badge variant="mandatory" className="text-xs">Mandatory</Badge>
                             : isNA       ? <span className="text-muted-foreground text-xs">N/A</span>
                             :              <span className="text-muted-foreground">{m}</span>}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {!isMandatory && !isNA ? (
                              <Input
                                type="number"
                                min={0}
                                max={m as number}
                                value={scores[c.id] || ''}
                                onChange={e => handleScore(c.id, e.target.value, m as number)}
                                placeholder="0"
                                className="h-7 w-16 text-center mx-auto text-xs px-2"
                              />
                            ) : <span className="text-muted-foreground/40">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              <tr className="bg-muted/80">
                <td colSpan={2} className="px-4 py-3 text-right font-bold">GRAND TOTAL</td>
                <td className="px-4 py-3 text-center font-bold">{totalPossible}</td>
                <td className="px-4 py-3 text-center font-bold text-igbc-blue text-lg">{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Certification thresholds */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Certification Thresholds — {buildingType} Buildings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Points Range</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Level</th>
                </tr>
              </thead>
              <tbody>
                {CERTIFICATION_LEVELS.map(lvl => {
                  const min = lvl.min[bt];
                  const max = lvl.max[bt];
                  const active = grandTotal >= min && grandTotal <= max;
                  const rangeLabel = max === Infinity ? `${min} and above` : `${min} – ${max}`;
                  return (
                    <tr key={lvl.label} className={`border-b border-border last:border-0 transition-colors ${active ? 'row-active-star' : ''}`}>
                      <td className={`py-3 font-medium ${active ? lvl.colorClass : ''}`}>{rangeLabel}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Award className={`h-4 w-4 ${active ? lvl.colorClass : 'text-muted-foreground/30'}`} />
                          <span className={active ? `font-semibold ${lvl.colorClass}` : 'text-muted-foreground/60'}>{lvl.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DownloadSection data={downloadData} />
    </div>
  );
}
