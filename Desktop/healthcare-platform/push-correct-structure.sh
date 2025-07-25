#!/bin/bash

# Push with Correct Structure
# This script creates a fresh push with files in the correct location

echo "🚀 Pushing Files with Correct Structure"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in current directory"
    echo "Please run this script from /Users/yndr/Desktop/healthcare-platform/"
    exit 1
fi

echo "📋 Current Status:"
git status --short

echo ""
echo "🔄 Creating new branch with correct structure..."

# Create a new orphan branch (no history)
git checkout --orphan fixed-structure

# Add all files
echo "📦 Adding all files..."
git add -A

# Commit
echo "💾 Committing with correct structure..."
git commit -m "Initial commit with correct repository structure

- All files at root level for Vercel deployment
- Package.json accessible at repository root
- Ready for deployment"

# Force push to main (this will overwrite the incorrectly structured repository)
echo "🚀 Force pushing to main branch..."
echo "⚠️  This will overwrite the current main branch!"
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin fixed-structure:main --force
    
    echo ""
    echo "✅ Repository structure fixed!"
    echo "======================================"
    echo ""
    echo "📌 Next Steps:"
    echo "1. Go back to Vercel: https://vercel.com/new"
    echo "2. Import your repository again" 
    echo "3. Leave 'Root Directory' field EMPTY"
    echo "4. Deploy should now work!"
    echo ""
    echo "🎯 Your package.json is now at:"
    echo "   https://github.com/yndrdev/totalrecover/blob/main/package.json"
    
    # Switch back to main branch locally
    git checkout -B main origin/main
else
    echo "❌ Push cancelled"
    # Clean up - go back to main branch
    git checkout main
fi