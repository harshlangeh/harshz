"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Award, ArrowRight, Building2, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [stats, setStats] = useState({
    v6:    { points: 0, stars: 0 },
    v2019: { points: 0, stars: 0 },
    v2015: { points: 0, stars: 0 },
    igbc:  { points: 0, level: 'None' }
  });

  const [projectInfo, setProjectInfo] = useState({
    name: '',
    siteArea: '',
    builtUpArea: '',
    occupancyFixed: '',
    occupancyFloating: '',
    climateZone: 'Composite'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const v6    = JSON.parse(localStorage.getItem('stats_v6')    || '{"points":0,"stars":0}');
    const v2019 = JSON.parse(localStorage.getItem('stats_v2019') || '{"points":0,"stars":0}');
    const v2015 = JSON.parse(localStorage.getItem('stats_v2015') || '{"points":0,"stars":0}');
    const igbc  = JSON.parse(localStorage.getItem('stats_igbc')  || '{"points":0,"level":"None"}');
    setStats({ v6, v2019, v2015, igbc });
    const saved = JSON.parse(localStorage.getItem('project_info') || 'null');
    if (saved) setProjectInfo(saved);
  }, []);

  const handleChange = (field: string, value: string) => {
    const updated = { ...projectInfo, [field]: value };
    setProjectInfo(updated);
    localStorage.setItem('project_info', JSON.stringify(updated));
  };

  const renderStars = (count: number, colorClass: string) =>
    Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < count ? `fill-${colorClass} text-${colorClass} glow-${colorClass}` : 'text-muted-foreground/30'}`}
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
    {
      href: '/griha-v2015',
      label: 'GRIHA V2015',
      color: 'rose-red',
      borderClass: 'border-t-rose-red',
      points: stats.v2015.points,
      stars: stats.v2015.stars,
    },
    {
      href: '/griha-v2019',
      label: 'GRIHA V2019',
      color: 'green',
      borderClass: 'border-t-green',
      points: stats.v2019.points,
      stars: stats.v2019.stars,
    },
    {
      href: '/griha-v6',
      label: 'GRIHA V6',
      color: 'orange',
      borderClass: 'border-t-orange',
      points: stats.v6.points,
      stars: stats.v6.stars,
    },
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
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                placeholder="Enter project name"
                value={projectInfo.name}
                onChange={e => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Total Site Area (sq.m)</label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={projectInfo.siteArea}
                onChange={e => handleChange('siteArea', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Built-up Area (sq.m)</label>
              <Input
                type="number"
                placeholder="e.g. 12000"
                value={projectInfo.builtUpArea}
                onChange={e => handleChange('builtUpArea', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Occupancy — Fixed</label>
              <Input
                type="number"
                placeholder="e.g. 200"
                value={projectInfo.occupancyFixed}
                onChange={e => handleChange('occupancyFixed', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Occupancy — Floating</label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={projectInfo.occupancyFloating}
                onChange={e => handleChange('occupancyFloating', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Climate Zone</label>
              <Select value={projectInfo.climateZone} onValueChange={v => handleChange('climateZone', v)}>
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
        </CardContent>
      </Card>

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
