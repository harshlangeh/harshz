"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ClipboardList, FileText, Calculator, Upload, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AttemptStatusRadio } from '@/components/AttemptStatusRadio';
import { RichTextEditor } from '@/components/RichTextEditor';
import {
  getAppraisalMeta, getAppraisalState, saveAppraisalState, type AppraisalStatus,
} from '@/data/griha-v6-appraisals';
import { buildProjectApprovalsNarrative } from '@/lib/project-narrative';
import { TreePreservationCalculator } from '@/components/calculators/TreePreservationCalculator';
import { InnovationCalculator } from '@/components/calculators/InnovationCalculator';
import { INNOVATION_STRATEGIES, buildInnovationNarrativeHtml } from '@/data/innovation-strategies';
import { complianceBadge, rowClass } from '@/lib/griha-compliance';
import { DataTab } from '@/components/DataTab';

/** Appraisals whose narrative can be auto-generated from Project Information / Project Details. */
const DYNAMIC_NARRATIVE_BUILDERS: Record<string, (projectId: string) => string> = {
  '1.1.1': buildProjectApprovalsNarrative,
};

/** Appraisals with a configured calculator. */
const CALCULATORS: Record<string, React.ComponentType<{ projectId: string; code: string; status: AppraisalStatus | null }>> = {
  '1.1.2': TreePreservationCalculator,
  '30.1.1': InnovationCalculator,
};

/** Default narrative set whenever an appraisal's status is switched to Exempted. */
const EXEMPTED_NARRATIVES: Record<string, string> = {
  '1.1.2': 'There is no existing trees on the site hence project is exempted from the appraisal.',
};

type SectionKey = 'status' | 'narrative' | 'calculation' | 'data';

