"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CalculatorCard } from '@/components/calculators/CalculatorCard';
import { CALCULATOR_REGISTRY } from '@/data/calculator-registry';

export default function CalculatorsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = decodeURIComponent(params.projectId as string);

  const grouped = CALCULATOR_REGISTRY.reduce<Record<string, typeof CALCULATOR_REGISTRY>>((acc, calc) => {
    (acc[calc.ratingSystem] ??= []).push(calc);
    return acc;
  }, {});

  return (
    <div className="container">
      <Link
        href={`/project/${projectId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Project Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-orange">Calculators</h1>
        <p className="text-sm text-muted-foreground mt-1">All compliance calculators across rating systems</p>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([system, calcs]) => (
          <section key={system}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-base font-semibold">{system}</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {calcs.length} calculator{calcs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {calcs.map(calc => (
                <div key={calc.id} className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground px-0.5">
                    Appraisal {calc.appraisalCode} · {calc.criterionName}
                  </p>
                  <CalculatorCard
                    title={calc.title}
                    description={calc.description}
                    projectId={projectId}
                    code={calc.appraisalCode}
                    appraisalStatus={null}
                    getSummary={calc.getSummary}
                    Calculator={calc.component}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {CALCULATOR_REGISTRY.length === 0 && (
          <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No calculators have been configured yet.
          </div>
        )}
      </div>
    </div>
  );
}
