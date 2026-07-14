"use client";

import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Monitor, FileEdit, Loader2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [loading, setLoading] = useState<Format | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (format: Format) => {
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

  return (
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
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {formats.map(({ id, label, ext, Icon, iconClass }) => {
            const isLoading = loading === id;
            return (
              <Button
                key={id}
                variant="outline"
                onClick={() => handleDownload(id)}
                disabled={loading !== null}
                className="flex items-center gap-2 min-w-[140px]"
              >
                {isLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Icon className={`h-4 w-4 ${iconClass}`} />
                }
                <span>{isLoading ? 'Generating…' : `${label} ${ext}`}</span>
              </Button>
            );
          })}
        </div>
        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