export default function AppraisalDetailPage() {
  const params = useParams<{ projectId: string; code: string }>();
  const projectId = decodeURIComponent(params.projectId as string);
  const code = decodeURIComponent(params.code as string);
  const meta = getAppraisalMeta(code);

  const [status, setStatus] = useState<AppraisalStatus | null>(null);
  const [narrative, setNarrative] = useState('');
  const [strategies, setStrategies] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>('status');

  const narrativeBuilder = DYNAMIC_NARRATIVE_BUILDERS[code];
  const exemptedNarrative = EXEMPTED_NARRATIVES[code];

  useEffect(() => {
    const state = getAppraisalState(projectId, code);
    setStatus(state.status);
    setStrategies(state.strategies || []);
    if (!state.narrativeHtml) {
      // First visit with no manual edits yet — seed a default narrative.
      let generated: string | undefined;
      if (state.status === 'exempted' && exemptedNarrative) {
        generated = `<p>${exemptedNarrative}</p>`;
      } else if (narrativeBuilder) {
        generated = narrativeBuilder(projectId);
      }
      if (generated) {
        setNarrative(generated);
        saveAppraisalState(projectId, code, { narrativeHtml: generated });
        return;
      }
    }
    setNarrative(state.narrativeHtml);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, code]);

  const updateStatus = (s: AppraisalStatus) => {
    setStatus(s);
    if (s === 'exempted' && exemptedNarrative) {
      const html = `<p>${exemptedNarrative}</p>`;
      setNarrative(html);
      saveAppraisalState(projectId, code, { status: s, narrativeHtml: html });
      return;
    }
    saveAppraisalState(projectId, code, { status: s });
  };

  const updateNarrative = (html: string) => {
    setNarrative(html);
    saveAppraisalState(projectId, code, { narrativeHtml: html });
  };

  const regenerateNarrative = () => {
    if (!narrativeBuilder) return;
    const generated = narrativeBuilder(projectId);
    setNarrative(generated);
    saveAppraisalState(projectId, code, { narrativeHtml: generated });
  };

  const toggleStrategy = (id: string) => {
    const next = strategies.includes(id) ? strategies.filter(s => s !== id) : [...strategies, id];
    const earnedPoints = Math.min(next.length, 5);
    const html = buildInnovationNarrativeHtml(next);
    setStrategies(next);
    setNarrative(html);
    saveAppraisalState(projectId, code, { strategies: next, earnedPoints, narrativeHtml: html });
  };

  const CalculatorComponent = CALCULATORS[code];

  if (!meta) {
    return (
      <div className="container">
        <p className="text-sm text-muted-foreground mb-4">Appraisal &ldquo;{code}&rdquo; was not found.</p>
        <Link href={`/project/${projectId}/griha-v6`} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to GRIHA V6 Checklist
        </Link>
      </div>
    );
  }

  const SECTIONS: {
    key: SectionKey;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
    right?: React.ReactNode;
    content: React.ReactNode;
  }[] = [
    {
      key: 'status',
      icon: ClipboardList,
      title: 'Status',
      subtitle: 'Are you attempting this appraisal?',
      content: (
        <>
          <AttemptStatusRadio
            name="appraisal-status"
            value={status}
            onChange={updateStatus}
            exemptable={meta.exemptable}
          />
          {status === 'later' && (
            <p className="text-xs text-muted-foreground mt-3">
              Supporting details for this appraisal will be shared at final submission. Its full points are
              counted toward your target score until then.
            </p>
          )}
          {status === 'exempted' && (
            <p className="text-xs text-muted-foreground mt-3">
              Marked not applicable to this project — excluded from the criterion&rsquo;s max.
            </p>
          )}
        </>
      ),
    },
    {
      key: 'narrative',
      icon: FileText,
      title: 'Narrative',
      subtitle: 'Describe how this appraisal is being met',
      right: narrativeBuilder && (
        <Button variant="outline" size="sm" onClick={regenerateNarrative} className="gap-1.5 flex-shrink-0">
          <RefreshCw className="h-3.5 w-3.5" />
          Generate from Project Details
        </Button>
      ),
      content: (
        <div className="space-y-4">
          {code === '30.1.1' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Select Innovative Strategies</p>
                <span className="text-xs text-muted-foreground">
                  <span className={`font-bold ${Math.min(strategies.length, 5) === 5 ? 'text-green-600' : 'text-foreground'}`}>
                    {Math.min(strategies.length, 5)}
                  </span>
                  {' / 5 points'}
                  {strategies.length > 5 && (
                    <span className="ml-1 text-amber-500">({strategies.length} selected, max 5 pts)</span>
                  )}
                </span>
              </div>
              <div className="rounded-md border border-border divide-y divide-border">
                {INNOVATION_STRATEGIES.map(s => (
                  <label
                    key={s.id}
                    className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={strategies.includes(s.id)}
                      onChange={() => toggleStrategy(s.id)}
                      className="mt-0.5 h-4 w-4 rounded border-input accent-primary flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug">{s.title}</p>
                      {s.hasCalculator && (
                        <p className="text-xs text-primary mt-0.5">Calculator available in Calculation section</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          <RichTextEditor
            value={narrative}
            onChange={updateNarrative}
            placeholder="Write the narrative for this appraisal…"
          />
        </div>
      ),
    },
    {
      key: 'calculation',
      icon: Calculator,
      title: 'Calculation',
      subtitle: 'Prefilled from Project Information and rating-specific data',
      content: CalculatorComponent ? (
        <CalculatorComponent projectId={projectId} code={code} status={status} />
      ) : (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          The calculator for this appraisal hasn&rsquo;t been configured yet.
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
          rating="griha-v6"
          criterionCode={code}
        />
      ),
    },
  ];

  return (
    <div className="container">
      <Link
        href={`/project/${projectId}/griha-v6`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to GRIHA V6 Checklist
      </Link>

      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Appraisal {meta.code}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-orange">{meta.title}</h1>
        </div>
        {complianceBadge(meta.type || 'Optional')}
      </div>

      {/* Same accordion-row look as the criterion table on the checklist page: tinted by
          compliance type, chevron + title on the left, single section expanded at a time. */}
      <Card className="overflow-hidden">
        {SECTIONS.map((section, i) => {
          const expanded = expandedSection === section.key;
          const Icon = section.icon;
          return (
            <React.Fragment key={section.key}>
              <div
                onClick={() => setExpandedSection(expanded ? null : section.key)}
                className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors ${i < SECTIONS.length - 1 || expanded ? 'border-b border-border' : ''} ${rowClass(meta.type || 'Optional')}`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold flex-1 min-w-0">
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform flex-shrink-0 ${expanded ? '' : '-rotate-90'}`} />
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{section.title}</span>
                  <span className="hidden sm:inline text-xs font-normal text-muted-foreground truncate">— {section.subtitle}</span>
                </span>
                {section.right && (
                  <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
                    {section.right}
                  </div>
                )}
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
