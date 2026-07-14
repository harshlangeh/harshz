"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Palette, Upload, X, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { CoverPageVisual } from '@/components/CoverPageVisual';
import { getBranding, saveBranding, DEFAULT_BRANDING, type BrandingInfo, type CoverTemplate } from '@/types/branding';

const TEMPLATES: { id: CoverTemplate; label: string; desc: string }[] = [
  { id: 'classic', label: 'Classic',  desc: 'Header band, centered title' },
  { id: 'modern',  label: 'Modern',   desc: 'Side panel, bold typography' },
  { id: 'minimal', label: 'Minimal',  desc: 'Clean white, sparse layout' },
  { id: 'bold',    label: 'Bold',     desc: 'Full-color, high impact' },
];

const PREVIEW_META = {
  ratingName: 'GRIHA V6',
  projectName: 'Sample Project',
  brandColor: '#32b460',
  totalPoints: 72,
  maxPoints: 100,
  starsCount: 4,
  format: 'pdf' as const,
};

export function BrandingSection() {
  const [branding, setBranding] = useState<BrandingInfo>(DEFAULT_BRANDING);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBranding(getBranding());
  }, []);

  function update(patch: Partial<BrandingInfo>) {
    const next = { ...branding, ...patch };
    setBranding(next);
    saveBranding(next);
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => update({ logoDataUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Branding</CardTitle>
          </div>
          <CardDescription>
            Customise the cover page shown on every downloaded document
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Logo + name/tagline row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* Logo uploader */}
            <div className="flex-shrink-0">
              <p className="text-sm font-medium mb-2">Logo</p>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative group cursor-pointer w-[88px] h-[88px] rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors bg-muted/30 flex items-center justify-center overflow-hidden"
              >
                {branding.logoDataUrl ? (
                  <>
                    <img src={branding.logoDataUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px] text-center leading-tight">Upload<br />logo</span>
                  </div>
                )}
              </div>
              {branding.logoDataUrl && (
                <button
                  onClick={() => update({ logoDataUrl: '' })}
                  className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            </div>

            {/* Company name + tagline */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Company / Organisation Name</label>
                <Input
                  value={branding.companyName}
                  onChange={e => update({ companyName: e.target.value })}
                  placeholder="Your company name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tagline</label>
                <Input
                  value={branding.tagline}
                  onChange={e => update({ tagline: e.target.value })}
                  placeholder="e.g. Green Building Consultants"
                />
              </div>
            </div>
          </div>

          {/* Template picker */}
          <div>
            <p className="text-sm font-medium mb-3">Cover Page Template</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TEMPLATES.map(t => {
                const active = branding.template === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => update({ template: t.id })}
                    className={`group rounded-xl border-2 overflow-hidden transition-all text-left ${
                      active
                        ? 'border-primary shadow-md shadow-primary/20 ring-2 ring-primary/30'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="pointer-events-none">
                      <CoverPageVisual
                        branding={{ ...branding, template: t.id }}
                        meta={PREVIEW_META}
                        scale={0.245}
                        width={360}
                      />
                    </div>
                    {/* Label */}
                    <div className={`px-2.5 py-2 border-t ${active ? 'border-primary/20 bg-primary/5' : 'border-border bg-background'}`}>
                      <p className={`text-xs font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>{t.label}</p>
                      <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview button */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Preview Cover Page
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full preview dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} title="Cover Page Preview" size="lg">
        <div className="p-6 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground self-start">
            This is how your cover page will look on downloaded documents.
          </p>
          <div className="w-full overflow-auto flex justify-center">
            <div className="shadow-xl rounded-xl overflow-hidden border border-border" style={{ width: 380 }}>
              <CoverPageVisual
                branding={branding}
                meta={PREVIEW_META}
                width={380}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Actual score and project name will be filled from your data at download time.</p>
        </div>
      </Dialog>
    </>
  );
}
