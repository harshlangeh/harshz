const fs = require('fs');
let content = fs.readFileSync('src/app/griha-v6/page.tsx', 'utf8');

content = content.replace('GRIHA V6 Criteria', 'GRIHA V6 Checklist');

content = content.replace('<th className="p-4">Max Pts</th>', '<th className="p-4 text-center">Max Pts</th>');
content = content.replace('<th className="p-4">Target Points</th>', '<th className="p-4 text-center">Target Points</th>');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.match(/<td className="(p-4|py-3 px-4)">(100|\d+|100 \+ 5|)<\/td>/)) {
    if (lines[i-1] && lines[i-1].includes('<tr')) {
      continue;
    }
    lines[i] = line.replace(/className="(p-4|py-3 px-4)"/, 'className="$1 text-center"');
  }
}

fs.writeFileSync('src/app/griha-v6/page.tsx', lines.join('\n'));
console.log('Title renamed and points centered.');
