import type { DownloadData } from '@/types/download';
import { getBranding } from '@/types/branding';

function starsText(count: number): string {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

async function buildPresentation(data: DownloadData): Promise<any> {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const branding = getBranding();
  const prs = new PptxGenJS();

  const hex = data.brandColor.replace('#', '');
  const white = 'FFFFFF';
  const lightBg = 'F8FAFC';
  const grayText = '64748B';
  const darkText = '1E293B';
  const template = branding.template;

  prs.layout = 'LAYOUT_16x9';

  // ── Slide 1: Cover (branded) ───────────────────────────────────────────────
  const cover = prs.addSlide();

  const companyName = branding.companyName;
  const tagline = branding.tagline;
  const scoreStr = `${data.totalPoints} / ${data.maxPoints}`;
  const starStr = data.starsCount !== undefined ? starsText(data.starsCount) : (data.level || 'None');
  const subLabel = data.starsCount !== undefined ? `${data.starsCount} / 5 Stars` : 'Certification Level';

  if (template === 'classic') {
    cover.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.4, fill: { color: hex } });
    if (branding.logoDataUrl) {
      try { cover.addImage({ data: branding.logoDataUrl, x: 0.3, y: 0.2, w: 0.9, h: 0.9 }); } catch {}
    }
    cover.addText(companyName, { x: 1.4, y: 0.22, w: 7, h: 0.45, fontSize: 16, bold: true, color: white });
    cover.addText(tagline,     { x: 1.4, y: 0.72, w: 7, h: 0.34, fontSize: 10, color: white });

    cover.addText(data.ratingName, { x: 0, y: 1.8, w: '100%', h: 0.9, fontSize: 34, bold: true, color: hex, align: 'center' });
    cover.addText('Compliance Checklist', { x: 0, y: 2.7, w: '100%', h: 0.4, fontSize: 14, color: grayText, align: 'center' });
    cover.addShape('line', { x: 4.0, y: 3.18, w: 2.0, h: 0, line: { color: hex, width: 2.5 } });

    if (data.projectInfo.name) {
      cover.addText('Project: ' + data.projectInfo.name, { x: 0, y: 3.4, w: '100%', h: 0.3, fontSize: 10, color: grayText, align: 'center' });
    }
    cover.addText(scoreStr, { x: 3.5, y: 3.85, w: 3.0, h: 0.55, fontSize: 22, bold: true, color: hex, align: 'center' });
    cover.addText(starStr,  { x: 3.5, y: 4.45, w: 3.0, h: 0.38, fontSize: 16, bold: true, color: hex, align: 'center' });
    cover.addShape('rect', { x: 0, y: 5.3, w: '100%', h: 0.12, fill: { color: hex } });
    cover.addText(`Powered by Harshz  ·  ${new Date().toLocaleDateString('en-IN')}`, { x: 0, y: 5.44, w: '100%', h: 0.22, fontSize: 7, color: grayText, align: 'center' });

  } else if (template === 'modern') {
    cover.addShape('rect', { x: 0, y: 0, w: 3.2, h: '100%', fill: { color: hex } });
    if (branding.logoDataUrl) {
      try { cover.addImage({ data: branding.logoDataUrl, x: 0.85, y: 0.6, w: 1.4, h: 1.4 }); } catch {}
    }
    cover.addShape('line', { x: 0.5, y: 2.3, w: 2.2, h: 0, line: { color: white, width: 0.75 } });
    cover.addText(companyName, { x: 0.3, y: 2.5, w: 2.6, h: 0.9, fontSize: 10, bold: true, color: white, align: 'center', valign: 'top' });
    cover.addText(tagline,     { x: 0.3, y: 3.45, w: 2.6, h: 0.6, fontSize: 8.5, color: white, align: 'center', valign: 'top' });

    const rx = 3.6;
    cover.addText('POWERPOINT PRESENTATION', { x: rx, y: 0.5, w: 5.6, h: 0.28, fontSize: 7, color: grayText });
    cover.addText(data.ratingName, { x: rx, y: 0.9, w: 5.6, h: 0.85, fontSize: 28, bold: true, color: darkText });
    cover.addText('Compliance Checklist', { x: rx, y: 1.75, w: 5.6, h: 0.34, fontSize: 13, color: grayText });
    cover.addShape('rect', { x: rx, y: 2.2, w: 1.2, h: 0.1, fill: { color: hex } });
    if (data.projectInfo.name) {
      cover.addText(data.projectInfo.name, { x: rx, y: 2.5, w: 5.6, h: 0.3, fontSize: 10, color: grayText });
    }
    cover.addText(scoreStr, { x: rx, y: 2.95, w: 5.6, h: 0.65, fontSize: 26, bold: true, color: hex });
    cover.addText(starStr,  { x: rx, y: 3.65, w: 5.6, h: 0.42, fontSize: 16, bold: true, color: hex });
    cover.addText(subLabel, { x: rx, y: 4.1,  w: 5.6, h: 0.28, fontSize: 9,  color: grayText });
    cover.addText(`Powered by Harshz  ·  ${new Date().toLocaleDateString('en-IN')}`, { x: rx, y: 5.3, w: 5.6, h: 0.22, fontSize: 7.5, color: '9CA3AF' });

  } else if (template === 'minimal') {
    cover.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: 'FAFAFA' } });
    if (branding.logoDataUrl) {
      try { cover.addImage({ data: branding.logoDataUrl, x: 0.4, y: 0.25, w: 1.0, h: 1.0 }); } catch {}
    }
    cover.addText(companyName, { x: 0, y: 0.3, w: 9.6, h: 0.34, fontSize: 10, bold: true, color: darkText, align: 'right' });
    cover.addText(tagline,     { x: 0, y: 0.66, w: 9.6, h: 0.26, fontSize: 8.5, color: grayText, align: 'right' });

    cover.addText('PRESENTATION', { x: 0.4, y: 1.7, w: 9.2, h: 0.26, fontSize: 7, color: hex });
    cover.addText(data.ratingName, { x: 0.4, y: 2.0, w: 9.2, h: 0.85, fontSize: 32, bold: true, color: darkText });
    cover.addText('Compliance Checklist', { x: 0.4, y: 2.85, w: 9.2, h: 0.4, fontSize: 16, bold: true, color: darkText });
    cover.addShape('line', { x: 0.4, y: 3.35, w: 9.2, h: 0, line: { color: 'E5E7EB', width: 0.75 } });
    if (data.projectInfo.name) {
      cover.addText(data.projectInfo.name, { x: 0.4, y: 3.55, w: 9.2, h: 0.3, fontSize: 11, color: grayText });
    }
    cover.addText(scoreStr, { x: 0.4, y: 4.0, w: 9.2, h: 0.6, fontSize: 24, bold: true, color: hex });
    cover.addText(starStr,  { x: 0.4, y: 4.65, w: 9.2, h: 0.38, fontSize: 15, bold: true, color: hex });
    cover.addShape('rect', { x: 0, y: 5.4, w: 1.5, h: 0.15, fill: { color: hex } });
    cover.addText(`${new Date().toLocaleDateString('en-IN')}  ·  Powered by Harshz`, { x: 1.7, y: 5.42, w: 7.9, h: 0.22, fontSize: 7.5, color: '9CA3AF' });

  } else {
    // Bold
    cover.addShape('rect', { x: 0, y: 0, w: '100%', h: '100%', fill: { color: hex } });
    if (branding.logoDataUrl) {
      try { cover.addImage({ data: branding.logoDataUrl, x: 0.4, y: 0.3, w: 0.9, h: 0.9 }); } catch {}
    }
    cover.addText(companyName, { x: 1.5, y: 0.32, w: 7, h: 0.36, fontSize: 12, bold: true, color: white });
    cover.addText(tagline,     { x: 1.5, y: 0.7,  w: 7, h: 0.28, fontSize: 9,  color: white });
    cover.addText('POWERPOINT PRESENTATION', { x: 0.4, y: 1.55, w: 9.2, h: 0.28, fontSize: 7.5, color: white });
    cover.addText(data.ratingName, { x: 0.4, y: 1.9, w: 9.2, h: 0.95, fontSize: 34, bold: true, color: white });
    cover.addText('Compliance Checklist', { x: 0.4, y: 2.85, w: 9.2, h: 0.4, fontSize: 15, color: white });
    if (data.projectInfo.name) {
      cover.addText(data.projectInfo.name, { x: 0.4, y: 3.35, w: 9.2, h: 0.3, fontSize: 10, color: white });
    }
    cover.addShape('rect', { x: 0.4, y: 3.75, w: 3.2, h: 1.25, fill: { color: hex }, line: { color: white, width: 1.2 } });
    cover.addText(scoreStr, { x: 0.4, y: 3.82, w: 3.2, h: 0.55, fontSize: 22, bold: true, color: white, align: 'center' });
    cover.addText(starStr,  { x: 0.4, y: 4.4,  w: 3.2, h: 0.35, fontSize: 15, bold: true, color: white, align: 'center' });
    cover.addShape('line', { x: 0.4, y: 5.22, w: 9.2, h: 0, line: { color: white, width: 0.5 } });
    cover.addText(`Powered by Harshz  ·  ${new Date().toLocaleDateString('en-IN')}`, { x: 0, y: 5.32, w: '100%', h: 0.22, fontSize: 7.5, color: white, align: 'center' });
  }

  // ── Slide 2: Summary ──────────────────────────────────────────────────────
  const slide1 = prs.addSlide();

  slide1.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.6, fill: { color: hex } });
  slide1.addText('Harshz Green Building Automation', { x: 0.4, y: 0.2, w: 9.2, h: 0.55, fontSize: 22, bold: true, color: white });
  slide1.addText(data.ratingName + ' Checklist', { x: 0.4, y: 0.85, w: 9.2, h: 0.45, fontSize: 14, color: white });

  const pi = data.projectInfo;
  const infoLines = [
    `Project: ${pi.name || '—'}`,
    `Site Area: ${pi.siteArea ? pi.siteArea + ' sq.m' : '—'}   Built-up: ${pi.builtUpArea ? pi.builtUpArea + ' sq.m' : '—'}`,
    `Occupancy: ${pi.occupancyFixed || '—'} fixed / ${pi.occupancyFloating || '—'} floating / ${pi.occupancyTotal || '—'} total`,
    `Climate Zone: ${pi.climateZone || '—'}`,
    `Address: ${[pi.city, pi.state, pi.country].filter(Boolean).join(', ') || '—'}`,
  ];
  slide1.addText(infoLines.join('\n'), { x: 0.4, y: 1.85, w: 5.2, h: 2.6, fontSize: 10.5, color: darkText, lineSpacingMultiple: 1.35 });

  slide1.addShape('rect', { x: 6.0, y: 1.75, w: 3.6, h: 2.4, fill: { color: lightBg }, line: { color: hex, width: 2 } });
  slide1.addText(`${data.totalPoints} / ${data.maxPoints}`, { x: 6.0, y: 1.9, w: 3.6, h: 0.75, fontSize: 30, bold: true, color: hex, align: 'center' });
  slide1.addText('Total Points', { x: 6.0, y: 2.65, w: 3.6, h: 0.28, fontSize: 9, color: grayText, align: 'center' });

  if (data.starsCount !== undefined) {
    slide1.addText(starsText(data.starsCount), { x: 6.0, y: 3.0, w: 3.6, h: 0.45, fontSize: 18, bold: true, color: hex, align: 'center' });
    slide1.addText(`${data.starsCount} / 5 Stars`, { x: 6.0, y: 3.45, w: 3.6, h: 0.3, fontSize: 9.5, color: grayText, align: 'center' });
  } else {
    slide1.addText(data.level || 'None', { x: 6.0, y: 3.0, w: 3.6, h: 0.6, fontSize: 20, bold: true, color: hex, align: 'center' });
    slide1.addText('Certification Level', { x: 6.0, y: 3.6, w: 3.6, h: 0.28, fontSize: 9, color: grayText, align: 'center' });
  }

  slide1.addText(
    `Generated: ${new Date().toLocaleDateString('en-IN')}  ·  ${companyName}`,
    { x: 0, y: 5.05, w: '100%', h: 0.28, fontSize: 7.5, color: grayText, align: 'center' },
  );

  // ── Section Slides ─────────────────────────────────────────────────────────
  for (const section of data.sections) {
    const sl = prs.addSlide();
    sl.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.65, fill: { color: hex } });
    sl.addText(section.title, { x: 0.3, y: 0.08, w: 7.2, h: 0.5, fontSize: 13, bold: true, color: white });
    sl.addText(`${section.sectionScore} / ${section.maxPoints} pts`, { x: 7.5, y: 0.08, w: 2.1, h: 0.5, fontSize: 12, bold: true, color: white, align: 'right' });

    const headerRow = [[
      { text: 'No.',        options: { bold: true, fill: { color: hex }, color: white, fontSize: 8 } },
      { text: 'Criterion',  options: { bold: true, fill: { color: hex }, color: white, fontSize: 8 } },
      { text: 'Max',        options: { bold: true, fill: { color: hex }, color: white, fontSize: 8 } },
      { text: 'Score',      options: { bold: true, fill: { color: hex }, color: white, fontSize: 8 } },
      { text: 'Compliance', options: { bold: true, fill: { color: hex }, color: white, fontSize: 8 } },
    ]];

    const dataRows = section.criteria.map(c => [
      { text: String(c.no),        options: { fontSize: 8 } },
      { text: c.name,              options: { fontSize: 8 } },
      { text: String(c.maxPoints), options: { fontSize: 8, align: 'center' as const } },
      { text: String(c.score),     options: { fontSize: 8, align: 'center' as const } },
      { text: c.compliance || '',  options: { fontSize: 8 } },
    ]);

    sl.addTable([...headerRow, ...dataRows] as any, {
      x: 0.3, y: 0.78, w: 9.4,
      colW: [0.75, 4.55, 1.0, 1.0, 2.1],
      border: { pt: 0.5, color: 'E2E8F0' },
      rowH: 0.29, autoPage: true,
    });

    sl.addText(`${data.ratingName}  ·  ${companyName}`, { x: 0, y: 5.3, w: '100%', h: 0.22, fontSize: 7, color: grayText, align: 'center' });
  }

  // ── Summary Table Slide ───────────────────────────────────────────────────
  const sumSlide = prs.addSlide();
  sumSlide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.65, fill: { color: hex } });
  sumSlide.addText('Section Summary', { x: 0.3, y: 0.1, w: 9.4, h: 0.5, fontSize: 16, bold: true, color: white });

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

  const totalPct = data.maxPoints > 0 ? Math.round((data.totalPoints / data.maxPoints) * 100) + '%' : '—';
  const totalRow = [[
    { text: 'TOTAL',                  options: { bold: true, fontSize: 9 } },
    { text: String(data.maxPoints),   options: { bold: true, fontSize: 9, align: 'center' as const } },
    { text: String(data.totalPoints), options: { bold: true, fontSize: 9, color: hex, align: 'center' as const } },
    { text: totalPct,                 options: { bold: true, fontSize: 9, color: hex, align: 'center' as const } },
  ]];

  sumSlide.addTable([...summaryHeader, ...summaryRows, ...totalRow] as any, {
    x: 0.3, y: 0.82, w: 9.4,
    colW: [5.8, 1.3, 1.2, 1.1],
    border: { pt: 0.5, color: 'E2E8F0' },
    rowH: 0.32,
  });

  return prs;
}

export async function downloadPPT(data: DownloadData): Promise<void> {
  const prs = await buildPresentation(data);
  await prs.writeFile({ fileName: `${data.ratingName.replace(/\s+/g, '_')}_Checklist.pptx` });
}
