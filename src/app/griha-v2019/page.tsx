"use client";
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const sections = [
  {
    "id": 1,
    "title": "Sustainable Site Planning",
    "max": 12,
    "criteria": [
      {
        "id": 1,
        "name": "Green Infrastructure",
        "max": 5,
        "type": "Partly Mandatory"
      },
      {
        "id": 2,
        "name": "Low Impact Design Strategies",
        "max": 5,
        "type": "Optional"
      },
      {
        "id": 3,
        "name": "Design to Mitigate UHIE",
        "max": 2,
        "type": "Optional"
      }
    ]
  },
  {
    "id": 2,
    "title": "Construction Management",
    "max": 4,
    "criteria": [
      {
        "id": 4,
        "name": "Air and Soil Pollution Control",
        "max": 1,
        "type": "Partly Mandatory"
      },
      {
        "id": 5,
        "name": "Topsoil Preservation",
        "max": 1,
        "type": "Optional"
      },
      {
        "id": 6,
        "name": "Construction Management Practices",
        "max": 2,
        "type": "Partly Mandatory"
      }
    ]
  },
  {
    "id": 3,
    "title": "Energy Optimization",
    "max": 18,
    "criteria": [
      {
        "id": 7,
        "name": "Energy Optimization",
        "max": 12,
        "type": "Partly Mandatory"
      },
      {
        "id": 8,
        "name": "Renewable Energy Utilization",
        "max": 5,
        "type": "Partly Mandatory"
      },
      {
        "id": 9,
        "name": "Low ODP and GWP Materials",
        "max": 1,
        "type": "Partly Mandatory"
      }
    ]
  },
  {
    "id": 4,
    "title": "Occupant Comfort",
    "max": 12,
    "criteria": [
      {
        "id": 10,
        "name": "Visual Comfort",
        "max": 4,
        "type": "Partly Mandatory"
      },
      {
        "id": 11,
        "name": "Thermal and Acoustic Comfort",
        "max": 2,
        "type": "Partly Mandatory"
      },
      {
        "id": 12,
        "name": "Indoor Air Quality",
        "max": 6,
        "type": "Partly Mandatory"
      }
    ]
  },
  {
    "id": 5,
    "title": "Water Management",
    "max": 16,
    "criteria": [
      {
        "id": 13,
        "name": "Water Demand Reduction",
        "max": 4,
        "type": "Partly Mandatory"
      },
      {
        "id": 14,
        "name": "Wastewater Treatment",
        "max": 2,
        "type": "Optional"
      },
      {
        "id": 15,
        "name": "Rainwater Management",
        "max": 5,
        "type": "Optional"
      },
      {
        "id": 16,
        "name": "Water Quality and Self-Sufficiency",
        "max": 5,
        "type": "Partly Mandatory"
      }
    ]
  },
  {
    "id": 6,
    "title": "Solid Waste Management",
    "max": 6,
    "criteria": [
      {
        "id": 17,
        "name": "Waste Management – Post Occupancy",
        "max": 4,
        "type": "Partly Mandatory"
      },
      {
        "id": 18,
        "name": "Organic Waste Treatment",
        "max": 2,
        "type": "Optional"
      }
    ]
  },
  {
    "id": 7,
    "title": "Sustainable Building Materials",
    "max": 12,
    "criteria": [
      {
        "id": 19,
        "name": "Utilization of Alternative Materials in Building",
        "max": 5,
        "type": "Optional"
      },
      {
        "id": 20,
        "name": "Reduction in Global Warming Potential through Life Cycle Assessment",
        "max": 5,
        "type": "Optional"
      },
      {
        "id": 21,
        "name": "Alternative Materials for External Site Development",
        "max": 2,
        "type": "Optional"
      }
    ]
  },
  {
    "id": 8,
    "title": "Life Cycle Costing",
    "max": 5,
    "criteria": [
      {
        "id": 22,
        "name": "Life Cycle Cost Analysis",
        "max": 5,
        "type": "Optional"
      }
    ]
  },
  {
    "id": 9,
    "title": "Socio-Economic Strategies",
    "max": 8,
    "criteria": [
      {
        "id": 23,
        "name": "Safety and Sanitation for Construction Workers",
        "max": 1,
        "type": "Partly Mandatory"
      },
      {
        "id": 24,
        "name": "Universal Accessibility",
        "max": 2,
        "type": "Optional"
      },
      {
        "id": 25,
        "name": "Dedicated Facilities for Service Staff",
        "max": 2,
        "type": "Optional"
      },
      {
        "id": 26,
        "name": "Positive Social Impact",
        "max": 3,
        "type": "Partly Mandatory"
      }
    ]
  },
  {
    "id": 10,
    "title": "Performance Metering and Monitoring",
    "max": 7,
    "criteria": [
      {
        "id": 27,
        "name": "Project Commissioning",
        "max": 0,
        "type": "Mandatory"
      },
      {
        "id": 28,
        "name": "Smart Metering and Monitoring",
        "max": 7,
        "type": "Partly Mandatory"
      },
      {
        "id": 29,
        "name": "Operation and Maintenance Protocol",
        "max": 0,
        "type": "Mandatory"
      }
    ]
  },
  {
    "id": 11,
    "title": "Innovation",
    "max": 5,
    "criteria": [
      {
        "id": 30,
        "name": "Innovation",
        "max": 5,
        "type": "Optional"
      }
    ]
  }
];

