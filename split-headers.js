const fs = require('fs');
let content = fs.readFileSync('src/app/griha-v6/page.tsx', 'utf8');

const regex = /<td colSpan=\{4\} className="py-3 px-4">(.*?) \(Max: (\d+) Pts\)<\/td>/g;
content = content.replace(regex, '<td className="py-3 px-4">$1</td>\n              <td className="py-3 px-4">$2</td>\n              <td className="py-3 px-4">0</td>\n              <td className="py-3 px-4"></td>');

fs.writeFileSync('src/app/griha-v6/page.tsx', content);
console.log('Section headers split successfully.');
