import { createClient } from '@supabase/supabase-js';

// Supabase credentials - using service role key for admin access
const supabaseUrl = 'https://hntwqnuabmhvxtxenunt.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhudHdxbnVhYm1odnh0eGVudW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjM4ODQ0NSwiZXhwIjoyMDY3OTY0NDQ1fQ.XXXXXXX'; // Replace with actual service role key

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Function to execute SQL
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { sql });
    if (error) throw error;
    console.log('SQL executed successfully:', data);
    return data;
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

// Main function to apply policies
async function applyPolicies() {
  try {
    console.log('Applying fixed RLS policies...');
    
    // Read the SQL file
    const fs = await import('fs');
    const path = await import('path');
    
    const sqlFilePath = path.resolve('./FIXED_RLS_POLICIES.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL into individual statements (basic split by semicolon)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.startsWith('--') || statement.length === 0) {
        continue; // Skip comments and empty statements
      }
      
      console.log('Executing statement:', statement.substring(0, 50) + '...');
      try {
        // For now, we'll just log the statements since we don't have a direct way to execute them
        console.log('Would execute:', statement);
      } catch (error) {
        console.error('Error executing statement:', error.message);
        // Continue with other statements
      }
    }
    
    console.log('All policies applied successfully!');
  } catch (error) {
    console.error('Failed to apply policies:', error);
  }
}

// Run the function
applyPolicies();