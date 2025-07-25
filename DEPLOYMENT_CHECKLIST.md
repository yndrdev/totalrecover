# Total Recover - Deployment Checklist

## 🚀 GitHub Setup

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository settings:
   - **Name**: `total-recover`
   - **Description**: Multi-tenant healthcare platform for post-surgical recovery
   - **Visibility**: Private
   - **Initialize repository**: Leave ALL options unchecked (no README, .gitignore, or license)
3. Click "Create repository"

### Step 2: Push Code to GitHub
Run the setup script:
```bash
./setup-github.sh
```

Or manually:
```bash
# Remove old remote
git remote remove origin

# Add new remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/total-recover.git

# Stage all changes
git add -A

# Create initial commit
git commit -m "Initial commit - Total Recover healthcare app"

# Push to GitHub
git push -u origin main
```

## 🔧 Vercel Deployment

### Step 1: Import Project
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `total-recover` repository
4. Configure project:
   - **Project Name**: total-recover
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./ (leave as is)

### Step 2: Environment Variables
Add the following in Vercel dashboard:

#### Required Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Twilio (SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Resend (Email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Security
ENCRYPTION_KEY=
JWT_SECRET=
SESSION_SECRET=

# Application
NEXT_PUBLIC_APP_URL=https://total-recover.vercel.app
NEXT_PUBLIC_BRAND_NAME=Total Recover

# License Verification (if applicable)
LICENSE_API_URL=
LICENSE_API_KEY=
```

#### Optional Variables
```
# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
CSP_REPORT_URI=

# Feature Flags
ENABLE_VOICE_INPUT=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=true
```

### Step 3: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Verify deployment at your Vercel URL

## 📋 Post-Deployment Tasks

### Database Setup
1. **Run Migrations**:
   - Connect to your Supabase project
   - Run migrations in order:
     ```sql
     -- Run each file in supabase/migrations/ in order
     -- Start with the numbered migrations (001_, 002_, etc.)
     -- Then run the dated migrations
     ```

2. **Configure Auth**:
   - Enable Email/Password authentication
   - Configure OAuth providers if needed
   - Set up email templates

3. **Storage Buckets**:
   - Create `patient-uploads` bucket for file uploads
   - Create `exercise-videos` bucket for content
   - Set appropriate permissions

### Verification Steps
- [ ] Homepage loads without errors
- [ ] Authentication flow works (signup/signin)
- [ ] Database connections are working
- [ ] Environment variables are properly set
- [ ] No sensitive data in logs
- [ ] SSL certificate is active

### Custom Domain (Optional)
1. Go to Vercel project settings
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

## 🔒 Security Checklist
- [ ] All `.env` files are ignored by git
- [ ] No hardcoded credentials in code
- [ ] Database has proper indexes
- [ ] RLS policies are configured (after demo)
- [ ] API routes have proper authentication
- [ ] CORS is properly configured

## 📞 Support Contacts
- **Supabase Support**: support@supabase.com
- **Vercel Support**: support@vercel.com
- **Your Team**: support@totalrecover.com

## 🎉 Launch!
Once all checks are complete, your Total Recover platform is ready for use!