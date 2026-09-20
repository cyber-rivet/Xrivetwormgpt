const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const fixed = [];

let currentIndent = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const nextLine = lines[i+1] || '';
  
  // Calculate this line's indent
  const thisIndentMatch = line.match(/^(\s*)/);
  const thisIndent = thisIndentMatch ? thisIndentMatch[1].length : 0;
  
  // Calculate next line's indent (skip empty lines)
  let j = i + 1;
  let nextIndent = 0;
  let foundNext = false;
  while (j < lines.length) {
    if (lines[j].trim() !== '') {
      const match = lines[j].match(/^(\s*)/);
      nextIndent = match ? match[1].length : 0;
      foundNext = true;
      break;
    }
    j++;
  }
  
  fixed.push(line);
  
  // If next line is significantly less indented, we probably missed a closing brace(s)
  if (foundNext && line.trim() !== '' && !line.trim().endsWith('{') && !line.trim().endsWith('(') && !line.trim().endsWith('[')) {
    // Check how many levels of indent we dropped
    // Assuming 2 spaces per indent
    if (nextIndent < thisIndent) {
      const drop = thisIndent - nextIndent;
      // We need to insert closing braces
      let insertIndent = thisIndent - 2;
      while (insertIndent >= nextIndent) {
        // Just guess '}'
        // fixed.push(' '.repeat(insertIndent) + '}');
        // insertIndent -= 2;
      }
    }
  }
}
// fs.writeFileSync('src/App.tsx', fixed.join('\n'));
