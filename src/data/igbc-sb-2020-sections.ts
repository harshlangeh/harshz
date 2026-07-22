export type IgbcMax = number | 'Mandatory' | 'NA';

export interface IgbcCriterion {
  id: string;
  name: string;
  maxNew: IgbcMax;
  maxExisting: IgbcMax;
}

export interface IgbcSection {
  id: number;
  title: string;
  maxNew: number;
  maxExisting: number;
  criteria: IgbcCriterion[];
}

export const igbcSections: IgbcSection[] = [
  { id: 1, title: "Site Planning and Design", maxNew: 7, maxExisting: 7, criteria: [
    { id: "SPD MR 1",     name: "Local Building Regulations",                                        maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "SPD Credit 1", name: "Erosion and Sedimentation Control",                                maxNew: 1, maxExisting: 1 },
    { id: "SPD Credit 2", name: "Sustainable Landscape",                                            maxNew: 3, maxExisting: 3 },
    { id: "SPD Credit 3", name: "Heat Island Reduction, Non-roof and Roof",                         maxNew: 2, maxExisting: 2 },
    { id: "SPD Credit 4", name: "Green Education",                                                  maxNew: 1, maxExisting: 1 },
  ]},
  { id: 2, title: "Water Conservation", maxNew: 8, maxExisting: 7, criteria: [
    { id: "WC MR 1",      name: "Rainwater Harvesting, Roof",                                       maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "WC MR 2",      name: "Water Efficient Plumbing Fixtures",                                maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "WC Credit 1",  name: "Rainwater Harvesting, Roof",                                       maxNew: 4, maxExisting: 3 },
    { id: "WC Credit 2",  name: "Water Efficient Plumbing Fixtures",                                maxNew: 3, maxExisting: 3 },
    { id: "WC Credit 3",  name: "Water Metering",                                                   maxNew: 1, maxExisting: 1 },
  ]},
  { id: 3, title: "Energy Efficiency", maxNew: 20, maxExisting: 20, criteria: [
    { id: "EE MR 1",      name: "Minimum Energy Efficiency",                                        maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "EE Credit 1",  name: "Passive Architecture",                                             maxNew: 3, maxExisting: 3 },
    { id: "EE Credit 2",  name: "Enhanced Energy Efficiency",                                       maxNew: 10, maxExisting: 10 },
    { id: "EE Credit 3",  name: "On-site Renewable Energy",                                         maxNew: 5, maxExisting: 5 },
    { id: "EE Credit 4",  name: "Energy Saving Appliances",                                         maxNew: 1, maxExisting: 1 },
    { id: "EE Credit 5",  name: "Energy Metering",                                                  maxNew: 1, maxExisting: 1 },
  ]},
  { id: 4, title: "Building Materials and Resources", maxNew: 8, maxExisting: 1, criteria: [
    { id: "BMR MR 1",     name: "Segregation of Waste, Post-occupancy",                             maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "BMR Credit 1", name: "Green Procurement Policy",                                         maxNew: "NA", maxExisting: 1 },
    { id: "BMR Credit 2", name: "Use of Eco-labelled Building Materials, Products & Equipment",     maxNew: 3, maxExisting: "NA" },
    { id: "BMR Credit 3", name: "Alternative Construction Technologies & Materials",                maxNew: 3, maxExisting: "NA" },
    { id: "BMR Credit 4", name: "Alternate Wood-based Materials",                                   maxNew: 1, maxExisting: "NA" },
    { id: "BMR Credit 5", name: "Handling of Waste Materials, During Construction",                 maxNew: 1, maxExisting: "NA" },
  ]},
  { id: 5, title: "Health and Well-being", maxNew: 7, maxExisting: 5, criteria: [
    { id: "HWB MR 1",     name: "Minimum Fresh Air Ventilation",                                    maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "HWB MR 2",     name: "No Smoking Premises",                                              maxNew: "Mandatory", maxExisting: "Mandatory" },
    { id: "HWB Credit 1", name: "Daylighting",                                                      maxNew: 2, maxExisting: 2 },
    { id: "HWB Credit 2", name: "Low-emitting Materials",                                           maxNew: 1, maxExisting: "NA" },
    { id: "HWB Credit 3", name: "Eco-friendly Housekeeping Chemicals",                              maxNew: 1, maxExisting: 1 },
    { id: "HWB Credit 4", name: "Access to Quality Drinking Water",                                 maxNew: 1, maxExisting: 1 },
    { id: "HWB Credit 5", name: "Eco-friendly Refrigerants",                                        maxNew: 1, maxExisting: "NA" },
    { id: "HWB Credit 6", name: "Universal Design",                                                 maxNew: 1, maxExisting: 1 },
  ]},
  { id: 6, title: "Green Measures Beyond the Fence", maxNew: 4, maxExisting: 4, criteria: [
    { id: "GM Credit 1",  name: "Green Measures Beyond the Fence",                                  maxNew: 4, maxExisting: 4 },
  ]},
  { id: 7, title: "Innovation and Performance", maxNew: 6, maxExisting: 6, criteria: [
    { id: "IP Credit 1",  name: "Innovation in Design Process",                                     maxNew: 4, maxExisting: 4 },
    { id: "IP Credit 2",  name: "Water and Energy Performance",                                     maxNew: "NA", maxExisting: 1 },
    { id: "IP Credit 3",  name: "Green Measures Cost Analysis",                                     maxNew: 1, maxExisting: "NA" },
    { id: "IP Credit 4",  name: "IGBC Accredited Professional",                                     maxNew: 1, maxExisting: 1 },
  ]},
];

export function findIgbcCriterion(id: string) {
  for (const s of igbcSections) {
    const c = s.criteria.find(c => c.id === id);
    if (c) return { criterion: c, section: s };
  }
  return null;
}
