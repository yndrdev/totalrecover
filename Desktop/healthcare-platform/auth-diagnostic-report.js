#!/usr/bin/env node

/**
 * HEALTHCARE PLATFORM AUTHENTICATION DIAGNOSTIC REPORT
 * 
 * This script analyzes the authentication setup and identifies potential issues
 * without requiring direct Supabase MCP access.
 */

console.log('\n🔍 HEALTHCARE PLATFORM AUTHENTICATION DIAGNOSTIC REPORT');
console.log('='*70);

// 1. Environment Configuration Analysis
console.log('\n📋 1. ENVIRONMENT CONFIGURATION ANALYSIS');
console.log('-'*50);

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ACCESS_TOKEN'
];

const fs = require('fs');
const path = require('path');

let envConfig = {};
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envConfig[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.log('❌ ERROR: Could not read .env.local file');
}

requiredEnvVars.forEach(varName => {
  if (envConfig[varName]) {
    console.log(`✅ ${varName}: Configured`);
  } else {
    console.log(`❌ ${varName}: Missing`);
  }
});

// 2. Database Schema Analysis
console.log('\n📊 2. DATABASE SCHEMA ANALYSIS');
console.log('-'*50);

const schemaFiles = [
  'Database docs and infrastructure/minimal-setup.sql',
  'Database docs and infrastructure/CREATE_DEMO_USERS.sql',
  'Database docs and infrastructure/RLS_POLICIES_COMPLETE.sql'
];

schemaFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Schema file exists: ${path.basename(file)}`);
  } else {
    console.log(`❌ Schema file missing: ${path.basename(file)}`);
  }
});

// 3. Demo Users Configuration Analysis
console.log('\n👥 3. DEMO USERS CONFIGURATION ANALYSIS');
console.log('-'*50);

const expectedDemoUsers = [
  'sarah.patient@tjvrecovery.com',
  'mike.patient@tjvrecovery.com', 
  'dr.smith@tjvrecovery.com',
  'nurse.jones@tjvrecovery.com',
  'admin@tjvrecovery.com'
];

console.log('Expected demo accounts:');
expectedDemoUsers.forEach(email => {
  console.log(`  📧 ${email} (Password: Demo123!)`);
});

// 4. Authentication Flow Analysis
console.log('\n🔐 4. AUTHENTICATION FLOW ANALYSIS');
console.log('-'*50);

const authFiles = [
  'app/auth/login/route.ts',
  'app/auth/signup/route.ts', 
  'app/dashboard/page.tsx',
  'middleware.ts'
];

authFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Auth file exists: ${file}`);
    
    // Analyze file content for common issues
    const content = fs.readFileSync(file, 'utf8');
    
    if (file.includes('login/route.ts')) {
      if (content.includes('email_confirmed_at')) {
        console.log('  ⚠️  Email verification check present (may block demo users)');
      }
      if (content.includes('signInWithPassword')) {
        console.log('  ✅ Standard login method used');
      }
    }
    
    if (file.includes('signup/route.ts')) {
      if (content.includes('email_verified: true')) {
        console.log('  ✅ Auto-email verification for demo mode');
      }
      if (content.includes('profiles') && content.includes('insert')) {
        console.log('  ✅ Profile auto-creation configured');
      }
    }
    
    if (file.includes('dashboard/page.tsx')) {
      if (content.includes('No profile found')) {
        console.log('  ✅ Profile error handling implemented');
      }
      if (content.includes('redirect("/login")')) {
        console.log('  ✅ Authentication redirect configured');
      }
    }
  } else {
    console.log(`❌ Auth file missing: ${file}`);
  }
});

// 5. Common Authentication Issues Analysis
console.log('\n🚨 5. COMMON AUTHENTICATION ISSUES ANALYSIS');
console.log('-'*50);

console.log('Potential issues to check in Supabase dashboard:');
console.log('');

console.log('A. EMAIL VERIFICATION SETTINGS:');
console.log('  • Check: Supabase Dashboard → Authentication → Settings');
console.log('  • Issue: "Enable email confirmations" may be turned ON');
console.log('  • Solution: Turn OFF for demo mode');
console.log('');

console.log('B. DEMO USERS IN AUTH.USERS TABLE:');
console.log('  • Check: Supabase Dashboard → Authentication → Users');
console.log('  • Expected users:');
expectedDemoUsers.forEach(email => {
  console.log(`    - ${email}`);
});
console.log('  • Each should have email_confirmed_at timestamp');
console.log('');