export default function GrihaV2019Page() {
  const [scores, setScores] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scores_v2019');
      if (saved) return JSON.parse(saved);
    }
    return Array(35).fill(0);
  });

  const handleScoreChange = (id, value, max) => {
    let num = parseInt(value);
    if (isNaN(num)) num = 0;
    if (num > max) num = max;
    if (num < 0) num = 0;
    
    const newScores = [...scores];
    newScores[id] = num;
    setScores(newScores);
  };

  const getSectionTotal = (section) => {
    return section.criteria.reduce((sum, c) => sum + scores[c.id], 0);
  };

  const baseTotal = sections.slice(0, 10).reduce((sum, section) => sum + getSectionTotal(section), 0);
  const innovationTotal = getSectionTotal(sections[10]);
  const grandTotal = baseTotal + innovationTotal;

  let stars = 0;
  if (grandTotal >= 86) stars = 5;
  else if (grandTotal >= 71) stars = 4;
  else if (grandTotal >= 56) stars = 3;
  else if (grandTotal >= 41) stars = 2;
  else if (grandTotal >= 25) stars = 1;

  useEffect(() => {
    localStorage.setItem('scores_v2019', JSON.stringify(scores));
    localStorage.setItem('stats_v2019', JSON.stringify({ points: grandTotal, stars }));
  }, [scores, grandTotal, stars]);


  const renderSection = (section) => (
    <React.Fragment key={section.id}>
      <tr className="bg-silver font-bold">
        <td className="py-3 px-4 text-center">{section.id}.</td>
        <td className="py-3 px-4">{section.title}</td>
        <td className="py-3 px-4 text-center">{section.max}</td>
        <td className="py-3 px-4 text-center text-green">{getSectionTotal(section)}</td>
        <td className="py-3 px-4"></td>
      </tr>
      {section.criteria.map(c => (
        <tr key={c.id} className={`border-b transition-colors hover:bg-white-5 ${c.type === 'Mandatory' ? 'bg-dark-rose' : c.type === 'Partly Mandatory' ? 'bg-rose-10' : ''}`}>
          <td className="py-3 px-4 text-center">{c.id}</td>
          <td className="py-3 px-4">{c.name}</td>
          <td className="py-3 px-4 text-center">{c.max}</td>
          <td className="py-3 px-4 text-center">
            <input 
              type="number" 
              min="0" 
              max={c.max}
              value={scores[c.id] || ''}
              onChange={(e) => handleScoreChange(c.id, e.target.value, c.max)}
              className="glass-input focus-ring-green text-center"
              placeholder="0"
            />
          </td>
          <td className={`py-3 px-4 ${c.type === 'Mandatory' ? 'text-dark-rose font-bold' : c.type === 'Partly Mandatory' ? 'text-red font-bold' : 'opacity-80'}`}>
            {c.type}
          </td>
        </tr>
      ))}
    </React.Fragment>
  );

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-10 text-center text-green">
        GRIHA V2019 Checklist
      </h1>
      
      <div className="glass-card p-8 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-green">
              <th className="p-4 text-center rounded-tl-lg">No.</th>
              <th className="p-4">Criterion Name</th>
              <th className="p-4 text-center">Max Pts</th>
              <th className="p-4 text-center">Target Points</th>
              <th className="p-4 rounded-tr-lg">Compliance Type</th>
            </tr>
          </thead>
          <tbody>
            {sections.slice(0, 10).map(renderSection)}
            <tr className="font-bold text-lg bg-white-5 border-y border-white/20">
              <td colSpan={2} className="p-4 text-right">TOTAL (Base Points)</td>
              <td className="p-4 text-center">100</td>
              <td className="p-4 text-center text-green">{baseTotal}</td>
              <td className="p-4"></td>
            </tr>
            {sections.slice(10).map(renderSection)}
            <tr className="font-bold text-lg bg-white-5 border-t border-white/20">
              <td colSpan={2} className="p-4 text-right">GRAND TOTAL</td>
              <td className="p-4 text-center">100 + 5</td>
              <td className="p-4 text-center text-green text-xl">{grandTotal}</td>
              <td className="p-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="glass-card p-8 mt-10 overflow-x-auto">
        <table className="w-full border-collapse text-left text-lg">
          <thead>
            <tr className="bg-green">
              <th className="p-4 rounded-tl-lg">Percentile Threshold</th>
              <th className="p-4 rounded-tr-lg">Achievable Star Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr className={`border-b transition-colors ${grandTotal >= 25 && grandTotal <= 40 ? 'bg-green-10 border-l-4 border-l-green' : 'hover:bg-white-5'}`}>
              <td className="p-4">25–40</td>
              <td className="p-4 flex gap-1 text-green">
                <Star className={`${grandTotal >= 25 && grandTotal <= 40 ? "fill-green glow-green" : "text-white/20"}`} />
              </td>
            </tr>
            <tr className={`border-b transition-colors ${grandTotal >= 41 && grandTotal <= 55 ? 'bg-green-10 border-l-4 border-l-green' : 'hover:bg-white-5'}`}>
              <td className="p-4">41–55</td>
              <td className="p-4 flex gap-1 text-green">
                <Star className={`${grandTotal >= 41 && grandTotal <= 55 ? "fill-green glow-green" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 41 && grandTotal <= 55 ? "fill-green glow-green" : "text-white/20"}`} />
              </td>
            </tr>
            <tr className={`border-b transition-colors ${grandTotal >= 56 && grandTotal <= 70 ? 'bg-green-10 border-l-4 border-l-green' : 'hover:bg-white-5'}`}>
              <td className="p-4">56–70</td>
              <td className="p-4 flex gap-1 text-green">
                <Star className={`${grandTotal >= 56 && grandTotal <= 70 ? "fill-green glow-green" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 56 && grandTotal <= 70 ? "fill-green glow-green" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 56 && grandTotal <= 70 ? "fill-green glow-green" : "text-white/20"}`} />
              </td>
            </tr>
            <tr className={`border-b transition-colors ${grandTotal >= 71 && grandTotal <= 85 ? 'bg-green-10 border-l-4 border-l-green' : 'hover:bg-white-5'}`}>
              <td className="p-4">71–85</td>
              <td className="p-4 flex gap-1 text-green">
                <Star className={`${grandTotal >= 71 && grandTotal <= 85 ? "fill-green glow-green" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 71 && grandTotal <= 85 ? "fill-green glow-green" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 71 && grandTotal <= 85 ? "fill-green glow-green" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 71 && grandTotal <= 85 ? "fill-green glow-green" : "text-white/20"}`} />
              </td>
            </tr>
            <tr className={`transition-colors ${grandTotal >= 86 ? 'bg-green-10 border-l-4 border-l-green' : 'hover:bg-white-5'}`}>
              <td className="p-4">86 and more</td>
              <td className="p-4 flex gap-1 text-green">
                <Star className={`${grandTotal >= 86 ? "fill-green glow-green" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 86 ? "fill-green glow-green" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 86 ? "fill-green glow-green" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 86 ? "fill-green glow-green" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 86 ? "fill-green glow-green" : "text-white/20"}`} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}