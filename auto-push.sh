#!/bin/bash
# MeterVerse Auto-Push to GitHub
# Run this script in Git Bash

echo "========================================"
echo "   MeterVerse Auto-Push to GitHub"
echo "========================================"
echo ""

cd /d/meter || exit

echo "→ Adding all changes..."
git add -A

echo ""
echo "→ Committing..."
git commit -m "Auto-update $(date '+%Y-%m-%d %H:%M:%S')"

echo ""
echo "→ Pushing to origin clean-main:main..."
git push origin clean-main:main

echo ""
echo "========================================"
if [ $? -eq 0 ]; then
    echo "   ✅ PUSH SUCCESSFUL"
else
    echo "   ❌ PUSH FAILED"
fi
echo "========================================"
echo ""
read -p "Press Enter to close..."
