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
    id: 'heritage-conservation',
    title: 'Heritage Conservation',
    narrative:
      'The project team has undertaken measures for heritage conservation, preserving culturally or historically significant elements on or near the site, integrating them sensitively into the built environment.',
    requiredDocs:
      'Documentation of heritage elements identified on site; photographs; conservation methodology report; approval or NOC from the relevant heritage authority where applicable.',
  },
  {
    id: 'gender-neutral-toilets',
    title: 'Provision of Gender-Neutral Toilets',
    narrative:
      'The project provides gender-neutral toilet facilities accessible to all occupants irrespective of gender, promoting inclusivity and equitable access within the built environment.',
    requiredDocs:
      'Architectural drawings highlighting gender-neutral toilet locations; signage photographs or renders; narrative describing the inclusivity approach and number of gender-neutral fixtures provided.',
  },
  {
    id: 'sos-buttons',
    title: 'Safety Alert Buttons (Save Our Souls — SOS)',
    narrative:
      'The project has installed SOS safety alert buttons at strategic locations within the building, enabling occupants to raise immediate security or medical alerts, thereby enhancing personal safety and emergency response.',
    requiredDocs:
      'Floor plans showing SOS button locations; product specifications; evidence of integration with a security or monitoring system; maintenance and testing protocol.',
  },
  {
    id: 'air-quality-monitoring',
    title: 'Real-Time Air Quality Monitoring During Construction Phase',
    narrative:
      'The project team has deployed real-time air quality monitoring systems during the construction phase, continuously tracking particulate matter and other pollutants to protect workers and the surrounding community from construction-related air pollution.',
    requiredDocs:
      'Monitoring device specifications and placement plan on site; sample data logs or dashboard screenshots showing real-time readings; corrective action protocol triggered by threshold exceedances.',
  },
  {
    id: 'resilient-communities',
    title: 'Initiatives to Form Resilient and Sustainable Communities',
    narrative:
      'The project team has actively implemented community-building initiatives aimed at fostering resilience and sustainability, including programs that engage occupants and neighbours in sustainable practices, disaster preparedness, or social well-being.',
    requiredDocs:
      'Narrative description of community engagement programs or initiatives; photographs, brochures, or event records; evidence of outcomes or participation (e.g. attendance records, awareness campaigns).',
  },
  {
    id: 'zero-concrete-wastage',
    title: 'Zero Concrete Wastage Sites',
    narrative:
      'The project has adopted a zero concrete wastage policy during construction, ensuring all surplus concrete is reused, repurposed, or otherwise diverted from landfill, minimising construction waste and associated environmental impacts.',
    requiredDocs:
      'Waste management plan detailing concrete waste diversion strategy; site records or waste manifests showing quantity of surplus concrete and its reuse/disposal destination; photographs of on-site reuse or recycling.',
  },
  {
    id: 'epd-products',
    title: 'Use of Minimum 5 EPD Products',
    narrative:
      'The project has specified and installed a minimum of five products carrying a verified Environmental Product Declaration (EPD), demonstrating a commitment to transparency in embodied carbon and environmental impact of building materials.',
    requiredDocs:
      'List of EPD-certified products used with manufacturer names, product names, and EPD registration numbers; copies of EPDs or links to a recognised EPD database; material schedule showing quantities and application areas.',
  },
  {
    id: 'net-positive-performance',
    title: 'Dynamic Performance / Net Positive Energy or Water',
    narrative:
      'The project achieves dynamic net positive performance, generating more energy or harvesting more water than it consumes over the course of a year, thereby contributing a surplus back to the grid or local supply.',
    requiredDocs:
      'Annual energy or water balance calculations demonstrating net positive status; renewable energy generation or rainwater harvesting calculations; utility data or metering agreement confirming surplus export or supply.',
  },
  {
    id: 'griha-cp',
    title: 'GRIHA-Certified Professional / GRIHA Evaluator Involvement',
    narrative:
      'A GRIHA-Certified Professional (CP) or GRIHA Evaluator has been actively involved in the project from commencement to completion, providing expert guidance to ensure the project meets GRIHA sustainability objectives at every stage.',
    requiredDocs:
      'GRIHA CP or evaluator certificate; appointment letter or engagement agreement; role description clarifying involvement from project commencement to completion; evidence of participation at key milestones.',
  },
  {
    id: 'hfc-free',
    title: 'HFC-Free Insulation and Refrigerant',
    narrative:
      'The project has specified HFC-free insulation materials and refrigerants throughout, eliminating high global warming potential hydrofluorocarbons from the building\'s mechanical systems and fabric, in line with best practices for climate impact reduction.',
    requiredDocs:
      'Equipment specifications confirming HFC-free refrigerants (e.g. natural refrigerants — ammonia, CO₂, hydrocarbons); insulation product data sheets confirming HFC-free blowing agents; MSDS or environmental compliance declaration.',
  },
  {
    id: 'liveability-index',
    title: 'Liveability Index',
    narrative:
      'The project team has implemented green area strategies to achieve a Liveability Index of ≥ 9 m² of green space per capita, providing adequate tree canopy and shrub cover relative to the building\'s fixed occupancy, enhancing the well-being of occupants.',
    requiredDocs:
      'Calculation showing fixed occupancy, tree canopy area (m²), shrub bed area (m²), and the resulting liveability index value with comparison to the benchmark of 9 m²/person; landscape plan highlighting counted green areas.',
    hasCalculator: true,
  },
  {
    id: 'water-factor-limit',
    title: 'Water Factor Limit for Clothes and Dishes',
    narrative:
      'The project has installed water-efficient washing equipment meeting the prescribed water factor limits — dishwashers consuming less than 24.6 litres per cycle and clothes washers consuming less than 35.96 litres per cycle per cubic foot — reducing potable water consumption from laundry and kitchen operations.',
    requiredDocs:
      'Equipment specifications or cut sheets confirming water consumption per cycle for all dishwashers and clothes washers installed; product data sheets or manufacturer brochures supporting the claimed water factor values.',
    hasCalculator: true,
  },
  {
    id: 'other-innovative',
    title: 'Any Other Innovative Strategy',
    narrative:
      'The project team has implemented an innovative strategy beyond the standard GRIHA requirements, contributing to sustainability, occupant well-being, or resource efficiency in a manner not otherwise captured by the rating system.',
    requiredDocs:
      'Detailed narrative describing the innovative strategy, its objectives, and outcomes; supporting technical documentation, calculations, photographs, or third-party verification as appropriate to the nature of the innovation.',
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
