#!/usr/bin/env tsx

/**
 * Vercel Deployment Pre-Check Script
 * 
 * This script validates the deployment readiness for the healthcare platform,
 * specifically checking for standard practice protocol feature requirements.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config({ path: '.env.local' });

interface DeploymentCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  fix?: string;
}

class VercelDeploymentChecker {
  private checks: DeploymentCheck[] = [];

  async runAllChecks(): Promise<{ success: boolean; checks: DeploymentCheck[] }> {
    console.log('🚀 Running Vercel Deployment Pre-Checks...\n');

    // Environment checks
    this.checkEnvironmentVariables();
    this.checkNodeVersion();
    this.checkPackageJson();
    
    // Build checks
    await this.checkBuildConfiguration();
    await this.checkTypeScriptConfig();
    
    // Database checks
    await this.checkDatabaseConnection();
    await this.checkDatabaseSchema();
    
    // Feature-specific checks
    await this.checkStandardPracticeFeatures();
    
    // File checks
    this.checkRequiredFiles();
    this.checkGitIgnore();

    // Summary
    this.printSummary();
    
    const failedChecks = this.checks.filter(c => c.status === 'fail');
    return {
      success: failedChecks.length === 0,
      checks: this.checks
    };
  }

  private checkEnvironmentVariables() {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
      this.addCheck('Environment Variables', 'pass', 'All required environment variables are set');
    } else {
      this.addCheck(
        'Environment Variables', 
        'fail', 
        `Missing variables: ${missingVars.join(', ')}`,
        'Set missing environment variables in Vercel dashboard'
      );
    }
  }

  private checkNodeVersion() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      this.addCheck('Node.js Version', 'pass', `Node.js ${nodeVersion} is compatible`);
    } else {
      this.addCheck(
        'Node.js Version', 
        'fail', 
        `Node.js ${nodeVersion} is too old (requires >= 18)`,
        'Update Node.js version or add .nvmrc file'
      );
    }
  }

  private checkPackageJson() {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const requiredScripts = ['build', 'start'];
      const missingScripts = requiredScripts.filter(script => !packageJson.scripts?.[script]);
      
      if (missingScripts.length === 0) {
        this.addCheck('Package.json Scripts', 'pass', 'Required build scripts are present');
      } else {
        this.addCheck(
          'Package.json Scripts', 
          'fail', 
          `Missing scripts: ${missingScripts.join(', ')}`,
          'Add missing scripts to package.json'
        );
      }
    } catch (error) {
      this.addCheck('Package.json', 'fail', 'Could not read package.json');
    }
  }

  private async checkBuildConfiguration() {
    try {
      const nextConfigPath = path.join(process.cwd(), 'next.config.js');
      const exists = fs.existsSync(nextConfigPath);
      
      if (exists) {
        this.addCheck('Next.js Config', 'pass', 'next.config.js exists');
      } else {
        this.addCheck(
          'Next.js Config', 
          'warning', 
          'next.config.js not found - using defaults',
          'Consider creating next.config.js for optimization'
        );
      }
    } catch (error) {
      this.addCheck('Build Configuration', 'warning', 'Could not check build configuration');
    }
  }

  private async checkTypeScriptConfig() {
    try {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      const exists = fs.existsSync(tsconfigPath);
      
      if (exists) {
        this.addCheck('TypeScript Config', 'pass', 'tsconfig.json exists');
      } else {
        this.addCheck('TypeScript Config', 'fail', 'tsconfig.json missing');
      }
    } catch (error) {
      this.addCheck('TypeScript Config', 'fail', 'Could not check TypeScript configuration');
    }
  }

  private async checkDatabaseConnection() {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        this.addCheck('Database Connection', 'fail', 'Missing Supabase credentials');
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from('tenants').select('id').limit(1);
      
      if (error) {
        this.addCheck(
          'Database Connection', 
          'fail', 
          `Database connection failed: ${error.message}`,
          'Check Supabase credentials and network connectivity'
        );
      } else {
        this.addCheck('Database Connection', 'pass', 'Database connection successful');
      }
    } catch (error) {
      this.addCheck('Database Connection', 'fail', `Connection error: ${error}`);
    }
  }

  private async checkDatabaseSchema() {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        this.addCheck('Database Schema', 'warning', 'Cannot check schema without service role key');
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Check for standard practice protocol column
      const { data, error } = await supabase
        .from('protocols')
        .select('is_standard_practice')
        .limit(1);
      
      if (error) {
        if (error.message.includes('column "is_standard_practice" does not exist')) {
          this.addCheck(
            'Database Schema', 
            'fail', 
            'Standard practice protocol column missing',
            'Run database migration: supabase/migrations/20250125_add_standard_practice_protocols.sql'
          );
        } else {
          this.addCheck('Database Schema', 'warning', `Schema check failed: ${error.message}`);
        }
      } else {
        this.addCheck('Database Schema', 'pass', 'Standard practice protocol schema is ready');
      }
    } catch (error) {
      this.addCheck('Database Schema', 'warning', `Could not verify schema: ${error}`);
    }
  }

  private async checkStandardPracticeFeatures() {
    // Check if migration file exists
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250125_add_standard_practice_protocols.sql');
    const migrationExists = fs.existsSync(migrationPath);
    
    if (migrationExists) {
      this.addCheck('Standard Practice Migration', 'pass', 'Database migration file exists');
    } else {
      this.addCheck(
        'Standard Practice Migration', 
        'fail', 
        'Migration file missing',
        'Ensure migration file is committed to repository'
      );
    }

    // Check service files
    const serviceFiles = [
      'lib/services/protocol-auto-assignment.ts',
      'lib/services/patient-chat-service.ts',
      'lib/services/protocol-service.ts'
    ];

    let missingServices = [];
    for (const file of serviceFiles) {
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        missingServices.push(file);
      }
    }

    if (missingServices.length === 0) {
      this.addCheck('Standard Practice Services', 'pass', 'All service files are present');
    } else {
      this.addCheck(
        'Standard Practice Services', 
        'fail', 
        `Missing service files: ${missingServices.join(', ')}`,
        'Ensure all service files are committed'
      );
    }
  }

  private checkRequiredFiles() {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      '.gitignore'
    ];

    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(process.cwd(), file))
    );

    if (missingFiles.length === 0) {
      this.addCheck('Required Files', 'pass', 'All required files are present');
    } else {
      this.addCheck(
        'Required Files', 
        'fail', 
        `Missing files: ${missingFiles.join(', ')}`,
        'Create missing required files'
      );
    }
  }

  private checkGitIgnore() {
    try {
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      
      const requiredEntries = ['.env.local', 'node_modules', '.next'];
      const missingEntries = requiredEntries.filter(entry => 
        !gitignoreContent.includes(entry)
      );

      if (missingEntries.length === 0) {
        this.addCheck('Git Ignore', 'pass', 'Gitignore properly configured');
      } else {
        this.addCheck(
          'Git Ignore', 
          'warning', 
          `Missing entries: ${missingEntries.join(', ')}`,
          'Add missing entries to .gitignore'
        );
      }
    } catch (error) {
      this.addCheck('Git Ignore', 'warning', 'Could not read .gitignore file');
    }
  }

  private addCheck(name: string, status: 'pass' | 'fail' | 'warning', message: string, fix?: string) {
    this.checks.push({ name, status, message, fix });
  }

  private printSummary() {
    console.log('\n📊 Deployment Check Summary:');
    console.log('================================');

    this.checks.forEach(check => {
      const icon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${check.name}: ${check.message}`);
      if (check.fix && check.status !== 'pass') {
        console.log(`   🔧 Fix: ${check.fix}`);
      }
    });

    const passCount = this.checks.filter(c => c.status === 'pass').length;
    const warnCount = this.checks.filter(c => c.status === 'warning').length;
    const failCount = this.checks.filter(c => c.status === 'fail').length;

    console.log('\n📈 Results:');
    console.log(`   ✅ Passed: ${passCount}`);
    console.log(`   ⚠️  Warnings: ${warnCount}`);
    console.log(`   ❌ Failed: ${failCount}`);

    if (failCount === 0) {
      console.log('\n🎉 All critical checks passed! Ready for deployment.');
    } else {
      console.log('\n🔧 Please address failed checks before deployment.');
    }
  }
}

// Run the checks
async function main() {
  const checker = new VercelDeploymentChecker();
  const result = await checker.runAllChecks();
  
  process.exit(result.success ? 0 : 1);
}

main().catch(console.error);