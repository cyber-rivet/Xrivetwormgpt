const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

const cleaned = lines.filter((line, index) => {
  if (index >= 387 && index <= 393) return false;
  return true;
});

fs.writeFileSync('src/App.tsx', cleaned.join('\n'));
