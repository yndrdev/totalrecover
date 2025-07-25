# 🚀 Total Recover - Quick Deploy Guide

Deploy your Total Recover app to Vercel in minutes!

## Prerequisites
- [ ] GitHub repository created and code pushed
- [ ] Vercel account (free at vercel.com)
- [ ] Environment variables ready (.env.local file)

## 🎯 Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Visit Vercel Import Page**
   ```
   https://vercel.com/new
   ```

2. **Import Your Repository**
   - Click "Import Git Repository"
   - Select `total-recover` from your GitHub
   - Click "Import"

3. **Configure Project**
   - Project Name: `total-recover`
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`

4. **Add Environment Variables**
   ```bash
   # Generate formatted env vars:
   npm run setup-env-vercel
   ```
   - Copy the JSON output (Option 2)
   - In Vercel: Click "Environment Variables"
   - Click "Add Multiple"
   - Paste and save

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - 🎉 Your app is live!

## ⚡ Option 2: Deploy via CLI (Faster)

1. **Run Deployment Script**
   ```bash
   npm run deploy
   ```
   Or manually:
   ```bash
   npx vercel --prod
   ```

2. **Follow Prompts**
   - Login to Vercel
   - Select scope
   - Project name: `total-recover`
   - Confirm settings

3. **Set Environment Variables**
   ```bash
   # After deployment, run:
   npm run setup-env-vercel
   
   # Copy commands from Option 1 output
   # Paste into terminal one by one
   ```

## 📋 Post-Deployment Checklist

### Immediate Tasks
- [ ] Visit your live URL: `https://total-recover.vercel.app`
- [ ] Test authentication flow
- [ ] Verify database connection
- [ ] Check environment variables in Vercel dashboard

### Database Setup (Supabase)
1. Run migrations in your Supabase project:
   ```sql
   -- In Supabase SQL Editor, run each file in order:
   -- 1. First numbered migrations (001_, 002_, etc.)
   -- 2. Then dated migrations (20240120_, etc.)
   -- 3. Finally the demo migrations (20250125_)
   ```

2. Configure Auth:
   - Enable Email auth
   - Set redirect URLs to your Vercel domain
   - Configure email templates

### Custom Domain (Optional)
1. In Vercel Dashboard → Settings → Domains
2. Add your domain: `app.totalrecover.com`
3. Configure DNS as instructed
4. Update `NEXT_PUBLIC_APP_URL` env var

## 🆘 Troubleshooting

### Build Fails
- Check all required env vars are set
- Verify Node version compatibility
- Review build logs in Vercel

### Database Connection Issues
- Verify Supabase URL and keys
- Check if migrations ran successfully
- Ensure RLS is disabled (for demo)

### Authentication Problems
- Verify redirect URLs in Supabase
- Check JWT secrets match
- Ensure email templates are configured

## 🔗 Quick Links

- **Your App**: https://total-recover.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Environment Variables**: https://vercel.com/[your-name]/total-recover/settings/environment-variables
- **Deployment Logs**: https://vercel.com/[your-name]/total-recover/deployments

## 💡 Pro Tips

1. **Use Preview Deployments**
   - Every PR gets its own preview URL
   - Test changes before merging

2. **Monitor Performance**
   - Check Analytics tab in Vercel
   - Set up alerts for errors

3. **Optimize Costs**
   - Use ISR for static pages
   - Implement proper caching
   - Monitor function usage

---

Need help? Check the [full deployment guide](./DEPLOYMENT_CHECKLIST.md) or create an issue!