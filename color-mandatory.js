const fs = require('fs');
let content = fs.readFileSync('src/app/griha-v6/page.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('>Mandatory</td>') && !lines[i].includes('Partly Mandatory')) {
    lines[i] = lines[i].replace('>Mandatory</td>', ' className="py-3 px-4 text-dark-rose font-bold">Mandatory</td>');
    lines[i] = lines[i].replace('className="py-3 px-4" className=', 'className=');
    
    for (let j = i - 1; j >= 0; j--) {
      if (lines[j].includes('<tr className="border-b">')) {
        lines[j] = lines[j].replace('<tr className="border-b">', '<tr className="border-b bg-dark-rose">');
        break;
      }
    }
  }
}

fs.writeFileSync('src/app/griha-v6/page.tsx', lines.join('\n'));
console.log('Mandatory rows updated with dark rose.');
