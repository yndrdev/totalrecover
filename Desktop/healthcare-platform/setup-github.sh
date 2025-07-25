#!/bin/bash

# Total Recover - GitHub Repository Setup Script
# This script helps set up a fresh GitHub repository

echo "🚀 Total Recover - GitHub Repository Setup"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git is not initialized in this directory."
    echo "Please run this script from the project root."
    exit 1
fi

echo "📝 Current git status:"
git status --short
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME
echo ""

echo "⚠️  This script will:"
echo "1. Remove the existing remote origin (tjv-recover)"
echo "2. Add new remote origin: https://github.com/$GITHUB_USERNAME/total-recover.git"
echo "3. Stage all current changes"
echo "4. Create an initial commit"
echo "5. Push to the new repository"
echo ""

read -p "Do you want to continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🔧 Step 1: Removing existing remote..."
git remote remove origin 2>/dev/null || echo "No existing remote to remove"

echo "🔧 Step 2: Adding new remote..."
git remote add origin https://github.com/$GITHUB_USERNAME/total-recover.git
echo "✅ Remote added: https://github.com/$GITHUB_USERNAME/total-recover.git"

echo ""
echo "🔧 Step 3: Staging all changes..."
# Add all modified files
git add -u

# Add new files created during our session
git add README.md
git add package.json
git add .gitignore
git add scripts/test-data-access.ts
git add scripts/test-demo-views.ts
git add supabase/migrations/20250125_adapt_for_demo.sql
git add supabase/migrations/20250125_disable_rls_demo.sql
git add supabase/migrations/20250125_seed_demo_data.sql

# Add any other new files in the project directory (but not parent directories)
git add app/ components/ lib/ supabase/ public/ docs/ tests/ 2>/dev/null || true

echo "✅ Files staged"

echo ""
echo "🔧 Step 4: Creating initial commit..."
git commit -m "Initial commit - Total Recover healthcare app

Total Recover is a comprehensive multi-tenant healthcare platform for post-surgical recovery management. Features include:
- Multi-tenant architecture for healthcare practices
- Patient task tracking and recovery protocols
- Provider dashboards for patient management
- HIPAA-compliant communication
- Pre-op and post-op care workflows"

echo "✅ Initial commit created"

echo ""
echo "🔧 Step 5: Ready to push to GitHub"
echo ""
echo "⚠️  IMPORTANT: Before pushing, make sure you have:"
echo "1. Created a new PRIVATE repository named 'total-recover' on GitHub"
echo "2. Do NOT initialize it with README, .gitignore, or license"
echo ""
echo "📌 To create the repository, visit:"
echo "   https://github.com/new"
echo "   - Repository name: total-recover"
echo "   - Description: Multi-tenant healthcare platform for post-surgical recovery"
echo "   - Private repository: ✓"
echo "   - Initialize with README: ✗"
echo ""

read -p "Have you created the repository on GitHub? (y/n): " REPO_CREATED
if [ "$REPO_CREATED" != "y" ]; then
    echo ""
    echo "Please create the repository first, then run:"
    echo "   git push -u origin main"
    exit 0
fi

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your code has been pushed to GitHub."
    echo ""
    echo "🔗 Your repository is now available at:"
    echo "   https://github.com/$GITHUB_USERNAME/total-recover"
    echo ""
    echo "📋 Next steps:"
    echo "1. Verify all files are properly uploaded"
    echo "2. Check that .env files are NOT included"
    echo "3. Set up branch protection rules if needed"
    echo "4. Connect to Vercel for deployment"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. The repository exists on GitHub"
    echo "2. You have the correct permissions"
    echo "3. Your GitHub credentials are set up"
    echo ""
    echo "You can manually push with:"
    echo "   git push -u origin main"
fi