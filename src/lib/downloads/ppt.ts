import type { DownloadData } from '@/types/download';

function starsText(count: number): string {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

export async function downloadPPT(data: DownloadData): Promise<void> {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const prs = new PptxGenJS();

  const hex = data.brandColor.replace('#', '');
  const white = 'FFFFFF';
  const lightBg = 'F8FAFC';
  const grayText = '64748B';
  const darkText = '1E293B';

  prs.layout = 'LAYOUT_16x9';

  // ── Slide 1: Title / Summary ───────────────────────────────────────────────
  const slide1 = prs.addSlide();

  // Brand header strip
  slide1.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.6, fill: { color: hex } });
  slide1.addText('Harshz Green Building Automation', {
    x: 0.4, y: 0.2, w: 9.2, h: 0.55, fontSize: 22, bold: true, color: white,
  });
  slide1.addText(data.ratingName + ' Checklist', {
    x: 0.4, y: 0.85, w: 9.2, h: 0.45, fontSize: 14, color: white,
  });

  // Project info
  const pi = data.projectInfo;
  const infoLines = [
    `Project: ${pi.name || '—'}`,
    `Site Area: ${pi.siteArea ? pi.siteArea + ' sq.m' : '—'}   Built-up: ${pi.builtUpArea ? pi.builtUpArea + ' sq.m' : '—'}`,
    `Occupancy: ${pi.occupancyFixed || '—'} fixed / ${pi.occupancyFloating || '—'} floating`,
    `Climate Zone: ${pi.climateZone || '—'}`,
  ];
  slide1.addText(infoLines.join('\n'), {
    x: 0.4, y: 1.85, w: 5.2, h: 2.2, fontSize: 11, color: darkText, lineSpacingMultiple: 1.4,
  });

  // Score box
  slide1.addShape('rect', {
    x: 6.0, y: 1.75, w: 3.6, h: 2.4,
    fill: { color: lightBg },
    line: { color: hex, width: 2 },
  });
  slide1.addText(`${data.totalPoints} / ${data.maxPoints}`, {
    x: 6.0, y: 1.9, w: 3.6, h: 0.75, fontSize: 30, bold: true, color: hex, align: 'center',
  });
  slide1.addText('Total Points', {
    x: 6.0, y: 2.65, w: 3.6, h: 0.28, fontSize: 9, color: grayText, align: 'center',
  });

  if (data.starsCount !== undefined) {
    const starStr = starsText(data.starsCount);
    slide1.addText(starStr, {
      x: 6.0, y: 3.0, w: 3.6, h: 0.45, fontSize: 18, bold: true, color: hex, align: 'center',
    });
    slide1.addText(`${data.starsCount} / 5 Stars`, {
      x: 6.0, y: 3.45, w: 3.6, h: 0.3, fontSize: 9.5, color: grayText, align: 'center',
    });
  } else {
    slide1.addText(data.level || 'None', {
      x: 6.0, y: 3.0, w: 3.6, h: 0.6, fontSize: 20, bold: true, color: hex, align: 'center',
    });
    slide1.addText('Certification Level', {
      x: 6.0, y: 3.6, w: 3.6, h: 0.28, fontSize: 9, color: grayText, align: 'center',
    });
  }

  // Footer
  slide1.addText(
    `Generated: ${new Date().toLocaleDateString('en-IN')}  ·  Harshz Technologies Private Limited`,
    { x: 0, y: 5.05, w: '100%', h: 0.28, fontSize: 7.5, color: grayText, align: 'center' },
  );

  // ── Section Slides ────────────────────────────────────────────────────────
  for (const section of data.sections) {
    const sl = prs.addSlide();

    sl.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.65, fill: { color: hex } });
    sl.addText(section.title, {
      x: 0.3, y: 0.08, w: 7.2, h: 0.5, fontSize: 13, bold: true, color: white,
    });
    sl.addText(`${section.sectionScore} / ${section.maxPoints} pts`, {
      x: 7.5, y: 0.08, w: 2.1, h: 0.5, fontSize: 12, bold: true, color: white, align: 'right',
    });

    const headerRow = [
      [
        { text: 'No.',        options: { bold: true, fill: { color: hex }, color: white, fontSize: 8 } },
        { text: 'Criterion',  options: { bold: true, fill: { color: hex }, color: white, fontSize: 8 } },
        { text: 'Max',        options: { bold: true, fill: { color: hex }, color: white, fontSize: 8 } },
        { text: 'Score',      options: { bold: true, fill: { color: hex }, color: white, fontSize: 8 } },
        { text: 'Compliance', options: { bold: true, fill: { color: hex }, color: white, fontSize: 8 } },
      ],
    ];

    const dataRows = section.criteria.map(c => [
      { text: String(c.no),        options: { fontSize: 8 } },
      { text: c.name,              options: { fontSize: 8 } },
      { text: String(c.maxPoints), options: { fontSize: 8, align: 'center' as const } },
      { text: String(c.score),     options: { fontSize: 8, align: 'center' as const } },
      { text: c.compliance || '',  options: { fontSize: 8 } },
    ]);

    sl.addTable([...headerRow, ...dataRows] as any, {
      x: 0.3, y: 0.78,
      w: 9.4,
      colW: [0.75, 4.55, 1.0, 1.0, 2.1],
      border: { pt: 0.5, color: 'E2E8F0' },
      rowH: 0.29,
      autoPage: true,
    });

    sl.addText(`${data.ratingName}  ·  Harshz Green Building Automation`, {
      x: 0, y: 5.3, w: '100%', h: 0.22, fontSize: 7, color: grayText, align: 'center',
    });
  }

  // ── Summary Table Slide ───────────────────────────────────────────────────
  const sumSlide = prs.addSlide();
  sumSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.65, fill: { color: hex } });
  sumSlide.addText('Section Summary', {
    x: 0.3, y: 0.1, w: 9.4, h: 0.5, fontSize: 16, bold: true, color: white,
  });

  const summaryHeader = [[
    { text: 'Section',    options: { bold: true, fill: { color: hex }, color: white, fontSize: 9 } },
    { text: 'Max Points', options: { bold: true, fill: { color: hex }, color: white, fontSize: 9 } },
    { text: 'Scored',     options: { bold: true, fill: { color: hex }, color: white, fontSize: 9 } },
    { text: '%',          options: { bold: true, fill: { color: hex }, color: white, fontSize: 9 } },
  ]];

  const summaryRows = data.sections.map(s => {
    const mp = typeof s.maxPoints === 'number' ? s.maxPoints : 0;
    const pct = mp > 0 ? Math.round((s.sectionScore / mp) * 100) + '%' : '—';
    return [
      { text: s.title,                options: { fontSize: 9 } },
      { text: String(s.maxPoints),    options: { fontSize: 9, align: 'center' as const } },
      { text: String(s.sectionScore), options: { fontSize: 9, align: 'center' as const } },
      { text: pct,                    options: { fontSize: 9, align: 'center' as const } },
    ];
  });

  const totalPct = data.maxPoints > 0
    ? Math.round((data.totalPoints / data.maxPoints) * 100) + '%'
    : '—';

  const totalRow = [[
    { text: 'TOTAL',                  options: { bold: true, fontSize: 9 } },
    { text: String(data.maxPoints),   options: { bold: true, fontSize: 9, align: 'center' as const } },
    { text: String(data.totalPoints), options: { bold: true, fontSize: 9, color: hex, align: 'center' as const } },
    { text: totalPct,                 options: { bold: true, fontSize: 9, color: hex, align: 'center' as const } },
  ]];

  sumSlide.addTable([...summaryHeader, ...summaryRows, ...totalRow] as any, {
    x: 0.3, y: 0.82,
    w: 9.4,
    colW: [5.8, 1.3, 1.2, 1.1],
    border: { pt: 0.5, color: 'E2E8F0' },
    rowH: 0.32,
  });

  await prs.writeFile({ fileName: `${data.ratingName.replace(/\s+/g, '_')}_Checklist.pptx` });
}
