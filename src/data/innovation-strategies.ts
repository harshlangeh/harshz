export interface InnovationStrategy {
  id: string;
  title: string;
  /** Narrative paragraph beginning "The project team has …" */
  narrative: string;
  /** Description of required documentation to attach */
  requiredDocs: string;
  /** Whether a dedicated calculator panel is available for this strategy */
  hasCalculator?: boolean;
}

export const INNOVATION_STRATEGIES: InnovationStrategy[] = [
  {
    id: 'liveability-index',
    title: 'Liveability Index',
    narrative:
      'The project team has implemented green area strategies to achieve a Liveability Index of ≥ 9 m²/person, providing adequate green cover relative to the building\'s fixed occupancy.',
    requiredDocs:
      'Calculation showing fixed occupancy, tree canopy area, shrub area, and the resulting liveability index value with reference to the benchmark of 9 m²/person.',
    hasCalculator: true,
  },
  {
    id: 'organic-architecture',
    title: 'Organic Architecture',
    narrative:
      'The project team has incorporated organic architecture elements inspired by nature, integrating natural forms, materials, and patterns into the built environment to create harmony between the structure and its surroundings.',
    requiredDocs:
      'Architectural drawings, renders, and photographs showing organic design features; narrative description explaining the organic architecture philosophy adopted for the project.',
  },
  {
    id: 'natural-ventilation',
    title: 'Naturally Ventilated Design',
    narrative:
      'The project has been designed to maximise natural ventilation, reducing reliance on mechanical cooling systems and improving occupant comfort through passive airflow strategies.',
    requiredDocs:
      'Architectural sections and floor plans showing the ventilation strategy; CFD analysis or ventilation simulation report demonstrating the effectiveness of natural ventilation across critical spaces.',
  },
  {
    id: 'innovative-wastewater',
    title: 'Innovative Wastewater Treatment Technique',
    narrative:
      'The project team has implemented an innovative wastewater treatment technique beyond standard requirements, adopting advanced or nature-based solutions for improved effluent quality and resource recovery.',
    requiredDocs:
      'Technical drawings showing the treatment system layout; process flow diagram; performance data or design specifications confirming treatment capacity and output quality.',
  },
  {
    id: 'smart-transportation',
    title: 'Smart Transportation',
    narrative:
      'The project incorporates smart transportation strategies, including provisions for electric vehicles, cycling infrastructure, and/or real-time transit information systems, to promote sustainable mobility for building occupants.',
    requiredDocs:
      'Site plan and drawings highlighting transportation facilities; photographs or renders of smart mobility infrastructure; relevant policies or agreements for shared mobility services if applicable.',
  },
  {
    id: 'waste-to-art',
    title: 'Waste to Art / Design',
    narrative:
      'The project team has creatively repurposed waste materials — from construction or other sources — into art installations or functional design elements within the project, demonstrating a commitment to circular economy principles.',
    requiredDocs:
      'Photographs of waste-to-art installations; documentation of material origin and type of waste used; narrative explaining the design intent and the quantity/type of waste diverted from landfill.',
  },
  {
    id: 'net-zero-water',
    title: 'Net Zero Water',
    narrative:
      'The project achieves net zero water consumption by harvesting, treating, and recycling water on-site, ensuring that total water demand is met entirely through on-site renewable water sources.',
    requiredDocs:
      'Water balance calculation demonstrating net zero status; drawings of rainwater harvesting, storage, and treatment systems; quality test reports for recycled water.',
  },
  {
    id: 'net-zero-energy',
    title: 'Net Zero Energy',
    narrative:
      'The project achieves net zero energy consumption by generating an equivalent amount of energy from on-site renewable sources as is consumed annually, resulting in zero net energy import from the grid.',
    requiredDocs:
      'Energy simulation report showing annual energy consumption; renewable energy generation calculations; drawings of solar PV or other renewable energy systems; utility or net metering agreement if applicable.',
  },
  {
    id: 'ev-charging',
    title: 'Electric Vehicle Charging',
    narrative:
      'The project provides EV charging infrastructure for a significant proportion of parking spaces, supporting the transition to electric mobility and reducing transportation-related carbon emissions.',
    requiredDocs:
      'Site plan and parking layout drawings indicating EV charging locations; equipment specifications; calculation of the percentage of parking spaces served by EV charging points.',
  },
  {
    id: 'biodegradable-products',
    title: 'Use of Biodegradable Products',
    narrative:
      'The project team has specified biodegradable and eco-labelled products for construction materials and interior finishes, reducing the environmental footprint of the building over its lifecycle.',
    requiredDocs:
      'Product specifications and data sheets confirming biodegradable or eco-labelled properties; eco-label certificates (e.g. Green Label, EPD); material schedules showing quantity and application areas.',
  },
  {
    id: 'prefab-construction',
    title: 'Pre-fab / Modular Construction',
    narrative:
      'The project has utilised prefabricated or modular construction techniques, significantly reducing on-site construction waste, construction time, and associated environmental impacts.',
    requiredDocs:
      'Construction drawings showing prefabricated elements; fabrication details and assembly methodology; waste reduction calculation comparing prefabricated vs. conventional construction.',
  },
  {
    id: 'washing-equipment',
    title: 'Washing Equipment Conservation',
    narrative:
      'The project has installed water-efficient washing equipment, with dishwashers consuming less than 24.6 litres per cycle and clothes washers consuming less than 35.96 litres per cycle per cubic foot, reducing water use from laundry and kitchen operations.',
    requiredDocs:
      'Equipment specifications or cut sheets confirming water consumption per cycle for all dishwashers and clothes washers; product data sheets or manufacturer brochures supporting the claim.',
    hasCalculator: true,
  },
  {
    id: 'high-performance-facade',
    title: 'High Performance and Low Maintenance Facade',
    narrative:
      'The project has implemented a high-performance facade system designed for durability, thermal efficiency, and minimal maintenance, reducing long-term operational costs and environmental impact.',
    requiredDocs:
      'Facade specifications including U-values, SHGC, and material properties; maintenance schedule document; performance calculations or simulation demonstrating thermal and energy performance of the facade system.',
  },
];

/** Auto-generates a numbered HTML narrative from the selected strategy IDs. */
export function buildInnovationNarrativeHtml(selectedIds: string[]): string {
  const selected = INNOVATION_STRATEGIES.filter(s => selectedIds.includes(s.id));
  if (selected.length === 0) return '';
  return selected
    .map(
      (s, i) =>
        `<p><strong>${i + 1}. ${s.title}</strong></p>` +
        `<p>${s.narrative} Please find attached the details/calculations/photographs below:</p>` +
        `<p><em>${s.requiredDocs}</em></p>`,
    )
    .join('\n');
}
