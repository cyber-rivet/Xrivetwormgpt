#!/bin/bash
sed -i 's/            setCurrentUser(null);/            setCurrentUser(null);\n          }/g' src/App.tsx
sed -i 's/      saveActiveSessionId(activeSessionId);/      saveActiveSessionId(activeSessionId);\n    }/g' src/App.tsx
sed -i 's/        setSettingsOpen(false);/        setSettingsOpen(false);\n      }/g' src/App.tsx
