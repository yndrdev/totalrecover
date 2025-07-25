#!/usr/bin/env node

/**
 * Generate environment variables for Vercel deployment
 * This script creates a formatted list of environment variables
 * that can be easily copied to Vercel's dashboard
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Total Recover - Environment Variables for Vercel');
console.log('================================================\n');

// Define required environment variables
const envVars = {
  required: {
    '# Supabase': [
      { name: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Your Supabase project URL' },
      { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Supabase anonymous key' },
      { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase service role key (keep secret!)' }
    ],
    '# OpenAI': [
      { name: 'OPENAI_API_KEY', description: 'OpenAI API key for chat functionality' }
    ],
    '# Twilio (SMS)': [
      { name: 'TWILIO_ACCOUNT_SID', description: 'Twilio Account SID' },
      { name: 'TWILIO_AUTH_TOKEN', description: 'Twilio Auth Token' },
      { name: 'TWILIO_PHONE_NUMBER', description: 'Your Twilio phone number (with country code)' }
    ],
    '# Resend (Email)': [
      { name: 'RESEND_API_KEY', description: 'Resend API key for email notifications' },
      { name: 'RESEND_FROM_EMAIL', description: 'Email address to send from (e.g., noreply@totalrecover.com)' }
    ],
    '# Security': [
      { name: 'ENCRYPTION_KEY', description: '32-character encryption key (generate with: openssl rand -hex 16)' },
      { name: 'JWT_SECRET', description: 'JWT secret for authentication (generate with: openssl rand -hex 32)' },
      { name: 'SESSION_SECRET', description: 'Session secret (generate with: openssl rand -hex 32)' }
    ],
    '# Application': [
      { name: 'NEXT_PUBLIC_APP_URL', description: 'Your Vercel URL (e.g., https://total-recover.vercel.app)', defaultValue: 'https://total-recover.vercel.app' },
      { name: 'NEXT_PUBLIC_BRAND_NAME', description: 'Your brand name', defaultValue: 'Total Recover' }
    ]
  },
  optional: {
    '# Monitoring': [
      { name: 'SENTRY_DSN', description: 'Sentry DSN for error tracking' },
      { name: 'NEXT_PUBLIC_SENTRY_DSN', description: 'Public Sentry DSN' },
      { name: 'CSP_REPORT_URI', description: 'Content Security Policy report URI' }
    ],
    '# License Verification': [
      { name: 'LICENSE_API_URL', description: 'License verification API URL' },
      { name: 'LICENSE_API_KEY', description: 'License verification API key' }
    ],
    '# Feature Flags': [
      { name: 'ENABLE_VOICE_INPUT', description: 'Enable voice input feature', defaultValue: 'true' },
      { name: 'ENABLE_SMS_NOTIFICATIONS', description: 'Enable SMS notifications', defaultValue: 'true' },
      { name: 'ENABLE_EMAIL_NOTIFICATIONS', description: 'Enable email notifications', defaultValue: 'true' }
    ]
  }
};

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
let existingEnv = {};

if (fs.existsSync(envLocalPath)) {
  console.log('📄 Found .env.local file, reading existing values...\n');
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      existingEnv[key.trim()] = value.trim();
    }
  });
}

// Generate commands for Vercel CLI
console.log('📝 OPTION 1: Copy these commands for Vercel CLI:\n');
console.log('```bash');

const printEnvVars = (vars, required = true) => {
  Object.entries(vars).forEach(([category, variables]) => {
    console.log(`\n${category}`);
    variables.forEach(({ name, description, defaultValue }) => {
      const value = existingEnv[name] || defaultValue || `your_${name.toLowerCase()}`;
      console.log(`vercel env add ${name} production`);
      console.log(`# Enter: ${value}`);
    });
  });
};

printEnvVars(envVars.required, true);
printEnvVars(envVars.optional, false);

console.log('```\n');

// Generate JSON format for bulk import
console.log('📋 OPTION 2: Copy this JSON for Vercel Dashboard:\n');
console.log('Go to: https://vercel.com/[your-name]/total-recover/settings/environment-variables');
console.log('Click "Add Multiple" and paste this:\n');

const jsonVars = [];

const addToJson = (vars) => {
  Object.entries(vars).forEach(([category, variables]) => {
    variables.forEach(({ name, description, defaultValue }) => {
      const value = existingEnv[name] || defaultValue || '';
      jsonVars.push({
        key: name,
        value: value,
        target: ['production', 'preview', 'development']
      });
    });
  });
};

addToJson(envVars.required);
addToJson(envVars.optional);

console.log('```json');
console.log(JSON.stringify(jsonVars, null, 2));
console.log('```\n');

// Generate .env template
console.log('📄 OPTION 3: Environment variables template:\n');
console.log('```env');

const printEnvTemplate = (vars, required = true) => {
  Object.entries(vars).forEach(([category, variables]) => {
    console.log(`\n${category}`);
    variables.forEach(({ name, description, defaultValue }) => {
      const value = existingEnv[name] || defaultValue || `your_${name.toLowerCase()}`;
      console.log(`# ${description}`);
      console.log(`${name}=${value}`);
    });
  });
};

printEnvTemplate(envVars.required, true);
console.log('\n# ===== OPTIONAL VARIABLES =====');
printEnvTemplate(envVars.optional, false);

console.log('```\n');

// Security reminders
console.log('⚠️  IMPORTANT SECURITY REMINDERS:');
console.log('1. Never commit .env.local to git');
console.log('2. Use different values for production vs development');
console.log('3. Rotate keys regularly');
console.log('4. Keep service role keys extra secure\n');

// Generate random secrets
console.log('🔐 Generate secure random values:');
console.log('- Encryption Key (32 chars): openssl rand -hex 16');
console.log('- JWT Secret: openssl rand -hex 32');
console.log('- Session Secret: openssl rand -hex 32\n');

console.log('✅ Environment variable setup complete!');
console.log('Choose one of the options above to configure Vercel.\n');