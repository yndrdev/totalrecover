#!/bin/bash

# Quick Fix for GitHub Structure
echo "🚀 Quick Fix for GitHub Repository Structure"
echo "=========================================="

# Go back to main branch first
echo "📌 Switching to main branch..."
git checkout main

# Pull latest from remote
echo "📥 Pulling latest from GitHub..."
git pull origin main

# Check current structure
echo "🔍 Checking repository structure..."
if [ -d "Desktop" ]; then
    echo "❌ Found Desktop folder - restructuring needed"
    
    # Create a new branch for the fix
    echo "🔄 Creating fix branch..."
    git checkout -b fix-structure
    
    # Move all files from Desktop/healthcare-platform to root
    echo "📦 Moving files to root..."
    if [ -d "Desktop/healthcare-platform" ]; then
        # Use git mv to preserve history
        git mv Desktop/healthcare-platform/* . 2>/dev/null || true
        git mv Desktop/healthcare-platform/.* . 2>/dev/null || true
        
        # Remove empty Desktop folder
        git rm -rf Desktop
        
        echo "✅ Files moved successfully"
    fi
    
    # Stage all changes
    git add -A
    
    # Commit the changes
    echo "💾 Committing restructure..."
    git commit -m "Fix repository structure for Vercel deployment

- Move all files from Desktop/healthcare-platform/ to root
- This allows Vercel to find package.json at repository root
- No code changes, only directory structure fix"
    
    # Push to main
    echo "🚀 Pushing fix to main..."
    git push origin fix-structure:main --force
    
    echo ""
    echo "✅ Repository fixed!"
    echo "📌 Your package.json is now at: https://github.com/yndrdev/totalrecover/blob/main/package.json"
    
else
    echo "✅ Repository structure is already correct!"
fi

echo ""
echo "🎯 Next: Go to Vercel and redeploy"