#!/bin/bash
# Kill any existing dev server on port 5173 and restart
lsof -t -i:5173 | xargs -r kill -9 2>/dev/null
npm run dev &
sleep 3
echo ""
echo "Server started at http://localhost:5173"
echo ""