import type { DownloadData } from '@/types/download';

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [0, 128, 0];
}

function drawStarRating(doc: any, x: number, y: number, filled: number, total: number, rgb: [number, number, number]) {
  const r = 2.2;
  const gap = 6;
  for (let i = 0; i < total; i++) {
    const cx = x + i * gap + r;
    if (i < filled) {
      doc.setFillColor(...rgb);
      doc.circle(cx, y + r, r, 'F');
    } else {
      doc.setDrawColor(...rgb);
      doc.setFillColor(255, 255, 255);
      doc.circle(cx, y + r, r, 'D');
    }
  }
}

export async function downloadPDF(data: DownloadData): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const rgb = hexToRgb(data.brandColor);
  const [r, g, b] = rgb;
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  // ── Header banner ─────────────────────────────────────────────────────────
  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageW, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('Harshz Green Building Automation', margin, 11);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.ratingName + ' Checklist', margin, 19);
  doc.setFontSize(7.5);
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(dateStr + ' IST', pageW - margin, 19, { align: 'right' });

  doc.setTextColor(30, 30, 30);
  let y = 34;

  // ── Project info ──────────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Information', margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ['Project Name',         data.projectInfo.name          || '—'],
      ['Site Area',            data.projectInfo.siteArea  ? data.projectInfo.siteArea + ' sq.m' : '—'],
      ['Built-up Area',        data.projectInfo.builtUpArea ? data.projectInfo.builtUpArea + ' sq.m' : '—'],
      ['Occupancy (Fixed / Floating)',
        `${data.projectInfo.occupancyFixed || '—'} / ${data.projectInfo.occupancyFloating || '—'}`],
      ['Climate Zone',         data.projectInfo.climateZone   || '—'],
    ],
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 58 }, 1: { cellWidth: 110 } },
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 7;

  // ── Rating summary ────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Rating Summary', margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ['Total Points Scored', `${data.totalPoints} / ${data.maxPoints}`],
    ],
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 58 },
      1: { cellWidth: 110, fontStyle: 'bold', textColor: [r, g, b] },
    },
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 2;

  // Draw star rating or certification level
  if (data.starsCount !== undefined) {
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, 168, 11, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text('Star Rating', margin + 2, y + 4);
    drawStarRating(doc, margin + 60, y + 2, data.starsCount, 5, rgb);
    doc.setTextColor(r, g, b);
    doc.text(`(${data.starsCount} / 5 stars)`, margin + 98, y + 4);
    doc.setTextColor(30, 30, 30);
    y += 14;
  } else {
    autoTable(doc, {
      startY: y,
      head: [],
      body: [['Certification Level', data.level || 'None']],
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 58 },
        1: { cellWidth: 110, fontStyle: 'bold', textColor: [r, g, b] },
      },
      margin: { left: margin, right: margin },
      theme: 'grid',
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  }

  y += 4;

  // ── Checklist table ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Full Checklist', margin, y);
  y += 3;

  const tableBody: any[] = [];
  for (const section of data.sections) {
    tableBody.push([{
      content: section.title,
      colSpan: 5,
      styles: { fillColor: [r, g, b], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    }]);
    for (const c of section.criteria) {
      tableBody.push([c.no, c.name, c.maxPoints, c.score, c.compliance || '']);
    }
    tableBody.push([
      { content: '', styles: { fillColor: [245, 245, 245] } },
      { content: 'Section Total', colSpan: 1, styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
      { content: String(section.maxPoints), styles: { fontStyle: 'bold', fillColor: [245, 245, 245], halign: 'center' } },
      { content: String(section.sectionScore), styles: { fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [r, g, b], halign: 'center' } },
      { content: '', styles: { fillColor: [245, 245, 245] } },
    ]);
  }

  tableBody.push([
    { content: '', styles: { fillColor: [r, g, b] } },
    { content: 'GRAND TOTAL', styles: { fontStyle: 'bold', fillColor: [r, g, b], textColor: [255, 255, 255] } },
    { content: String(data.maxPoints), styles: { fontStyle: 'bold', fillColor: [r, g, b], textColor: [255, 255, 255], halign: 'center' } },
    { content: String(data.totalPoints), styles: { fontStyle: 'bold', fillColor: [r, g, b], textColor: [255, 255, 255], halign: 'center' } },
    { content: '', styles: { fillColor: [r, g, b] } },
  ]);

  autoTable(doc, {
    startY: y,
    head: [['No.', 'Criterion', 'Max Pts', 'Scored', 'Compliance']],
    body: tableBody,
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: [r, g, b], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 88 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 30 },
    },
    margin: { left: margin, right: margin },
    theme: 'striped',
  });

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Harshz Green Building Automation  ·  ${data.ratingName}  ·  Page ${i} of ${totalPages}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' },
    );
  }

  doc.save(`${data.ratingName.replace(/\s+/g, '_')}_Checklist.pdf`);
}
