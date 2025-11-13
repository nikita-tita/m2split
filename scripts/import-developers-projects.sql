-- Import developers and projects from CSV data
-- IMPORTANT: This system currently works only for Moscow region
-- Date: 2025-01-13

-- ============================================
-- DEVELOPERS (Застройщики)
-- ============================================

-- Clear existing sample developers (if needed)
-- DELETE FROM counterparties WHERE type = 'DEVELOPER';

-- Insert developers from the provided list
INSERT INTO counterparties (id, type, name, inn, kpp, offer_accepted_at, created_at) VALUES
  ('dev-samolot', 'DEVELOPER', 'Группа «Самолет»', '7750005606', '775001001', NOW(), NOW()),
  ('dev-rodina', 'DEVELOPER', 'Группа «Родина»', '7728838886', '772801001', NOW(), NOW()),
  ('dev-unikey', 'DEVELOPER', 'Unikey', '7750000001', '775000001', NOW(), NOW()),
  ('dev-brusnike', 'DEVELOPER', 'Брусника', '6670394684', '667001001', NOW(), NOW()),
  ('dev-mr-group', 'DEVELOPER', 'MR Group', '7710936098', '771001001', NOW(), NOW()),
  ('dev-plus-dev', 'DEVELOPER', 'Plus Development', '7750000002', '775000002', NOW(), NOW()),
  ('dev-gals', 'DEVELOPER', 'Галс-Девелопмент', '7743003457', '774301001', NOW(), NOW()),
  ('dev-osnova', 'DEVELOPER', 'ГК «ОСНОВА»', '7750000003', '775000003', NOW(), NOW()),
  ('dev-forma', 'DEVELOPER', 'Forma', '7750000004', '775000004', NOW(), NOW()),
  ('dev-fsk', 'DEVELOPER', 'ГК ФСК', '7750000005', '775000005', NOW(), NOW()),
  ('dev-donstroy', 'DEVELOPER', 'ДОНСТРОЙ', '7728138022', '772801001', NOW(), NOW()),
  ('dev-lsr', 'DEVELOPER', 'ЛСР. Недвижимость-Москва', '7750000006', '775000006', NOW(), NOW()),
  ('dev-dsk1', 'DEVELOPER', 'ДСК-1', '7750000007', '775000007', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  offer_accepted_at = EXCLUDED.offer_accepted_at;

-- ============================================
-- PROJECTS (ЖК) - Moscow only
-- ============================================

-- Clear existing sample projects (if needed)
-- DELETE FROM projects;

-- Insert projects from the CSV
INSERT INTO projects (id, developer_id, project_name, region, city, address, is_active, created_at) VALUES
  -- Группа «Самолет»
  ('prj-kvartal-domashniy', 'dev-samolot', 'ЖК «Квартал Домашний»', 'Москва', 'Москва', 'ул. Донецкая', TRUE, NOW()),
  ('prj-troparevo-park', 'dev-samolot', '«Тропарево Парк»', 'Москва', 'Москва', 'Новомосковский округ, Коммунарка', TRUE, NOW()),
  ('prj-ostafyevo', 'dev-samolot', 'ЖК «Остафьево»', 'Москва', 'Москва', 'пос. Рязановское, Остафьево', TRUE, NOW()),
  ('prj-novoe-vnukovo', 'dev-samolot', 'ЖК «Новое Внуково»', 'Москва', 'Москва', 'Новомосковский округ, Внуково', TRUE, NOW()),
  ('prj-alkhimovo', 'dev-samolot', 'ЖК «Алхимово»', 'Москва', 'Москва', 'пос. Рязановское, Алхимово', TRUE, NOW()),
  ('prj-kvartal-na-vode', 'dev-samolot', 'ЖК «Квартал на воде»', 'Москва', 'Москва', 'ул. Шоссейная', TRUE, NOW()),
  ('prj-kvartal-rumyantsevo', 'dev-samolot', 'ЖК «Квартал Румянцево»', 'Москва', 'Москва', 'Новомосковский округ, Коммунарка', TRUE, NOW()),
  ('prj-olkhovyy-kvartal', 'dev-samolot', 'ЖК «Ольховый Квартал»', 'Москва', 'Москва', 'Новомосковский округ, пос. Газопровод', TRUE, NOW()),

  -- Группа «Родина»
  ('prj-soyuz', 'dev-rodina', 'ЖК «СОЮЗ»', 'Москва', 'Москва', 'ул. Сельскохозяйственная', TRUE, NOW()),
  ('prj-rodina-peredelkino', 'dev-rodina', 'ЖК «Родина Переделкино»', 'Москва', 'Москва', 'Боровское ш.', TRUE, NOW()),

  -- Unikey
  ('prj-novye-smysly', 'dev-unikey', 'ЖК «Новые Смыслы»', 'Москва', 'Москва', 'ул. Александры Монаховой', TRUE, NOW()),

  -- Брусника
  ('prj-metronom', 'dev-brusnike', 'Квартал «Метроном»', 'Москва', 'Москва', 'ул. Тагильская', TRUE, NOW()),
  ('prj-mons', 'dev-brusnike', 'Квартал «МОНС»', 'Москва', 'Москва', 'Огородный проезд', TRUE, NOW()),
  ('prj-dom-a', 'dev-brusnike', 'ЖК «Дом А»', 'Москва', 'Москва', 'ул. Дубининская', TRUE, NOW()),

  -- MR Group
  ('prj-set', 'dev-mr-group', 'ЖК «SET»', 'Москва', 'Москва', 'ул. Верейская', TRUE, NOW()),

  -- Plus Development
  ('prj-detali', 'dev-plus-dev', 'ЖК «Детали»', 'Москва', 'Москва', 'пос. Филимонковское', TRUE, NOW()),

  -- Галс-Девелопмент
  ('prj-monblan', 'dev-gals', 'ЖК «Монблан»', 'Москва', 'Москва', 'Шлюзовая наб.', TRUE, NOW()),
  ('prj-rozhdestvenko-8', 'dev-gals', 'ЖК «Рождественка 8»', 'Москва', 'Москва', 'ул. Кузнецкий Мост, 17', TRUE, NOW()),

  -- ГК «ОСНОВА»
  ('prj-mirapolis', 'dev-osnova', 'ЖК «МИРАПОЛИС»', 'Москва', 'Москва', 'пр. Мира, 222', TRUE, NOW()),
  ('prj-evopark', 'dev-osnova', 'ЖК «EVOPARK Измайлово»', 'Москва', 'Москва', 'ул. Электродная, 2А', TRUE, NOW()),

  -- Forma
  ('prj-moments', 'dev-forma', 'ЖК «Moments»', 'Москва', 'Москва', 'Волоколамское ш.', TRUE, NOW()),
  ('prj-soul', 'dev-forma', 'ЖК «SOUL»', 'Москва', 'Москва', 'ул. Часовая', TRUE, NOW()),

  -- ГК ФСК
  ('prj-amber-city', 'dev-fsk', 'ЖК «AMBER CITY»', 'Москва', 'Москва', 'ул. Розанова', TRUE, NOW()),
  ('prj-sky-garden', 'dev-fsk', 'ЖК «Sky Garden»', 'Москва', 'Москва', 'Строительный проезд', TRUE, NOW()),
  ('prj-rotterdam', 'dev-fsk', 'ЖК «Rotterdam»', 'Москва', 'Москва', 'Варшавское ш.', TRUE, NOW()),

  -- ДОНСТРОЙ
  ('prj-sobytie', 'dev-donstroy', 'ЖК «Событие»', 'Москва', 'Москва', 'ул. Лобачевского', TRUE, NOW()),

  -- ЛСР. Недвижимость-Москва
  ('prj-luchi', 'dev-lsr', 'ЖК «ЛУЧИ»', 'Москва', 'Москва', 'ул. Производственная', TRUE, NOW()),
  ('prj-dmitrovskoe-nebo', 'dev-lsr', 'ЖК «Дмитровское небо»', 'Москва', 'Москва', 'Ильменский проезд', TRUE, NOW()),

  -- ДСК-1
  ('prj-1-salaryevskiy', 'dev-dsk1', '«1-й Саларьевский»', 'Москва', 'Москва', 'пос. Московский', TRUE, NOW())

ON CONFLICT (id) DO UPDATE SET
  project_name = EXCLUDED.project_name,
  address = EXCLUDED.address,
  is_active = EXCLUDED.is_active;

-- ============================================
-- SAMPLE TARIFFS for imported projects
-- ============================================

-- Add sample tariffs for some of the imported projects
-- These are examples - real tariffs should come from your tariff card

INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city,
  segment, object_category, payment_stage,
  commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, is_active
) VALUES
  -- Группа «Самолет» - ЖК «Квартал Домашний»
  (
    'TAR-SAM-001', 'dev-samolot', 'Группа «Самолет»', 'ООО "Группа Самолет"',
    'prj-kvartal-domashniy', 'ЖК «Квартал Домашний»', 'Москва', 'Москва',
    'FLATS', '1_ROOM', 'ADVANCE',
    'PERCENT_OF_CONTRACT', 3.0,
    'BASE', '2025-01-01', TRUE
  ),
  -- Группа «Родина» - ЖК «СОЮЗ»
  (
    'TAR-ROD-001', 'dev-rodina', 'Группа «Родина»', 'ООО "Группа Родина"',
    'prj-soyuz', 'ЖК «СОЮЗ»', 'Москва', 'Москва',
    'FLATS', '2_ROOM', 'DEAL',
    'PERCENT_OF_CONTRACT', 3.5,
    'SPECIAL', '2025-01-01', TRUE
  ),
  -- MR Group - ЖК «SET»
  (
    'TAR-MRG-001', 'dev-mr-group', 'MR Group', 'ООО "MR Group"',
    'prj-set', 'ЖК «SET»', 'Москва', 'Москва',
    'FLATS', '1_ROOM', 'ADVANCE',
    'PERCENT_OF_CONTRACT', 4.0,
    'BASE', '2025-01-01', TRUE
  ),
  -- ДОНСТРОЙ - ЖК «Событие»
  (
    'TAR-DON-001', 'dev-donstroy', 'ДОНСТРОЙ', 'ООО "ДОНСТРОЙ"',
    'prj-sobytie', 'ЖК «Событие»', 'Москва', 'Москва',
    'FLATS', '2_ROOM', 'DEAL',
    'PERCENT_OF_CONTRACT', 3.8,
    'BASE', '2025-01-01', TRUE
  )

ON CONFLICT (tariff_id) DO UPDATE SET
  commission_total_percent = EXCLUDED.commission_total_percent,
  is_active = EXCLUDED.is_active;

-- ============================================
-- VERIFY DATA
-- ============================================

-- Check imported developers
SELECT
  type,
  name,
  inn,
  offer_accepted_at IS NOT NULL as offer_accepted,
  created_at
FROM counterparties
WHERE type = 'DEVELOPER'
ORDER BY name;

-- Check imported projects
SELECT
  p.project_name,
  c.name as developer_name,
  p.city,
  p.address,
  p.is_active,
  (SELECT COUNT(*) FROM tariffs t WHERE t.project_id = p.id) as tariffs_count
FROM projects p
JOIN counterparties c ON c.id = p.developer_id
ORDER BY c.name, p.project_name;

-- Check tariffs
SELECT
  tariff_id,
  developer_name,
  project_name,
  segment,
  object_category,
  commission_total_percent,
  promo_flag,
  is_active
FROM tariffs
ORDER BY developer_name, project_name;
