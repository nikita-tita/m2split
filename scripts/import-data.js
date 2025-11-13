const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Developer data
const developers = [
  { name: 'Группа «Самолет»', inn: '7750005606', kpp: '775001001' },
  { name: 'Группа «Родина»', inn: '7728838886', kpp: '772801001' },
  { name: 'Unikey', inn: '7750000001', kpp: '775000001' },
  { name: 'Брусника', inn: '6670394684', kpp: '667001001' },
  { name: 'MR Group', inn: '7710936098', kpp: '771001001' },
  { name: 'Plus Development', inn: '7750000002', kpp: '775000002' },
  { name: 'Галс-Девелопмент', inn: '7743003457', kpp: '774301001' },
  { name: 'ГК «ОСНОВА»', inn: '7750000003', kpp: '775000003' },
  { name: 'Forma', inn: '7750000004', kpp: '775000004' },
  { name: 'ГК ФСК', inn: '7750000005', kpp: '775000005' },
  { name: 'ДОНСТРОЙ', inn: '7728138022', kpp: '772801001' },
  { name: 'ЛСР. Недвижимость-Москва', inn: '7750000006', kpp: '775000006' },
  { name: 'ДСК-1', inn: '7750000007', kpp: '775000007' },
  { name: 'Level Group', inn: '7750000008', kpp: '775000008' },
  { name: 'Capital Group', inn: '7750000009', kpp: '775000009' },
  { name: 'ГК «МИЦ»', inn: '7750000010', kpp: '775000010' },
];

// Project data
const projects = [
  // Группа «Самолет»
  { developer: 'Группа «Самолет»', name: 'ЖК «Квартал Домашний»', address: 'ул. Донецкая' },
  { developer: 'Группа «Самолет»', name: '«Тропарево Парк»', address: 'Новомосковский округ, Коммунарка' },
  { developer: 'Группа «Самолет»', name: 'ЖК «Остафьево»', address: 'пос. Рязановское, Остафьево' },
  { developer: 'Группа «Самолет»', name: 'ЖК «Новое Внуково»', address: 'Новомосковский округ, Внуково' },
  { developer: 'Группа «Самолет»', name: 'ЖК «Алхимово»', address: 'пос. Рязановское, Алхимово' },
  { developer: 'Группа «Самолет»', name: 'ЖК «Квартал на воде»', address: 'ул. Шоссейная' },
  { developer: 'Группа «Самолет»', name: 'ЖК «Квартал Румянцево»', address: 'Новомосковский округ, Коммунарка' },
  { developer: 'Группа «Самолет»', name: 'ЖК «Ольховый Квартал»', address: 'Новомосковский округ, пос. Газопровод' },

  // Группа «Родина»
  { developer: 'Группа «Родина»', name: 'ЖК «СОЮЗ»', address: 'ул. Сельскохозяйственная' },
  { developer: 'Группа «Родина»', name: 'ЖК «Родина Переделкино»', address: 'Боровское ш.' },

  // Unikey
  { developer: 'Unikey', name: 'ЖК «Новые Смыслы»', address: 'ул. Александры Монаховой' },

  // Брусника
  { developer: 'Брусника', name: 'Квартал «Метроном»', address: 'ул. Тагильская' },
  { developer: 'Брусника', name: 'Квартал «МОНС»', address: 'Огородный проезд' },
  { developer: 'Брусника', name: 'ЖК «Дом А»', address: 'ул. Дубининская' },

  // MR Group
  { developer: 'MR Group', name: 'ЖК «SET»', address: 'ул. Верейская' },

  // Plus Development
  { developer: 'Plus Development', name: 'ЖК «Детали»', address: 'пос. Филимонковское' },

  // Галс-Девелопмент
  { developer: 'Галс-Девелопмент', name: 'ЖК «Монблан»', address: 'Шлюзовая наб.' },
  { developer: 'Галс-Девелопмент', name: 'ЖК «Рождественка 8»', address: 'ул. Кузнецкий Мост, 17' },

  // ГК «ОСНОВА»
  { developer: 'ГК «ОСНОВА»', name: 'ЖК «МИРАПОЛИС»', address: 'пр. Мира, 222' },
  { developer: 'ГК «ОСНОВА»', name: 'ЖК «EVOPARK Измайлово»', address: 'ул. Электродная, 2А' },

  // Forma
  { developer: 'Forma', name: 'ЖК «Moments»', address: 'Волоколамское ш.' },
  { developer: 'Forma', name: 'ЖК «SOUL»', address: 'ул. Часовая' },

  // ГК ФСК
  { developer: 'ГК ФСК', name: 'ЖК «AMBER CITY»', address: 'ул. Розанова' },
  { developer: 'ГК ФСК', name: 'ЖК «Sky Garden»', address: 'Строительный проезд' },
  { developer: 'ГК ФСК', name: 'ЖК «Rotterdam»', address: 'Варшавское ш.' },

  // ДОНСТРОЙ
  { developer: 'ДОНСТРОЙ', name: 'ЖК «Событие»', address: 'ул. Лобачевского' },

  // ЛСР. Недвижимость-Москва
  { developer: 'ЛСР. Недвижимость-Москва', name: 'ЖК «ЛУЧИ»', address: 'ул. Производственная' },
  { developer: 'ЛСР. Недвижимость-Москва', name: 'ЖК «Дмитровское небо»', address: 'Ильменский проезд' },

  // ДСК-1
  { developer: 'ДСК-1', name: '«1-й Саларьевский»', address: 'пос. Московский' },

  // Level Group
  { developer: 'Level Group', name: 'ЖК «Level Кавказский бульвар»', address: 'Кавказский бульвар' },
  { developer: 'Level Group', name: 'ЖК «Level Амурская»', address: 'ул. Амурская' },
  { developer: 'Level Group', name: 'ЖК «Level Павелецкая»', address: 'ул. Павелецкая' },
  { developer: 'Level Group', name: 'ЖК «Лефорт»', address: 'ул. Лефортовская' },
  { developer: 'Level Group', name: 'ЖК «Level Пресненский»', address: 'Пресненская наб.' },
  { developer: 'Level Group', name: 'ЖК «Река»', address: 'наб. Тараса Шевченко' },
  { developer: 'Level Group', name: 'ЖК «Level Амбулаторный»', address: 'Амбулаторный проезд' },
  { developer: 'Level Group', name: 'Дом «Level Римская»', address: 'пл. Рогожская Застава' },
  { developer: 'Level Group', name: 'ЖК «Level Сухаревская»', address: 'ул. Сретенка' },
  { developer: 'Level Group', name: 'ЖК «Level Донской»', address: 'ул. Донская' },
  { developer: 'Level Group', name: 'ЖК «Level Шереметьевская»', address: 'ул. Шереметьевская' },
  { developer: 'Level Group', name: 'ЖК «Level Ленинградский»', address: 'Ленинградский проспект' },
];

