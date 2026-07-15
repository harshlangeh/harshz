import type { DownloadData } from '@/types/download';
import { getBranding } from '@/types/branding';

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [0, 128, 0];
}

function lighten(rgb: [number, number, number], factor: number): [number, number, number] {
  return rgb.map(c => Math.round(c + (255 - c) * factor)) as [number, number, number];
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

async function addCoverPage(doc: any, data: DownloadData) {
  const branding = getBranding();
  const rgb = hexToRgb(data.brandColor);
  const [r, g, b] = rgb;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const template = branding.template;

  if (template === 'classic') {
    // Top header band
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageW, 38, 'F');

    // Logo placeholder or initials box
    if (branding.logoDataUrl) {
      try { doc.addImage(branding.logoDataUrl, 'PNG', 10, 8, 22, 22); } catch {}
    } else {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(10, 8, 22, 22, 3, 3, 'F');
      doc.setTextColor(r, g, b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const initials = branding.companyName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
      doc.text(initials, 21, 22.5, { align: 'center' });
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(branding.companyName, 38, 17);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(branding.tagline, 38, 26);

    // Center content
    doc.setTextColor(r, g, b);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(data.ratingName, pageW / 2, 100, { align: 'center' });

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Compliance Checklist', pageW / 2, 112, { align: 'center' });

    // Divider
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(2);
    doc.line(pageW / 2 - 24, 118, pageW / 2 + 24, 118);

    // Project name
    if (data.projectInfo.name) {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text('Project: ' + data.projectInfo.name, pageW / 2, 130, { align: 'center' });
    }

    // Score
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r, g, b);
    doc.text(`${data.totalPoints} / ${data.maxPoints} pts`, pageW / 2, 148, { align: 'center' });

    if (data.starsCount !== undefined) {
      drawStarRating(doc, pageW / 2 - 14, 152, data.starsCount, 5, rgb);
    } else {
      doc.setFontSize(14);
      doc.text(data.level || 'None', pageW / 2, 163, { align: 'center' });
    }

    // Bottom border + footer
    doc.setFillColor(r, g, b);
    doc.rect(0, pageH - 14, pageW, 3, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Powered by Harshz  ·  ' + new Date().toLocaleDateString('en-IN'), pageW / 2, pageH - 5, { align: 'center' });

  } else if (template === 'modern') {
    // Left sidebar
    const sideW = 68;
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, sideW, pageH, 'F');

    if (branding.logoDataUrl) {
      try { doc.addImage(branding.logoDataUrl, 'PNG', (sideW - 30) / 2, 20, 30, 30); } catch {}
    } else {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect((sideW - 30) / 2, 20, 30, 30, 4, 4, 'F');
      doc.setTextColor(r, g, b);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      const initials = branding.companyName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
      doc.text(initials, sideW / 2, 38, { align: 'center' });
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const nameLines = doc.splitTextToSize(branding.companyName, sideW - 10);
    doc.text(nameLines, sideW / 2, 58, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255, 0.7);
    const tagLines = doc.splitTextToSize(branding.tagline, sideW - 10);
    doc.text(tagLines, sideW / 2, 68, { align: 'center' });

    // Right content
    const cx = sideW + 16;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('PDF REPORT', cx, 30);

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(data.ratingName, cx, 50);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Compliance Checklist', cx, 62);

    doc.setFillColor(r, g, b);
    doc.rect(cx, 68, 28, 2.5, 'F');

    if (data.projectInfo.name) {
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text('Project: ' + data.projectInfo.name, cx, 82);
    }

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r, g, b);
    doc.text(`${data.totalPoints}/${data.maxPoints}`, cx, 98);
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text('points scored', cx + 42, 98);

    if (data.starsCount !== undefined) {
      drawStarRating(doc, cx, 104, data.starsCount, 5, rgb);
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(r, g, b);
      doc.text(data.level || 'None', cx, 110);
    }

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text('Powered by Harshz  ·  ' + new Date().toLocaleDateString('en-IN'), cx, pageH - 8);

  } else if (template === 'minimal') {
    // Clean white
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Top row: logo left, company right
    if (branding.logoDataUrl) {
      try { doc.addImage(branding.logoDataUrl, 'PNG', 16, 14, 24, 24); } catch {}
    } else {
      doc.setFillColor(r, g, b);
      doc.roundedRect(16, 14, 24, 24, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const initials = branding.companyName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
      doc.text(initials, 28, 29, { align: 'center' });
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(branding.companyName, pageW - 16, 20, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(branding.tagline, pageW - 16, 28, { align: 'right' });

    // Main text block
    doc.setFontSize(7);
    doc.setTextColor(r, g, b);
    doc.setFont('helvetica', 'normal');
    doc.text('PDF REPORT', 16, 95);

    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 15, 15);
    doc.text(data.ratingName, 16, 112);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 15, 15);
    doc.text('Compliance Checklist', 16, 122);

    // Thin divider
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(16, 128, pageW - 16, 128);

    if (data.projectInfo.name) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(data.projectInfo.name, 16, 138);
    }

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r, g, b);
    doc.text(`${data.totalPoints} `, 16, 155);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(160, 160, 160);
    doc.text(`/ ${data.maxPoints} pts`, 16 + doc.getTextWidth(`${data.totalPoints} `), 155);

    if (data.starsCount !== undefined) {
      drawStarRating(doc, 16, 158, data.starsCount, 5, rgb);
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(r, g, b);
      doc.text(data.level || 'None', 16, 165);
    }

    // Bottom accent bar
    doc.setFillColor(r, g, b);
    doc.rect(0, pageH - 8, 40, 8, 'F');
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text('Powered by Harshz  ·  ' + new Date().toLocaleDateString('en-IN'), 50, pageH - 3);

  } else {
    // Bold — full-color background
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Decorative circles
    const light = lighten(rgb, 0.15);
    doc.setFillColor(...light);
    doc.circle(pageW + 30, -30, 80, 'F');
    doc.setFillColor(...lighten(rgb, 0.08));
    doc.circle(-20, pageH + 20, 70, 'F');

    // Logo + company top
    if (branding.logoDataUrl) {
      try { doc.addImage(branding.logoDataUrl, 'PNG', 16, 16, 26, 26); } catch {}
    } else {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(16, 16, 26, 26, 3, 3, 'F');
      doc.setTextColor(r, g, b);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const initials = branding.companyName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
      doc.text(initials, 29, 31, { align: 'center' });
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(branding.companyName, 48, 26);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(branding.tagline, 48, 35);

    // Center title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('PDF REPORT', 16, 90);
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text(data.ratingName, 16, 110);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('Compliance Checklist', 16, 122);

    if (data.projectInfo.name) {
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(data.projectInfo.name, 16, 134);
    }

    // Score box
    doc.setFillColor(...lighten(rgb, 0.15));
    doc.roundedRect(16, 142, 80, 36, 4, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.totalPoints}`, 26, 158);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`/ ${data.maxPoints} pts`, 26 + doc.getTextWidth(`${data.totalPoints}`) + 1, 158);

    if (data.starsCount !== undefined) {
      drawStarRating(doc, 26, 161, data.starsCount, 5, [255, 255, 255]);
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(data.level || 'None', 26, 168);
    }

    // Footer
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(16, pageH - 18, pageW - 16, pageH - 18);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('Powered by Harshz', 16, pageH - 8);
    doc.text(new Date().toLocaleDateString('en-IN'), pageW - 16, pageH - 8, { align: 'right' });
  }
}

async function buildPdfDoc(data: DownloadData): Promise<any> {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const rgb = hexToRgb(data.brandColor);
  const [r, g, b] = rgb;
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;

  // ── Cover page (page 1) ────────────────────────────────────────────────────
  await addCoverPage(doc, data);

  // ── Content pages ──────────────────────────────────────────────────────────
  doc.addPage();

  // Header banner
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

  // Project info
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
      ['Occupancy (Fixed / Floating / Total)',
        `${data.projectInfo.occupancyFixed || '—'} / ${data.projectInfo.occupancyFloating || '—'} / ${data.projectInfo.occupancyTotal || '—'}`],
      ['Climate Zone',         data.projectInfo.climateZone   || '—'],
      ['Address',              [data.projectInfo.city, data.projectInfo.state, data.projectInfo.country].filter(Boolean).join(', ') || '—'],
    ],
    styles: { fontSize: 8.5, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 58 }, 1: { cellWidth: 110 } },
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 7;

  // Rating summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Rating Summary', margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [],
    body: [['Total Points Scored', `${data.totalPoints} / ${data.maxPoints}`]],
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 58 },
      1: { cellWidth: 110, fontStyle: 'bold', textColor: [r, g, b] },
    },
    margin: { left: margin, right: margin },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 2;

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

  // Checklist
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
      { content: 'Section Total', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } },
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

  // Footer on every page (skip page 1 = cover)
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Harshz  ·  ${data.ratingName}  ·  Page ${i - 1} of ${totalPages - 1}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' },
    );
  }

  return doc;
}

export async function downloadPDF(data: DownloadData): Promise<void> {
  const doc = await buildPdfDoc(data);
  doc.save(`${data.ratingName.replace(/\s+/g, '_')}_Checklist.pdf`);
}

/** Generates the exact PDF file as a Blob, for pixel-perfect preview before download. */
export async function generatePdfBlob(data: DownloadData): Promise<Blob> {
  const doc = await buildPdfDoc(data);
  return doc.output('blob');
}
