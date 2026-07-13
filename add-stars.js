const fs = require('fs');
let content = fs.readFileSync('src/app/griha-v6/page.tsx', 'utf8');

// Add Lucide import
if (!content.includes('lucide-react')) {
  content = content.replace("import React from 'react';", "import React from 'react';\nimport { Star } from 'lucide-react';");
}

// Add grandTotal mock
if (!content.includes('const grandTotal')) {
  content = content.replace('export default function GrihaV6Page() {\n  return (', 'export default function GrihaV6Page() {\n  // TODO: Replace with dynamic state when inputs are added\n  const grandTotal = 75;\n  return (');
}

const tableHTML = `
      <div className="glass-card p-8 mt-10 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-6 text-orange">Percentile Thresholds for Achieving Stars</h2>
        <table className="w-full border-collapse text-left text-lg">
          <thead>
            <tr className="bg-orange">
              <th className="p-4 rounded-tl-lg">Percentile Threshold</th>
              <th className="p-4 rounded-tr-lg">Achievable Star Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr className={\`border-b hover:bg-white-5 transition-colors \${grandTotal >= 25 && grandTotal <= 40 ? 'bg-orange-10' : ''}\`}>
              <td className="p-4">25–40</td>
              <td className="p-4 flex gap-1 text-orange">
                <Star className={grandTotal >= 25 && grandTotal <= 40 ? "fill-orange glow-orange" : ""} />
              </td>
            </tr>
            <tr className={\`border-b hover:bg-white-5 transition-colors \${grandTotal >= 41 && grandTotal <= 55 ? 'bg-orange-10' : ''}\`}>
              <td className="p-4">41–55</td>
              <td className="p-4 flex gap-1 text-orange">
                <Star className={grandTotal >= 41 && grandTotal <= 55 ? "fill-orange glow-orange" : ""} />
                <Star className={grandTotal >= 41 && grandTotal <= 55 ? "fill-orange glow-orange" : ""} />
              </td>
            </tr>
            <tr className={\`border-b hover:bg-white-5 transition-colors \${grandTotal >= 56 && grandTotal <= 70 ? 'bg-orange-10' : ''}\`}>
              <td className="p-4">56–70</td>
              <td className="p-4 flex gap-1 text-orange">
                <Star className={grandTotal >= 56 && grandTotal <= 70 ? "fill-orange glow-orange" : ""} />
                <Star className={grandTotal >= 56 && grandTotal <= 70 ? "fill-orange glow-orange" : ""} />
                <Star className={grandTotal >= 56 && grandTotal <= 70 ? "fill-orange glow-orange" : ""} />
              </td>
            </tr>
            <tr className={\`border-b hover:bg-white-5 transition-colors \${grandTotal >= 71 && grandTotal <= 85 ? 'bg-orange-10' : ''}\`}>
              <td className="p-4">71–85</td>
              <td className="p-4 flex gap-1 text-orange">
                <Star className={grandTotal >= 71 && grandTotal <= 85 ? "fill-orange glow-orange" : ""} />
                <Star className={grandTotal >= 71 && grandTotal <= 85 ? "fill-orange glow-orange" : ""} />
                <Star className={grandTotal >= 71 && grandTotal <= 85 ? "fill-orange glow-orange" : ""} />
                <Star className={grandTotal >= 71 && grandTotal <= 85 ? "fill-orange glow-orange" : ""} />
              </td>
            </tr>
            <tr className={\`hover:bg-white-5 transition-colors \${grandTotal >= 86 ? 'bg-orange-10' : ''}\`}>
              <td className="p-4">86 and more</td>
              <td className="p-4 flex gap-1 text-orange">
                <Star className={grandTotal >= 86 ? "fill-orange glow-orange" : ""} />
                <Star className={grandTotal >= 86 ? "fill-orange glow-orange" : ""} />
                <Star className={grandTotal >= 86 ? "fill-orange glow-orange" : ""} />
                <Star className={grandTotal >= 86 ? "fill-orange glow-orange" : ""} />
                <Star className={grandTotal >= 86 ? "fill-orange glow-orange" : ""} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;

// The end of page.tsx usually has </div> </div> ); } 
content = content.replace(/<\/div>\s*<\/div>\s*\);\s*}\s*$/g, `</div>\n${tableHTML}`);

fs.writeFileSync('src/app/griha-v6/page.tsx', content);
console.log('Star table appended.');
