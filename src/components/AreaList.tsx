"use client";
import React from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface AreaItem {
  id: string;
  name: string;
  value: string;
}

export function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function sumAreas(areas: AreaItem[]): number {
  return areas.reduce((s, a) => s + (parseFloat(a.value) || 0), 0);
}

export function fmtSqm(n: number): string {
  if (n === 0) return '0';
  return n % 1 === 0 ? n.toLocaleString('en-IN') : n.toFixed(2);
}

export function AreaList({
  label,
  items,
  namePlaceholder,
  addLabel = 'Add area',
  onChange,
}: {
  label: string;
  items: AreaItem[];
  namePlaceholder: string;
  addLabel?: string;
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
        {addLabel}
      </button>
    </div>
  );
}
