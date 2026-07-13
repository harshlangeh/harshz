const fs = require('fs');

const icons = ['Leaf', 'Wind', 'Sun', 'Droplets', 'Trees', 'Sprout', 'Recycle', 'Battery', 'Zap', 'Waves'];
const themes = [
  "Energy Efficiency", "Water Conservation", "Renewable Energy", "Waste Reduction", 
  "Sustainable Materials", "Indoor Air Quality", "Biodiversity", "Carbon Footprint",
  "Green Transportation", "Thermal Comfort"
];

const facts = [];
for (let i = 1; i <= 366; i++) {
  const icon = icons[i % icons.length];
  const theme = themes[i % themes.length];
  facts.push(`  {
    day: ${i},
    icon: '${icon}',
    title: '${theme} Day',
    description: 'Day ${i}: A focus on improving ${theme.toLowerCase()} for a greener future.'
  }`);
}

const content = `// Auto-generated 365 days of sustainability facts
import { Leaf, Wind, Sun, Droplets, Trees, Sprout, Recycle, Battery, Zap, Waves } from 'lucide-react';

export const iconMap: Record<string, any> = {
  Leaf, Wind, Sun, Droplets, Trees, Sprout, Recycle, Battery, Zap, Waves
};

export const sustainabilityDays = [
${facts.join(',\n')}
];
`;

fs.mkdirSync('./src/data', { recursive: true });
fs.writeFileSync('./src/data/sustainability.ts', content);
console.log('Successfully generated 365 days of facts.');
