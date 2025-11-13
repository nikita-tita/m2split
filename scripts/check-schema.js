const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking counterparties table schema...\n');

  // Try to get existing counterparties to see the structure
  const { data, error } = await supabase
    .from('counterparties')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    if (data && data.length > 0) {
      console.log('Sample row structure:');
      console.log(data[0]);
      console.log('\nColumn names:');
      console.log(Object.keys(data[0]));
    } else {
      console.log('No existing rows found');
    }
  }
}

checkSchema();
