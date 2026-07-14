import type { DownloadData } from '@/types/download';

function starsText(count: number): string {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

function hexNoHash(hex: string) {
  return hex.replace('#', '').toUpperCase();
}

export async function downloadWord(data: DownloadData): Promise<void> {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, HeadingLevel, ShadingType, BorderStyle,
    VerticalAlign,
  } = await import('docx');

  const brandHex = hexNoHash(data.brandColor);

  function headerCell(text: string): InstanceType<typeof TableCell> {
    return new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18 })],
      })],
      shading: { fill: brandHex, type: ShadingType.CLEAR, color: 'auto' },
      verticalAlign: VerticalAlign.CENTER,
    });
  }

  function dataCell(text: string, bold = false, colorHex?: string): InstanceType<typeof TableCell> {
    return new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text, bold, size: 18, color: colorHex })],
      })],
      verticalAlign: VerticalAlign.CENTER,
    });
  }

  function shadeCell(text: string, bold = false): InstanceType<typeof TableCell> {
    return new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text, bold, size: 18 })],
      })],
      shading: { fill: 'F3F4F6', type: ShadingType.CLEAR, color: 'auto' },
      verticalAlign: VerticalAlign.CENTER,
    });
  }

  function sectionHeaderRow(title: string): InstanceType<typeof TableRow> {
    return new TableRow({
      children: [
        new TableCell({
          columnSpan: 5,
          children: [new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 19, color: brandHex })],
          })],
          shading: { fill: 'EFF6FF', type: ShadingType.CLEAR, color: 'auto' },
        }),
      ],
    });
  }

  const pi = data.projectInfo;
  const ratingRow = data.starsCount !== undefined
    ? ['Star Rating', `${starsText(data.starsCount)}  (${data.starsCount}/5 stars)`]
    : ['Certification Level', data.level || 'None'];

  const children: any[] = [
    // ── Title ───────────────────────────────────────────────────────────────
    new Paragraph({
      children: [
        new TextRun({ text: 'Harshz Green Building Automation', bold: true, size: 36, color: brandHex }),
      ],
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [new TextRun({ text: data.ratingName + ' Checklist', size: 26 })],
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),

    // ── Project Info heading ─────────────────────────────────────────────────
    new Paragraph({
      children: [new TextRun({ text: 'Project Information', bold: true, size: 24 })],
    }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),

    // ── Project info table ───────────────────────────────────────────────────
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      rows: [
        new TableRow({ children: [headerCell('Field'), headerCell('Value')] }),
        new TableRow({ children: [dataCell('Project Name', true), dataCell(pi.name || '—')] }),
        new TableRow({ children: [dataCell('Site Area (sq.m)', true), dataCell(pi.siteArea || '—')] }),
        new TableRow({ children: [dataCell('Built-up Area (sq.m)', true), dataCell(pi.builtUpArea || '—')] }),
        new TableRow({ children: [dataCell('Occupancy — Fixed', true), dataCell(pi.occupancyFixed || '—')] }),
        new TableRow({ children: [dataCell('Occupancy — Floating', true), dataCell(pi.occupancyFloating || '—')] }),
        new TableRow({ children: [dataCell('Climate Zone', true), dataCell(pi.climateZone || '—')] }),
      ],
    }),

    new Paragraph({ children: [new TextRun({ text: '' })] }),

    // ── Rating summary heading ───────────────────────────────────────────────
    new Paragraph({
      children: [new TextRun({ text: 'Rating Summary', bold: true, size: 24 })],
    }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),

    // ── Rating summary table ─────────────────────────────────────────────────
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      rows: [
        new TableRow({ children: [headerCell('Metric'), headerCell('Value')] }),
        new TableRow({
          children: [
            dataCell('Total Points Scored', true),
            dataCell(`${data.totalPoints} / ${data.maxPoints}`, true, brandHex),
          ],
        }),
        new TableRow({
          children: [
            dataCell(ratingRow[0], true),
            dataCell(ratingRow[1], true, brandHex),
          ],
        }),
        new TableRow({
          children: [
            dataCell('Generated On', true),
            dataCell(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'),
          ],
        }),
      ],
    }),

    new Paragraph({ children: [new TextRun({ text: '' })] }),

    // ── Checklist heading ────────────────────────────────────────────────────
    new Paragraph({
      children: [new TextRun({ text: 'Full Checklist', bold: true, size: 24 })],
    }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),
  ];

  // ── Checklist table ────────────────────────────────────────────────────────
  const checklistRows: InstanceType<typeof TableRow>[] = [
    new TableRow({
      children: [
        headerCell('No.'),
        headerCell('Criterion'),
        headerCell('Max Pts'),
        headerCell('Score'),
        headerCell('Compliance'),
      ],
    }),
  ];

  for (const section of data.sections) {
    checklistRows.push(sectionHeaderRow(section.title));
    for (const c of section.criteria) {
      checklistRows.push(new TableRow({
        children: [
          dataCell(String(c.no)),
          dataCell(c.name),
          dataCell(String(c.maxPoints)),
          dataCell(String(c.score)),
          dataCell(c.compliance || ''),
        ],
      }));
    }
    checklistRows.push(new TableRow({
      children: [
        shadeCell(''),
        shadeCell('Section Total', true),
        shadeCell(String(section.maxPoints), true),
        shadeCell(String(section.sectionScore), true),
        shadeCell(''),
      ],
    }));
  }

  checklistRows.push(new TableRow({
    children: [
      headerCell(''),
      headerCell('GRAND TOTAL'),
      headerCell(String(data.maxPoints)),
      headerCell(String(data.totalPoints)),
      headerCell(''),
    ],
  }));

  children.push(
    new Table({
      width: { size: 9000, type: WidthType.DXA },
      rows: checklistRows,
    }),
  );

  children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
  children.push(new Paragraph({
    children: [new TextRun({
      text: `© ${new Date().getFullYear()} Harshz Technologies Private Limited. All rights reserved.`,
      size: 14,
      color: '6B7280',
    })],
    alignment: AlignmentType.CENTER,
  }));

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.ratingName.replace(/\s+/g, '_')}_Checklist.docx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
