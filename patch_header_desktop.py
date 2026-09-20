with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Desktop implementation
desktop_credits_patch = """
        {/* Credits Badge (Desktop) */}
        {currentUser && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors" title="Invite friends to get more credits!" onClick={() => {
            const link = `${window.location.origin}/?ref=${currentUser.referralCode || ''}`;
            navigator.clipboard.writeText(link);
            alert("Invite link copied! Dost ko bhejein aur 5 credits free paayen.");
          }}>
            <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {currentUser.username?.toLowerCase() === 'rizo8' ? 'Unlimited' : `${currentUser.credits ?? 0} Credits`}
            </span>
          </div>
        )}
"""

# Place it before the end of the main header flex container
# I need to find the right place. 
# Looking at the code, it seems the mobile controls are a separate div.
# Let's find the closing of the main header flex container just before mobile div.

# Actually, I can just insert it before <div className="md:hidden...
# But I must check if it already exists to avoid duplicates.
if 'Credits Badge (Desktop)' not in content:
    content = content.replace('      {/* Right on Mobile', desktop_credits_patch + '\n      {/* Right on Mobile')

with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
