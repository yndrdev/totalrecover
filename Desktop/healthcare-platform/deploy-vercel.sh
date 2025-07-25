#!/bin/bash

# Total Recover - Vercel Deployment Script
# This script helps deploy to Vercel using the CLI

echo "🚀 Total Recover - Vercel Deployment"
echo "===================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo ""
    echo "📦 Would you like to install it now? (y/n)"
    read -p "> " INSTALL_VERCEL
    
    if [ "$INSTALL_VERCEL" = "y" ]; then
        echo "Installing Vercel CLI..."
        npm i -g vercel
        echo "✅ Vercel CLI installed!"
    else
        echo "Please install Vercel CLI manually:"
        echo "  npm i -g vercel"
        exit 1
    fi
fi

echo "✅ Vercel CLI is installed"
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status -s
    echo ""
    echo "Would you like to commit them first? (y/n)"
    read -p "> " COMMIT_CHANGES
    
    if [ "$COMMIT_CHANGES" = "y" ]; then
        git add -A
        read -p "Enter commit message: " COMMIT_MSG
        git commit -m "$COMMIT_MSG"
        git push
    fi
fi

# Deployment options
echo "📋 Deployment Options:"
echo "1. Deploy to production (recommended for first deployment)"
echo "2. Deploy to preview"
echo "3. Link existing project"
echo ""
read -p "Select option (1-3): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        echo ""
        echo "🚀 Deploying to production..."
        echo ""
        echo "ℹ️  Vercel will ask you to:"
        echo "1. Login (if not already logged in)"
        echo "2. Select scope (your account or team)"
        echo "3. Link to existing project or create new"
        echo "4. Configure project settings"
        echo ""
        echo "📝 Project Configuration:"
        echo "- Project Name: total-recover"
        echo "- Framework: Next.js (auto-detected)"
        echo "- Build Command: npm run build"
        echo "- Output Directory: .next"
        echo "- Install Command: npm install"
        echo ""
        echo "Press Enter to continue..."
        read
        
        vercel --prod
        ;;
    2)
        echo ""
        echo "🔄 Deploying to preview..."
        vercel
        ;;
    3)
        echo ""
        echo "🔗 Linking to existing project..."
        vercel link
        echo ""
        echo "✅ Project linked! Now you can deploy with:"
        echo "  vercel --prod"
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment process completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Visit your Vercel dashboard to configure environment variables"
echo "2. Set up your custom domain (optional)"
echo "3. Configure production environment variables"
echo ""
echo "🔗 Useful Links:"
echo "- Dashboard: https://vercel.com/dashboard"
echo "- Environment Variables: https://vercel.com/[your-name]/total-recover/settings/environment-variables"
echo "- Domains: https://vercel.com/[your-name]/total-recover/settings/domains"
echo ""
echo "💡 Tip: Run 'npm run setup-env-vercel' to generate environment variables for easy copying!"