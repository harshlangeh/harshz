"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ClipboardList, FileText, Calculator, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AttemptStatusRadio } from '@/components/AttemptStatusRadio';
import { RichTextEditor } from '@/components/RichTextEditor';
import { DataTab } from '@/components/DataTab';
import { findIgbcCriterion } from '@/data/igbc-sb-2020-sections';
import { getCriterionState, saveCriterionState, type CriterionStatus } from '@/lib/criterion-state';
import type { AppraisalStatus } from '@/data/griha-v6-appraisals';

type SectionKey = 'status' | 'narrative' | 'calculation' | 'data';

function igbcBadge(maxNew: string | number, maxExisting: string | number) {
  const isMandatory = maxNew === 'Mandatory' || maxExisting === 'Mandatory';
  const isNA = maxNew === 'NA' && maxExisting === 'NA';
  if (isMandatory) return <Badge variant="mandatory">Mandatory</Badge>;
  if (isNA) return <Badge variant="optional">N/A</Badge>;
  return <Badge variant="optional">Optional</Badge>;
}

function rowClass(maxNew: string | number) {
  if (maxNew === 'Mandatory') return 'row-mandatory';
  return '';
}

export default function IgbcCriterionPage() {
  const params = useParams<{ projectId: string; id: string }>();
  const projectId = decodeURIComponent(params.projectId as string);
  const criterionId = decodeURIComponent(params.id as string);

  const found = findIgbcCriterion(criterionId);
  const [status, setStatus] = useState<CriterionStatus | null>(null);
  const [narrative, setNarrative] = useState('');
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>('status');

  useEffect(() => {
    if (!found) return;
    const state = getCriterionState(projectId, 'igbc', criterionId);
    setStatus(state.status);
    setNarrative(state.narrativeHtml);
  }, [projectId, criterionId, found]);

  const updateStatus = (s: AppraisalStatus) => {
    setStatus(s as CriterionStatus);
    saveCriterionState(projectId, 'igbc', criterionId, { status: s as CriterionStatus });
  };

  const updateNarrative = (html: string) => {
    setNarrative(html);
    saveCriterionState(projectId, 'igbc', criterionId, { narrativeHtml: html });
  };

  if (!found) {
    return (
      <div className="container">
        <p className="text-sm text-muted-foreground mb-4">Criterion &ldquo;{criterionId}&rdquo; not found.</p>
        <Link href={`/project/${projectId}/igbc-sb-2020`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to IGBC SB 2020 Checklist
        </Link>
      </div>
    );
  }

  const { criterion, section } = found;

  type SectionDef = {
    key: SectionKey;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
    content: React.ReactNode;
  };

  const maxNew = criterion.maxNew;
  const maxExisting = criterion.maxExisting;
  const maxPts = typeof maxNew === 'number' ? maxNew : typeof maxExisting === 'number' ? maxExisting : null;

  const SECTIONS: SectionDef[] = [
    {
      key: 'status',
      icon: ClipboardList,
      title: 'Status',
      subtitle: 'Are you attempting this criterion?',
      content: (
        <>
          <AttemptStatusRadio
            name="criterion-status"
            value={status}
            onChange={updateStatus}
          />
          {status === 'later' && (
            <p className="text-xs text-muted-foreground mt-3">
              Supporting details will be shared at final submission. Full points counted toward target until then.
            </p>
          )}
        </>
      ),
    },
    {
      key: 'narrative',
      icon: FileText,
      title: 'Narrative',
      subtitle: 'Describe how this criterion is being met',
      content: (
        <RichTextEditor
          value={narrative}
          onChange={updateNarrative}
          placeholder="Write the narrative for this criterion…"
        />
      ),
    },
    {
      key: 'calculation',
      icon: Calculator,
      title: 'Calculation',
      subtitle: 'Prefilled from Project Information and rating-specific data',
      content: (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          The calculator for this criterion hasn&rsquo;t been configured yet.
        </div>
      ),
    },
    {
      key: 'data',
      icon: Upload,
      title: 'Data',
      subtitle: 'Supporting documents, photographs and products',
      content: (
        <DataTab
          projectId={projectId}
          rating="igbc-sb-2020"
          criterionCode={criterionId}
        />
      ),
    },
  ];

  return (
    <div className="container">
      <Link
        href={`/project/${projectId}/igbc-sb-2020`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to IGBC SB 2020 Checklist
      </Link>

      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            {section.title} · {criterion.id}
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'hsl(var(--igbc))' }}>
            {criterion.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {maxPts !== null && maxPts > 0 && (
            <span className="text-sm text-muted-foreground">
              New: {typeof maxNew === 'number' ? maxNew : maxNew} · Existing: {typeof maxExisting === 'number' ? maxExisting : maxExisting} pts
            </span>
          )}
          {igbcBadge(maxNew, maxExisting)}
        </div>
      </div>

      <Card className="overflow-hidden">
        {SECTIONS.map((section, i) => {
          const expanded = expandedSection === section.key;
          const Icon = section.icon;
          return (
            <React.Fragment key={section.key}>
              <div
                onClick={() => setExpandedSection(expanded ? null : section.key)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors ${i < SECTIONS.length - 1 || expanded ? 'border-b border-border' : ''} ${rowClass(maxNew)}`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold flex-1 min-w-0">
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform flex-shrink-0 ${expanded ? '' : '-rotate-90'}`} />
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{section.title}</span>
                  <span className="hidden sm:inline text-xs font-normal text-muted-foreground truncate">— {section.subtitle}</span>
                </span>
              </div>
              {expanded && (
                <div className={`px-4 py-4 bg-muted/10 ${i < SECTIONS.length - 1 ? 'border-b border-border' : ''}`}>
                  {section.content}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </Card>
    </div>
  );
}
