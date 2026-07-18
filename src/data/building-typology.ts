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

export interface ProjectDetailsState {
  typologyCategory: string;
  typologyType: string;
  operationDaily: string;
  operationWeekly: string;
}

const DEFAULT_STATE: ProjectDetailsState = {
  typologyCategory: '',
  typologyType: '',
  operationDaily: '',
  operationWeekly: '',
};

const STORAGE_KEY = 'project_typology';

export function getProjectDetails(): ProjectDetailsState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveProjectDetails(patch: Partial<ProjectDetailsState>) {
  const next = { ...getProjectDetails(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
