const fs = require('fs');

const path = '/Users/harshanand/.gemini/antigravity/scratch/travelcrm/src/components/query-tabs/BillingTab.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const conditionals = lines.slice(33, 58);
const hooks = lines.slice(58, 199);
const start = lines.slice(0, 33);
const end = lines.slice(199);

const newLines = [...start, ...hooks, ...conditionals, ...end];
fs.writeFileSync(path, newLines.join('\n'));
console.log('Fixed hooks order');
