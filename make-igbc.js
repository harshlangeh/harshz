const fs = require('fs');
const path = require('path');

const data = [
  {
    id: 1, title: "Site Planning and Design", maxNew: 7, maxExisting: 7,
    criteria: [
      { id: 'SPD MR 1', name: "Local Building Regulations", maxNew: 'Mandatory', maxExisting: 'Mandatory' },
      { id: 'SPD Credit 1', name: "Erosion and Sedimentation Control", maxNew: 1, maxExisting: 1 },
      { id: 'SPD Credit 2', name: "Sustainable Landscape", maxNew: 3, maxExisting: 3 },
      { id: 'SPD Credit 3', name: "Heat Island Reduction, Non-roof and Roof", maxNew: 2, maxExisting: 2 },
      { id: 'SPD Credit 4', name: "Green Education", maxNew: 1, maxExisting: 1 }
    ]
  },
  {
    id: 2, title: "Water Conservation", maxNew: 8, maxExisting: 7,
    criteria: [
      { id: 'WC MR 1', name: "Rainwater Harvesting, Roof", maxNew: 'Mandatory', maxExisting: 'Mandatory' },
      { id: 'WC MR 2', name: "Water Efficient Plumbing Fixtures", maxNew: 'Mandatory', maxExisting: 'Mandatory' },
      { id: 'WC Credit 1', name: "Rainwater Harvesting, Roof", maxNew: 4, maxExisting: 3 },
      { id: 'WC Credit 2', name: "Water Efficient Plumbing Fixtures", maxNew: 3, maxExisting: 3 },
      { id: 'WC Credit 3', name: "Water Metering", maxNew: 1, maxExisting: 1 }
    ]
  },
  {
    id: 3, title: "Energy Efficiency", maxNew: 20, maxExisting: 20,
    criteria: [
      { id: 'EE MR 1', name: "Minimum Energy Efficiency", maxNew: 'Mandatory', maxExisting: 'Mandatory' },
      { id: 'EE Credit 1', name: "Passive Architecture", maxNew: 3, maxExisting: 3 },
      { id: 'EE Credit 2', name: "Enhanced Energy Efficiency", maxNew: 10, maxExisting: 10 },
      { id: 'EE Credit 3', name: "On-site Renewable Energy", maxNew: 5, maxExisting: 5 },
      { id: 'EE Credit 4', name: "Energy Saving Appliances", maxNew: 1, maxExisting: 1 },
      { id: 'EE Credit 5', name: "Energy Metering", maxNew: 1, maxExisting: 1 }
    ]
  },
  {
    id: 4, title: "Building Materials and Resources", maxNew: 8, maxExisting: 1,
    criteria: [
      { id: 'BMR MR 1', name: "Segregation of Waste, Post-occupancy", maxNew: 'Mandatory', maxExisting: 'Mandatory' },
      { id: 'BMR Credit 1', name: "Green Procurement Policy", maxNew: 'NA', maxExisting: 1 },
      { id: 'BMR Credit 2', name: "Use of Eco-labelled Building Materials, Products & Equipment", maxNew: 3, maxExisting: 'NA' },
      { id: 'BMR Credit 3', name: "Alternative Construction Technologies & Materials", maxNew: 3, maxExisting: 'NA' },
      { id: 'BMR Credit 4', name: "Alternate Wood-based Materials", maxNew: 1, maxExisting: 'NA' },
      { id: 'BMR Credit 5', name: "Handling of Waste Materials, During Construction", maxNew: 1, maxExisting: 'NA' }
    ]
  },
  {
    id: 5, title: "Health and Well-being", maxNew: 7, maxExisting: 5,
    criteria: [
      { id: 'HWB MR 1', name: "Minimum Fresh Air Ventilation", maxNew: 'Mandatory', maxExisting: 'Mandatory' },
      { id: 'HWB MR 2', name: "No Smoking Premises", maxNew: 'Mandatory', maxExisting: 'Mandatory' },
      { id: 'HWB Credit 1', name: "Daylighting", maxNew: 2, maxExisting: 2 },
      { id: 'HWB Credit 2', name: "Low-emitting Materials", maxNew: 1, maxExisting: 'NA' },
      { id: 'HWB Credit 3', name: "Eco-friendly Housekeeping Chemicals", maxNew: 1, maxExisting: 1 },
      { id: 'HWB Credit 4', name: "Access to Quality Drinking Water", maxNew: 1, maxExisting: 1 },
      { id: 'HWB Credit 5', name: "Eco-friendly Refrigerants", maxNew: 1, maxExisting: 'NA' },
      { id: 'HWB Credit 6', name: "Universal Design", maxNew: 1, maxExisting: 1 }
    ]
  },
  {
    id: 6, title: "Green Measures Beyond the Fence", maxNew: 4, maxExisting: 4,
    criteria: [
      { id: 'GM Credit 1', name: "Green Measures Beyond the Fence", maxNew: 4, maxExisting: 4 }
    ]
  },
  {
    id: 7, title: "Innovation and Performance", maxNew: 6, maxExisting: 6,
    criteria: [
      { id: 'IP Credit 1', name: "Innovation in Design Process", maxNew: 4, maxExisting: 4 },
      { id: 'IP Credit 2', name: "Water and Energy Performance", maxNew: 'NA', maxExisting: 1 },
      { id: 'IP Credit 3', name: "Green Measures Cost Analysis", maxNew: 1, maxExisting: 'NA' },
      { id: 'IP Credit 4', name: "IGBC Accredited Professional", maxNew: 1, maxExisting: 1 }
    ]
  }
];

