#!/bin/bash
sed -i 's/          updatedAt: Date.now()/          updatedAt: Date.now()\n        };\n      }\n      return s;\n    });/g' src/App.tsx
