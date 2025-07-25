#!/bin/bash

# Final Fix for GitHub Repository Structure
echo "🔧 FINAL FIX for GitHub Repository Structure"
echo "==========================================="

# Save current changes
echo "💾 Saving current changes..."
git stash

# Create a new temporary directory
echo "📁 Creating clean workspace..."
TEMP_DIR=$(mktemp -d)
CURRENT_DIR=$(pwd)

# Clone just the structure we need to fix
echo "📥 Cloning repository to fix structure..."
cd "$TEMP_DIR"
git clone https://github.com/yndrdev/totalrecover.git totalrecover-fix
cd totalrecover-fix

# Check if Desktop folder exists
if [ -d "Desktop" ]; then
    echo "✅ Found Desktop folder - fixing structure..."
    
    # Move everything from Desktop/healthcare-platform to root
    if [ -d "Desktop/healthcare-platform" ]; then
        # Use mv with -n to not overwrite existing files
        mv -n Desktop/healthcare-platform/* . 2>/dev/null || true
        mv -n Desktop/healthcare-platform/.* . 2>/dev/null || true
        
        # Remove the Desktop directory
        rm -rf Desktop
        
        echo "📦 Files moved to root successfully"
    fi
    
    # Add all changes
    git add -A
    
    # Commit the fix
    git commit -m "Fix repository structure - move files to root

This commit moves all project files from Desktop/healthcare-platform/ to the repository root.
This is required for Vercel deployment to find package.json correctly.
No code changes - only directory restructuring."
    
    # Push the fix
    echo "🚀 Pushing fixed structure to GitHub..."
    git push origin main
    
    echo ""
    echo "✅ Repository structure fixed on GitHub!"
    
else
    echo "❓ Desktop folder not found - checking current structure..."
    if [ -f "package.json" ]; then
        echo "✅ Files are already at root level!"
    else
        echo "❌ Unexpected repository structure"
    fi
fi

# Go back to original directory
cd "$CURRENT_DIR"

# Clean up
rm -rf "$TEMP_DIR"

# Restore stashed changes
echo "♻️  Restoring your local changes..."
git stash pop 2>/dev/null || true

echo ""
echo "🎯 DONE! Next steps:"
echo "1. Check: https://github.com/yndrdev/totalrecover/blob/main/package.json"
echo "2. Go to Vercel and redeploy"
echo "3. Leave Root Directory field EMPTY in Vercel"