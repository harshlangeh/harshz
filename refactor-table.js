const fs = require('fs');
let content = fs.readFileSync('src/app/griha-v6/page.tsx', 'utf8');

// Find the start of the return statement
const returnIndex = content.indexOf('return (');

// Define the renderSection helper
const renderSectionHelper = `  const renderSection = (section) => (
    <React.Fragment key={section.id}>
      <tr className="bg-silver font-bold">
        <td className="py-3 px-4 text-center">{section.id}.</td>
        <td className="py-3 px-4">{section.title}</td>
        <td className="py-3 px-4 text-center">{section.max}</td>
        <td className="py-3 px-4 text-center text-orange">{getSectionTotal(section)}</td>
        <td className="py-3 px-4"></td>
      </tr>
      {section.criteria.map(c => (
        <tr key={c.id} className={\`border-b transition-colors hover:bg-white-5 \${c.type === 'Mandatory' ? 'bg-dark-rose' : c.type === 'Partly Mandatory' ? 'bg-rose-10' : ''}\`}>
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
              className="w-16 bg-black/20 border border-white/10 rounded px-2 py-1 text-center text-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
              placeholder="0"
            />
          </td>
          <td className={\`py-3 px-4 \${c.type === 'Mandatory' ? 'text-dark-rose font-bold' : c.type === 'Partly Mandatory' ? 'text-red font-bold' : 'opacity-80'}\`}>
            {c.type}
          </td>
        </tr>
      ))}
    </React.Fragment>
  );

  `;

// Inject helper before return
content = content.slice(0, returnIndex) + renderSectionHelper + content.slice(returnIndex);

// Replace the tbody contents
const tbodyRegex = /<tbody>[\s\S]*?(?=<div className="glass-card p-8 mt-10 overflow-x-auto">)/;

const newTbody = `<tbody>
            {sections.slice(0, 10).map(renderSection)}
            <tr className="font-bold text-lg bg-white-5">
              <td colSpan={2} className="p-4 text-right">TOTAL (Base Points)</td>
              <td className="p-4 text-center">100</td>
              <td className="p-4 text-center text-orange">{baseTotal}</td>
              <td className="p-4"></td>
            </tr>
            {sections.slice(10).map(renderSection)}
            <tr className="font-bold text-lg bg-white-5 border-t border-white/20">
              <td colSpan={2} className="p-4 text-right">GRAND TOTAL</td>
              <td className="p-4 text-center">100 + 5</td>
              <td className="p-4 text-center text-orange text-xl">{grandTotal}</td>
              <td className="p-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      `;

content = content.replace(tbodyRegex, newTbody);

fs.writeFileSync('src/app/griha-v6/page.tsx', content);
console.log('Refactored tbody and moved Base Total.');
