const fs = require('fs');
let content = fs.readFileSync('src/app/griha-v6/page.tsx', 'utf8');

content = content.replace(
  '<th className="p-4">Max Pts</th>',
  '<th className="p-4">Max Pts</th>\n              <th className="p-4">Target Points</th>'
);

content = content.replace(/colSpan=\{3\}/g, 'colSpan={4}');

const rowRegex = /(<td className="py-3 px-4">\d+<\/td>)\s*(<td className="py-3 px-4.*?>(?:Partly Mandatory|Optional|Mandatory)<\/td>)/g;
content = content.replace(rowRegex, '$1\n              <td className="py-3 px-4">0</td>\n              $2');

content = content.replace(
  /<td colSpan=\{2\} className="p-4">100 \+ 5<\/td>/g,
  '<td className="p-4">100 + 5</td>\n              <td className="p-4">0</td>\n              <td className="p-4"></td>'
);

const innovationHeader = '<tr className="bg-silver font-bold">\\s*<td className="py-3 px-4">11\\.</td>';
const totalRow = `            <tr className="font-bold text-lg bg-card">
              <td colSpan={2} className="p-4 text-right">TOTAL (Base Points)</td>
              <td className="p-4">100</td>
              <td className="p-4">0</td>
              <td className="p-4"></td>
            </tr>\n            `;
content = content.replace(new RegExp(innovationHeader), totalRow + '<tr className="bg-silver font-bold">\n              <td className="py-3 px-4">11.</td>');

fs.writeFileSync('src/app/griha-v6/page.tsx', content);
console.log('Columns and total row added.');
