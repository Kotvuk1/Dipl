#!/bin/bash
cd /home/node/app

# Check for package.json (Node.js project)
if [ -f "package.json" ]; then
    echo "Found package.json, running npm install and start..."
    npm install 2>/dev/null || true
    
    # Try various start scripts
    if npm run dev --if-present 2>/dev/null; then
        exit 0
    elif npm run start --if-present 2>/dev/null; then
        exit 0
    fi
fi

# Fallback: serve static files
echo "Serving static files on port 3000..."
exec npx -y serve -l 3000 -s .
