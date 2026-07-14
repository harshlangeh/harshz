"use client";
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';

const sections = [
  { id: 1, title: "Site Planning", max: 8, criteria: [
    { id: 1, name: "Site Selection", max: 1 },
    { id: 2, name: "Low-impact design", max: 4 },
    { id: 3, name: "Design to mitigate UHIE", max: 2 },
    { id: 4, name: "Site Imperviousness Factor", max: 1 },
  ]},
  { id: 2, title: "Construction Management", max: 9, criteria: [
    { id: 5, name: "Air and water pollution control", max: 1 },
    { id: 6, name: "Preserve and protect landscape during construction", max: 4 },
    { id: 7, name: "Construction Management Practices", max: 4 },
  ]},
  { id: 3, title: "Energy", max: 20, criteria: [
    { id: 8, name: "Energy efficiency", max: 13 },
    { id: 9, name: "Renewable energy utilization", max: 7 },
    { id: 10, name: "Zero ODP materials", max: 0 },
  ]},
  { id: 4, title: "Occupant Comfort and Well Being", max: 12, criteria: [
    { id: 11, name: "Achieving indoor comfort requirements (visual/thermal/acoustic)", max: 6 },
    { id: 12, name: "Maintaining good IAQ", max: 4 },
    { id: 13, name: "Use of low-VOC paints and other compounds in building interiors", max: 2 },
  ]},
  { id: 5, title: "Water", max: 17, criteria: [
    { id: 14, name: "Use of low-flow fixtures and systems", max: 4 },
    { id: 15, name: "Reducing landscape water demand", max: 4 },
    { id: 16, name: "Water Quality", max: 2 },
    { id: 17, name: "On-site water reuse", max: 5 },
    { id: 18, name: "Rainwater Recharge", max: 2 },
  ]},
  { id: 6, title: "Sustainable Building Materials", max: 14, criteria: [
    { id: 19, name: "Utilization of BIS recommended waste materials in building structure", max: 6 },
    { id: 20, name: "Reduction in embodied energy of building structure", max: 4 },
    { id: 21, name: "Use of low-environmental impact materials in building interiors", max: 4 },
  ]},
  { id: 7, title: "Solid Waste Management", max: 6, criteria: [
    { id: 22, name: "Avoided post-construction landfill", max: 4 },
    { id: 23, name: "Treat organic waste on site", max: 2 },
  ]},
  { id: 8, title: "Socio-Economic Strategies", max: 6, criteria: [
    { id: 24, name: "Labour safety and sanitation", max: 1 },
    { id: 25, name: "Design for Universal Accessibility", max: 2 },
    { id: 26, name: "Dedicated facilities for service staff", max: 2 },
    { id: 27, name: "Increase in environmental awareness", max: 1 },
  ]},
  { id: 9, title: "Performance Monitoring and Validation", max: 8, criteria: [
    { id: 28, name: "Smart metering and monitoring", max: 8 },
    { id: 29, name: "Operation, Maintenance Protocols", max: 0 },
    { id: 30, name: "Performance Assessment for Final Rating", max: 0 },
  ]},
  { id: 10, title: "Innovation", max: 4, criteria: [
    { id: 31, name: "Innovation", max: 4 },
  ]},
];

const STAR_THRESHOLDS = [
  { range: '25 – 40',     min: 25, max: 40,       stars: 1 },
  { range: '41 – 55',     min: 41, max: 55,       stars: 2 },
  { range: '56 – 70',     min: 56, max: 70,       stars: 3 },
  { range: '71 – 85',     min: 71, max: 85,       stars: 4 },
  { range: '86 and above', min: 86, max: Infinity, stars: 5 },
];

