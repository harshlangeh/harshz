import type { DownloadData } from '@/types/download';
import { getBranding } from '@/types/branding';

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
    VerticalAlign, PageBreak,
  } = await import('docx');

  const branding = getBranding();
  const brandHex = hexNoHash(data.brandColor);
  const template = branding.template;

  function headerCell(text: string): InstanceType<typeof TableCell> {
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18 })] })],
      shading: { fill: brandHex, type: ShadingType.CLEAR, color: 'auto' },
      verticalAlign: VerticalAlign.CENTER,
    });
  }

  function dataCell(text: string, bold = false, colorHex?: string): InstanceType<typeof TableCell> {
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold, size: 18, color: colorHex })] })],
      verticalAlign: VerticalAlign.CENTER,
    });
  }

  function shadeCell(text: string, bold = false): InstanceType<typeof TableCell> {
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold, size: 18 })] })],
      shading: { fill: 'F3F4F6', type: ShadingType.CLEAR, color: 'auto' },
      verticalAlign: VerticalAlign.CENTER,
    });
  }

  function sectionHeaderRow(title: string): InstanceType<typeof TableRow> {
    return new TableRow({
      children: [new TableCell({
        columnSpan: 5,
        children: [new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 19, color: brandHex })] })],
        shading: { fill: 'EFF6FF', type: ShadingType.CLEAR, color: 'auto' },
      })],
    });
  }

  const pi = data.projectInfo;
  const ratingRow = data.starsCount !== undefined
    ? ['Star Rating', `${starsText(data.starsCount)}  (${data.starsCount}/5 stars)`]
    : ['Certification Level', data.level || 'None'];

  // ── Cover page paragraphs ──────────────────────────────────────────────────
  const coverChildren: any[] = [];

  if (template === 'classic') {
    coverChildren.push(
      new Paragraph({ children: [new TextRun({ text: branding.companyName, bold: true, size: 40, color: brandHex })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: branding.tagline, size: 22, color: '6B7280' })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: data.ratingName, bold: true, size: 56, color: brandHex })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: 'Compliance Checklist', size: 32, color: '374151' })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      ...(pi.name ? [new Paragraph({ children: [new TextRun({ text: 'Project: ' + pi.name, size: 22, color: '4B5563' })], alignment: AlignmentType.CENTER })] : []),
      new Paragraph({ children: [new TextRun({ text: `Score: ${data.totalPoints} / ${data.maxPoints} pts`, bold: true, size: 28, color: brandHex })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: ratingRow[1], bold: true, size: 28, color: brandHex })], alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: new Date().toLocaleDateString('en-IN') + '  ·  Powered by Harshz', size: 16, color: '9CA3AF' })], alignment: AlignmentType.CENTER }),
    );
  } else if (template === 'modern') {
    coverChildren.push(
      new Paragraph({ children: [new TextRun({ text: branding.companyName, bold: true, size: 36, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: branding.tagline, size: 20, color: '6B7280' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: 'WORD DOCUMENT', size: 16, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: data.ratingName, bold: true, size: 52, color: '111827' })] }),
      new Paragraph({ children: [new TextRun({ text: 'Compliance Checklist', size: 26, color: '6B7280' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      ...(pi.name ? [new Paragraph({ children: [new TextRun({ text: pi.name, size: 20, color: '374151' })] })] : []),
      new Paragraph({ children: [new TextRun({ text: `${data.totalPoints} / ${data.maxPoints} pts`, bold: true, size: 36, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: ratingRow[1], bold: true, size: 26, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: new Date().toLocaleDateString('en-IN') + '  ·  Powered by Harshz', size: 16, color: '9CA3AF' })] }),
    );
  } else if (template === 'minimal') {
    coverChildren.push(
      new Paragraph({ children: [new TextRun({ text: branding.companyName, bold: true, size: 22, color: '374151' })], alignment: AlignmentType.RIGHT }),
      new Paragraph({ children: [new TextRun({ text: branding.tagline, size: 18, color: '9CA3AF' })], alignment: AlignmentType.RIGHT }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: 'WORD DOCUMENT', size: 14, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: data.ratingName, bold: true, size: 54, color: '111827' })] }),
      new Paragraph({ children: [new TextRun({ text: 'Compliance Checklist', bold: true, size: 28, color: '111827' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      ...(pi.name ? [new Paragraph({ children: [new TextRun({ text: pi.name, size: 20, color: '6B7280' })] })] : []),
      new Paragraph({ children: [new TextRun({ text: `${data.totalPoints} / ${data.maxPoints} pts`, bold: true, size: 32, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: ratingRow[1], size: 24, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: new Date().toLocaleDateString('en-IN') + '  ·  Powered by Harshz', size: 16, color: '9CA3AF' })] }),
    );
  } else {
    // Bold
    coverChildren.push(
      new Paragraph({ children: [new TextRun({ text: branding.companyName, bold: true, size: 32, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: branding.tagline, size: 20, color: '6B7280' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: 'WORD DOCUMENT', size: 16, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: data.ratingName, bold: true, size: 60, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: 'Compliance Checklist', size: 28, color: '374151' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      ...(pi.name ? [new Paragraph({ children: [new TextRun({ text: pi.name, size: 20, color: '6B7280' })] })] : []),
      new Paragraph({ children: [new TextRun({ text: `${data.totalPoints} / ${data.maxPoints} pts`, bold: true, size: 44, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: ratingRow[1], bold: true, size: 28, color: brandHex })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: '' })] }),
      new Paragraph({ children: [new TextRun({ text: new Date().toLocaleDateString('en-IN') + '  ·  Powered by Harshz', size: 16, color: '9CA3AF' })] }),
    );
  }

  // Page break after cover
  coverChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // ── Content pages ──────────────────────────────────────────────────────────
  const contentChildren: any[] = [
    new Paragraph({ children: [new TextRun({ text: 'Harshz Green Building Automation', bold: true, size: 36, color: brandHex })], heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ children: [new TextRun({ text: data.ratingName + ' Checklist', size: 26 })], heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),

    new Paragraph({ children: [new TextRun({ text: 'Project Information', bold: true, size: 24 })] }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),

    new Table({
      width: { size: 9000, type: WidthType.DXA },
      rows: [
        new TableRow({ children: [headerCell('Field'), headerCell('Value')] }),
        new TableRow({ children: [dataCell('Project Name', true), dataCell(pi.name || '—')] }),
        new TableRow({ children: [dataCell('Site Area (sq.m)', true), dataCell(pi.siteArea || '—')] }),
        new TableRow({ children: [dataCell('Built-up Area (sq.m)', true), dataCell(pi.builtUpArea || '—')] }),
        new TableRow({ children: [dataCell('Occupancy — Fixed', true), dataCell(pi.occupancyFixed || '—')] }),
        new TableRow({ children: [dataCell('Occupancy — Floating', true), dataCell(pi.occupancyFloating || '—')] }),
        new TableRow({ children: [dataCell('Occupancy — Total', true), dataCell(pi.occupancyTotal || '—')] }),
        new TableRow({ children: [dataCell('Climate Zone', true), dataCell(pi.climateZone || '—')] }),
        new TableRow({ children: [dataCell('Address', true), dataCell([pi.city, pi.state, pi.country].filter(Boolean).join(', ') || '—')] }),
      ],
    }),

    new Paragraph({ children: [new TextRun({ text: '' })] }),
    new Paragraph({ children: [new TextRun({ text: 'Rating Summary', bold: true, size: 24 })] }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),

    new Table({
      width: { size: 9000, type: WidthType.DXA },
      rows: [
        new TableRow({ children: [headerCell('Metric'), headerCell('Value')] }),
        new TableRow({ children: [dataCell('Total Points Scored', true), dataCell(`${data.totalPoints} / ${data.maxPoints}`, true, brandHex)] }),
        new TableRow({ children: [dataCell(ratingRow[0], true), dataCell(ratingRow[1], true, brandHex)] }),
        new TableRow({ children: [dataCell('Generated On', true), dataCell(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST')] }),
      ],
    }),

    new Paragraph({ children: [new TextRun({ text: '' })] }),
    new Paragraph({ children: [new TextRun({ text: 'Full Checklist', bold: true, size: 24 })] }),
    new Paragraph({ children: [new TextRun({ text: '' })] }),
  ];

  // Checklist table
  const checklistRows: InstanceType<typeof TableRow>[] = [
    new TableRow({ children: [headerCell('No.'), headerCell('Criterion'), headerCell('Max Pts'), headerCell('Score'), headerCell('Compliance')] }),
  ];

  for (const section of data.sections) {
    checklistRows.push(sectionHeaderRow(section.title));
    for (const c of section.criteria) {
      checklistRows.push(new TableRow({ children: [dataCell(String(c.no)), dataCell(c.name), dataCell(String(c.maxPoints)), dataCell(String(c.score)), dataCell(c.compliance || '')] }));
    }
    checklistRows.push(new TableRow({ children: [shadeCell(''), shadeCell('Section Total', true), shadeCell(String(section.maxPoints), true), shadeCell(String(section.sectionScore), true), shadeCell('')] }));
  }
  checklistRows.push(new TableRow({ children: [headerCell(''), headerCell('GRAND TOTAL'), headerCell(String(data.maxPoints)), headerCell(String(data.totalPoints)), headerCell('')] }));

  contentChildren.push(new Table({ width: { size: 9000, type: WidthType.DXA }, rows: checklistRows }));
  contentChildren.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
  contentChildren.push(new Paragraph({
    children: [new TextRun({ text: `© ${new Date().getFullYear()} ${branding.companyName}. All rights reserved.`, size: 14, color: '6B7280' })],
    alignment: AlignmentType.CENTER,
  }));

  const doc = new Document({ sections: [{ children: [...coverChildren, ...contentChildren] }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.ratingName.replace(/\s+/g, '_')}_Checklist.docx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
