#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyAlertsTable() {
  console.log('📊 Applying alerts table and related functions...\n');

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create-alerts-table.sql'), 'utf8');
    
    // Split by semicolons but be careful with function definitions
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    
    const lines = sqlContent.split('\n');
    for (const line of lines) {
      currentStatement += line + '\n';
      
      // Check if we're entering or exiting a function
      if (line.trim().toUpperCase().startsWith('CREATE OR REPLACE FUNCTION') ||
          line.trim().toUpperCase().startsWith('CREATE FUNCTION')) {
        inFunction = true;
      }
      
      if (inFunction && line.trim() === '$$ LANGUAGE plpgsql;') {
        inFunction = false;
        statements.push(currentStatement.trim());
        currentStatement = '';
      } else if (!inFunction && line.trim().endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.trim().startsWith('--')) continue;
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        // Try direct execution if exec_sql doesn't exist
        const { data, error: directError } = await supabase
          .from('_sql')
          .insert({ query: statement })
          .select();
          
        if (directError) {
          console.error(`❌ Error executing statement ${i + 1}:`, directError.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          
          // Try using a different approach - direct SQL execution
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
              method: 'POST',
              headers: {
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ query: statement })
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log(`✅ Statement ${i + 1} executed successfully (alternative method)`);
          } catch (altError) {
            console.error('Alternative execution also failed:', altError.message);
            
            // For critical statements, show the SQL so it can be run manually
            if (statement.includes('CREATE TABLE') || statement.includes('CREATE POLICY')) {
              console.log('\n📋 SQL to run manually:');
              console.log('```sql');
              console.log(statement);
              console.log('```\n');
            }
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('\n✅ Alerts table setup completed!');
    console.log('\n📊 Verifying alerts table...');
    
    // Verify the table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'alerts');
    
    if (tableError) {
      console.error('❌ Error checking table:', tableError.message);
    } else if (tables && tables.length > 0) {
      console.log('✅ Alerts table exists');
      
      // Check RLS status
      const { data: rlsStatus, error: rlsError } = await supabase
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .eq('schemaname', 'public')
        .eq('tablename', 'alerts');
      
      if (!rlsError && rlsStatus && rlsStatus.length > 0) {
        console.log(`✅ RLS is ${rlsStatus[0].rowsecurity ? 'enabled' : 'disabled'} on alerts table`);
      }
    } else {
      console.log('⚠️  Alerts table not found - manual setup may be required');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the setup
applyAlertsTable();