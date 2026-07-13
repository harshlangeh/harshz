const fs = require('fs');

const updateFile = (path, name, type) => {
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes('useEffect')) {
    content = content.replace(/import React, { useState } from 'react';/, "import React, { useState, useEffect } from 'react';");
  }
  
  if (type === 'griha') {
    content = content.replace(/const \[scores, setScores\] = useState\(Array\(\d+\)\.fill\(0\)\);/, 
`const [scores, setScores] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scores_${name}');
      if (saved) return JSON.parse(saved);
    }
    return Array(35).fill(0);
  });`);

    const effectStr = `
  let stars = 0;
  if (grandTotal >= 86) stars = 5;
  else if (grandTotal >= 71) stars = 4;
  else if (grandTotal >= 56) stars = 3;
  else if (grandTotal >= 41) stars = 2;
  else if (grandTotal >= 25) stars = 1;

  useEffect(() => {
    localStorage.setItem('scores_${name}', JSON.stringify(scores));
    localStorage.setItem('stats_${name}', JSON.stringify({ points: grandTotal, stars }));
  }, [scores, grandTotal, stars]);
`;
    content = content.replace(/(const grandTotal =[^;]+;)/, `$1\n${effectStr}`);
  } else if (type === 'igbc') {
    content = content.replace(/const \[scores, setScores\] = useState\(Array\(\d+\)\.fill\(0\)\);/, 
`const [scores, setScores] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scores_${name}');
      if (saved) return JSON.parse(saved);
    }
    return Array(35).fill(0);
  });`);

    const effectStr = `
  let level = "None";
  if (buildingType === 'New') {
    if (grandTotal >= 51) level = "Platinum";
    else if (grandTotal >= 42) level = "Gold";
    else if (grandTotal >= 36) level = "Silver";
    else if (grandTotal >= 30) level = "Certified";
  } else {
    if (grandTotal >= 43) level = "Platinum";
    else if (grandTotal >= 35) level = "Gold";
    else if (grandTotal >= 30) level = "Silver";
    else if (grandTotal >= 25) level = "Certified";
  }

  useEffect(() => {
    localStorage.setItem('scores_${name}', JSON.stringify(scores));
    localStorage.setItem('stats_${name}', JSON.stringify({ points: grandTotal, level }));
  }, [scores, grandTotal, level]);
`;
    content = content.replace(/(const grandTotal =[^;]+;)/, `$1\n${effectStr}`);
  }

  fs.writeFileSync(path, content);
};

updateFile('src/app/griha-v6/page.tsx', 'v6', 'griha');
updateFile('src/app/griha-v2019/page.tsx', 'v2019', 'griha');
updateFile('src/app/griha-v2015/page.tsx', 'v2015', 'griha');
updateFile('src/app/igbc-sb-2020/page.tsx', 'igbc', 'igbc');