console.log('C. PROFILES TABLE RECORDS:');
console.log('  • Check: Supabase Dashboard → Table Editor → profiles');
console.log('  • Each auth user should have corresponding profile record');
console.log('  • Profile.user_id should match auth.users.id');
console.log('  • Profile.role should be: patient, provider, surgeon, nurse, admin');
console.log('');

console.log('D. RLS POLICIES:');
console.log('  • Check: Supabase Dashboard → Authentication → Policies');
console.log('  • Tables should have appropriate RLS policies');
console.log('  • Demo mode may need relaxed policies');
console.log('');

console.log('E. TENANT CONFIGURATION:');
console.log('  • Check: Supabase Dashboard → Table Editor → tenants');
console.log('  • Should have default tenant: 00000000-0000-0000-0000-000000000000');
console.log('  • Name: "TJV Recovery Demo" or "Default Tenant"');

// 6. Debugging Steps
console.log('\n🔧 6. STEP-BY-STEP DEBUGGING GUIDE');
console.log('-'*50);

console.log('STEP 1: Verify Supabase Connection');
console.log('  1. Check .env.local has correct Supabase URL and keys');
console.log('  2. Test connection: npm run dev and check console');
console.log('');

console.log('STEP 2: Reset Demo Environment');
console.log('  1. Run: Database docs and infrastructure/DEMO_RESET_SCRIPT.sql');
console.log('  2. Delete all users in Supabase Auth → Users');
console.log('  3. Turn OFF email confirmation in Auth → Settings');
console.log('');

console.log('STEP 3: Create Demo Users');
console.log('  1. Option A: Register via /register form');
console.log('  2. Option B: Run CREATE_DEMO_USERS.sql in SQL Editor');
console.log('');

console.log('STEP 4: Test Login Flow');
console.log('  1. Try login with: sarah.patient@tjvrecovery.com / Demo123!');
console.log('  2. Check browser console for errors');
console.log('  3. Check network tab for failed requests');
console.log('  4. Verify redirect to /chat (for patients)');
console.log('');

console.log('STEP 5: Check Profile Creation');
console.log('  1. Login should auto-create missing profiles');
console.log('  2. Check profiles table after successful login');
console.log('  3. Verify patient/provider records created');

// 7. SQL Queries for Manual Verification
console.log('\n📝 7. SQL QUERIES FOR MANUAL VERIFICATION');
console.log('-'*50);

console.log('Run these in Supabase SQL Editor to verify setup:');
console.log('');

console.log('-- Check if demo users exist in auth.users');
console.log(`SELECT email, email_confirmed_at, created_at FROM auth.users WHERE email LIKE '%@tjvrecovery.com';`);
console.log('');

console.log('-- Check profiles table');
console.log(`SELECT email, role, is_active, email_verified FROM profiles WHERE email LIKE '%@tjvrecovery.com';`);
console.log('');

console.log('-- Check patients table');
console.log(`SELECT p.first_name, p.last_name, pr.email FROM patients p JOIN profiles pr ON p.user_id = pr.user_id;`);
console.log('');

console.log('-- Check providers table');
console.log(`SELECT p.first_name, p.last_name, p.specialty, pr.email FROM providers p JOIN profiles pr ON p.user_id = pr.user_id;`);
console.log('');

console.log('-- Check tenants');
console.log(`SELECT id, name, subdomain FROM tenants;`);
console.log('');

console.log('-- Check RLS policies');
console.log(`SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';`);

// 8. Final Recommendations
console.log('\n💡 8. FINAL RECOMMENDATIONS');
console.log('-'*50);

console.log('IMMEDIATE ACTIONS:');
console.log('✅ 1. Verify all environment variables are set correctly');
console.log('✅ 2. Turn OFF email confirmation in Supabase for demo');
console.log('✅ 3. Create demo users via registration form or SQL');
console.log('✅ 4. Test login flow with browser dev tools open');
console.log('✅ 5. Check that profiles are auto-created on login');
console.log('');

console.log('PRODUCTION PREPARATION:');
console.log('🔒 1. Re-enable email confirmation before going live');
console.log('🔒 2. Delete demo users and create real accounts');
console.log('🔒 3. Enable full RLS policies for production security');
console.log('🔒 4. Test with real email verification flow');

console.log('\n' + '='*70);
console.log('🎯 DIAGNOSTIC COMPLETE - Use this report to troubleshoot auth issues');
console.log('='*70);