export default function GrihaV2015Page() {
  const [scores, setScores] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scores_v2015');
      if (saved) return JSON.parse(saved);
    }
    return Array(35).fill(0);
  });

  const handleScore = (id: number, value: string, max: number) => {
    let n = parseInt(value);
    if (isNaN(n)) n = 0;
    n = Math.max(0, Math.min(max, n));
    const next = [...scores];
    next[id] = n;
    setScores(next);
  };

  const sectionTotal = (s: typeof sections[0]) => s.criteria.reduce((sum, c) => sum + (scores[c.id] || 0), 0);
  const baseTotal = sections.slice(0, 9).reduce((sum, s) => sum + sectionTotal(s), 0);
  const innovationTotal = sectionTotal(sections[9]);
  const grandTotal = baseTotal + innovationTotal;

  let stars = 0;
  if (grandTotal >= 86) stars = 5;
  else if (grandTotal >= 71) stars = 4;
  else if (grandTotal >= 56) stars = 3;
  else if (grandTotal >= 41) stars = 2;
  else if (grandTotal >= 25) stars = 1;

  useEffect(() => {
    localStorage.setItem('scores_v2015', JSON.stringify(scores));
    localStorage.setItem('stats_v2015', JSON.stringify({ points: grandTotal, stars }));
  }, [scores, grandTotal, stars]);

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-rose-red">GRIHA V2015 Checklist</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your target points for each criterion below</p>
      </div>

      {/* Summary */}
      <Card className="mb-6 border-t-4 border-t-rose-red">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Total Score</p>
              <div className="text-4xl font-bold text-rose-red">
                {grandTotal}
                <span className="ml-1 text-base font-normal text-muted-foreground">/ 104 pts</span>
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
                  <Star key={i} className={`h-5 w-5 ${i < stars ? 'fill-rose-red text-rose-red glow-rose-red' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Progress</p>
              <Progress value={Math.min(100, baseTotal)} indicatorClassName="bg-rose-red" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria table */}
      <Card className="mb-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-rose-red text-white">
                <th className="px-4 py-3 text-center font-semibold w-12">No.</th>
                <th className="px-4 py-3 text-left font-semibold">Criterion</th>
                <th className="px-4 py-3 text-center font-semibold w-20">Max</th>
                <th className="px-4 py-3 text-center font-semibold w-24">Points</th>
              </tr>
            </thead>
            <tbody>
              {sections.slice(0, 9).map(section => (
                <React.Fragment key={section.id}>
                  <tr className="row-section border-b border-border">
                    <td className="px-4 py-2.5 text-center font-semibold text-muted-foreground">{section.id}.</td>
                    <td className="px-4 py-2.5 font-semibold">{section.title}</td>
                    <td className="px-4 py-2.5 text-center font-semibold">{section.max}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-rose-red">{sectionTotal(section)}</td>
                  </tr>
                  {section.criteria.map(c => (
                    <tr key={c.id} className="border-b border-border hover:bg-muted/40 transition-colors">
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
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              <tr className="border-y-2 border-border bg-muted/80">
                <td colSpan={2} className="px-4 py-3 text-right font-bold">TOTAL (Base Points)</td>
                <td className="px-4 py-3 text-center font-bold">100</td>
                <td className="px-4 py-3 text-center font-bold text-rose-red text-base">{baseTotal}</td>
              </tr>

              {sections.slice(9).map(section => (
                <React.Fragment key={section.id}>
                  <tr className="row-section border-b border-border">
                    <td className="px-4 py-2.5 text-center font-semibold text-muted-foreground">{section.id}.</td>
                    <td className="px-4 py-2.5 font-semibold">{section.title}</td>
                    <td className="px-4 py-2.5 text-center font-semibold">{section.max}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-rose-red">{sectionTotal(section)}</td>
                  </tr>
                  {section.criteria.map(c => (
                    <tr key={c.id} className="border-b border-border hover:bg-muted/40 transition-colors">
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
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              <tr className="bg-muted/80">
                <td colSpan={2} className="px-4 py-3 text-right font-bold">GRAND TOTAL</td>
                <td className="px-4 py-3 text-center font-bold">100 + 4</td>
                <td className="px-4 py-3 text-center font-bold text-rose-red text-lg">{grandTotal}</td>
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
                      <td className={`py-3 font-medium ${active ? 'text-rose-red' : ''}`}>{t.range}</td>
                      <td className="py-3">
                        <div className="flex gap-0.5">
                          {Array(t.stars).fill(0).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${active ? 'fill-rose-red text-rose-red glow-rose-red' : 'text-muted-foreground/30'}`} />
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
    </div>
  );
}
