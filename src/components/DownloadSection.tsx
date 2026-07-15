"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FileSpreadsheet, FileText, Monitor, FileEdit, Loader2, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { PptSlidesPreview } from '@/components/PptSlidesPreview';
import { getBranding } from '@/types/branding';
import type { DownloadData } from '@/types/download';

type Format = 'excel' | 'pdf' | 'ppt' | 'word';

const formats: {
  id: Format;
  label: string;
  ext: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}[] = [
  { id: 'excel', label: 'Excel',      ext: '.xlsx', Icon: FileSpreadsheet, iconClass: 'text-emerald-600' },
  { id: 'pdf',   label: 'PDF',        ext: '.pdf',  Icon: FileText,        iconClass: 'text-red-500'     },
  { id: 'ppt',   label: 'PowerPoint', ext: '.pptx', Icon: Monitor,         iconClass: 'text-orange-500'  },
  { id: 'word',  label: 'Word',       ext: '.docx', Icon: FileEdit,        iconClass: 'text-blue-600'    },
];

interface Props {
  data: DownloadData;
}

export function DownloadSection({ data }: Props) {
  const [loading, setLoading]       = useState<Format | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [preview, setPreview]       = useState(false);
  const [previewFmt, setPreviewFmt] = useState<typeof formats[0] | null>(null);

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError]     = useState<string | null>(null);

  const [pdfUrl, setPdfUrl]           = useState<string | null>(null);
  const [excelSheets, setExcelSheets] = useState<{ sheetName: string; html: string }[] | null>(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [docxBlob, setDocxBlob]       = useState<Blob | null>(null);

  const docxContainerRef = useRef<HTMLDivElement | null>(null);

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

  const closePreview = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setExcelSheets(null);
    setActiveSheet(0);
    setDocxBlob(null);
    setPreviewError(null);
    setPreviewFmt(null);
  };

  const openPreview = async (fmt: typeof formats[0]) => {
    setPreviewFmt(fmt);
    setPreviewError(null);
    // PPT preview is a synchronous content mockup — no generation step needed
    setPreviewLoading(fmt.id !== 'ppt');
    try {
      if (fmt.id === 'pdf') {
        const { generatePdfBlob } = await import('@/lib/downloads/pdf');
        const blob = await generatePdfBlob(data);
        setPdfUrl(URL.createObjectURL(blob));
      } else if (fmt.id === 'excel') {
        const { generateExcelPreview } = await import('@/lib/downloads/excel');
        setExcelSheets(await generateExcelPreview(data));
        setActiveSheet(0);
      } else if (fmt.id === 'word') {
        const { generateDocxBlob } = await import('@/lib/downloads/word');
        setDocxBlob(await generateDocxBlob(data));
      }
    } catch (err) {
      console.error('Preview generation error:', err);
      setPreviewError('Failed to generate preview — please try downloading directly.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClick = (fmt: typeof formats[0]) => {
    if (preview) {
      openPreview(fmt);
    } else {
      triggerDownload(fmt.id);
    }
  };

  // Render the actual generated .docx into the preview container once both are ready
  useEffect(() => {
    if (previewFmt?.id !== 'word' || !docxBlob || !docxContainerRef.current) return;
    const container = docxContainerRef.current;
    let cancelled = false;
    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        if (cancelled || !container) return;
        container.innerHTML = '';
        await renderAsync(docxBlob, container);
      } catch (err) {
        console.error('Word preview render error:', err);
        if (!cancelled) setPreviewError('Failed to render Word preview.');
      }
    })();
    return () => { cancelled = true; };
  }, [docxBlob, previewFmt]);

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
              Click a format button above to see the exact document — cover page through the last page — before it downloads.
              (PowerPoint shows an exact content preview; no browser can render the real .pptx file.)
            </p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {/* Preview modal — shows the real generated document */}
      {previewFmt && (
        <Dialog
          open={!!previewFmt}
          onClose={closePreview}
          title={`Preview — ${previewFmt.label}${previewFmt.ext} (exactly as downloaded)`}
          size="full"
        >
          <div className="flex flex-col" style={{ height: '76vh' }}>
            {/* Scrollable document preview */}
            <div className="flex-1 min-h-0 overflow-auto bg-muted/30 rounded-t-none">
              {previewLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">Generating the real {previewFmt.label} document…</span>
                </div>
              )}

              {!previewLoading && previewError && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-destructive">{previewError}</p>
                </div>
              )}

              {!previewLoading && !previewError && previewFmt.id === 'pdf' && pdfUrl && (
                <iframe
                  src={pdfUrl}
                  title="PDF preview"
                  className="w-full h-full border-0"
                />
              )}

              {!previewLoading && !previewError && previewFmt.id === 'excel' && excelSheets && (
                <div className="p-4">
                  <div className="flex gap-1 mb-3 border-b border-border">
                    {excelSheets.map((s, i) => (
                      <button
                        key={s.sheetName}
                        onClick={() => setActiveSheet(i)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors ${
                          i === activeSheet
                            ? 'bg-background text-foreground border border-b-0 border-border'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {s.sheetName}
                      </button>
                    ))}
                  </div>
                  <div
                    className="bg-background rounded-md border border-border p-3 overflow-auto [&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs [&_td]:whitespace-nowrap [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-xs [&_th]:bg-muted"
                    dangerouslySetInnerHTML={{ __html: excelSheets[activeSheet]?.html || '' }}
                  />
                </div>
              )}

              {/* Word container stays mounted so its ref is ready before generation finishes */}
              <div
                ref={docxContainerRef}
                className={`p-4 [&_.docx-wrapper]:!bg-transparent [&_.docx-wrapper]:flex [&_.docx-wrapper]:flex-col [&_.docx-wrapper]:items-center [&_.docx-wrapper]:gap-4 ${
                  previewFmt.id === 'word' && !previewLoading && !previewError ? '' : 'hidden'
                }`}
              />

              {!previewLoading && !previewError && previewFmt.id === 'ppt' && (
                <div className="p-4">
                  <p className="text-xs text-muted-foreground text-center mb-4">
                    No browser can render a real .pptx file, so this shows every slide's exact content and order.
                    The visual template (colors, layout) appears once opened in PowerPoint.
                  </p>
                  <PptSlidesPreview data={data} branding={getBranding()} />
                </div>
              )}
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border">
              <div className="text-sm text-muted-foreground hidden sm:block">
                {data.ratingName} · {data.totalPoints} / {data.maxPoints} pts
              </div>
              <div className="flex gap-3 ml-auto">
                <Button variant="outline" onClick={closePreview}>
                  Cancel
                </Button>
                <Button
                  onClick={() => { triggerDownload(previewFmt.id); closePreview(); }}
                  disabled={loading !== null}
                >
                  {loading === previewFmt.id
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating…</>
                    : <><Download className="h-4 w-4 mr-2" /> Download {previewFmt.label}</>
                  }
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
