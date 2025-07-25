#!/bin/bash

# Fix GitHub Repository Structure
# This script will restructure your repository to have files at the root level

echo "🔧 Fixing GitHub Repository Structure..."
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in current directory"
    echo "Please run this script from /Users/yndr/Desktop/healthcare-platform/"
    exit 1
fi

# Create a temporary directory for the fix
echo "📁 Creating temporary workspace..."
TEMP_DIR=$(mktemp -d)
echo "   Temporary directory: $TEMP_DIR"

# Clone the repository
echo "📥 Cloning repository..."
cd "$TEMP_DIR"
git clone https://github.com/yndrdev/totalrecover.git
cd totalrecover

# Check current structure
echo "🔍 Checking current repository structure..."
if [ -d "Desktop" ]; then
    echo "   ⚠️  Found nested Desktop directory - files are in wrong location"
    
    # Move all files from Desktop/healthcare-platform to root
    echo "📦 Restructuring files..."
    if [ -d "Desktop/healthcare-platform" ]; then
        # Move all files and directories from nested location to root
        mv Desktop/healthcare-platform/* . 2>/dev/null || true
        mv Desktop/healthcare-platform/.* . 2>/dev/null || true
        
        # Remove empty directories
        rm -rf Desktop
        
        echo "   ✅ Files moved to root directory"
    else
        echo "   ❌ Unexpected structure - Desktop/healthcare-platform not found"
        ls -la
        exit 1
    fi
elif [ -f "package.json" ]; then
    echo "   ✅ Files are already at root level!"
    echo "   No restructuring needed."
    exit 0
else
    echo "   ❌ Unknown repository structure"
    ls -la
    exit 1
fi

# Commit the restructure
echo "💾 Committing restructured files..."
git add -A
git commit -m "Fix repository structure - move files to root directory

- Moved all project files from Desktop/healthcare-platform/ to root
- This allows Vercel to correctly find package.json
- No code changes, only file structure reorganization"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Repository structure fixed!"
echo "======================================"
echo ""
echo "📌 Next Steps:"
echo "1. Go back to Vercel: https://vercel.com/new"
echo "2. Import your repository again"
echo "3. Leave 'Root Directory' field EMPTY (or set to './')"
echo "4. Deploy should now work correctly!"
echo ""
echo "🎯 Your package.json is now at:"
echo "   https://github.com/yndrdev/totalrecover/blob/main/package.json"

# Cleanup
cd /
rm -rf "$TEMP_DIR"