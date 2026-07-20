"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { DownloadSection } from '@/components/DownloadSection';
import { ProjectDetailsSection } from '@/components/ProjectDetailsSection';
import { scopedKey } from '@/lib/projects';

const sections = [
  { id: 1, title: "Sustainable Site Planning", max: 12, criteria: [
    { id: 1, name: "Green Infrastructure", max: 5, type: "Partly Mandatory" },
    { id: 2, name: "Low Impact Design Strategies", max: 5, type: "Optional" },
    { id: 3, name: "Design to Mitigate UHIE", max: 2, type: "Optional" },
  ]},
  { id: 2, title: "Construction Management", max: 4, criteria: [
    { id: 4, name: "Air and Soil Pollution Control", max: 1, type: "Partly Mandatory" },
    { id: 5, name: "Topsoil Preservation", max: 1, type: "Optional" },
    { id: 6, name: "Construction Management Practices", max: 2, type: "Partly Mandatory" },
  ]},
  { id: 3, title: "Energy Optimization", max: 18, criteria: [
    { id: 7, name: "Energy Optimization", max: 12, type: "Partly Mandatory" },
    { id: 8, name: "Renewable Energy Utilization", max: 5, type: "Partly Mandatory" },
    { id: 9, name: "Low ODP and GWP Materials", max: 1, type: "Partly Mandatory" },
  ]},
  { id: 4, title: "Occupant Comfort", max: 12, criteria: [
    { id: 10, name: "Visual Comfort", max: 4, type: "Partly Mandatory" },
    { id: 11, name: "Thermal and Acoustic Comfort", max: 2, type: "Partly Mandatory" },
    { id: 12, name: "Indoor Air Quality", max: 6, type: "Partly Mandatory" },
  ]},
  { id: 5, title: "Water Management", max: 16, criteria: [
    { id: 13, name: "Water Demand Reduction", max: 4, type: "Partly Mandatory" },
    { id: 14, name: "Wastewater Treatment", max: 2, type: "Optional" },
    { id: 15, name: "Rainwater Management", max: 5, type: "Optional" },
    { id: 16, name: "Water Quality and Self-Sufficiency", max: 5, type: "Partly Mandatory" },
  ]},
  { id: 6, title: "Solid Waste Management", max: 6, criteria: [
    { id: 17, name: "Waste Management – Post Occupancy", max: 4, type: "Partly Mandatory" },
    { id: 18, name: "Organic Waste Treatment", max: 2, type: "Optional" },
  ]},
  { id: 7, title: "Sustainable Building Materials", max: 12, criteria: [
    { id: 19, name: "Utilization of Alternative Materials in Building", max: 5, type: "Optional" },
    { id: 20, name: "Reduction in Global Warming Potential through Life Cycle Assessment", max: 5, type: "Optional" },
    { id: 21, name: "Alternative Materials for External Site Development", max: 2, type: "Optional" },
  ]},
  { id: 8, title: "Life Cycle Costing", max: 5, criteria: [
    { id: 22, name: "Life Cycle Cost Analysis", max: 5, type: "Optional" },
  ]},
  { id: 9, title: "Socio-Economic Strategies", max: 8, criteria: [
    { id: 23, name: "Safety and Sanitation for Construction Workers", max: 1, type: "Partly Mandatory" },
    { id: 24, name: "Universal Accessibility", max: 2, type: "Optional" },
    { id: 25, name: "Dedicated Facilities for Service Staff", max: 2, type: "Optional" },
    { id: 26, name: "Positive Social Impact", max: 3, type: "Partly Mandatory" },
  ]},
  { id: 10, title: "Performance Metering and Monitoring", max: 7, criteria: [
    { id: 27, name: "Project Commissioning", max: 0, type: "Mandatory" },
    { id: 28, name: "Smart Metering and Monitoring", max: 7, type: "Partly Mandatory" },
    { id: 29, name: "Operation and Maintenance Protocol", max: 0, type: "Mandatory" },
  ]},
  { id: 11, title: "Innovation", max: 5, criteria: [
    { id: 30, name: "Innovation", max: 5, type: "Optional" },
  ]},
];

