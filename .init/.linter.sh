#!/bin/bash
cd /home/kavia/workspace/code-generation/personal-notes-manager-a71e596b/frontend_reactjs
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

