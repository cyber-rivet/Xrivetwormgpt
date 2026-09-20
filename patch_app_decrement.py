import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

patch = """
      // If success, update local credits
      if (currentUser && currentUser.username !== 'rizo8') {
        setCurrentUser(prev => prev ? { ...prev, credits: Math.max(0, (prev.credits || 0) - 1) } : null);
      }

      setSessions(prev => prev.map(s => {
"""

content = content.replace('      setSessions(prev => prev.map(s => {', patch)

with open('src/App.tsx', 'w') as f:
    f.write(content)