const componentCode = `
"use client";
import React, { useState } from 'react';
import { Award } from 'lucide-react';

const sections = ${JSON.stringify(data, null, 2)};

export default function IgbcSb2020Page() {
  const [buildingType, setBuildingType] = useState('New'); // 'New' or 'Existing'
  const [scores, setScores] = useState({});

  const handleScoreChange = (id, value, max) => {
    let num = parseInt(value);
    if (isNaN(num)) num = 0;
    if (num > max) num = max;
    if (num < 0) num = 0;
    
    setScores(prev => ({ ...prev, [id]: num }));
  };

  const getSectionTotal = (section) => {
    return section.criteria.reduce((sum, c) => {
      const max = buildingType === 'New' ? c.maxNew : c.maxExisting;
      if (max === 'NA' || max === 'Mandatory') return sum;
      return sum + (scores[c.id] || 0);
    }, 0);
  };

  const grandTotal = sections.reduce((sum, section) => sum + getSectionTotal(section), 0);
  const maxGrandTotal = buildingType === 'New' ? 60 : 50;

  const renderSection = (section) => (
    <React.Fragment key={section.id}>
      <tr className="bg-silver font-bold">
        <td colSpan={2} className="py-3 px-4">{section.id}. {section.title}</td>
        <td className="py-3 px-4 text-center">{buildingType === 'New' ? section.maxNew : section.maxExisting}</td>
        <td className="py-3 px-4 text-center text-igbc-blue">{getSectionTotal(section)}</td>
      </tr>
      {section.criteria.map(c => {
        const max = buildingType === 'New' ? c.maxNew : c.maxExisting;
        const isNA = max === 'NA';
        const isMandatory = max === 'Mandatory';
        
        return (
          <tr key={c.id} className={\`border-b transition-colors hover:bg-white-5 \${isMandatory ? 'bg-dark-rose' : ''} \${isNA ? 'opacity-50' : ''}\`}>
            <td className="py-3 px-4 text-center">{c.id}</td>
            <td className="py-3 px-4">{c.name}</td>
            <td className="py-3 px-4 text-center font-bold">{max}</td>
            <td className="py-3 px-4 text-center">
              {!isNA && !isMandatory ? (
                <input 
                  type="number" 
                  min="0" 
                  max={max}
                  value={scores[c.id] || ''}
                  onChange={(e) => handleScoreChange(c.id, e.target.value, max)}
                  className="glass-input focus-ring-igbc-blue text-center"
                  placeholder="0"
                />
              ) : (
                <span className="text-white/30">-</span>
              )}
            </td>
          </tr>
        );
      })}
    </React.Fragment>
  );

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-6 text-center text-igbc-blue">
        IGBC Green Service Buildings 2020
      </h1>
      
      <div className="flex justify-center gap-4 mb-10">
        <button 
          onClick={() => { setBuildingType('New'); setScores({}); }}
          className={\`px-6 py-2 rounded-full border transition-all \${buildingType === 'New' ? 'bg-igbc-blue text-white border-igbc-blue' : 'bg-transparent border-white/20 text-white/70 hover:bg-white/5'}\`}
        >
          New Buildings
        </button>
        <button 
          onClick={() => { setBuildingType('Existing'); setScores({}); }}
          className={\`px-6 py-2 rounded-full border transition-all \${buildingType === 'Existing' ? 'bg-igbc-blue text-white border-igbc-blue' : 'bg-transparent border-white/20 text-white/70 hover:bg-white/5'}\`}
        >
          Existing Buildings
        </button>
      </div>
      
      <div className="glass-card p-8 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-igbc-blue text-white">
              <th className="p-4 text-center rounded-tl-lg">No.</th>
              <th className="p-4">Criterion Name</th>
              <th className="p-4 text-center">Max Pts</th>
              <th className="p-4 text-center rounded-tr-lg">Target Points</th>
            </tr>
          </thead>
          <tbody>
            {sections.map(renderSection)}
            <tr className="font-bold text-lg bg-white-5 border-t border-white/20">
              <td colSpan={2} className="p-4 text-right">GRAND TOTAL</td>
              <td className="p-4 text-center">{maxGrandTotal}</td>
              <td className="p-4 text-center text-igbc-blue text-xl">{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="glass-card p-8 mt-10 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-6 text-igbc-blue">Certification Levels</h2>
        <table className="w-full border-collapse text-left text-lg">
          <thead>
            <tr className="bg-igbc-blue text-white">
              <th className="p-4 rounded-tl-lg">Certification Level</th>
              <th className="p-4 rounded-tr-lg">Thresholds ({buildingType})</th>
            </tr>
          </thead>
          <tbody>
            {buildingType === 'New' ? (
              <>
                <tr className={\`border-b transition-colors \${grandTotal >= 30 && grandTotal <= 35 ? 'bg-igbc-blue-10 border-l-4 border-l-igbc-blue' : 'hover:bg-white-5'}\`}>
                  <td className="p-4 flex items-center gap-2"><Award className={\`\${grandTotal >= 30 && grandTotal <= 35 ? "text-igbc-blue glow-igbc-blue" : "text-white/20"}\`}/> Certified</td>
                  <td className="p-4">30 - 35</td>
                </tr>
                <tr className={\`border-b transition-colors \${grandTotal >= 36 && grandTotal <= 41 ? 'bg-igbc-blue-10 border-l-4 border-l-igbc-blue' : 'hover:bg-white-5'}\`}>
                  <td className="p-4 flex items-center gap-2"><Award className={\`\${grandTotal >= 36 && grandTotal <= 41 ? "text-igbc-blue glow-igbc-blue" : "text-white/20"}\`}/> Silver</td>
                  <td className="p-4">36 - 41</td>
                </tr>
                <tr className={\`border-b transition-colors \${grandTotal >= 42 && grandTotal <= 50 ? 'bg-igbc-blue-10 border-l-4 border-l-igbc-blue' : 'hover:bg-white-5'}\`}>
                  <td className="p-4 flex items-center gap-2"><Award className={\`\${grandTotal >= 42 && grandTotal <= 50 ? "text-igbc-blue glow-igbc-blue" : "text-white/20"}\`}/> Gold</td>
                  <td className="p-4">42 - 50</td>
                </tr>
                <tr className={\`transition-colors \${grandTotal >= 51 ? 'bg-igbc-blue-10 border-l-4 border-l-igbc-blue' : 'hover:bg-white-5'}\`}>
                  <td className="p-4 flex items-center gap-2"><Award className={\`\${grandTotal >= 51 ? "text-igbc-blue glow-igbc-blue" : "text-white/20"}\`}/> Platinum</td>
                  <td className="p-4">51 - 60</td>
                </tr>
              </>
            ) : (
              <>
                <tr className={\`border-b transition-colors \${grandTotal >= 25 && grandTotal <= 29 ? 'bg-igbc-blue-10 border-l-4 border-l-igbc-blue' : 'hover:bg-white-5'}\`}>
                  <td className="p-4 flex items-center gap-2"><Award className={\`\${grandTotal >= 25 && grandTotal <= 29 ? "text-igbc-blue glow-igbc-blue" : "text-white/20"}\`}/> Certified</td>
                  <td className="p-4">25 - 29</td>
                </tr>
                <tr className={\`border-b transition-colors \${grandTotal >= 30 && grandTotal <= 34 ? 'bg-igbc-blue-10 border-l-4 border-l-igbc-blue' : 'hover:bg-white-5'}\`}>
                  <td className="p-4 flex items-center gap-2"><Award className={\`\${grandTotal >= 30 && grandTotal <= 34 ? "text-igbc-blue glow-igbc-blue" : "text-white/20"}\`}/> Silver</td>
                  <td className="p-4">30 - 34</td>
                </tr>
                <tr className={\`border-b transition-colors \${grandTotal >= 35 && grandTotal <= 42 ? 'bg-igbc-blue-10 border-l-4 border-l-igbc-blue' : 'hover:bg-white-5'}\`}>
                  <td className="p-4 flex items-center gap-2"><Award className={\`\${grandTotal >= 35 && grandTotal <= 42 ? "text-igbc-blue glow-igbc-blue" : "text-white/20"}\`}/> Gold</td>
                  <td className="p-4">35 - 42</td>
                </tr>
                <tr className={\`transition-colors \${grandTotal >= 43 ? 'bg-igbc-blue-10 border-l-4 border-l-igbc-blue' : 'hover:bg-white-5'}\`}>
                  <td className="p-4 flex items-center gap-2"><Award className={\`\${grandTotal >= 43 ? "text-igbc-blue glow-igbc-blue" : "text-white/20"}\`}/> Platinum</td>
                  <td className="p-4">43 - 50</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;

const dir = 'src/app/igbc-sb-2020';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}
fs.writeFileSync(path.join(dir, 'page.tsx'), componentCode.trim());
console.log('IGBC SB 2020 checklist generated.');
