import type { DownloadData } from '@/types/download';
import { getBranding } from '@/types/branding';

function starsText(count: number): string {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

export async function downloadExcel(data: DownloadData): Promise<void> {
  const XLSX = await import('xlsx');
  const branding = getBranding();

  const wb = XLSX.utils.book_new();

  // ── Cover sheet ───────────────────────────────────────────────────────────
  const ratingStr = data.starsCount !== undefined
    ? starsText(data.starsCount) + `  (${data.starsCount}/5 stars)`
    : (data.level || 'None');

  const coverRows: (string | number)[][] = [
    [branding.companyName],
    [branding.tagline],
    [],
    [data.ratingName + ' — Compliance Checklist'],
    [],
    ['Project',     data.projectInfo.name          || '—'],
    ['Site Area',   data.projectInfo.siteArea ? data.projectInfo.siteArea + ' sq.m' : '—'],
    ['Built-up',    data.projectInfo.builtUpArea ? data.projectInfo.builtUpArea + ' sq.m' : '—'],
    ['Occupancy',   `${data.projectInfo.occupancyFixed || '—'} fixed / ${data.projectInfo.occupancyFloating || '—'} floating`],
    ['Climate Zone', data.projectInfo.climateZone  || '—'],
    [],
    ['Total Score', `${data.totalPoints} / ${data.maxPoints} pts`],
    ['Rating',      ratingStr],
    [],
    ['Generated',   new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'],
    [],
    ['Powered by Harshz — Green Building Automation'],
  ];

  const wsCover = XLSX.utils.aoa_to_sheet(coverRows);
  wsCover['!cols'] = [{ wch: 20 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsCover, 'Cover');

  // ── Summary sheet ─────────────────────────────────────────────────────────
  const summaryRows: (string | number)[][] = [
    ['Harshz Green Building Automation'],
    [data.ratingName + ' Checklist'],
    [],
    ['PROJECT INFORMATION'],
    ['Project Name',          data.projectInfo.name          || '—'],
    ['Site Area (sq.m)',      data.projectInfo.siteArea       || '—'],
    ['Built-up Area (sq.m)',  data.projectInfo.builtUpArea    || '—'],
    ['Occupancy — Fixed',     data.projectInfo.occupancyFixed    || '—'],
    ['Occupancy — Floating',  data.projectInfo.occupancyFloating || '—'],
    ['Climate Zone',          data.projectInfo.climateZone    || '—'],
    [],
    ['RATING SUMMARY'],
    ['Total Points Scored', data.totalPoints],
    ['Maximum Points',      data.maxPoints],
    [data.starsCount !== undefined ? 'Star Rating' : 'Certification Level', ratingStr],
    ['Generated On', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 26 }, { wch: 44 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ── Checklist sheet ───────────────────────────────────────────────────────
  const checklistRows: (string | number)[][] = [
    [data.ratingName + ' — Full Checklist'],
    [],
    ['No.', 'Criterion', 'Max Points', 'Points Scored', 'Compliance Type'],
  ];

  for (const section of data.sections) {
    checklistRows.push(['', `► ${section.title}`, section.maxPoints, section.sectionScore, '']);
    for (const c of section.criteria) {
      checklistRows.push([c.no, c.name, c.maxPoints, c.score, c.compliance || '']);
    }
    checklistRows.push(['', 'Section Total', section.maxPoints, section.sectionScore, '']);
    checklistRows.push([]);
  }
  checklistRows.push(['', 'GRAND TOTAL', data.maxPoints, data.totalPoints, '']);

  const wsChecklist = XLSX.utils.aoa_to_sheet(checklistRows);
  wsChecklist['!cols'] = [{ wch: 14 }, { wch: 52 }, { wch: 14 }, { wch: 16 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsChecklist, 'Checklist');

  XLSX.writeFile(wb, `${data.ratingName.replace(/\s+/g, '_')}_Checklist.xlsx`);
}
