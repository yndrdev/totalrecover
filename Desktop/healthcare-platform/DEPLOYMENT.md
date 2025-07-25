# TJV Recovery Platform - Deployment Guide

## 🚀 Vercel Deployment Instructions

This guide will help you deploy the TJV Recovery Platform to Vercel successfully.

## Prerequisites

- GitHub repository connected to Vercel
- Vercel account with a project created
- All required API keys and credentials ready

## Step-by-Step Deployment

### 1. Environment Variables Configuration

**CRITICAL**: All environment variables must be configured in Vercel before deployment.

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (tjv-recover)
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

#### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Resend Configuration (Email)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Security Configuration
ENCRYPTION_KEY=your_32_character_encryption_key
JWT_SECRET=your_jwt_secret_base64_encoded
SESSION_SECRET=your_session_secret

# Application Configuration
NEXT_PUBLIC_APP_URL=https://tjv-recover.vercel.app
NEXT_PUBLIC_BRAND_NAME=TJV Recovery

# Vercel MCP Configuration
VERCEL_MCP_TOKEN=your_vercel_mcp_token
```

#### Optional/Production Environment Variables

```bash
# Monitoring (Required for Production)
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn
CSP_REPORT_URI=your_csp_report_uri

# License Verification
LICENSE_API_URL=https://your-license-api.com
LICENSE_API_KEY=your_license_api_key

# File Storage Configuration
MAX_FILE_SIZE_MB=50
ALLOWED_FILE_TYPES=pdf,mp4,mov,jpg,jpeg,png

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Feature Flags
ENABLE_VOICE_INPUT=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=true

# Development Settings (NEVER true in production)
BYPASS_AUTH=false
```

### 2. Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set in Vercel
- [ ] Local build succeeds: `npm run build`
- [ ] No sensitive data in code (API keys, passwords)
- [ ] Database migrations are applied
- [ ] Supabase RLS policies are configured
- [ ] Branch is up to date with main

### 3. Build Configuration

Vercel should automatically detect Next.js, but verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x or higher

### 4. Deployment Process

#### Option A: Automatic Deployment (Recommended)
1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
2. Vercel will automatically deploy

#### Option B: Manual Deployment
1. In Vercel Dashboard, click "Deployments"
2. Click "Deploy" or "Redeploy"
3. Select the branch to deploy

### 5. Post-Deployment Verification

After deployment:

1. **Check deployment logs** for any errors
2. **Test critical paths**:
   - Authentication flow
   - Patient chat interface
   - Provider dashboard
   - API endpoints
3. **Verify environment variables** are working:
   - Check browser console for missing public variables
   - Test API features (OpenAI chat, SMS, email)

## Common Deployment Issues

### Issue: "Module not found" errors
**Solution**: Clear cache and redeploy
```bash
vercel --force
```

### Issue: "Environment variable missing" errors
**Solution**: 
1. Verify variable is set in Vercel dashboard
2. Redeploy after adding variables
3. Check for typos in variable names

### Issue: "Build failed" with TypeScript/ESLint errors
**Solution**: 
1. Fix errors locally first: `npm run build`
2. Or temporarily ignore in next.config.ts (not recommended)

### Issue: "500 Internal Server Error" in production
**Solution**:
1. Check Vercel function logs
2. Verify all environment variables
3. Check Supabase connection
4. Review middleware configuration

## Security Considerations

1. **Never commit .env files** to version control
2. **Use different API keys** for development and production
3. **Enable Vercel's security headers**
4. **Set up domain verification** in Vercel
5. **Configure CORS properly** for API routes

## Monitoring and Logs

### Viewing Logs
1. Go to Vercel Dashboard → Your Project
2. Click on "Functions" tab
3. Select a function to view logs
4. Use "Runtime Logs" for real-time debugging

### Setting up Monitoring
1. Configure Sentry for error tracking
2. Set up Vercel Analytics
3. Enable Vercel Speed Insights

## Rollback Procedure

If deployment fails:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"
4. Investigate and fix issues before redeploying

## Environment-Specific Configurations

### Production
- All security variables required
- BYPASS_AUTH must be false
- Monitoring enabled
- Rate limiting active

### Preview (Staging)
- Same as production but with test API keys
- Can use different database

### Development
- Can use BYPASS_AUTH=true
- Local Supabase instance optional
- Debug logging enabled

## CI/CD Pipeline (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

## Support and Troubleshooting

### Getting Help
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review deployment logs in Vercel dashboard
3. Check [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

### Debug Mode
Add these to environment variables for more logging:
```bash
DEBUG=true
NODE_ENV=development
```

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and rotate API keys quarterly
- Monitor error rates and performance
- Keep documentation updated

### Before Major Updates
1. Test thoroughly in preview environment
2. Backup database
3. Notify users of maintenance window
4. Have rollback plan ready

---

Last Updated: January 2025