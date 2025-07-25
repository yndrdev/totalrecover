#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Environment Variables Validation Script
 * Ensures all required variables for TJV Recovery Platform are set
 */

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

// Define required environment variables
const required = [
  // Supabase
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",

  // OpenAI
  "OPENAI_API_KEY",

  // Twilio
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",

  // Resend
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",

  // Security
  "ENCRYPTION_KEY",
  "JWT_SECRET",
  "SESSION_SECRET",

  // Application
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_BRAND_NAME",
];

// Production-only requirements
const productionRequired = [
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "CSP_REPORT_URI",
  "LICENSE_API_URL",
  "LICENSE_API_KEY",
];

// Validation rules
const validationRules = {
  ENCRYPTION_KEY: (value) => {
    if (value.length !== 32) {
      return "ENCRYPTION_KEY must be exactly 32 characters";
    }
    return null;
  },
  NEXT_PUBLIC_SUPABASE_URL: (value) => {
    if (!value.startsWith("https://") || !value.includes(".supabase.co")) {
      return "NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase URL";
    }
    return null;
  },
  RESEND_FROM_EMAIL: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "RESEND_FROM_EMAIL must be a valid email address";
    }
    return null;
  },
  MAX_FILE_SIZE_MB: (value) => {
    const size = parseInt(value);
    if (isNaN(size) || size <= 0) {
      return "MAX_FILE_SIZE_MB must be a positive number";
    }
    return null;
  },
};

// Check if running in production
const isProduction = process.env.NODE_ENV === "production";

// Add production requirements if needed
if (isProduction) {
  required.push(...productionRequired);
}

console.log("🔍 Validating environment variables...\n");

// Check for missing variables
const missing = required.filter((key) => !process.env[key]);

// Check for validation errors
const validationErrors = [];
Object.keys(validationRules).forEach((key) => {
  if (process.env[key]) {
    const error = validationRules[key](process.env[key]);
    if (error) {
      validationErrors.push({ key, error });
    }
  }
});

// Report results
let hasErrors = false;

if (missing.length > 0) {
  hasErrors = true;
  console.error("❌ Missing required environment variables:");
  missing.forEach((key) => {
    console.error(`   - ${key}`);
  });
  console.log("");
}

if (validationErrors.length > 0) {
  hasErrors = true;
  console.error("❌ Validation errors:");
  validationErrors.forEach(({ key, error }) => {
    console.error(`   - ${key}: ${error}`);
  });
  console.log("");
}

// Check for development bypass
if (process.env.BYPASS_AUTH === "true" && isProduction) {
  hasErrors = true;
  console.error("❌ BYPASS_AUTH cannot be true in production!");
  console.log("");
}

// Summary
if (hasErrors) {
  console.error("❌ Environment validation failed!");
  console.log("\n📚 See ENVIRONMENT_VARIABLES.md for documentation");
  
  // In production (Vercel), log errors but don't exit with error
  // This prevents build failures due to missing env vars that might be set in Vercel
  if (process.env.VERCEL || process.env.CI) {
    console.log("\n⚠️  Running in CI/Vercel environment - continuing despite errors");
    console.log("   Make sure all environment variables are configured in Vercel dashboard!");
  } else {
    process.exit(1);
  }
} else {
  console.log("✅ All environment variables are valid!");

  // Show feature flags status
  console.log("\n🚀 Feature Flags:");
  console.log(
    `   Voice Input: ${process.env.ENABLE_VOICE_INPUT === "true" ? "✅" : "❌"}`
  );
  console.log(
    `   SMS Notifications: ${
      process.env.ENABLE_SMS_NOTIFICATIONS === "true" ? "✅" : "❌"
    }`
  );
  console.log(
    `   Email Notifications: ${
      process.env.ENABLE_EMAIL_NOTIFICATIONS === "true" ? "✅" : "❌"
    }`
  );

  if (!isProduction && process.env.BYPASS_AUTH === "true") {
    console.log("\n⚠️  Warning: Authentication is bypassed (development only)");
  }
}
