import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Add credits to User bottom section
user_info_replacement = """
        {/* Credits & Referral Widget */}
        <div className="p-3 mx-2 mb-2 rounded-xl bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-300/50 dark:border-zinc-700/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Your Credits</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">{currentUser?.credits ?? 0}</span>
          </div>
          <button 
            onClick={() => {
              const link = `${window.location.origin}/?ref=${currentUser?.referralCode || ''}`;
              navigator.clipboard.writeText(link);
              alert("Invite link copied! Dost ko bhejein aur 5 credits free paayen.");
            }}
            className="w-full flex items-center justify-center gap-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-200 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-lg transition-colors"
          >
            Invite & Earn
          </button>
        </div>

        {/* User Info Bottom */}
"""

content = content.replace('{/* User Info Bottom */}', user_info_replacement)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)
