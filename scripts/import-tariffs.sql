-- M2 Split - Tariff Card Import
-- Import tariffs with maximum commission rates (максимальный тариф)
-- All calculations assume unique client (уникальный клиент)

-- ============================================
-- TARIFF IMPORT
-- ============================================

-- Level Group tariffs (various rates)
-- ЖК «Level Кавказский бульвар»: от 0.45 до 1.8 % → 1.8%
-- ЖК «Level Амурская»: от 0.45 до 1.8 % → 1.8%
-- ЖК «Level Павелецкая»: от 0.675 до 4.5 % → 4.5%
-- ЖК «Лефорт»: от 0.45 до 1.8 % → 1.8%
-- ЖК «Level Пресненский»: от 1.35 до 2.7 % → 2.7%
-- ЖК «Река»: от 0.45 до 1.8 % → 1.8%
-- ЖК «Level Амбулаторный»: от 0.45 до 1.8 % → 1.8%
-- Дом «Level Римская»: от 0.45 до 3.6 % → 3.6%
-- ЖК «Level Сухаревская»: от 0.45 до 3.6 % → 3.6%
-- ЖК «Level Донской»: от 0.45 до 3.6 % → 3.6%
-- ЖК «Level Шереметьевская»: от 0.45 до 1.8 % → 1.8%
-- ЖК «Level Ленинградский»: от 0.45 до 1.8 % → 1.8%

INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city, segment, object_category,
  payment_stage, commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, valid_to, is_active, comments
) VALUES
  -- Level Group projects
  (
    'TAR-LEVEL-KAVKAZSKIY',
    (SELECT id FROM counterparties WHERE name = 'Level Group' LIMIT 1),
    'Level Group', 'ООО «Level Group»',
    (SELECT id FROM projects WHERE project_name LIKE '%Level Кавказский%' LIMIT 1),
    'ЖК «Level Кавказский бульвар»',
    'Москва', 'Москва', 'FLATS', '1_ROOM',
    'ADVANCE', 'PERCENT_OF_CONTRACT', 1.8,
    'BASE', '2025-01-01', '2025-10-31', TRUE,
    'Максимальная ставка 1.8% для уникального клиента. Окончание КВ: 31.10.2025'
  ),
  (
    'TAR-LEVEL-PAVELETSKAYA',
    (SELECT id FROM counterparties WHERE name = 'Level Group' LIMIT 1),
    'Level Group', 'ООО «Level Group»',
    (SELECT id FROM projects WHERE project_name LIKE '%Level Павелецкая%' LIMIT 1),
    'оК «Level Павелецкая»',
    'Москва', 'Москва', 'FLATS', '1_ROOM',
    'ADVANCE', 'PERCENT_OF_CONTRACT', 4.5,
    'SPECIAL', '2025-01-01', '2025-10-31', TRUE,
    'Максимальная ставка 4.5% для уникального клиента. Окончание КВ: 31.10.2025'
  ),
  (
    'TAR-LEVEL-RIMSKAYA',
    (SELECT id FROM counterparties WHERE name = 'Level Group' LIMIT 1),
    'Level Group', 'ООО «Level Group»',
    (SELECT id FROM projects WHERE project_name LIKE '%Level Римская%' LIMIT 1),
    'Дом «Level Римская»',
    'Москва', 'Москва', 'FLATS', '1_ROOM',
    'ADVANCE', 'PERCENT_OF_CONTRACT', 3.6,
    'BASE', '2025-01-01', '2025-10-31', TRUE,
    'Максимальная ставка 3.6% для уникального клиента. Окончание КВ: 31.10.2025'
  );

-- Группа «Самолет» tariffs (от 1.8 до 2.7 % → 2.7%)
-- All Самолет projects have the same commission structure
INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city, segment, object_category,
  payment_stage, commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, valid_to, is_active, comments
)
SELECT
  'TAR-SAMOLET-' || UPPER(SUBSTRING(MD5(p.id::text), 1, 6)),
  p.developer_id,
  'Группа «Самолет»',
  'ООО «Самолет-Девелопмент»',
  p.id,
  p.project_name,
  p.region,
  p.city,
  'FLATS',
  '1_ROOM',
  'ADVANCE',
  'PERCENT_OF_CONTRACT',
  2.7, -- Maximum rate
  'BASE',
  '2025-01-01',
  '2025-11-30',
  TRUE,
  'Максимальная ставка 2.7% для уникального клиента. Окончание КВ: 30.11.2025'
FROM projects p
JOIN counterparties c ON p.developer_id = c.id
WHERE c.name = 'Группа «Самолет»';

-- ФСК tariffs (от 1.35 до 3.15 % → 3.15%)
INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city, segment, object_category,
  payment_stage, commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, valid_to, is_active, comments
)
SELECT
  'TAR-FSK-' || UPPER(SUBSTRING(MD5(p.id::text), 1, 6)),
  p.developer_id,
  'ГК ФСК',
  'ООО «ФСК»',
  p.id,
  p.project_name,
  p.region,
  p.city,
  'FLATS',
  '1_ROOM',
  'ADVANCE',
  'PERCENT_OF_CONTRACT',
  3.15, -- Maximum rate
  'BASE',
  '2025-01-01',
  '2025-11-30',
  TRUE,
  'Максимальная ставка 3.15% для уникального клиента. Окончание КВ: 30.11.2025'
FROM projects p
JOIN counterparties c ON p.developer_id = c.id
WHERE c.name IN ('ГК ФСК', 'ФСК');

