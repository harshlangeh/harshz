export type CriterionType = 'Mandatory' | 'Partly Mandatory' | 'Optional';

export interface V2019Criterion {
  id: number;
  name: string;
  max: number;
  type: CriterionType;
}

export interface V2019Section {
  id: number;
  title: string;
  max: number;
  criteria: V2019Criterion[];
}

export const v2019Sections: V2019Section[] = [
  { id: 1, title: "Sustainable Site Planning", max: 12, criteria: [
    { id: 1,  name: "Green Infrastructure", max: 5, type: "Partly Mandatory" },
    { id: 2,  name: "Low Impact Design Strategies", max: 5, type: "Optional" },
    { id: 3,  name: "Design to Mitigate UHIE", max: 2, type: "Optional" },
  ]},
  { id: 2, title: "Construction Management", max: 4, criteria: [
    { id: 4,  name: "Air and Soil Pollution Control", max: 1, type: "Partly Mandatory" },
    { id: 5,  name: "Topsoil Preservation", max: 1, type: "Optional" },
    { id: 6,  name: "Construction Management Practices", max: 2, type: "Partly Mandatory" },
  ]},
  { id: 3, title: "Energy Optimization", max: 18, criteria: [
    { id: 7,  name: "Energy Optimization", max: 12, type: "Partly Mandatory" },
    { id: 8,  name: "Renewable Energy Utilization", max: 5, type: "Partly Mandatory" },
    { id: 9,  name: "Low ODP and GWP Materials", max: 1, type: "Partly Mandatory" },
  ]},
  { id: 4, title: "Occupant Comfort", max: 12, criteria: [
    { id: 10, name: "Visual Comfort", max: 4, type: "Partly Mandatory" },
    { id: 11, name: "Thermal and Acoustic Comfort", max: 2, type: "Partly Mandatory" },
    { id: 12, name: "Indoor Air Quality", max: 6, type: "Partly Mandatory" },
  ]},
  { id: 5, title: "Water Management", max: 16, criteria: [
    { id: 13, name: "Water Demand Reduction", max: 4, type: "Partly Mandatory" },
    { id: 14, name: "Wastewater Treatment", max: 2, type: "Optional" },
    { id: 15, name: "Rainwater Management", max: 5, type: "Optional" },
    { id: 16, name: "Water Quality and Self-Sufficiency", max: 5, type: "Partly Mandatory" },
  ]},
  { id: 6, title: "Solid Waste Management", max: 6, criteria: [
    { id: 17, name: "Waste Management – Post Occupancy", max: 4, type: "Partly Mandatory" },
    { id: 18, name: "Organic Waste Treatment", max: 2, type: "Optional" },
  ]},
  { id: 7, title: "Sustainable Building Materials", max: 12, criteria: [
    { id: 19, name: "Utilization of Alternative Materials in Building", max: 5, type: "Optional" },
    { id: 20, name: "Reduction in Global Warming Potential through Life Cycle Assessment", max: 5, type: "Optional" },
    { id: 21, name: "Alternative Materials for External Site Development", max: 2, type: "Optional" },
  ]},
  { id: 8, title: "Life Cycle Costing", max: 5, criteria: [
    { id: 22, name: "Life Cycle Cost Analysis", max: 5, type: "Optional" },
  ]},
  { id: 9, title: "Socio-Economic Strategies", max: 8, criteria: [
    { id: 23, name: "Safety and Sanitation for Construction Workers", max: 1, type: "Partly Mandatory" },
    { id: 24, name: "Universal Accessibility", max: 2, type: "Optional" },
    { id: 25, name: "Dedicated Facilities for Service Staff", max: 2, type: "Optional" },
    { id: 26, name: "Positive Social Impact", max: 3, type: "Partly Mandatory" },
  ]},
  { id: 10, title: "Performance Metering and Monitoring", max: 7, criteria: [
    { id: 27, name: "Project Commissioning", max: 0, type: "Mandatory" },
    { id: 28, name: "Smart Metering and Monitoring", max: 7, type: "Partly Mandatory" },
    { id: 29, name: "Operation and Maintenance Protocol", max: 0, type: "Mandatory" },
  ]},
  { id: 11, title: "Innovation", max: 5, criteria: [
    { id: 30, name: "Innovation", max: 5, type: "Optional" },
  ]},
];

export function findV2019Criterion(id: number) {
  for (const s of v2019Sections) {
    const c = s.criteria.find(c => c.id === id);
    if (c) return { criterion: c, section: s };
  }
  return null;
}
