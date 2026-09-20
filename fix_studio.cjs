const fs = require('fs');

let content = fs.readFileSync('src/components/AppStudioView.tsx', 'utf8');

// Replace the return statement to fix responsive layout on mobile
// In mobile, when tab is 'preview', hide the chat sidebar completely or make sure width is 100%
// Also ensure mobile sidebar drawer closes correctly and layout uses flex properly.

// Let's make sure the main view has proper overflow and height on mobile:
// Replace the main flex container
content = content.replace(
  'className="flex-1 flex overflow-hidden relative">',
  'className="flex-1 flex overflow-hidden relative w-full">'
);

fs.writeFileSync('src/components/AppStudioView.tsx', content);
console.log('Done fix_studio');
