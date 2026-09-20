import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

fetch_patch = """
      if (!res.ok) {
        if (data.outOfCredits) {
          // Decrement credits or set to 0 just in case
          if (currentUser) {
            setCurrentUser({ ...currentUser, credits: 0 });
          }
          // Show alert and throw error to render in chat
          alert("Free Credits khatam ho gaye! Sidebar se 'Invite & Earn' button use karein aur doston ko bula kar 5 credits hasil karein.");
          throw new Error(data.error || "Aapke credits khatam ho gaye hain. Naye doston ko invite karein.");
        }
        if (res.status === 401 || data.authRequired) {
"""

content = content.replace(
    '''      if (!res.ok) {
        if (res.status === 401 || data.authRequired) {''',
    fetch_patch
)

# After successful message, we should decrement credit if not admin
success_patch = """
      // If success, update local credits
      if (currentUser && currentUser.username !== 'admin') {
        setCurrentUser(prev => prev ? { ...prev, credits: Math.max(0, (prev.credits || 0) - 1) } : null);
      }

      const verifiedLinks = data.verifiedLinks || [];
"""

content = content.replace('const verifiedLinks = data.verifiedLinks || [];', success_patch)

with open('src/App.tsx', 'w') as f:
    f.write(content)
