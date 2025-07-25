# TJV Recovery Platform Environment Variables Documentation

## 🚨 CRITICAL: Healthcare Software Requirements

This is healthcare software handling PHI (Protected Health Information). ALL security variables are REQUIRED for HIPAA compliance.

## Environment Setup

### 1. Copy the example file

```bash
cp .env.local.example .env.local
```

### 2. Update with your actual values

Replace all placeholder values with your actual credentials.

## Required Environment Variables

### 🔐 Supabase Configuration (REQUIRED)

```bash
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://slhdxlhnwujvqkwdgfko.supabase.co

# Your Supabase anonymous key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your Supabase service role key (server-side only - KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 🤖 OpenAI Configuration (REQUIRED)

```bash
# OpenAI API key for AI-powered features
OPENAI_API_KEY=sk-proj-...
```

### 📱 Twilio Configuration (REQUIRED - SMS)

```bash
# Twilio account credentials for SMS notifications
TWILIO_ACCOUNT_SID=SKf4e17c02855d5caccc7b6f084317123
TWILIO_AUTH_TOKEN=2dM0R1A5Yg5B3qrCB2Pgra3byhKbTqGY
TWILIO_PHONE_NUMBER=4706915270
```

### 📧 Resend Configuration (REQUIRED - Email)

```bash
# Resend API for email notifications
RESEND_API_KEY=re_dZtn9Baw_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 🔒 Security Configuration (REQUIRED - HIPAA)

```bash
# 32-character encryption key for PHI data
ENCRYPTION_KEY=your_32_character_encryption_key_must_be_32_chars

# JWT secret for authentication tokens
JWT_SECRET=qAICKSd9EVOeCOaNrabJlgASbfU120jADQhiz8L5jpLX/0o7eMtSHbBtrocaCvPXvsubuVUaZbjQTebmTEMQ5A==

# Session secret for secure sessions
SESSION_SECRET=your_session_secret_for_auth
```

### 🌐 Application Configuration

```bash
# Your production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Brand name for multi-tenant support
NEXT_PUBLIC_BRAND_NAME=TJV Recovery
```

### 📊 Monitoring (REQUIRED for Production)

```bash
# Sentry error tracking
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn

# Content Security Policy reporting
CSP_REPORT_URI=your_csp_report_uri
```

### 🔑 License Verification (REQUIRED)

```bash
# API for verifying healthcare provider licenses
LICENSE_API_URL=https://your-license-api.com
LICENSE_API_KEY=your_license_api_key
```

### 📁 File Storage Configuration

```bash
# Maximum file upload size in MB
MAX_FILE_SIZE_MB=50

# Allowed file types (comma-separated)
ALLOWED_FILE_TYPES=pdf,mp4,mov,jpg,jpeg,png
```

### ⚡ Rate Limiting

```bash
# API rate limiting per minute
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

### 🚀 Feature Flags

```bash
# Enable/disable features
ENABLE_VOICE_INPUT=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=true
```

### 🛠️ Development Settings

```bash
# DANGER: Only for development - bypasses authentication
BYPASS_AUTH=false
```

## Security Best Practices

1. **Never commit `.env.local` to version control**

   - The `.gitignore` file already excludes it
   - Use `.env.local.example` as a template

2. **Rotate keys regularly**

   - Especially `ENCRYPTION_KEY`, `JWT_SECRET`, and API keys
   - Update in production first, then development

3. **Use different keys for each environment**

   - Never use production keys in development
   - Maintain separate Supabase projects for dev/staging/prod

4. **Secure key storage in production**

   - Use Vercel environment variables
   - Or your hosting provider's secret management
   - Never hardcode sensitive values

5. **Monitor for exposed keys**
   - Set up GitHub secret scanning
   - Use tools like GitGuardian
   - Immediately rotate any exposed keys

## Environment-Specific Files

- `.env.local` - Local development (gitignored)
- `.env.production` - Production values (use hosting provider's env vars instead)
- `.env.test` - Testing environment

## Validation Script

Create a validation script to ensure all required variables are set:

```javascript
// scripts/validate-env.js
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "RESEND_API_KEY",
  "ENCRYPTION_KEY",
  "JWT_SECRET",
  "SESSION_SECRET",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach((key) => console.error(`   - ${key}`));
  process.exit(1);
}

console.log("✅ All required environment variables are set");
```

## Troubleshooting

### Common Issues

1. **"Invalid Supabase URL"**

   - Ensure URL includes `https://` and ends with `.supabase.co`
   - Check for trailing slashes

2. **"Authentication failed"**

   - Verify JWT_SECRET matches across services
   - Check key expiration dates

3. **"SMS not sending"**

   - Verify Twilio phone number format (+1 prefix for US)
   - Check Twilio account balance

4. **"Encryption errors"**
   - ENCRYPTION_KEY must be exactly 32 characters
   - Use only alphanumeric characters

### Getting Help

- Check logs in Vercel/hosting dashboard
- Enable debug mode: `DEBUG=true`
- Contact support with sanitized error messages (remove sensitive data)

## Updates and Maintenance

This document should be updated whenever:

- New environment variables are added
- Security requirements change
- Integration providers change
- Best practices evolve

Last updated: January 2025
