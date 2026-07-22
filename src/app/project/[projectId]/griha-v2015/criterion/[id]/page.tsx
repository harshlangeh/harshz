"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ClipboardList, FileText, Calculator, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AttemptStatusRadio } from '@/components/AttemptStatusRadio';
import { RichTextEditor } from '@/components/RichTextEditor';
import { DataTab } from '@/components/DataTab';
import { findV2015Criterion } from '@/data/griha-v2015-sections';
import { getCriterionState, saveCriterionState, type CriterionStatus } from '@/lib/criterion-state';
import type { AppraisalStatus } from '@/data/griha-v6-appraisals';

type SectionKey = 'status' | 'narrative' | 'calculation' | 'data';

function rowClass(max: number) {
  return max === 0 ? 'row-mandatory' : '';
}

export default function V2015CriterionPage() {
  const params = useParams<{ projectId: string; id: string }>();
  const projectId = decodeURIComponent(params.projectId as string);
  const criterionId = parseInt(decodeURIComponent(params.id as string), 10);

  const found = findV2015Criterion(criterionId);
  const [status, setStatus] = useState<CriterionStatus | null>(null);
  const [narrative, setNarrative] = useState('');
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>('status');

  useEffect(() => {
    if (!found) return;
    const state = getCriterionState(projectId, 'v2015', criterionId);
    setStatus(state.status);
    setNarrative(state.narrativeHtml);
  }, [projectId, criterionId, found]);

  const updateStatus = (s: AppraisalStatus) => {
    setStatus(s as CriterionStatus);
    saveCriterionState(projectId, 'v2015', criterionId, { status: s as CriterionStatus });
  };

  const updateNarrative = (html: string) => {
    setNarrative(html);
    saveCriterionState(projectId, 'v2015', criterionId, { narrativeHtml: html });
  };

  if (!found) {
    return (
      <div className="container">
        <p className="text-sm text-muted-foreground mb-4">Criterion &ldquo;{criterionId}&rdquo; not found.</p>
        <Link href={`/project/${projectId}/griha-v2015`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to GRIHA V2015 Checklist
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
          rating="griha-v2015"
          criterionCode={String(criterionId)}
        />
      ),
    },
  ];

  return (
    <div className="container">
      <Link
        href={`/project/${projectId}/griha-v2015`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to GRIHA V2015 Checklist
      </Link>

      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            {section.title} · Criterion {criterion.id}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-rose-red">{criterion.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {criterion.max > 0 && (
            <span className="text-sm font-semibold text-muted-foreground">{criterion.max} pts</span>
          )}
          {criterion.max === 0 && <span className="text-xs font-semibold text-rose-red uppercase">Mandatory</span>}
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
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors ${i < SECTIONS.length - 1 || expanded ? 'border-b border-border' : ''} ${rowClass(criterion.max)}`}
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
