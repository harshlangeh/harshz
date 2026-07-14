"use client";
import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Monitor, FileEdit, Loader2, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { CoverPageVisual } from '@/components/CoverPageVisual';
import { getBranding } from '@/types/branding';
import type { DownloadData } from '@/types/download';

type Format = 'excel' | 'pdf' | 'ppt' | 'word';

const formats: {
  id: Format;
  label: string;
  ext: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  formatKey: 'pdf' | 'excel' | 'ppt' | 'word';
}[] = [
  { id: 'excel', label: 'Excel',      ext: '.xlsx', Icon: FileSpreadsheet, iconClass: 'text-emerald-600', formatKey: 'excel' },
  { id: 'pdf',   label: 'PDF',        ext: '.pdf',  Icon: FileText,        iconClass: 'text-red-500',     formatKey: 'pdf'   },
  { id: 'ppt',   label: 'PowerPoint', ext: '.pptx', Icon: Monitor,         iconClass: 'text-orange-500',  formatKey: 'ppt'   },
  { id: 'word',  label: 'Word',       ext: '.docx', Icon: FileEdit,        iconClass: 'text-blue-600',    formatKey: 'word'  },
];

interface Props {
  data: DownloadData;
}

export function DownloadSection({ data }: Props) {
  const [loading, setLoading]       = useState<Format | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [preview, setPreview]       = useState(false);
  const [previewFmt, setPreviewFmt] = useState<typeof formats[0] | null>(null);

  const triggerDownload = async (format: Format) => {
    setLoading(format);
    setError(null);
    try {
      if (format === 'excel') {
        const { downloadExcel } = await import('@/lib/downloads/excel');
        await downloadExcel(data);
      } else if (format === 'pdf') {
        const { downloadPDF } = await import('@/lib/downloads/pdf');
        await downloadPDF(data);
      } else if (format === 'ppt') {
        const { downloadPPT } = await import('@/lib/downloads/ppt');
        await downloadPPT(data);
      } else {
        const { downloadWord } = await import('@/lib/downloads/word');
        await downloadWord(data);
      }
    } catch (err) {
      console.error('Download error:', err);
      setError('Download failed — please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleClick = (fmt: typeof formats[0]) => {
    if (preview) {
      setPreviewFmt(fmt);
    } else {
      triggerDownload(fmt.id);
    }
  };

  const branding = getBranding();
  const coverMeta = {
    ratingName:   data.ratingName,
    projectName:  data.projectInfo.name || '',
    brandColor:   data.brandColor,
    totalPoints:  data.totalPoints,
    maxPoints:    data.maxPoints,
    starsCount:   data.starsCount,
    level:        data.level,
    format:       (previewFmt?.formatKey ?? 'pdf') as 'pdf' | 'excel' | 'ppt' | 'word',
  };

  return (
    <>
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Download Checklist</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Export the full checklist with your current scores and rating
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Format buttons */}
          <div className="flex flex-wrap gap-3">
            {formats.map((fmt) => {
              const isLoading = loading === fmt.id;
              return (
                <Button
                  key={fmt.id}
                  variant="outline"
                  onClick={() => handleClick(fmt)}
                  disabled={loading !== null}
                  className="flex items-center gap-2 min-w-[148px]"
                >
                  {isLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <fmt.Icon className={`h-4 w-4 ${fmt.iconClass}`} />
                  }
                  <span>{isLoading ? 'Generating…' : `${fmt.label} ${fmt.ext}`}</span>
                </Button>
              );
            })}
          </div>

          {/* Preview toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={preview}
                onChange={e => setPreview(e.target.checked)}
              />
              <div className="w-9 h-5 rounded-full bg-muted peer-checked:bg-primary transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              <Eye className="h-3.5 w-3.5" />
              Preview before downloading
            </span>
          </label>

          {preview && (
            <p className="text-xs text-muted-foreground -mt-1 pl-12">
              Click a format button above to preview its cover page first.
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* Preview modal */}
      {previewFmt && (
        <Dialog
          open={!!previewFmt}
          onClose={() => setPreviewFmt(null)}
          title={`Preview — ${previewFmt.label} cover page`}
          size="xl"
        >
          <div className="p-6 flex flex-col lg:flex-row gap-6 items-start">
            {/* Cover preview */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <div className="shadow-xl rounded-xl overflow-hidden border border-border" style={{ width: 320 }}>
                <CoverPageVisual
                  branding={branding}
                  meta={{ ...coverMeta, format: previewFmt.formatKey }}
                  width={320}
                />
              </div>
            </div>

            {/* Document info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-4">Document Contents</h3>

              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">{previewFmt.label} ({previewFmt.ext})</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Rating System</span>
                  <span className="font-medium">{data.ratingName}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-medium" style={{ color: data.brandColor }}>
                    {data.totalPoints} / {data.maxPoints} pts
                  </span>
                </div>
                {data.starsCount !== undefined && (
                  <div className="flex justify-between border-b border-border pb-1.5">
                    <span className="text-muted-foreground">Star Rating</span>
                    <span className="font-medium">{'★'.repeat(data.starsCount)}{'☆'.repeat(5 - data.starsCount)} ({data.starsCount}/5)</span>
                  </div>
                )}
                {data.level !== undefined && (
                  <div className="flex justify-between border-b border-border pb-1.5">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">{data.level || 'None'}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Sections</span>
                  <span className="font-medium">{data.sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criteria</span>
                  <span className="font-medium">{data.sections.reduce((s, sec) => s + sec.criteria.length, 0)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => { triggerDownload(previewFmt.id); setPreviewFmt(null); }}
                  disabled={loading !== null}
                  className="flex-1"
                >
                  {loading === previewFmt.id
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating…</>
                    : <><Download className="h-4 w-4 mr-2" /> Download {previewFmt.label}</>
                  }
                </Button>
                <Button variant="outline" onClick={() => setPreviewFmt(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
