"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Building2, ChevronDown, ChevronRight, ClipboardPaste, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AreaList, fmtSqm, newId, parsePasteText } from '@/components/AreaList';
import {
  BUILDING_TYPOLOGIES, OPERATION_SCHEDULE, getProjectDetails, saveProjectDetails,
  newBuildingId, buildingBuiltUpArea, type ProjectDetailsState, type BuildingItem,
} from '@/data/building-typology';

interface Props {
  projectId: string;
  accentClass: string;
}

const PLACEHOLDER = '__placeholder__';

const EMPTY_STATE: ProjectDetailsState = {
  typologyCategory: '', typologyType: '', operationDaily: '', operationWeekly: '',
  siteAreas: [], numberOfBuildings: '1', buildings: [{ id: 'init', name: '', floors: [] }],
};

export function ProjectDetailsSection({ projectId, accentClass }: Props) {
  const [details, setDetails] = useState<ProjectDetailsState>(EMPTY_STATE);
  const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);
  const [showBuildingPaste, setShowBuildingPaste] = useState(false);
  const buildingPasteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDetails(getProjectDetails(projectId));
  }, [projectId]);

  const update = (patch: Partial<ProjectDetailsState>) => {
    setDetails(saveProjectDetails(projectId, patch));
  };

  const resolve = (v: string) => (v === PLACEHOLDER ? '' : v);

  const selectedCategory = BUILDING_TYPOLOGIES.find(c => c.category === details.typologyCategory);

  const totalBuiltUpArea = details.buildings.reduce((s, b) => s + buildingBuiltUpArea(b), 0);

  // ── Number-of-buildings input ──────────────────────────────────────────────
  const updateBuildingCount = (raw: string) => {
    const patch: Partial<ProjectDetailsState> = { numberOfBuildings: raw };
    const count = parseInt(raw, 10);
    if (!Number.isNaN(count) && count > 0) {
      let buildings = [...details.buildings];
      while (buildings.length < count) buildings.push({ id: newBuildingId(), name: '', floors: [] });
      if (buildings.length > count) buildings = buildings.slice(0, count);
      patch.buildings = buildings;
    }
    update(patch);
  };

  // ── Per-building helpers ───────────────────────────────────────────────────
  const updateBuildingName = (id: string, name: string) =>
    update({ buildings: details.buildings.map(b => (b.id === id ? { ...b, name } : b)) });

  const updateBuildingFloors = (id: string, floors: BuildingItem['floors']) => {
    update({ buildings: details.buildings.map(b => (b.id === id ? { ...b, floors } : b)) });
  };

  const addBuilding = () => {
    const buildings = [...details.buildings, { id: newBuildingId(), name: '', floors: [] }];
    update({ buildings, numberOfBuildings: String(buildings.length) });
  };

  const removeBuilding = (id: string) => {
    const buildings = details.buildings.filter(b => b.id !== id);
    if (buildings.length === 0) return; // keep at least one
    update({ buildings, numberOfBuildings: String(buildings.length) });
    if (expandedBuilding === id) setExpandedBuilding(null);
  };

  // ── Buildings bulk paste ───────────────────────────────────────────────────
  const applyBuildingPaste = (text: string) => {
    const rows = parsePasteText(text);
    if (rows.length === 0) return;
    const parsed: BuildingItem[] = rows.map(r => ({
      id: newBuildingId(),
      name: r.name,
      // pasted area becomes the first floor entry
      floors: r.value ? [{ id: newId(), name: '', value: r.value }] : [],
    }));
    const buildings = [...details.buildings, ...parsed];
    update({ buildings, numberOfBuildings: String(buildings.length) });
    setShowBuildingPaste(false);
  };

  const handleBuildingPasteEvent = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (!text.trim()) return;
    const rows = parsePasteText(text);
    if (rows.length > 0) {
      e.preventDefault();
      applyBuildingPaste(text);
    }
  };

  const openBuildingPaste = () => {
    setShowBuildingPaste(true);
    setTimeout(() => buildingPasteRef.current?.focus(), 0);
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

        {/* ── Typology ── */}
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

        {/* ── Buildings ── */}
        <div className="space-y-3">
          {/* count input */}
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

          {/* heading row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Buildings</span>
            <span className="text-sm text-muted-foreground">
              Total Built-up Area:{' '}
              <span className="font-bold text-foreground">{fmtSqm(totalBuiltUpArea)} sqm</span>
            </span>
          </div>

          {/* building accordion rows */}
          <div className="space-y-1.5">
            {details.buildings.map((b, i) => {
              const builtUp = buildingBuiltUpArea(b);
              const isOpen = expandedBuilding === b.id;
              return (
                <div key={b.id} className="rounded-md border border-border overflow-hidden">
                  {/* accordion header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
                    <button
                      type="button"
                      onClick={() => setExpandedBuilding(isOpen ? null : b.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={isOpen ? 'Collapse' : 'Expand'}
                    >
                      {isOpen
                        ? <ChevronDown className="h-4 w-4" />
                        : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <Input
                      placeholder={`Building ${i + 1} name`}
                      value={b.name}
                      onChange={e => updateBuildingName(b.id, e.target.value)}
                      className="flex-1 min-w-0 h-8 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 p-0"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {fmtSqm(builtUp)} sqm
                    </span>
                    <button
                      type="button"
                      onClick={() => removeBuilding(b.id)}
                      aria-label="Remove building"
                      className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* accordion body — floor list */}
                  {isOpen && (
                    <div className="px-4 py-3 border-t border-border bg-background">
                      <AreaList
                        label="Floor Areas"
                        items={b.floors}
                        namePlaceholder="e.g. Ground floor, First floor…"
                        addLabel="Add floor"
                        onChange={floors => updateBuildingFloors(b.id, floors)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* buildings bulk paste panel */}
          {showBuildingPaste && (
            <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                Paste building names and areas from Excel or Word. Each row: name + value.
                Detected automatically on paste.
              </p>
              <textarea
                ref={buildingPasteRef}
                rows={4}
                onPaste={handleBuildingPasteEvent}
                placeholder={"Paste here — e.g.\nTower A\t2500\nTower B\t1800"}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyBuildingPaste(buildingPasteRef.current?.value ?? '')}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Parse &amp; Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowBuildingPaste(false)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* action buttons */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={addBuilding}
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" />
              Add building
            </button>
            {!showBuildingPaste && (
              <button
                type="button"
                onClick={openBuildingPaste}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                Paste from spreadsheet
              </button>
            )}
          </div>
        </div>

        <Separator />

        {/* ── Total Site Area ── */}
        <AreaList
          label="Total Site Area"
          items={details.siteAreas}
          namePlaceholder="e.g. Landscape area, Hard paved area…"
          onChange={items => update({ siteAreas: items })}
        />

        <Separator />

        {/* ── Operation Schedule ── */}
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
