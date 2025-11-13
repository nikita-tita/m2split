const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importTariffs() {
  console.log('🚀 Starting tariff import...\n');

  // Step 1: Fetch developers and projects to get UUIDs
  console.log('📋 Step 1: Fetching developers and projects...');

  const { data: developers, error: devError } = await supabase
    .from('counterparties')
    .select('id, name')
    .eq('type', 'developer');

  if (devError) {
    console.error('❌ Error fetching developers:', devError);
    return;
  }

  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select('id, project_name, developer_id');

  if (projError) {
    console.error('❌ Error fetching projects:', projError);
    return;
  }

  console.log(`✅ Found ${developers.length} developers and ${projects.length} projects\n`);

  // Create lookup maps
  const devMap = {};
  developers.forEach(d => { devMap[d.name] = d.id; });

  const projMap = {};
  projects.forEach(p => { projMap[p.project_name] = { id: p.id, developer_id: p.developer_id }; });

  // Step 2: Build tariff data
  console.log('📋 Step 2: Building tariff data...');

  const tariffs = [];

  // Level Group tariffs (special ones)
  const levelTariffs = [
    { project: 'ЖК «Level Кавказский бульвар»', rate: 1.8, flag: 'BASE', validTo: '2025-10-31' },
    { project: 'ЖК «Level Павелецкая»', rate: 4.5, flag: 'SPECIAL', validTo: '2025-10-31' },
    { project: 'Дом «Level Римская»', rate: 3.6, flag: 'BASE', validTo: '2025-10-31' },
  ];

  for (const lt of levelTariffs) {
    const proj = projMap[lt.project];
    if (proj) {
      tariffs.push({
        tariff_id: `TAR-LEVEL-${proj.id.substring(0, 8).toUpperCase()}`,
        developer_id: devMap['Level Group'],
        developer_name: 'Level Group',
        developer_legal_entity: 'ООО «Level Group»',
        project_id: proj.id,
        project_name: lt.project,
        region: 'Москва',
        city: 'Москва',
        segment: 'FLATS',
        object_category: '1_ROOM',
        payment_stage: 'ADVANCE',
        commission_scheme_type: 'PERCENT_OF_CONTRACT',
        commission_total_percent: lt.rate,
        promo_flag: lt.flag,
        valid_from: '2025-01-01',
        valid_to: lt.validTo,
        is_active: true,
        comments: `Максимальная ставка ${lt.rate}% для уникального клиента. Окончание КВ: ${lt.validTo}`
      });
    }
  }

  // Группа «Самолет» tariffs (2.7% for all)
  const samoletProjects = projects.filter(p => p.developer_id === devMap['Группа «Самолет»']);
  for (const proj of samoletProjects) {
    tariffs.push({
      tariff_id: `TAR-SAMOLET-${proj.id.substring(0, 6).toUpperCase()}`,
      developer_id: devMap['Группа «Самолет»'],
      developer_name: 'Группа «Самолет»',
      developer_legal_entity: 'ООО «Самолет-Девелопмент»',
      project_id: proj.id,
      project_name: proj.project_name,
      region: 'Москва',
      city: 'Москва',
      segment: 'FLATS',
      object_category: '1_ROOM',
      payment_stage: 'ADVANCE',
      commission_scheme_type: 'PERCENT_OF_CONTRACT',
      commission_total_percent: 2.7,
      promo_flag: 'BASE',
      valid_from: '2025-01-01',
      valid_to: '2025-11-30',
      is_active: true,
      comments: 'Максимальная ставка 2.7% для уникального клиента. Окончание КВ: 30.11.2025'
    });
  }

  // ГК ФСК tariffs (3.15% for all)
  const fskProjects = projects.filter(p => p.developer_id === devMap['ГК ФСК']);
  for (const proj of fskProjects) {
    tariffs.push({
      tariff_id: `TAR-FSK-${proj.id.substring(0, 6).toUpperCase()}`,
      developer_id: devMap['ГК ФСК'],
      developer_name: 'ГК ФСК',
      developer_legal_entity: 'ООО «ФСК»',
      project_id: proj.id,
      project_name: proj.project_name,
      region: 'Москва',
      city: 'Москва',
      segment: 'FLATS',
      object_category: '1_ROOM',
      payment_stage: 'ADVANCE',
      commission_scheme_type: 'PERCENT_OF_CONTRACT',
      commission_total_percent: 3.15,
      promo_flag: 'BASE',
      valid_from: '2025-01-01',
      valid_to: '2025-11-30',
      is_active: true,
      comments: 'Максимальная ставка 3.15% для уникального клиента. Окончание КВ: 30.11.2025'
    });
  }

  // Брусника tariffs (2.7% for all)
  const brusnikaProjects = projects.filter(p => p.developer_id === devMap['Брусника']);
  for (const proj of brusnikaProjects) {
    tariffs.push({
      tariff_id: `TAR-BRUSNIKA-${proj.id.substring(0, 6).toUpperCase()}`,
      developer_id: devMap['Брусника'],
      developer_name: 'Брусника',
      developer_legal_entity: 'ООО «Брусника»',
      project_id: proj.id,
      project_name: proj.project_name,
      region: 'Москва',
      city: 'Москва',
      segment: 'FLATS',
      object_category: '1_ROOM',
      payment_stage: 'ADVANCE',
      commission_scheme_type: 'PERCENT_OF_CONTRACT',
      commission_total_percent: 2.7,
      promo_flag: 'BASE',
      valid_from: '2025-01-01',
      valid_to: '2025-11-30',
      is_active: true,
      comments: 'Максимальная ставка 2.7% для уникального клиента. Окончание КВ: 30.11.2025'
    });
  }

  // ДОНСТРОЙ tariffs (3.06% for all)
  const donstroyProjects = projects.filter(p => p.developer_id === devMap['ДОНСТРОЙ']);
  for (const proj of donstroyProjects) {
    tariffs.push({
      tariff_id: `TAR-DONSTROY-${proj.id.substring(0, 6).toUpperCase()}`,
      developer_id: devMap['ДОНСТРОЙ'],
      developer_name: 'ДОНСТРОЙ',
      developer_legal_entity: 'ООО «ДОНСТРОЙ»',
      project_id: proj.id,
      project_name: proj.project_name,
      region: 'Москва',
      city: 'Москва',
      segment: 'FLATS',
      object_category: '1_ROOM',
      payment_stage: 'ADVANCE',
      commission_scheme_type: 'PERCENT_OF_CONTRACT',
      commission_total_percent: 3.06,
      promo_flag: 'BASE',
      valid_from: '2025-01-01',
      valid_to: '2025-07-31',
      is_active: true,
      comments: 'Максимальная ставка 3.06% для уникального клиента. Окончание КВ: 31.07.2025'
    });
  }

  // ГК «ОСНОВА» tariffs (2.7% for all)
  const osnovaProjects = projects.filter(p => p.developer_id === devMap['ГК «ОСНОВА»']);
  for (const proj of osnovaProjects) {
    tariffs.push({
      tariff_id: `TAR-OSNOVA-${proj.id.substring(0, 6).toUpperCase()}`,
      developer_id: devMap['ГК «ОСНОВА»'],
      developer_name: 'ГК «ОСНОВА»',
      developer_legal_entity: 'ООО «ГК «ОСНОВА»»',
      project_id: proj.id,
      project_name: proj.project_name,
      region: 'Москва',
      city: 'Москва',
      segment: 'FLATS',
      object_category: '1_ROOM',
      payment_stage: 'ADVANCE',
      commission_scheme_type: 'PERCENT_OF_CONTRACT',
      commission_total_percent: 2.7,
      promo_flag: 'BASE',
      valid_from: '2025-01-01',
      valid_to: '2025-11-30',
      is_active: true,
      comments: 'Ставка 2.7% для уникального клиента. Окончание КВ: 30.11.2025'
    });
  }

  console.log(`✅ Prepared ${tariffs.length} tariff records\n`);

  // Step 3: Insert tariffs
  console.log('📋 Step 3: Inserting tariffs...');

  const { data: insertedTariffs, error: tariffError } = await supabase
    .from('tariffs')
    .upsert(tariffs, { onConflict: 'tariff_id' })
    .select();

  if (tariffError) {
    console.error('❌ Error inserting tariffs:', tariffError);
    return;
  }

  console.log(`✅ Inserted ${insertedTariffs.length} tariffs\n`);

  // Step 4: Verify
  console.log('📋 Step 4: Verifying data...');

  const { count } = await supabase
    .from('tariffs')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Tariff import complete!`);
  console.log(`   📊 Total tariffs in database: ${count}`);
  console.log(`\n🎉 All data imported successfully!\n`);
}

importTariffs().catch(console.error);
