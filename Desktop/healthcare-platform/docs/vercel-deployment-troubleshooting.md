# Vercel Deployment Troubleshooting Guide

## Common GitHub to Vercel Issues

### 1. Build Configuration Issues

#### Check `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper build settings
  output: 'standalone', // Only if needed for Docker
  typescript: {
    ignoreBuildErrors: false, // Set to true temporarily if needed
  },
  eslint: {
    ignoreDuringBuilds: false, // Set to true temporarily if needed
  },
  // Add any required experimental features
  experimental: {
    serverComponentsExternalPackages: [],
  },
}

module.exports = nextConfig
```

#### Verify `package.json` Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 2. Environment Variables

#### Required Environment Variables for Vercel
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
BYPASS_AUTH=true
```

#### Setting Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable for Production, Preview, and Development

### 3. Node.js Version Issues

#### Specify Node Version
Create `.nvmrc` file:
```
18.17.0
```

Or in `package.json`:
```json
{
  "engines": {
    "node": ">=18.17.0"
  }
}
```

### 4. Database Connection Issues

#### Common Problems
- **Supabase URL mismatch**: Ensure production URL is correct
- **API Key mismatch**: Verify anon key and service key
- **Database migrations**: Ensure schema is up to date in production

#### Quick Test
Create a simple API route to test database connection:
```javascript
// pages/api/test-db.js
export default async function handler(req, res) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

### 5. Build Error Debugging

#### Common Build Errors

**TypeScript Errors**
```bash
# Check locally first
npm run build

# If TypeScript errors, fix them or temporarily:
# In next.config.js:
typescript: {
  ignoreBuildErrors: true,
}
```

**ESLint Errors**
```bash
# Check locally
npm run lint

# If ESLint errors, fix them or temporarily:
# In next.config.js:
eslint: {
  ignoreDuringBuilds: true,
}
```

**Dependency Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 6. Vercel Function Limits

#### Check Function Size
- Serverless functions have size limits
- Large dependencies can cause deployment failures
- Consider code splitting for large components

#### Optimize Bundle Size
```javascript
// next.config.js
const nextConfig = {
  // Optimize bundle
  swcMinify: true,
  compress: true,
  
  // Analyze bundle (optional)
  experimental: {
    bundlePagesRouterDependencies: true,
  },
}
```

### 7. Debugging Steps

#### 1. Check Vercel Deployment Logs
- Go to Vercel Dashboard
- Click on failed deployment
- Check "View Function Logs"
- Look for specific error messages

#### 2. Test Locally with Production Build
```bash
npm run build
npm run start
```

#### 3. Verify Environment Variables
```bash
# In your API route or page
console.log('Environment check:', {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});
```

#### 4. Check Git Integration
- Ensure Vercel is connected to correct GitHub repository
- Verify branch settings (main/master)
- Check if specific directories need to be deployed

### 8. Immediate Fix Checklist

#### For Your Current Issue:
1. **Check Build Command**: Ensure `npm run build` works locally
2. **Verify Environment Variables**: All required vars are set in Vercel
3. **Node Version**: Specify Node 18+ in `.nvmrc`
4. **Database Schema**: Ensure production DB matches local
5. **API Routes**: Check for serverless function compatibility
6. **Static Files**: Verify all assets are properly referenced

### 9. Quick Resolution Steps

#### Step 1: Local Build Test
```bash
# In your project directory
npm run build
```
If this fails, fix the local build first.

#### Step 2: Environment Variable Check
Create a simple API route to verify:
```javascript
// pages/api/env-check.js
export default function handler(req, res) {
  res.status(200).json({
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}
```

#### Step 3: Vercel Settings
- Go to Vercel project settings
- Verify "Build & Development Settings"
- Check "Root Directory" if using monorepo
- Ensure "Install Command" and "Build Command" are correct

### 10. Emergency Fixes

#### If Build Keeps Failing:
1. **Temporarily disable strict checks**:
   ```javascript
   // next.config.js
   const nextConfig = {
     typescript: { ignoreBuildErrors: true },
     eslint: { ignoreDuringBuilds: true },
   }
   ```

2. **Deploy specific branch**:
   - Create a stable branch
   - Deploy from that branch
   - Fix issues on main/master separately

3. **Manual deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy manually
   vercel --prod
   ```

## Contact Points
- Check Vercel status page for platform issues
- Review Vercel documentation for latest changes
- Consider reaching out to Vercel support for persistent issues

## Success Indicators
- ✅ Local build works (`npm run build`)
- ✅ Environment variables are set
- ✅ Database connection works
- ✅ No TypeScript/ESLint errors
- ✅ Vercel deployment completes successfully