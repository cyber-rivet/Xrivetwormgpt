#!/bin/bash
sed -i 's/import { AgentCoderStudioModal } from '"'"'.\/components\/AgentCoderStudioModal'"'"';/import { AppStudioView } from '"'"'.\/components\/AppStudioView'"'"';/g' src/App.tsx

sed -i '/return (/i \  if (agentStudioOpen) {\n    return <AppStudioView onClose={() => setAgentStudioOpen(false)} currentUser={currentUser} darkMode={darkMode} />;\n  }' src/App.tsx

