"use client";
import React, { useRef, useState } from 'react';
import { ClipboardPaste, Plus, X } from 'lucide-react';
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

/**
 * Parses pasted text from Excel / Word into AreaItem rows.
 *
 * Supported layouts (all strip trailing unit words like sqm / m2 / sq.m):
 *   Tab-separated (Excel copy):  "Landscape area\t500"
 *   Colon-separated:             "Landscape area: 500"
 *   Equals-separated:            "Landscape area = 500"
 *   Space-terminated number:     "Landscape area 500"
 */
function parsePasteText(text: string): AreaItem[] {
  const unitSuffix = /\s*(sqm|sq\.m\.?|m2|sq\.ft\.?|ft2)\s*$/i;

  return text
    .split('\n')
    .map(l => l.replace('\r', '').trim())
    .filter(Boolean)
    .flatMap(line => {
      // strip trailing unit suffix from the whole line first
      const stripped = line.replace(unitSuffix, '');

      // 1. tab-separated  →  everything after last tab is the number
      const tab = stripped.match(/^(.+)\t([\d,. ]+)$/);
      if (tab) return [{ id: newId(), name: tab[1].trim(), value: normalise(tab[2]) }];

      // 2. colon-separated
      const colon = stripped.match(/^(.+?):\s*([\d,. ]+)$/);
      if (colon) return [{ id: newId(), name: colon[1].trim(), value: normalise(colon[2]) }];

      // 3. equals-separated
      const eq = stripped.match(/^(.+?)\s*=\s*([\d,. ]+)$/);
      if (eq) return [{ id: newId(), name: eq[1].trim(), value: normalise(eq[2]) }];

      // 4. trailing number — last whitespace-delimited token is numeric
      const trailing = stripped.match(/^(.*\S)\s+([\d,.]+)$/);
      if (trailing && /^[\d,. ]+$/.test(trailing[2])) {
        return [{ id: newId(), name: trailing[1].trim(), value: normalise(trailing[2]) }];
      }

      return [];
    });
}

/** Remove thousand-separators and collapse spaces so "1 500" → "1500" */
function normalise(raw: string) {
  return raw.replace(/,/g, '').replace(/\s/g, '').trim();
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
  const [showPaste, setShowPaste] = useState(false);
  const pasteRef = useRef<HTMLTextAreaElement>(null);

  const update = (id: string, field: 'name' | 'value', val: string) =>
    onChange(items.map(a => (a.id === id ? { ...a, [field]: val } : a)));

  const remove = (id: string) => onChange(items.filter(a => a.id !== id));

  const add = () => onChange([...items, { id: newId(), name: '', value: '' }]);

  /** Called on paste into the textarea — immediately parses multi-line content. */
  const handlePasteEvent = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (!text.trim()) return;

    const parsed = parsePasteText(text);
    if (parsed.length > 0) {
      e.preventDefault(); // don't let the raw text land in the textarea
      onChange([...items, ...parsed]);
      setShowPaste(false);
    }
    // if nothing parsed, fall through so user sees what they pasted
  };

  /** Triggered by the "Add" button inside the paste panel — parses whatever was typed/pasted. */
  const applyPastePanel = () => {
    const text = pasteRef.current?.value ?? '';
    const parsed = parsePasteText(text);
    if (parsed.length > 0) {
      onChange([...items, ...parsed]);
      setShowPaste(false);
    }
  };

  const openPaste = () => {
    setShowPaste(true);
    // focus the textarea on next frame
    setTimeout(() => pasteRef.current?.focus(), 0);
  };

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
              <Input
                placeholder={namePlaceholder}
                value={item.name}
                onChange={e => update(item.id, 'name', e.target.value)}
                className="flex-1 min-w-0 h-8 text-sm"
              />
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

      {items.length === 0 && !showPaste && (
        <p className="text-sm text-muted-foreground italic">No areas added yet.</p>
      )}

      {/* bulk-paste panel */}
      {showPaste && (
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Paste from Excel or Word — each row should have an area name and a value.
            Detected automatically on paste.
          </p>
          <p className="text-xs text-muted-foreground font-mono leading-relaxed opacity-70">
            Landscape area{'  '}500{'\n'}Hard paved area{'  '}300
          </p>
          <textarea
            ref={pasteRef}
            rows={5}
            onPaste={handlePasteEvent}
            placeholder={"Paste here — e.g.\nLandscape area\t500\nHard paved area\t300"}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyPastePanel}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Parse &amp; Add
            </button>
            <button
              type="button"
              onClick={() => setShowPaste(false)}
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
          onClick={add}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-75 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>

        {!showPaste && (
          <button
            type="button"
            onClick={openPaste}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            Paste from spreadsheet
          </button>
        )}
      </div>
    </div>
  );
}
