"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Award, ArrowRight, Building2, Leaf, Plus, X } from 'lucide-react';
import { BrandingSection } from '@/components/BrandingSection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// ── Area list types & helpers ─────────────────────────────────────────────────

interface AreaItem {
  id: string;
  name: string;
  value: string;
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function sumAreas(areas: AreaItem[]): number {
  return areas.reduce((s, a) => s + (parseFloat(a.value) || 0), 0);
}

function fmtSqm(n: number): string {
  if (n === 0) return '0';
  return n % 1 === 0 ? n.toLocaleString('en-IN') : n.toFixed(2);
}

// ── AreaList sub-component ────────────────────────────────────────────────────

function AreaList({
  label,
  items,
  namePlaceholder,
  onChange,
}: {
  label: string;
  items: AreaItem[];
  namePlaceholder: string;
  onChange: (items: AreaItem[]) => void;
}) {
  const total = sumAreas(items);

  const update = (id: string, field: 'name' | 'value', val: string) =>
    onChange(items.map(a => (a.id === id ? { ...a, [field]: val } : a)));

  const remove = (id: string) => onChange(items.filter(a => a.id !== id));

  const add = () => onChange([...items, { id: newId(), name: '', value: '' }]);

  return (
    <div className="space-y-2.5">
      {/* heading row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-sm text-muted-foreground">
          Total:{' '}
          <span className="font-bold text-foreground">
            {fmtSqm(total)} sqm
          </span>
        </span>
      </div>

      {/* area rows */}
      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2">
              {/* name */}
              <Input
                placeholder={namePlaceholder}
                value={item.name}
                onChange={e => update(item.id, 'name', e.target.value)}
                className="flex-1 min-w-0 h-8 text-sm"
              />
              {/* value + unit */}
              <div className="flex items-center border border-input rounded-md focus-within:ring-1 focus-within:ring-ring overflow-hidden bg-background">
                <input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="0"
                  value={item.value}
                  onChange={e => update(item.id, 'value', e.target.value)}
                  className="w-24 h-8 px-2 text-sm text-right bg-transparent outline-none"
                />
                <span className="pr-2 text-xs text-muted-foreground select-none whitespace-nowrap">
                  sqm
                </span>
              </div>
              {/* delete */}
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Remove area"
                className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No areas added yet.</p>
      )}