function complianceBadge(type: string) {
  if (type === 'Mandatory')        return <Badge variant="mandatory">Mandatory</Badge>;
  if (type === 'Partly Mandatory') return <Badge variant="partly-mandatory">Partly Mandatory</Badge>;
  return <Badge variant="optional">Optional</Badge>;
}

function rowClass(type: string) {
  if (type === 'Mandatory')        return 'row-mandatory';
  if (type === 'Partly Mandatory') return 'row-partly';
  return '';
}

const STAR_THRESHOLDS = [
  { range: '25 – 40',     min: 25, max: 40,       stars: 1 },
  { range: '41 – 55',     min: 41, max: 55,       stars: 2 },
  { range: '56 – 70',     min: 56, max: 70,       stars: 3 },
  { range: '71 – 85',     min: 71, max: 85,       stars: 4 },
  { range: '86 and above', min: 86, max: Infinity, stars: 5 },
];

export default function GrihaV2019Page() {
  const params = useParams<{ projectId: string }>();
  const projectId = decodeURIComponent(params.projectId as string);

  const [scores, setScores] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(scopedKey(projectId, 'scores_v2019'));
      if (saved) return JSON.parse(saved);
    }
    return Array(35).fill(0);
  });

  const [projectInfo, setProjectInfo] = useState<Record<string, string>>({});
  useEffect(() => {
    const saved = localStorage.getItem(scopedKey(projectId, 'project_info'));
    if (saved) setProjectInfo(JSON.parse(saved));
  }, [projectId]);

  const handleScore = (id: number, value: string, max: number) => {
    let n = parseInt(value);
    if (isNaN(n)) n = 0;
    n = Math.max(0, Math.min(max, n));
    const next = [...scores];
    next[id] = n;
    setScores(next);
  };

  const sectionTotal = (s: typeof sections[0]) => s.criteria.reduce((sum, c) => sum + (scores[c.id] || 0), 0);
  const baseTotal = sections.slice(0, 10).reduce((sum, s) => sum + sectionTotal(s), 0);
  const innovationTotal = sectionTotal(sections[10]);
  const grandTotal = baseTotal + innovationTotal;

  let stars = 0;
  if (grandTotal >= 86) stars = 5;
  else if (grandTotal >= 71) stars = 4;
  else if (grandTotal >= 56) stars = 3;
  else if (grandTotal >= 41) stars = 2;
  else if (grandTotal >= 25) stars = 1;

  useEffect(() => {
    localStorage.setItem(scopedKey(projectId, 'scores_v2019'), JSON.stringify(scores));
    localStorage.setItem(scopedKey(projectId, 'stats_v2019'), JSON.stringify({ points: grandTotal, stars }));
  }, [projectId, scores, grandTotal, stars]);

  const downloadData = useMemo(() => ({
    ratingName: 'GRIHA V2019',
    brandColor: '#32b460',
    totalPoints: grandTotal,
    maxPoints: 105,
    starsCount: stars,
    projectInfo,
    sections: sections.map(s => ({
      title: s.title,
      maxPoints: s.max,
      sectionScore: s.criteria.reduce((sum, c) => sum + (scores[c.id] || 0), 0),
      criteria: s.criteria.map(c => ({
        no: c.id,
        name: c.name,
        maxPoints: c.max,
        score: scores[c.id] || 0,
        compliance: c.type,
      })),
    })),
  }), [grandTotal, stars, scores, projectInfo]);

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-green">GRIHA V2019 Checklist</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your target points for each criterion below</p>
      </div>

      {/* Summary */}
      <Card className="mb-6 border-t-4 border-t-green">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Total Score</p>
              <div className="text-4xl font-bold text-green">
                {grandTotal}
                <span className="ml-1 text-base font-normal text-muted-foreground">/ 105 pts</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Base Points</p>
              <div className="text-2xl font-semibold">{baseTotal} <span className="text-sm font-normal text-muted-foreground">/ 100</span></div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Star Rating</p>
              <div className="flex gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < stars ? 'fill-green text-green glow-green' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Progress</p>
              <Progress value={Math.min(100, baseTotal)} indicatorClassName="bg-green" />
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectDetailsSection projectId={projectId} accentClass="border-t-green" />

      {/* Criteria table */}
      <Card className="mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green text-white">
                <th className="px-4 py-3 text-center font-semibold w-12">No.</th>
                <th className="px-4 py-3 text-left font-semibold">Criterion</th>
                <th className="px-4 py-3 text-center font-semibold w-20">Max</th>
                <th className="px-4 py-3 text-center font-semibold w-24">Points</th>
                <th className="px-4 py-3 text-left font-semibold w-40">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {sections.slice(0, 10).map(section => (
                <React.Fragment key={section.id}>
                  <tr className="row-section border-b border-border">
                    <td className="px-4 py-2.5 text-center font-semibold text-muted-foreground">{section.id}.</td>
                    <td className="px-4 py-2.5 font-semibold">{section.title}</td>
                    <td className="px-4 py-2.5 text-center font-semibold">{section.max}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-green">{sectionTotal(section)}</td>
                    <td />
                  </tr>
                  {section.criteria.map(c => (
                    <tr key={c.id} className={`border-b border-border ${rowClass(c.type)}`}>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{c.id}</td>
                      <td className="px-4 py-2.5">{c.name}</td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{c.max}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={c.max}
                          value={scores[c.id] || ''}
                          onChange={e => handleScore(c.id, e.target.value, c.max)}
                          placeholder="0"
                          className="h-7 w-16 text-center mx-auto text-xs px-2"
                          disabled={c.max === 0}
                        />
                      </td>
                      <td className="px-4 py-2.5">{complianceBadge(c.type)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              <tr className="border-y-2 border-border bg-muted/80">
                <td colSpan={2} className="px-4 py-3 text-right font-bold">TOTAL (Base Points)</td>
                <td className="px-4 py-3 text-center font-bold">100</td>
                <td className="px-4 py-3 text-center font-bold text-green text-base">{baseTotal}</td>
                <td />
              </tr>

              {sections.slice(10).map(section => (
                <React.Fragment key={section.id}>
                  <tr className="row-section border-b border-border">
                    <td className="px-4 py-2.5 text-center font-semibold text-muted-foreground">{section.id}.</td>
                    <td className="px-4 py-2.5 font-semibold">{section.title}</td>
                    <td className="px-4 py-2.5 text-center font-semibold">{section.max}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-green">{sectionTotal(section)}</td>
                    <td />
                  </tr>
                  {section.criteria.map(c => (
                    <tr key={c.id} className={`border-b border-border ${rowClass(c.type)}`}>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{c.id}</td>
                      <td className="px-4 py-2.5">{c.name}</td>
                      <td className="px-4 py-2.5 text-center text-muted-foreground">{c.max}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={c.max}
                          value={scores[c.id] || ''}
                          onChange={e => handleScore(c.id, e.target.value, c.max)}
                          placeholder="0"
                          className="h-7 w-16 text-center mx-auto text-xs px-2"
                        />
                      </td>
                      <td className="px-4 py-2.5">{complianceBadge(c.type)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              <tr className="bg-muted/80">
                <td colSpan={2} className="px-4 py-3 text-right font-bold">GRAND TOTAL</td>
                <td className="px-4 py-3 text-center font-bold">100 + 5</td>
                <td className="px-4 py-3 text-center font-bold text-green text-lg">{grandTotal}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Star thresholds */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Star Rating Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Points Range</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground">Star Rating</th>
                </tr>
              </thead>
              <tbody>
                {STAR_THRESHOLDS.map(t => {
                  const active = grandTotal >= t.min && grandTotal <= t.max;
                  return (
                    <tr key={t.stars} className={`border-b border-border last:border-0 transition-colors ${active ? 'row-active-star' : ''}`}>
                      <td className={`py-3 font-medium ${active ? 'text-green' : ''}`}>{t.range}</td>
                      <td className="py-3">
                        <div className="flex gap-0.5">
                          {Array(t.stars).fill(0).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${active ? 'fill-green text-green glow-green' : 'text-muted-foreground/30'}`} />
                          ))}
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
