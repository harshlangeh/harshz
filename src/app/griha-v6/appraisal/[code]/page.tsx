"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calculator, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AttemptStatusRadio } from '@/components/AttemptStatusRadio';
import { RichTextEditor } from '@/components/RichTextEditor';
import {
  getAppraisalMeta, getAppraisalState, saveAppraisalState, type AppraisalStatus,
} from '@/data/griha-v6-appraisals';

export default function AppraisalDetailPage() {
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code as string);
  const meta = getAppraisalMeta(code);

  const [status, setStatus] = useState<AppraisalStatus | null>(null);
  const [narrative, setNarrative] = useState('');

  useEffect(() => {
    const state = getAppraisalState(code);
    setStatus(state.status);
    setNarrative(state.narrativeHtml);
  }, [code]);

  const updateStatus = (s: AppraisalStatus) => {
    setStatus(s);
    saveAppraisalState(code, { status: s });
  };

  const updateNarrative = (html: string) => {
    setNarrative(html);
    saveAppraisalState(code, { narrativeHtml: html });
  };

  if (!meta) {
    return (
      <div className="container">
        <p className="text-sm text-muted-foreground mb-4">Appraisal &ldquo;{code}&rdquo; was not found.</p>
        <Link href="/griha-v6" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to GRIHA V6 Checklist
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link
        href="/griha-v6"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to GRIHA V6 Checklist
      </Link>

      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
          Appraisal {meta.code}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-orange">{meta.title}</h1>
      </div>

      {/* Status */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status</CardTitle>
          <CardDescription>Are you attempting this appraisal?</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Narrative */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Narrative</CardTitle>
          <CardDescription>Describe how this appraisal is being met</CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={narrative}
            onChange={updateNarrative}
            placeholder="Write the narrative for this appraisal…"
          />
        </CardContent>
      </Card>

      {/* Calculation */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Calculation</CardTitle>
          </div>
          <CardDescription>Prefilled from Project Information and rating-specific data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            The calculator for this appraisal hasn&rsquo;t been configured yet.
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Data</CardTitle>
          </div>
          <CardDescription>Supporting documents for this appraisal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Required data for this appraisal hasn&rsquo;t been defined yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
