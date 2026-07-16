"use client";
import React from 'react';
import { Palette } from 'lucide-react';
import { BrandingSection } from '@/components/BrandingSection';

export default function BrandingPage() {
  return (
    <div className="container">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branding</h1>
          <p className="text-sm text-muted-foreground">Customise the cover page shown on every downloaded document</p>
        </div>
      </div>

      <BrandingSection />
    </div>
  );
}
