"use client";
import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AreaList, fmtSqm } from '@/components/AreaList';
import {
  BUILDING_TYPOLOGIES, OPERATION_SCHEDULE, getProjectDetails, saveProjectDetails,
  newBuildingId, type ProjectDetailsState, type BuildingItem,
} from '@/data/building-typology';

interface Props {
  projectId: string;
  /** Brand accent class for the card's top border, e.g. "border-t-orange". */
  accentClass: string;
}

/**
 * Sentinel for the leading "Select…" placeholder option. It must be enabled (not `disabled`) so
 * Radix's open-on-no-value auto-focus lands on it instead of the first real option — otherwise the
 * first real option gets a focus highlight that reads as a pre-selected default.
 */
const PLACEHOLDER = '__placeholder__';

const EMPTY_STATE: ProjectDetailsState = {
  typologyCategory: '', typologyType: '', operationDaily: '', operationWeekly: '',
  siteAreas: [], numberOfBuildings: '1', buildings: [{ id: 'init', name: '', builtUpArea: '' }],
};

export function ProjectDetailsSection({ projectId, accentClass }: Props) {
  const [details, setDetails] = useState<ProjectDetailsState>(EMPTY_STATE);

  useEffect(() => {
    setDetails(getProjectDetails(projectId));
  }, [projectId]);

  const update = (patch: Partial<ProjectDetailsState>) => {
    setDetails(saveProjectDetails(projectId, patch));
  };

  const resolve = (v: string) => (v === PLACEHOLDER ? '' : v);

  const selectedCategory = BUILDING_TYPOLOGIES.find(c => c.category === details.typologyCategory);

  const totalBuiltUpArea = details.buildings.reduce((s, b) => s + (parseFloat(b.builtUpArea) || 0), 0);

  const updateBuildingCount = (raw: string) => {
    const patch: Partial<ProjectDetailsState> = { numberOfBuildings: raw };
    const count = parseInt(raw, 10);
    if (!Number.isNaN(count) && count > 0) {
      let buildings = [...details.buildings];
      while (buildings.length < count) buildings.push({ id: newBuildingId(), name: '', builtUpArea: '' });
      if (buildings.length > count) buildings = buildings.slice(0, count);
      patch.buildings = buildings;
    }
    update(patch);
  };

  const updateBuilding = (id: string, field: 'name' | 'builtUpArea', val: string) => {
    update({ buildings: details.buildings.map(b => (b.id === id ? { ...b, [field]: val } : b)) });
  };

  return (
    <Card className={`mb-6 border-t-4 ${accentClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Project Details</CardTitle>
        </div>
        <CardDescription>Building typology, areas and operation schedule for this project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Building Typology</label>
            <Select
              value={details.typologyCategory}
              onValueChange={v => update({ typologyCategory: resolve(v), typologyType: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEHOLDER} className="text-muted-foreground">Select a category</SelectItem>
                {BUILDING_TYPOLOGIES.map(c => (
                  <SelectItem key={c.category} value={c.category}>{c.category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Building Sub-typology</label>
            {selectedCategory?.types ? (
              <Select
                value={details.typologyType}
                onValueChange={v => update({ typologyType: resolve(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sub-type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PLACEHOLDER} className="text-muted-foreground">Select a sub-type</SelectItem>
                  {selectedCategory.types.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex h-9 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                {selectedCategory ? 'Assessed per building/space' : 'Select a category first'}
              </div>
            )}
          </div>
        </div>

        {selectedCategory?.description && (
          <p className="text-xs text-muted-foreground -mt-2">{selectedCategory.description}</p>
        )}

        <Separator />

        {/* Buildings */}
        <div className="space-y-3">
          <div className="max-w-[220px] space-y-1.5">
            <label className="text-sm font-medium">Number of Buildings</label>
            <Input
              type="number"
              min={1}
              step={1}
              value={details.numberOfBuildings}
              onChange={e => updateBuildingCount(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Buildings</span>
            <span className="text-sm text-muted-foreground">
              Total Built-up Area:{' '}
              <span className="font-bold text-foreground">{fmtSqm(totalBuiltUpArea)} sqm</span>
            </span>
          </div>
          <div className="space-y-1.5">
            {details.buildings.map((b: BuildingItem, i: number) => (
              <div key={b.id} className="flex items-center gap-2">
                <Input
                  placeholder={`Building ${i + 1} name`}
                  value={b.name}
                  onChange={e => updateBuilding(b.id, 'name', e.target.value)}
                  className="flex-1 min-w-0 h-8 text-sm"
                />
                <div className="flex items-center border border-input rounded-md focus-within:ring-1 focus-within:ring-ring overflow-hidden bg-background">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="0"
                    value={b.builtUpArea}
                    onChange={e => updateBuilding(b.id, 'builtUpArea', e.target.value)}
                    className="w-24 h-8 px-2 text-sm text-right bg-transparent outline-none"
                  />
                  <span className="pr-2 text-xs text-muted-foreground select-none whitespace-nowrap">sqm</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <AreaList
          label="Total Site Area"
          items={details.siteAreas}
          namePlaceholder="e.g. Landscape area, Hard paved area…"
          onChange={items => update({ siteAreas: items })}
        />

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Daily Operation Schedule</label>
            <Select
              value={details.operationDaily}
              onValueChange={v => update({ operationDaily: resolve(v) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select daily hours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEHOLDER} className="text-muted-foreground">Select daily hours</SelectItem>
                {OPERATION_SCHEDULE.dailyOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Weekly Operation Schedule</label>
            <Select
              value={details.operationWeekly}
              onValueChange={v => update({ operationWeekly: resolve(v) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select weekly days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEHOLDER} className="text-muted-foreground">Select weekly days</SelectItem>
                {OPERATION_SCHEDULE.weeklyOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{OPERATION_SCHEDULE.note}</p>
      </CardContent>
    </Card>
  );
}
