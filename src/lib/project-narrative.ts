import { getProjectDetails, BUILDING_TYPOLOGIES, OPERATION_SCHEDULE, buildingBuiltUpArea, sumSiteAreaTotal } from '@/data/building-typology';
import { fmtSqm } from '@/components/AreaList';
import { scopedKey } from '@/lib/projects';

interface ProjectInfoLite {
  name?: string;
  country?: string;
  state?: string;
  city?: string;
  climateZone?: string;
}

function getProjectInfo(projectId: string): ProjectInfoLite {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(scopedKey(projectId, 'project_info')) || '{}');
  } catch {
    return {};
  }
}

/**
 * Builds the "Project Approvals" (1.1.1) narrative from Project Information + Project Details —
 * an intro paragraph followed by a details table, regenerated on demand rather than kept live,
 * since the narrative is still freely editable rich text afterwards.
 */
export function buildProjectApprovalsNarrative(projectId: string): string {
  const info = getProjectInfo(projectId);
  const details = getProjectDetails(projectId);

  const name = info.name?.trim() || '[Project Name]';
  const category = BUILDING_TYPOLOGIES.find(c => c.category === details.typologyCategory)?.category
    || '[Building Typology]';
  const typologyText = details.typologyType ? `${details.typologyType} (${category})` : category;

  const siteAreaTotal = sumSiteAreaTotal(details);
  const builtUpTotal = details.buildings.reduce((s, b) => s + buildingBuiltUpArea(b), 0);
  const numberOfBuildings = details.buildings.length;

  const dailyLabel = OPERATION_SCHEDULE.dailyOptions.find(o => o.value === details.operationDaily)?.label
    || '[Daily Operation Schedule]';
  const weeklyLabel = OPERATION_SCHEDULE.weeklyOptions.find(o => o.value === details.operationWeekly)?.label
    || '[Weekly Operation Schedule]';

  const location = [info.city, info.state, info.country].filter(Boolean).join(', ') || '—';

  const buildingsTable = numberOfBuildings > 1
    ? `<p><strong>Building-wise Built-up Area</strong></p>
<table>
  <thead><tr><th>Building</th><th>Built-up Area</th></tr></thead>
  <tbody>
    ${details.buildings.map((b, i) => {
      const area = buildingBuiltUpArea(b);
      return `<tr><td>${b.name || `Building ${i + 1}`}</td><td>${area > 0 ? `${fmtSqm(area)} sqm` : '—'}</td></tr>`;
    }).join('\n    ')}
  </tbody>
</table>`
    : '';

  return `<p>The project <strong>${name}</strong> is a <strong>${typologyText}</strong>, having a total site area ` +
    `of <strong>${fmtSqm(siteAreaTotal)} sqm</strong> and a total built-up area of <strong>${fmtSqm(builtUpTotal)} sqm</strong> ` +
    `across <strong>${numberOfBuildings}</strong> building${numberOfBuildings === 1 ? '' : 's'}, operating on a schedule of ` +
    `<strong>${dailyLabel}</strong>, <strong>${weeklyLabel}</strong>, as per the details selected in Project Information ` +
    `and Project Details.</p>
<table>
  <tbody>
    <tr><td>Project Name</td><td>${name}</td></tr>
    <tr><td>Location</td><td>${location}</td></tr>
    <tr><td>Climate Zone</td><td>${info.climateZone || '—'}</td></tr>
    <tr><td>Building Typology</td><td>${typologyText}</td></tr>
    <tr><td>Number of Buildings</td><td>${numberOfBuildings}</td></tr>
    <tr><td>Total Site Area</td><td>${fmtSqm(siteAreaTotal)} sqm</td></tr>
    <tr><td>Total Built-up Area</td><td>${fmtSqm(builtUpTotal)} sqm</td></tr>
    <tr><td>Daily Operation Schedule</td><td>${dailyLabel}</td></tr>
    <tr><td>Weekly Operation Schedule</td><td>${weeklyLabel}</td></tr>
  </tbody>
</table>
${buildingsTable}`.trim();
}
