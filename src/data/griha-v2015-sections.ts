export interface V2015Criterion {
  id: number;
  name: string;
  max: number;
}

export interface V2015Section {
  id: number;
  title: string;
  max: number;
  criteria: V2015Criterion[];
}

export const v2015Sections: V2015Section[] = [
  { id: 1, title: "Site Planning", max: 8, criteria: [
    { id: 1,  name: "Site Selection", max: 1 },
    { id: 2,  name: "Low-impact design", max: 4 },
    { id: 3,  name: "Design to mitigate UHIE", max: 2 },
    { id: 4,  name: "Site Imperviousness Factor", max: 1 },
  ]},
  { id: 2, title: "Construction Management", max: 9, criteria: [
    { id: 5,  name: "Air and water pollution control", max: 1 },
    { id: 6,  name: "Preserve and protect landscape during construction", max: 4 },
    { id: 7,  name: "Construction Management Practices", max: 4 },
  ]},
  { id: 3, title: "Energy", max: 20, criteria: [
    { id: 8,  name: "Energy efficiency", max: 13 },
    { id: 9,  name: "Renewable energy utilization", max: 7 },
    { id: 10, name: "Zero ODP materials", max: 0 },
  ]},
  { id: 4, title: "Occupant Comfort and Well Being", max: 12, criteria: [
    { id: 11, name: "Achieving indoor comfort requirements (visual/thermal/acoustic)", max: 6 },
    { id: 12, name: "Maintaining good IAQ", max: 4 },
    { id: 13, name: "Use of low-VOC paints and other compounds in building interiors", max: 2 },
  ]},
  { id: 5, title: "Water", max: 17, criteria: [
    { id: 14, name: "Use of low-flow fixtures and systems", max: 4 },
    { id: 15, name: "Reducing landscape water demand", max: 4 },
    { id: 16, name: "Water Quality", max: 2 },
    { id: 17, name: "On-site water reuse", max: 5 },
    { id: 18, name: "Rainwater Recharge", max: 2 },
  ]},
  { id: 6, title: "Sustainable Building Materials", max: 14, criteria: [
    { id: 19, name: "Utilization of BIS recommended waste materials in building structure", max: 6 },
    { id: 20, name: "Reduction in embodied energy of building structure", max: 4 },
    { id: 21, name: "Use of low-environmental impact materials in building interiors", max: 4 },
  ]},
  { id: 7, title: "Solid Waste Management", max: 6, criteria: [
    { id: 22, name: "Avoided post-construction landfill", max: 4 },
    { id: 23, name: "Treat organic waste on site", max: 2 },
  ]},
  { id: 8, title: "Socio-Economic Strategies", max: 6, criteria: [
    { id: 24, name: "Labour safety and sanitation", max: 1 },
    { id: 25, name: "Design for Universal Accessibility", max: 2 },
    { id: 26, name: "Dedicated facilities for service staff", max: 2 },
    { id: 27, name: "Increase in environmental awareness", max: 1 },
  ]},
  { id: 9, title: "Performance Monitoring and Validation", max: 8, criteria: [
    { id: 28, name: "Smart metering and monitoring", max: 8 },
    { id: 29, name: "Operation, Maintenance Protocols", max: 0 },
    { id: 30, name: "Performance Assessment for Final Rating", max: 0 },
  ]},
  { id: 10, title: "Innovation", max: 4, criteria: [
    { id: 31, name: "Innovation", max: 4 },
  ]},
];

export function findV2015Criterion(id: number) {
  for (const s of v2015Sections) {
    const c = s.criteria.find(c => c.id === id);
    if (c) return { criterion: c, section: s };
  }
  return null;
}