-- Брусника tariffs (от 1.8 до 2.7 % → 2.7%)
INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city, segment, object_category,
  payment_stage, commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, valid_to, is_active, comments
)
SELECT
  'TAR-BRUSNIKA-' || UPPER(SUBSTRING(MD5(p.id::text), 1, 6)),
  p.developer_id,
  'Брусника',
  'ООО «Брусника»',
  p.id,
  p.project_name,
  p.region,
  p.city,
  'FLATS',
  '1_ROOM',
  'ADVANCE',
  'PERCENT_OF_CONTRACT',
  2.7, -- Maximum rate
  'BASE',
  '2025-01-01',
  '2025-11-30',
  TRUE,
  'Максимальная ставка 2.7% для уникального клиента. Окончание КВ: 30.11.2025'
FROM projects p
JOIN counterparties c ON p.developer_id = c.id
WHERE c.name = 'Брусника';

-- ДОНСТРОЙ tariffs (от 2.7 до 3.06 % → 3.06%)
INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city, segment, object_category,
  payment_stage, commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, valid_to, is_active, comments
)
SELECT
  'TAR-DONSTROY-' || UPPER(SUBSTRING(MD5(p.id::text), 1, 6)),
  p.developer_id,
  'ДОНСТРОЙ',
  'ООО «ДОНСТРОЙ»',
  p.id,
  p.project_name,
  p.region,
  p.city,
  'FLATS',
  '1_ROOM',
  'ADVANCE',
  'PERCENT_OF_CONTRACT',
  3.06, -- Maximum rate
  'BASE',
  '2025-01-01',
  '2025-07-31',
  TRUE,
  'Максимальная ставка 3.06% для уникального клиента. Окончание КВ: 31.07.2025'
FROM projects p
JOIN counterparties c ON p.developer_id = c.id
WHERE c.name = 'ДОНСТРОЙ';

-- ОСНОВА-ИНВЕСТ / ГК «ОСНОВА» tariffs (2.7%)
INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city, segment, object_category,
  payment_stage, commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, valid_to, is_active, comments
)
SELECT
  'TAR-OSNOVA-' || UPPER(SUBSTRING(MD5(p.id::text), 1, 6)),
  p.developer_id,
  c.name,
  'ООО «' || c.name || '»',
  p.id,
  p.project_name,
  p.region,
  p.city,
  'FLATS',
  '1_ROOM',
  'ADVANCE',
  'PERCENT_OF_CONTRACT',
  2.7,
  'BASE',
  '2025-01-01',
  '2025-11-30',
  TRUE,
  'Ставка 2.7% для уникального клиента. Окончание КВ: 30.11.2025'
FROM projects p
JOIN counterparties c ON p.developer_id = c.id
WHERE c.name IN ('ОСНОВА-ИНВЕСТ', 'ГК «ОСНОВА»');

-- Capital Group tariffs (2.7%)
INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city, segment, object_category,
  payment_stage, commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, valid_to, is_active, comments
)
SELECT
  'TAR-CAPITAL-' || UPPER(SUBSTRING(MD5(p.id::text), 1, 6)),
  p.developer_id,
  'Capital Group',
  'ООО «Capital Group»',
  p.id,
  p.project_name,
  p.region,
  p.city,
  'FLATS',
  '1_ROOM',
  'ADVANCE',
  'PERCENT_OF_CONTRACT',
  2.7,
  'BASE',
  '2025-01-01',
  NULL, -- No expiry specified
  TRUE,
  'Ставка 2.7% для уникального клиента. Аванс.'
FROM projects p
JOIN counterparties c ON p.developer_id = c.id
WHERE c.name = 'Capital Group';

-- ГК «МИЦ» tariffs (1.8%)
INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city, segment, object_category,
  payment_stage, commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, valid_to, is_active, comments
)
SELECT
  'TAR-MIC-' || UPPER(SUBSTRING(MD5(p.id::text), 1, 6)),
  p.developer_id,
  'ГК «МИЦ»',
  'ООО «МИЦ»',
  p.id,
  p.project_name,
  p.region,
  p.city,
  'FLATS',
  '1_ROOM',
  'ADVANCE',
  'PERCENT_OF_CONTRACT',
  1.8,
  'BASE',
  '2025-01-01',
  '2025-02-28',
  TRUE,
  'Ставка 1.8% для уникального клиента. Окончание КВ: 28.02.2025'
FROM projects p
JOIN counterparties c ON p.developer_id = c.id
WHERE c.name = 'ГК «МИЦ»';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count tariffs by developer
SELECT
  c.name as developer_name,
  COUNT(t.id) as tariff_count,
  AVG(t.commission_total_percent) as avg_commission,
  MAX(t.commission_total_percent) as max_commission
FROM tariffs t
JOIN counterparties c ON t.developer_id = c.id
GROUP BY c.name
ORDER BY max_commission DESC;

-- Show all tariffs with expiry dates
SELECT
  tariff_id,
  developer_name,
  project_name,
  commission_total_percent || '%' as commission,
  valid_to,
  CASE
    WHEN valid_to IS NULL THEN 'Бессрочно'
    WHEN valid_to < CURRENT_DATE THEN 'Истек'
    ELSE 'Действует'
  END as status
FROM tariffs
WHERE is_active = TRUE
ORDER BY developer_name, project_name;

-- Tariffs by commission rate
SELECT
  commission_total_percent || '%' as commission_rate,
  COUNT(*) as project_count,
  STRING_AGG(DISTINCT developer_name, ', ') as developers
FROM tariffs
WHERE is_active = TRUE
GROUP BY commission_total_percent
ORDER BY commission_total_percent DESC;
