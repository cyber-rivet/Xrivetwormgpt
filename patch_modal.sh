#!/bin/bash
sed -i 's/<div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800 bg=\[#161618\] shrink-0">/<div className="flex flex-col md:flex-row md:items-center justify-between px-3 sm:px-6 py-3 gap-3 border-b border-zinc-800 bg-[#161618] shrink-0">/g' src/components/LiveCodeSandboxModal.tsx

sed -i 's/XRIVET AI AGENT – LIVE APP PREVIEW & SANDBOX/XRIVET SANDBOX <span className="hidden sm:inline">– LIVE APP PREVIEW<\/span>/g' src/components/LiveCodeSandboxModal.tsx

sed -i 's/<div className="flex items-center gap-2">/<div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">/g' src/components/LiveCodeSandboxModal.tsx

sed -i 's/<button\n              onClick={onClose}\n              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"\n            >\n              <X className="w-4 h-4" \/>\n            <\/button>/<button\n              onClick={onClose}\n              className="flex items-center gap-1.5 p-1.5 px-3 rounded-lg bg-red-500\/10 border border-red-500\/30 text-red-500 hover:text-white hover:bg-red-500 transition-colors shrink-0"\n              title="Close Sandbox"\n            >\n              <X className="w-4 h-4" \/><span className="text-xs font-bold font-mono">BACK<\/span>\n            <\/button>/g' src/components/LiveCodeSandboxModal.tsx
