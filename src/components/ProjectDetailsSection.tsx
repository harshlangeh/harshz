"use client";
import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  BUILDING_TYPOLOGIES, OPERATION_SCHEDULE, getProjectDetails, saveProjectDetails,
  type ProjectDetailsState,
} from '@/data/building-typology';

interface Props {
  /** Brand accent class for the card's top border, e.g. "border-t-orange". */
  accentClass: string;
}

/**
 * Sentinel for the leading "Select…" placeholder option. It must be enabled (not `disabled`) so
 * Radix's open-on-no-value auto-focus lands on it instead of the first real option — otherwise the
 * first real option gets a focus highlight that reads as a pre-selected default.
 */
const PLACEHOLDER = '__placeholder__';

export function ProjectDetailsSection({ accentClass }: Props) {
  const [details, setDetails] = useState<ProjectDetailsState>({
    typologyCategory: '', typologyType: '', operationDaily: '', operationWeekly: '',
  });

  useEffect(() => {
    setDetails(getProjectDetails());
  }, []);

  const update = (patch: Partial<ProjectDetailsState>) => {
    setDetails(saveProjectDetails(patch));
  };

  const resolve = (v: string) => (v === PLACEHOLDER ? '' : v);

  const selectedCategory = BUILDING_TYPOLOGIES.find(c => c.category === details.typologyCategory);

  return (
    <Card className={`mb-6 border-t-4 ${accentClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Project Details</CardTitle>
        </div>
        <CardDescription>Building typology and operation schedule for this project</CardDescription>
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
