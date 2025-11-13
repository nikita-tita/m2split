const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('🔍 Checking available tables...\n');

  // Try common table names
  const tablesToCheck = [
    'counterparties',
    'projects',
    'tariffs',
    'deals',
    'deal_participants',
    'registries',
    'registry_items',
    'payments',
    'documents'
  ];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0);

    if (!error) {
      console.log(`✅ ${table} - exists`);
    } else {
      console.log(`❌ ${table} - ${error.message}`);
    }
  }
}

listTables();
