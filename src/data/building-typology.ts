import { type AreaItem, newId, sumAreas } from '@/components/AreaList';
import { scopedKey } from '@/lib/projects';

export interface BuildingTypologyCategory {
  category: string;
  /** Sub-typologies within this category. Absent for categories assessed by description instead (e.g. Mixed-use Development). */
  types?: string[];
  /** Shown in place of a sub-typology dropdown when `types` is absent. */
  description?: string;
}

export const BUILDING_TYPOLOGIES: BuildingTypologyCategory[] = [
  {
    category: 'Healthcare Facility',
    types: ['Hospitals', 'Clinics', 'Medical colleges', 'Dispensaries'],
  },
  {
    category: 'Hospitality',
    types: ['Hotels', 'Guest houses', 'Service apartments', 'Community/Visitors centre'],
  },
  {
    category: 'Institutional',
    types: [
      'Universities', 'Schools', 'Colleges', 'Libraries', 'Institutes', 'Sports complex',
      'Research and development buildings', 'Place of worship',
    ],
  },
  {
    category: 'Office',
    types: ['Core & shell buildings', 'IT buildings/data centres', 'Owner-occupied buildings', 'Co-working spaces', 'Industries', 'Court'],
  },
  {
    category: 'Residential',
    types: ['Multi-dwelling unit', 'Bungalows', 'Villas', 'Mansions', 'Military barracks', 'Hostels'],
  },
  {
    category: 'Retail',
    types: [
      'Shopping complexes', 'Banquets/wedding halls', 'Restaurants', 'Food courts', 'Cafeterias', 'Multiplexes',
      'Gallery/Museum', 'Sports and leisure facilities', 'Auditorium/Theatre',
    ],
  },
  {
    category: 'Transit Terminal',
    types: ['Airports', 'Heliports', 'Bus stands', 'Railway stations', 'Metro stations'],
  },
  {
    category: 'Mixed-use Development',
    description: 'Projects having multiple buildings with different uses or a single building with multiple occupancies. Assessment is carried out according to the applicable standards for each building or space.',
  },
];

export const OPERATION_SCHEDULE = {
  dailyOptions: [
    { value: '8', label: '8 hours/day' },
    { value: '24', label: '24 hours/day' },
  ],
  weeklyOptions: [
    { value: '5', label: '5 days/week' },
    { value: '7', label: '7 days/week' },
  ],
  note: 'Projects that do not fall under these operating schedules may use their actual or owner-defined schedule. Base consumption calculations should be modified accordingly.',
};

export interface BuildingItem {
  id: string;
  name: string;
  /** Floor-by-floor breakdown. Built-up area = sum of floor values. */
  floors: AreaItem[];
}

export function newBuildingId() {
  return `bldg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildingBuiltUpArea(b: BuildingItem): number {
  return sumAreas(b.floors);
}

function sumBuiltUpAreas(buildings: BuildingItem[]): number {
  return buildings.reduce((s, b) => s + buildingBuiltUpArea(b), 0);
}

type RawBuilding = { id: string; name: string; floors?: AreaItem[]; builtUpArea?: string };

/** Migrates a raw stored building that may still have the old `builtUpArea: string` shape. */
function migrateBuilding(raw: RawBuilding): BuildingItem {
  if (raw.floors !== undefined) return { id: raw.id, name: raw.name, floors: raw.floors };
  return {
    id: raw.id,
    name: raw.name,
    floors: raw.builtUpArea ? [{ id: newId(), name: '', value: raw.builtUpArea }] : [],
  };
}

export interface ProjectDetailsState {
  typologyCategory: string;
  typologyType: string;
  operationDaily: string;
  operationWeekly: string;
  /** Ground-floor footprint items per building — auto-computed in UI from buildings.floors[0] */
  siteAreaHardpaved: AreaItem[];  // Road, Parking, Paved
  siteAreaLandscape: AreaItem[];  // Lawn, Shrub Bed
  siteAreaOther: AreaItem[];      // Other
  numberOfBuildings: string;
  buildings: BuildingItem[];
}

const DEFAULT_STATE: ProjectDetailsState = {
  typologyCategory: '',
  typologyType: '',
  operationDaily: '',
  operationWeekly: '',
  siteAreaHardpaved: [],
  siteAreaLandscape: [],
  siteAreaOther: [],
  numberOfBuildings: '1',
  buildings: [{ id: newBuildingId(), name: '', floors: [] }],
};

/** Sum of the first floor area of each building (= building footprint on ground). */
export function buildingFootprintTotal(buildings: BuildingItem[]): number {
  return buildings.reduce((s, b) => s + (parseFloat(b.floors[0]?.value || '') || 0), 0);
}

/** Total site area = footprint + hardpaved + landscape + other. */
export function sumSiteAreaTotal(state: ProjectDetailsState): number {
  return (
    buildingFootprintTotal(state.buildings) +
    sumAreas(state.siteAreaHardpaved) +
    sumAreas(state.siteAreaLandscape) +
    sumAreas(state.siteAreaOther)
  );
}

const STORAGE_KEY = 'project_typology';

export function getProjectDetails(projectId: string): ProjectDetailsState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = JSON.parse(localStorage.getItem(scopedKey(projectId, STORAGE_KEY)) || '{}');
    if (Array.isArray(raw.buildings)) {
      raw.buildings = raw.buildings.map(migrateBuilding);
    }
    const state: ProjectDetailsState = { ...DEFAULT_STATE, ...raw };
    // Migrate old flat siteAreas → siteAreaOther on first load with new schema
    if (
      Array.isArray(raw.siteAreas) && raw.siteAreas.length > 0 &&
      !raw.siteAreaHardpaved && !raw.siteAreaLandscape && !raw.siteAreaOther
    ) {
      state.siteAreaOther = raw.siteAreas;
    }
    return state;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveProjectDetails(projectId: string, patch: Partial<ProjectDetailsState>) {
  const next = { ...getProjectDetails(projectId), ...patch };
  localStorage.setItem(scopedKey(projectId, STORAGE_KEY), JSON.stringify(next));
  syncAreaTotalsToProjectInfo(projectId, next);
  return next;
}

/**
 * Mirrors computed Site Area / Built-up Area totals into the `project_info` localStorage blob
 * (merged, not overwritten) so the existing Word/PDF download code — which reads
 * `projectInfo.siteArea` / `projectInfo.builtUpArea` — keeps working unchanged.
 */
function syncAreaTotalsToProjectInfo(projectId: string, state: ProjectDetailsState) {
  if (typeof window === 'undefined') return;
  const key = scopedKey(projectId, 'project_info');
  let existing: Record<string, unknown> = {};
  try {
    existing = JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    existing = {};
  }
  const payload = {
    ...existing,
    siteArea: String(sumSiteAreaTotal(state)),
    builtUpArea: String(sumBuiltUpAreas(state.buildings)),
  };
  localStorage.setItem(key, JSON.stringify(payload));
}
