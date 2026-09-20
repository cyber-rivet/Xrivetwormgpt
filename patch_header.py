import re

with open('src/components/Header.tsx', 'r') as f:
    content = f.read()

# Add a credits display in the desktop view (after server status badge)
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

content = content.replace('        {/* Desktop Admin & Settings */}', desktop_credits_patch + '\n        {/* Desktop Admin & Settings */}')

# Also add it to the mobile menu header section
mobile_credits_patch = """
            {/* Status Header */}
            <div className="px-2.5 py-2 mb-1 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {serverStatus?.activeModel || 'Xrivet WormGPT'}
              </span>
              {currentUser && (
                <button 
                  onClick={() => {
                    const link = `${window.location.origin}/?ref=${currentUser.referralCode || ''}`;
                    navigator.clipboard.writeText(link);
                    alert("Invite link copied! Dost ko bhejein aur 5 credits free paayen.");
                  }}
                  className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full text-[10px] text-emerald-700 dark:text-emerald-400 font-bold"
                >
                  <Flame className="w-3 h-3" />
                  {currentUser.username?.toLowerCase() === 'rizo8' ? 'Unlimited' : `${currentUser.credits ?? 0} Credits`}
                </button>
              )}
            </div>
"""

content = re.sub(r'\{\/\* Status Header \*\/\}.*?<\/div>', mobile_credits_patch, content, flags=re.DOTALL)


with open('src/components/Header.tsx', 'w') as f:
    f.write(content)
