#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Pre-deployment Validation Script
 * Run this before deploying to catch common issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Running pre-deployment checks...\n');

let hasErrors = false;
const warnings = [];

// 1. Check if .env.local exists
console.log('📋 Checking environment setup...');
if (!fs.existsSync('.env.local')) {
  warnings.push('⚠️  .env.local not found - make sure environment variables are set in Vercel');
} else {
  console.log('✅ .env.local found');
}

// 2. Check Node version
console.log('\n📋 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 18) {
  hasErrors = true;
  console.error(`❌ Node.js version ${nodeVersion} is too old. Required: 18.x or higher`);
} else {
  console.log(`✅ Node.js version ${nodeVersion} is compatible`);
}

// 3. Check if node_modules exists
console.log('\n📋 Checking dependencies...');
if (!fs.existsSync('node_modules')) {
  hasErrors = true;
  console.error('❌ node_modules not found. Run: npm install');
} else {
  console.log('✅ Dependencies installed');
}

// 4. Run build test
console.log('\n📋 Testing build process...');
try {
  console.log('   Running Next.js build (this may take a moment)...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build completed successfully');
} catch (error) {
  hasErrors = true;
  console.error('❌ Build failed! Fix errors before deploying');
  console.error('   Run "npm run build" to see detailed errors');
}

// 5. Check for TypeScript errors
console.log('\n📋 Checking TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ No TypeScript errors found');
} catch (error) {
  warnings.push('⚠️  TypeScript errors found - build may fail if strict mode is enabled');
}

// 6. Check for ESLint errors
console.log('\n📋 Checking ESLint...');
try {
  execSync('npm run lint', { stdio: 'pipe' });
  console.log('✅ No ESLint errors found');
} catch (error) {
  warnings.push('⚠️  ESLint errors found - build may fail if strict mode is enabled');
}

// 7. Check critical files exist
console.log('\n📋 Checking critical files...');
const criticalFiles = [
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'tsconfig.json',
  'app/layout.tsx',
  'app/page.tsx'
];

criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    hasErrors = true;
    console.error(`❌ Critical file missing: ${file}`);
  }
});

if (!hasErrors || criticalFiles.every(f => fs.existsSync(f))) {
  console.log('✅ All critical files present');
}

// 8. Check for sensitive data in code
console.log('\n📋 Checking for exposed secrets...');
const sensitivePatterns = [
  /sk-[a-zA-Z0-9]{48}/g,  // OpenAI API key
  /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,  // JWT tokens
  /https:\/\/[a-zA-Z0-9]+\.supabase\.co/g,  // Hardcoded Supabase URLs
];

const sourceFiles = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v .next', { encoding: 'utf-8' })
  .split('\n')
  .filter(Boolean);

let secretsFound = false;
sourceFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        secretsFound = true;
        console.error(`❌ Potential secret found in ${file}`);
      }
    });
  } catch (e) {
    // Skip files that can't be read
  }
});

if (!secretsFound) {
  console.log('✅ No exposed secrets found');
}

// 9. Check package.json scripts
console.log('\n📋 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const requiredScripts = ['dev', 'build', 'start'];
const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

if (missingScripts.length > 0) {
  hasErrors = true;
  console.error(`❌ Missing required scripts in package.json: ${missingScripts.join(', ')}`);
} else {
  console.log('✅ All required scripts present');
}

// 10. Summary
console.log('\n' + '='.repeat(50));
console.log('📊 PRE-DEPLOYMENT CHECK SUMMARY\n');

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(warning => console.log(`   ${warning}`));
  console.log('');
}

if (hasErrors) {
  console.error('❌ Pre-deployment check FAILED!');
  console.error('   Fix the errors above before deploying.');
  process.exit(1);
} else {
  console.log('✅ Pre-deployment check PASSED!');
  console.log('\n🎉 Your application is ready for deployment!');
  console.log('\n📝 Next steps:');
  console.log('   1. Commit and push your changes to GitHub');
  console.log('   2. Ensure all environment variables are set in Vercel');
  console.log('   3. Deploy through Vercel dashboard or git push');
  console.log('\n📚 See DEPLOYMENT.md for detailed instructions');
}