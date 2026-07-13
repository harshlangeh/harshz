const fs = require('fs');
let content = fs.readFileSync('src/app/griha-v6/page.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('bg-rose-10 text-red font-bold')) {
    lines[i] = lines[i].replace(' bg-rose-10', '');
    
    for (let j = i - 1; j >= 0; j--) {
      if (lines[j].includes('<tr className="border-b">')) {
        lines[j] = lines[j].replace('<tr className="border-b">', '<tr className="border-b bg-rose-10">');
        break;
      }
    }
  }
}

fs.writeFileSync('src/app/griha-v6/page.tsx', lines.join('\n'));
console.log('Rows successfully updated.');