      {/* add button */}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity"
      >
        <Plus className="h-3.5 w-3.5" />
        Add area
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

interface ProjectInfo {
  name: string;
  siteAreas: AreaItem[];
  builtUpAreas: AreaItem[];
  occupancyFixed: string;
  occupancyFloating: string;
  climateZone: string;
  country: string;
  state: string;
  city: string;
}

const DEFAULT_PROJECT: ProjectInfo = {
  name: '',
  siteAreas: [],
  builtUpAreas: [],
  occupancyFixed: '',
  occupancyFloating: '',
  climateZone: 'Composite',
  country: 'India',
  state: '',
  city: '',
};

function migrateProjectInfo(raw: any): ProjectInfo {
  // Migrate from old flat format (siteArea / builtUpArea strings)
  const siteAreas: AreaItem[] = Array.isArray(raw.siteAreas)
    ? raw.siteAreas
    : raw.siteArea
    ? [{ id: 'site-0', name: 'Site Area', value: String(raw.siteArea) }]
    : [];

  const builtUpAreas: AreaItem[] = Array.isArray(raw.builtUpAreas)
    ? raw.builtUpAreas
    : raw.builtUpArea
    ? [{ id: 'built-0', name: 'Built-up Area', value: String(raw.builtUpArea) }]
    : [];

  return {
    name:              raw.name              || '',
    occupancyFixed:    raw.occupancyFixed    || '',
    occupancyFloating: raw.occupancyFloating || '',
    climateZone:       raw.climateZone       || 'Composite',
    country:           raw.country           || 'India',
    state:             raw.state             || '',
    city:              raw.city              || '',
    siteAreas,
    builtUpAreas,
  };
}

function saveProjectInfo(info: ProjectInfo) {
  // Include computed totals so rating-page download code still works
  const payload = {
    ...info,
    siteArea:        String(sumAreas(info.siteAreas)),
    builtUpArea:     String(sumAreas(info.builtUpAreas)),
    occupancyTotal:  String((parseFloat(info.occupancyFixed) || 0) + (parseFloat(info.occupancyFloating) || 0)),
  };
  localStorage.setItem('project_info', JSON.stringify(payload));
}

export default function Home() {
  const [stats, setStats] = useState({
    v6:    { points: 0, stars: 0 },
    v2019: { points: 0, stars: 0 },
    v2015: { points: 0, stars: 0 },
    igbc:  { points: 0, level: 'None' },
  });

  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(DEFAULT_PROJECT);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v6    = JSON.parse(localStorage.getItem('stats_v6')    || '{"points":0,"stars":0}');
    const v2019 = JSON.parse(localStorage.getItem('stats_v2019') || '{"points":0,"stars":0}');
    const v2015 = JSON.parse(localStorage.getItem('stats_v2015') || '{"points":0,"stars":0}');
    const igbc  = JSON.parse(localStorage.getItem('stats_igbc')  || '{"points":0,"level":"None"}');
    setStats({ v6, v2019, v2015, igbc });

    const raw = JSON.parse(localStorage.getItem('project_info') || 'null');
    if (raw) setProjectInfo(migrateProjectInfo(raw));
  }, []);

  const setField = (field: keyof ProjectInfo, value: any) => {
    const updated = { ...projectInfo, [field]: value };
    setProjectInfo(updated);
    saveProjectInfo(updated);
  };

  const totalOccupancy = (parseFloat(projectInfo.occupancyFixed) || 0) + (parseFloat(projectInfo.occupancyFloating) || 0);

  const renderStars = (count: number, colorClass: string) =>
    Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < count
            ? `fill-${colorClass} text-${colorClass} glow-${colorClass}`
            : 'text-muted-foreground/30'
        }`}
      />
    ));

  const igbcBadgeVariant = (level: string) => {
    if (level === 'Certified') return 'certified';
    if (level === 'Silver')    return 'silver';
    if (level === 'Gold')      return 'gold';
    if (level === 'Platinum')  return 'platinum';
    return 'outline';
  };

  const ratingCards = [
    { href: '/griha-v2015', label: 'GRIHA V2015', color: 'rose-red', borderClass: 'border-t-rose-red', points: stats.v2015.points, stars: stats.v2015.stars },
    { href: '/griha-v2019', label: 'GRIHA V2019', color: 'green',    borderClass: 'border-t-green',    points: stats.v2019.points, stars: stats.v2019.stars },
    { href: '/griha-v6',    label: 'GRIHA V6',    color: 'orange',   borderClass: 'border-t-orange',   points: stats.v6.points,    stars: stats.v6.stars    },
  ];

  return (
    <div className="container">
      {/* Page header */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your green building certification progress</p>
        </div>
      </div>

      {/* Project information */}
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Project Information</CardTitle>
          </div>
          <CardDescription>Basic details used across all rating systems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                placeholder="Enter project name"
                value={projectInfo.name}
                onChange={e => setField('name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Occupancy — Fixed</label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={projectInfo.occupancyFixed}
                onChange={e => setField('occupancyFixed', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Occupancy — Floating</label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={projectInfo.occupancyFloating}
                onChange={e => setField('occupancyFloating', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Total Occupancy</label>
              <div className="flex h-9 items-center rounded-md border border-input bg-muted/50 px-3 text-sm font-semibold">
                {fmtSqm(totalOccupancy)}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Climate Zone</label>
              <Select
                value={projectInfo.climateZone}
                onValueChange={v => setField('climateZone', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Composite">Composite</SelectItem>
                  <SelectItem value="Hot and Dry">Hot and Dry</SelectItem>
                  <SelectItem value="Warm and Humid">Warm and Humid</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Address */}
          <div className="space-y-2.5">
            <span className="text-sm font-semibold">Address</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Country</label>
                <Input
                  placeholder="Country"
                  value={projectInfo.country}
                  onChange={e => setField('country', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">State</label>
                <Input
                  placeholder="e.g. Maharashtra"
                  value={projectInfo.state}
                  onChange={e => setField('state', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">City</label>
                <Input
                  placeholder="e.g. Mumbai"
                  value={projectInfo.city}
                  onChange={e => setField('city', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Area sections — two columns on large screens */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <AreaList
              label="Total Site Area"
              items={projectInfo.siteAreas}
              namePlaceholder="e.g. Landscape area, Hard paved area…"
              onChange={items => setField('siteAreas', items)}
            />
            <AreaList
              label="Built-up Area"
              items={projectInfo.builtUpAreas}
              namePlaceholder="e.g. Ground floor, First floor…"
              onChange={items => setField('builtUpAreas', items)}
            />
          </div>
        </CardContent>
      </Card>

      <BrandingSection />

      {/* Rating cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ratingCards.map(card => (
          <Link key={card.href} href={card.href} className="no-underline">
            <Card className={`h-full border-t-4 ${card.borderClass} transition-shadow hover:shadow-md group cursor-pointer`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-sm font-semibold text-${card.color}`}>{card.label}</CardTitle>
                  <div className="flex gap-0.5">{renderStars(card.stars, card.color)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <div className={`text-3xl font-bold text-${card.color}`}>
                    {card.points}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">/ 100 pts</span>
                  </div>
                </div>
                <Progress
                  value={Math.min(100, card.points)}
                  className="h-1.5 mb-3"
                  indicatorClassName={`bg-${card.color}`}
                />
                <div className={`flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-${card.color} transition-colors`}>
                  View details <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* IGBC card */}
        <Link href="/igbc-sb-2020" className="no-underline">
          <Card className="h-full border-t-4 border-t-igbc-blue transition-shadow hover:shadow-md group cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-igbc-blue">IGBC SB 2020</CardTitle>
                {stats.igbc.level !== 'None'
                  ? <Badge variant={igbcBadgeVariant(stats.igbc.level) as any}>{stats.igbc.level}</Badge>
                  : <Award className="h-4 w-4 text-muted-foreground/40" />
                }
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <div className="text-3xl font-bold text-igbc-blue">
                  {stats.igbc.points}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/ 100 pts</span>
                </div>
              </div>
              <Progress
                value={Math.min(100, stats.igbc.points)}
                className="h-1.5 mb-3"
                indicatorClassName="bg-igbc-blue"
              />
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-igbc-blue transition-colors">
                View details <ArrowRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
