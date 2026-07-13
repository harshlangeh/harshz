"use client";
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const sections = [
  {
    "id": 1,
    "title": "Site Planning",
    "max": 8,
    "criteria": [
      {
        "id": 1,
        "name": "Site Selection",
        "max": 1
      },
      {
        "id": 2,
        "name": "Low-impact design",
        "max": 4
      },
      {
        "id": 3,
        "name": "Design to mitigate UHIE",
        "max": 2
      },
      {
        "id": 4,
        "name": "Site Imperviousness Factor",
        "max": 1
      }
    ]
  },
  {
    "id": 2,
    "title": "Construction Management",
    "max": 9,
    "criteria": [
      {
        "id": 5,
        "name": "Air and water pollution control",
        "max": 1
      },
      {
        "id": 6,
        "name": "Preserve and protect landscape during construction",
        "max": 4
      },
      {
        "id": 7,
        "name": "Construction Management Practices",
        "max": 4
      }
    ]
  },
  {
    "id": 3,
    "title": "Energy",
    "max": 20,
    "criteria": [
      {
        "id": 8,
        "name": "Energy efficiency",
        "max": 13
      },
      {
        "id": 9,
        "name": "Renewable energy utilization",
        "max": 7
      },
      {
        "id": 10,
        "name": "Zero ODP materials",
        "max": 0
      }
    ]
  },
  {
    "id": 4,
    "title": "Occupant Comfort and Well Being",
    "max": 12,
    "criteria": [
      {
        "id": 11,
        "name": "Achieving indoor comfort requirements (visual/thermal/acoustic)",
        "max": 6
      },
      {
        "id": 12,
        "name": "Maintaining good IAQ",
        "max": 4
      },
      {
        "id": 13,
        "name": "Use of low-VOC paints and other compounds in building interiors",
        "max": 2
      }
    ]
  },
  {
    "id": 5,
    "title": "Water",
    "max": 17,
    "criteria": [
      {
        "id": 14,
        "name": "Use of low-flow fixtures and systems",
        "max": 4
      },
      {
        "id": 15,
        "name": "Reducing landscape water demand",
        "max": 4
      },
      {
        "id": 16,
        "name": "Water Quality",
        "max": 2
      },
      {
        "id": 17,
        "name": "On-site water reuse",
        "max": 5
      },
      {
        "id": 18,
        "name": "Rainwater Recharge",
        "max": 2
      }
    ]
  },
  {
    "id": 6,
    "title": "Sustainable Building Materials",
    "max": 14,
    "criteria": [
      {
        "id": 19,
        "name": "Utilization of BIS recommended waste materials in building structure",
        "max": 6
      },
      {
        "id": 20,
        "name": "Reduction in embodied energy of building structure",
        "max": 4
      },
      {
        "id": 21,
        "name": "Use of low-environmental impact materials in building interiors",
        "max": 4
      }
    ]
  },
  {
    "id": 7,
    "title": "Solid Waste Management",
    "max": 6,
    "criteria": [
      {
        "id": 22,
        "name": "Avoided post-construction landfill",
        "max": 4
      },
      {
        "id": 23,
        "name": "Treat organic waste on site",
        "max": 2
      }
    ]
  },
  {
    "id": 8,
    "title": "Socio-Economic Strategies",
    "max": 6,
    "criteria": [
      {
        "id": 24,
        "name": "Labour safety and sanitation",
        "max": 1
      },
      {
        "id": 25,
        "name": "Design for Universal Accessibility",
        "max": 2
      },
      {
        "id": 26,
        "name": "Dedicated facilities for service staff",
        "max": 2
      },
      {
        "id": 27,
        "name": "Increase in environmental awareness",
        "max": 1
      }
    ]
  },
  {
    "id": 9,
    "title": "Performance Monitoring and Validation",
    "max": 8,
    "criteria": [
      {
        "id": 28,
        "name": "Smart metering and monitoring",
        "max": 8
      },
      {
        "id": 29,
        "name": "Operation, Maintenance Protocols",
        "max": 0
      },
      {
        "id": 30,
        "name": "Performance Assessment for Final Rating",
        "max": 0
      }
    ]
  },
  {
    "id": 10,
    "title": "Innovation",
    "max": 4,
    "criteria": [
      {
        "id": 31,
        "name": "Innovation",
        "max": 4
      }
    ]
  }
];