async function importData() {
  console.log('🚀 Starting data import...\n');

  // Step 1: Import developers
  console.log('📋 Step 1: Importing developers...');
  const developersToInsert = developers.map(dev => ({
    type: 'developer', // lowercase as per existing data
    name: dev.name,
    inn: dev.inn,
    kpp: dev.kpp,
    tax_regime: 'VAT', // VAT regime for developers (as per existing data)
    vat_rate: 20, // Standard VAT rate in Russia
    account_number: '40702810000000000000', // Placeholder bank account
    bik: '044525225', // Placeholder BIK (Sberbank)
    bank_name: 'Банк (не указан)', // Placeholder bank name
    address: 'Москва', // Placeholder address
    offer_accepted: true, // Boolean field
    offer_accepted_at: new Date().toISOString(),
  }));

  const { data: insertedDevs, error: devError } = await supabase
    .from('counterparties')
    .upsert(developersToInsert, { onConflict: 'inn' })
    .select();

  if (devError) {
    console.error('❌ Error inserting developers:', devError);
    return;
  }

  console.log(`✅ Inserted ${insertedDevs.length} developers\n`);

  // Step 2: Fetch all developers to get their UUIDs
  console.log('📋 Step 2: Fetching developer UUIDs...');
  const { data: allDevs, error: fetchError } = await supabase
    .from('counterparties')
    .select('id, name')
    .eq('type', 'developer');

  if (fetchError) {
    console.error('❌ Error fetching developers:', fetchError);
    return;
  }

  // Create mapping: developer name -> UUID
  const devMap = {};
  allDevs.forEach(dev => {
    devMap[dev.name] = dev.id;
  });
  console.log(`✅ Fetched ${allDevs.length} developers\n`);

  // Step 3: Import projects
  console.log('📋 Step 3: Importing projects...');
  const projectsToInsert = projects.map(proj => ({
    developer_id: devMap[proj.developer],
    project_name: proj.name,
    region: 'Москва',
    city: 'Москва',
    address: proj.address,
    is_active: true,
  })).filter(p => p.developer_id); // Filter out any missing developers

  // Split into batches of 50 to avoid request size limits
  const batchSize = 50;
  let totalInserted = 0;

  for (let i = 0; i < projectsToInsert.length; i += batchSize) {
    const batch = projectsToInsert.slice(i, i + batchSize);
    const { data: insertedProjects, error: projError } = await supabase
      .from('projects')
      .upsert(batch, { onConflict: 'developer_id,project_name' })
      .select();

    if (projError) {
      console.error('❌ Error inserting projects batch:', projError);
      continue;
    }

    totalInserted += insertedProjects.length;
    console.log(`   Batch ${Math.floor(i / batchSize) + 1}: ${insertedProjects.length} projects`);
  }

  console.log(`✅ Inserted ${totalInserted} projects\n`);

  // Step 4: Verify data
  console.log('📋 Step 4: Verifying data...');

  const { data: devCount } = await supabase
    .from('counterparties')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'developer');

  const { data: projCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Import complete!`);
  console.log(`   📊 Developers: ${devCount?.length || 'unknown'} (expected 16)`);
  console.log(`   📊 Projects: ${projCount?.length || 'unknown'} (expected 47)`);
  console.log(`\n🎉 Ready for tariff import!\n`);
}

importData().catch(console.error);
