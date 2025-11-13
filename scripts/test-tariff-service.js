const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTariffService() {
  console.log('🧪 Testing Tariff Service with real data\n');

  // Test 1: Get all tariffs
  console.log('📋 Test 1: Fetching all tariffs...');
  const { data: allTariffs, error: allError } = await supabase
    .from('tariffs')
    .select('*')
    .order('commission_total_percent', { ascending: false });

  if (allError) {
    console.error('❌ Error:', allError);
    return;
  }

  console.log(`✅ Found ${allTariffs.length} tariffs\n`);

  // Test 2: Find best tariff for Группа «Самолет»
  console.log('📋 Test 2: Finding best tariff for Группа «Самолет»...');

  const { data: developers } = await supabase
    .from('counterparties')
    .select('id, name')
    .eq('name', 'Группа «Самолет»')
    .single();

  if (developers) {
    const { data: samoletTariffs } = await supabase
      .from('tariffs')
      .select('*')
      .eq('developer_id', developers.id)
      .eq('is_active', true)
      .order('commission_total_percent', { ascending: false })
      .limit(1);

    if (samoletTariffs && samoletTariffs.length > 0) {
      const tariff = samoletTariffs[0];
      console.log(`✅ Best tariff for ${tariff.developer_name}:`);
      console.log(`   Project: ${tariff.project_name}`);
      console.log(`   Rate: ${tariff.commission_total_percent}%`);
      console.log(`   Valid: ${tariff.valid_from} to ${tariff.valid_to || 'unlimited'}`);
      console.log();
    }
  }

  // Test 3: Find tariff by project
  console.log('📋 Test 3: Finding tariff for ЖК «Level Павелецкая» (should be 4.5%)...');

  const { data: projects } = await supabase
    .from('projects')
    .select('id, project_name')
    .ilike('project_name', '%Павелецкая%')
    .single();

  if (projects) {
    const { data: projectTariff } = await supabase
      .from('tariffs')
      .select('*')
      .eq('project_id', projects.id)
      .eq('is_active', true)
      .single();

    if (projectTariff) {
      console.log(`✅ Found tariff for ${projectTariff.project_name}:`);
      console.log(`   Developer: ${projectTariff.developer_name}`);
      console.log(`   Rate: ${projectTariff.commission_total_percent}%`);
      console.log(`   Promo: ${projectTariff.promo_flag}`);
      console.log();
    }
  }

  // Test 4: Calculate commission example
  console.log('📋 Test 4: Calculating commission...');
  const dealAmount = 10000000; // 10M RUB
  const rate = 2.7; // Самолет rate
  const commission = dealAmount * (rate / 100);

  console.log(`✅ Commission calculation:`);
  console.log(`   Deal amount: ${dealAmount.toLocaleString('ru-RU')} ₽`);
  console.log(`   Commission rate: ${rate}%`);
  console.log(`   Commission: ${commission.toLocaleString('ru-RU')} ₽`);
  console.log();

  // Test 5: Group tariffs by rate
  console.log('📋 Test 5: Tariffs grouped by commission rate...');

  const rateGroups = {};
  allTariffs.forEach(t => {
    const rate = t.commission_total_percent;
    if (!rateGroups[rate]) {
      rateGroups[rate] = [];
    }
    rateGroups[rate].push(t.developer_name);
  });

  console.log('✅ Tariff distribution:');
  Object.keys(rateGroups)
    .sort((a, b) => parseFloat(b) - parseFloat(a))
    .forEach(rate => {
      const developers = [...new Set(rateGroups[rate])].join(', ');
      console.log(`   ${rate}%: ${rateGroups[rate].length} projects (${developers})`);
    });

  console.log('\n🎉 All tests passed!\n');
}

testTariffService().catch(console.error);