export default function GrihaV2015Page() {
  const [scores, setScores] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scores_v2015');
      if (saved) return JSON.parse(saved);
    }
    return Array(35).fill(0);
  });

  const handleScoreChange = (id: number, value: string, max: number) => {
    let num = parseInt(value);
    if (isNaN(num)) num = 0;
    if (num > max) num = max;
    if (num < 0) num = 0;
    
    const newScores = [...scores];
    newScores[id] = num;
    setScores(newScores);
  };

  const getSectionTotal = (section: any) => {
    return section.criteria.reduce((sum, c) => sum + scores[c.id], 0);
  };

  const baseTotal = sections.slice(0, 9).reduce((sum, section) => sum + getSectionTotal(section), 0);
  const innovationTotal = getSectionTotal(sections[9]);
  const grandTotal = baseTotal + innovationTotal;

  let stars = 0;
  if (grandTotal >= 86) stars = 5;
  else if (grandTotal >= 71) stars = 4;
  else if (grandTotal >= 56) stars = 3;
  else if (grandTotal >= 41) stars = 2;
  else if (grandTotal >= 25) stars = 1;

  useEffect(() => {
    localStorage.setItem('scores_v2015', JSON.stringify(scores));
    localStorage.setItem('stats_v2015', JSON.stringify({ points: grandTotal, stars }));
  }, [scores, grandTotal, stars]);


  const renderSection = (section) => (
    <React.Fragment key={section.id}>
      <tr className="bg-silver font-bold">
        <td className="py-3 px-4 text-center">{section.id}.</td>
        <td className="py-3 px-4">{section.title}</td>
        <td className="py-3 px-4 text-center">{section.max}</td>
        <td className="py-3 px-4 text-center text-rose-red">{getSectionTotal(section)}</td>
      </tr>
      {section.criteria.map(c => (
        <tr key={c.id} className="border-b transition-colors hover:bg-white-5">
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
              className="glass-input focus-ring-rose-red text-center"
              placeholder="0"
            />
          </td>
        </tr>
      ))}
    </React.Fragment>
  );

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-10 text-center text-rose-red">
        GRIHA V2015 Checklist
      </h1>
      
      <div className="glass-card p-8 overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-rose-red">
              <th className="p-4 text-center rounded-tl-lg">No.</th>
              <th className="p-4">Criterion Name</th>
              <th className="p-4 text-center">Max Pts</th>
              <th className="p-4 text-center rounded-tr-lg">Target Points</th>
            </tr>
          </thead>
          <tbody>
            {sections.slice(0, 9).map(renderSection)}
            <tr className="font-bold text-lg bg-white-5 border-y border-white/20">
              <td colSpan={2} className="p-4 text-right">TOTAL (Base Points)</td>
              <td className="p-4 text-center">100</td>
              <td className="p-4 text-center text-rose-red">{baseTotal}</td>
            </tr>
            {sections.slice(9).map(renderSection)}
            <tr className="font-bold text-lg bg-white-5 border-t border-white/20">
              <td colSpan={2} className="p-4 text-right">GRAND TOTAL</td>
              <td className="p-4 text-center">100 + 4</td>
              <td className="p-4 text-center text-rose-red text-xl">{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="glass-card p-8 mt-10 overflow-x-auto">
        <table className="w-full border-collapse text-left text-lg">
          <thead>
            <tr className="bg-rose-red">
              <th className="p-4 rounded-tl-lg">Percentile Threshold</th>
              <th className="p-4 rounded-tr-lg">Achievable Star Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr className={`border-b transition-colors ${grandTotal >= 25 && grandTotal <= 40 ? 'bg-rose-red-10 border-l-4 border-l-rose-red' : 'hover:bg-white-5'}`}>
              <td className="p-4">25–40</td>
              <td className="p-4 flex gap-1 text-rose-red">
                <Star className={`${grandTotal >= 25 && grandTotal <= 40 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
              </td>
            </tr>
            <tr className={`border-b transition-colors ${grandTotal >= 41 && grandTotal <= 55 ? 'bg-rose-red-10 border-l-4 border-l-rose-red' : 'hover:bg-white-5'}`}>
              <td className="p-4">41–55</td>
              <td className="p-4 flex gap-1 text-rose-red">
                <Star className={`${grandTotal >= 41 && grandTotal <= 55 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 41 && grandTotal <= 55 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
              </td>
            </tr>
            <tr className={`border-b transition-colors ${grandTotal >= 56 && grandTotal <= 70 ? 'bg-rose-red-10 border-l-4 border-l-rose-red' : 'hover:bg-white-5'}`}>
              <td className="p-4">56–70</td>
              <td className="p-4 flex gap-1 text-rose-red">
                <Star className={`${grandTotal >= 56 && grandTotal <= 70 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 56 && grandTotal <= 70 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 56 && grandTotal <= 70 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
              </td>
            </tr>
            <tr className={`border-b transition-colors ${grandTotal >= 71 && grandTotal <= 85 ? 'bg-rose-red-10 border-l-4 border-l-rose-red' : 'hover:bg-white-5'}`}>
              <td className="p-4">71–85</td>
              <td className="p-4 flex gap-1 text-rose-red">
                <Star className={`${grandTotal >= 71 && grandTotal <= 85 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 71 && grandTotal <= 85 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 71 && grandTotal <= 85 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 71 && grandTotal <= 85 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
              </td>
            </tr>
            <tr className={`transition-colors ${grandTotal >= 86 ? 'bg-rose-red-10 border-l-4 border-l-rose-red' : 'hover:bg-white-5'}`}>
              <td className="p-4">86 and more</td>
              <td className="p-4 flex gap-1 text-rose-red">
                <Star className={`${grandTotal >= 86 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 86 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 86 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 86 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
                <Star className={`${grandTotal >= 86 ? "fill-rose-red glow-rose-red" : "text-white/20"}`} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}