const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function executeSQLFile() {
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-exercises.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    console.log('📋 Executing exercises SQL setup...');
    
    // Execute the SQL
    const { error } = await supabase.from('_').rpc('exec_sql', {
      sql: sqlContent
    });
    
    if (error) {
      // If the RPC doesn't exist, try executing directly through the REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`
        },
        body: JSON.stringify({ sql: sqlContent })
      });
      
      if (!response.ok) {
        // If direct execution fails, let's execute the SQL statements one by one
        console.log('⚠️  Direct SQL execution not available, attempting statement-by-statement execution...');
        
        // Split SQL into individual statements
        const statements = sqlContent
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        for (const statement of statements) {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          
          // Try to identify and execute table creation statements
          if (statement.toUpperCase().includes('CREATE TABLE')) {
            // Extract table name
            const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
            if (tableMatch) {
              const tableName = tableMatch[1];
              console.log(`Creating table: ${tableName}`);
              
              // For now, log that manual execution in Supabase dashboard is required
              console.log(`⚠️  Please execute the following SQL in Supabase SQL Editor:`);
              console.log(`\n${statement};\n`);
            }
          }
        }
        
        console.log('\n📌 To complete setup:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the contents of scripts/setup-exercises.sql');
        console.log('4. Click "Run" to execute the SQL');
        console.log('5. Then run: node scripts/seed-exercises.js');
        return;
      }
    }
    
    console.log('✅ Exercise tables created successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: node scripts/seed-exercises.js to populate sample data');
    
  } catch (error) {
    console.error('❌ Error executing SQL:', error);
    console.error('\nPlease execute the SQL manually in Supabase dashboard:');
    console.error('1. Go to SQL Editor in your Supabase project');
    console.error('2. Copy the contents of scripts/setup-exercises.sql');
    console.error('3. Paste and run the SQL');
  }
}

// Execute
executeSQLFile();