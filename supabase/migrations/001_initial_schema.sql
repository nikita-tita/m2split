-- M2 Split Database Schema
-- Version: 1.0
-- Date: 2025-01-13

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COUNTERPARTIES (Контрагенты)
-- ============================================

CREATE TABLE counterparties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('DEVELOPER', 'AGENCY', 'AGENT', 'IP', 'NPD')),
  name TEXT NOT NULL,
  inn TEXT NOT NULL,
  kpp TEXT,
  account_number TEXT,
  bik TEXT,
  bank_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  offer_accepted_at TIMESTAMPTZ,
  offer_acceptance_channel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_counterparties_type ON counterparties(type);
CREATE INDEX idx_counterparties_inn ON counterparties(inn);
CREATE INDEX idx_counterparties_offer_accepted ON counterparties(offer_accepted_at) WHERE offer_accepted_at IS NOT NULL;

-- ============================================
-- PROJECTS (ЖК/Проекты застройщиков)
-- ============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES counterparties(id),
  project_name TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_developer ON projects(developer_id);
CREATE INDEX idx_projects_active ON projects(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_projects_city ON projects(city);

-- ============================================
-- TARIFFS (Тарифная карта)
-- ============================================

CREATE TABLE tariffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tariff_id TEXT UNIQUE NOT NULL, -- TAR-0001, TAR-0002, etc.

  -- Developer & Project
  developer_id UUID NOT NULL REFERENCES counterparties(id),
  developer_name TEXT NOT NULL,
  developer_legal_entity TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id),
  project_name TEXT NOT NULL,

  -- Location
  region TEXT NOT NULL,
  city TEXT NOT NULL,

  -- Object classification
  segment TEXT NOT NULL CHECK (segment IN ('APARTMENTS', 'FLATS', 'COMMERCIAL', 'HOUSES', 'TOWNHOUSES', 'PARKING')),
  object_category TEXT NOT NULL CHECK (object_category IN ('STUDIO', '1_ROOM', '2_ROOM', '3_ROOM', '4_ROOM', 'OTHER')),

  -- Payment
  payment_stage TEXT NOT NULL CHECK (payment_stage IN ('ADVANCE', 'DEAL', 'ACT', 'COMBINED')),

  -- Commission calculation
  commission_scheme_type TEXT NOT NULL CHECK (commission_scheme_type IN ('PERCENT_OF_CONTRACT', 'FIXED_AMOUNT', 'STEP_SCALE')),
  commission_total_percent DECIMAL(5,2),
  commission_fixed_amount DECIMAL(15,2),
  commission_min_amount DECIMAL(15,2),
  commission_max_amount DECIMAL(15,2),

  -- Promo
  promo_flag TEXT NOT NULL DEFAULT 'BASE' CHECK (promo_flag IN ('BASE', 'SPECIAL', 'ONLY_M2', 'ACTION')),
  promo_description TEXT,

  -- Validity
  valid_from DATE NOT NULL,
  valid_to DATE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Meta
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT tariff_valid_dates CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE INDEX idx_tariffs_developer ON tariffs(developer_id);
CREATE INDEX idx_tariffs_project ON tariffs(project_id);
CREATE INDEX idx_tariffs_active ON tariffs(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_tariffs_validity ON tariffs(valid_from, valid_to);
CREATE INDEX idx_tariffs_lookup ON tariffs(developer_id, project_id, segment, object_category, payment_stage) WHERE is_active = TRUE;

-- ============================================
-- DEALS (Сделки)
-- ============================================

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_number TEXT UNIQUE,

  -- Object info
  object_name TEXT NOT NULL,
  object_address TEXT NOT NULL,
  lot_number TEXT,

  -- Participants
  developer_id UUID REFERENCES counterparties(id),
  project_id UUID REFERENCES projects(id),
  agency_id UUID REFERENCES counterparties(id),

  -- Client (на кого бронируем)
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  client_comment TEXT,

  -- Amounts
  total_amount DECIMAL(15,2) NOT NULL,
  commission_amount DECIMAL(15,2) NOT NULL,

  -- Tariff
  tariff_id UUID REFERENCES tariffs(id),
  commission_calculated_amount DECIMAL(15,2),
  commission_actual_amount DECIMAL(15,2),

  -- Contract
  contract_number TEXT,
  contract_date DATE,
  special_account_receipt_date DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'reserved', 'deal_confirmed',
    'commission_expected', 'commission_received',
    'split_ready', 'paid', 'cancelled'
  )),

  -- Meta
  responsible_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deals_developer ON deals(developer_id);
CREATE INDEX idx_deals_project ON deals(project_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_created ON deals(created_at);

-- ============================================
-- DEAL PARTICIPANTS (Участники сделки / Сплит)
-- ============================================

CREATE TABLE deal_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  counterparty_id UUID NOT NULL REFERENCES counterparties(id),

  role TEXT NOT NULL CHECK (role IN ('AGENCY', 'AGENT', 'IP', 'NPD')),
  share_percent DECIMAL(5,2) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,

  tax_regime TEXT NOT NULL CHECK (tax_regime IN ('OSN', 'USN', 'NPD')),
  vat_rate DECIMAL(5,2),

  contract_number TEXT,
  contract_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_share_percent CHECK (share_percent > 0 AND share_percent <= 100)
);

CREATE INDEX idx_deal_participants_deal ON deal_participants(deal_id);
CREATE INDEX idx_deal_participants_counterparty ON deal_participants(counterparty_id);

-- ============================================
-- REGISTRIES (Реестры выплат)
-- ============================================

CREATE TABLE registries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registry_number TEXT UNIQUE NOT NULL,
  registry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'approved',
    'sent_to_bank', 'executed', 'partially_executed', 'error'
  )),
  total_amount DECIMAL(15,2) NOT NULL,
  lines_count INTEGER NOT NULL DEFAULT 0,
  creator_id TEXT NOT NULL,
  approver_id TEXT,
  approved_at TIMESTAMPTZ,
  sent_to_bank_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  rejection_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_registries_status ON registries(status);
CREATE INDEX idx_registries_date ON registries(registry_date);

-- ============================================
-- REGISTRY ITEMS (Строки реестра)
-- ============================================

CREATE TABLE registry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registry_id UUID NOT NULL REFERENCES registries(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id),
  counterparty_id UUID NOT NULL REFERENCES counterparties(id),

  role TEXT NOT NULL CHECK (role IN ('AGENCY', 'AGENT', 'IP', 'NPD')),
  inn TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bik TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,

  tax_regime TEXT NOT NULL CHECK (tax_regime IN ('OSN', 'USN', 'NPD')),
  vat_rate DECIMAL(5,2),

  contract_number TEXT,
  contract_date DATE,
  comment TEXT,

  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'accepted_by_bank', 'executed', 'error'
  )),
  bank_error_code TEXT,
  bank_error_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_registry_items_registry ON registry_items(registry_id);
CREATE INDEX idx_registry_items_deal ON registry_items(deal_id);
CREATE INDEX idx_registry_items_counterparty ON registry_items(counterparty_id);
CREATE INDEX idx_registry_items_status ON registry_items(payment_status);

-- ============================================
-- DOCUMENTS (Первичные документы)
-- ============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id),
  counterparty_id UUID NOT NULL REFERENCES counterparties(id),

  document_type TEXT NOT NULL CHECK (document_type IN ('ACT', 'INVOICE', 'NPD_RECEIPT')),
  document_number TEXT NOT NULL,
  document_date DATE NOT NULL,

  amount DECIMAL(15,2) NOT NULL,
  vat_amount DECIMAL(15,2),

  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'not_requested' CHECK (status IN (
    'not_requested', 'requested', 'uploaded', 'verified', 'rejected'
  )),
  rejection_reason TEXT,

  uploaded_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_deal ON documents(deal_id);
CREATE INDEX idx_documents_counterparty ON documents(counterparty_id);
CREATE INDEX idx_documents_status ON documents(status);

-- ============================================
-- PAYMENTS (Платежи)
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registry_id UUID REFERENCES registries(id),
  registry_item_id UUID REFERENCES registry_items(id),
  deal_id UUID REFERENCES deals(id),
  counterparty_id UUID NOT NULL REFERENCES counterparties(id),

  amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted_by_bank', 'executed', 'error'
  )),

  bank_reference TEXT,
  bank_error_code TEXT,
  bank_error_text TEXT,

  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_registry ON payments(registry_id);
CREATE INDEX idx_payments_deal ON payments(deal_id);
CREATE INDEX idx_payments_counterparty ON payments(counterparty_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- TRIGGERS (Auto-update updated_at)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_counterparties_updated_at BEFORE UPDATE ON counterparties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tariffs_updated_at BEFORE UPDATE ON tariffs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_participants_updated_at BEFORE UPDATE ON deal_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registries_updated_at BEFORE UPDATE ON registries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registry_items_updated_at BEFORE UPDATE ON registry_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Sample developers (застройщики)
INSERT INTO counterparties (id, type, name, inn, kpp, offer_accepted_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'DEVELOPER', 'ИСК ВИТА', '7800123456', '780001001', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'DEVELOPER', 'СК "Селfстроит"', '7800234567', '780002001', NOW());

-- Sample projects
INSERT INTO projects (id, developer_id, project_name, region, city, is_active) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'ЖК Федоровское', 'Ленинградская область', 'Федоровское', TRUE),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'ЖК Первогорье', 'Ленинградская область', 'Первогорье', TRUE);

-- Sample tariffs
INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city, segment, object_category,
  payment_stage, commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, is_active
) VALUES
  (
    'TAR-0001', '11111111-1111-1111-1111-111111111111', 'ИСК ВИТА', 'ООО "ИСК ВИТА"',
    '33333333-3333-3333-3333-333333333333', 'ЖК Федоровское',
    'Ленинградская область', 'Федоровское', 'FLATS', '1_ROOM',
    'ADVANCE', 'PERCENT_OF_CONTRACT', 3.0,
    'BASE', '2025-01-01', TRUE
  ),
  (
    'TAR-0002', '22222222-2222-2222-2222-222222222222', 'СК "Селfстроит"', 'СК "Селfстроит"',
    '44444444-4444-4444-4444-444444444444', 'ЖК Первогорье',
    'Ленинградская область', 'Первогорье', 'FLATS', '2_ROOM',
    'DEAL', 'PERCENT_OF_CONTRACT', 3.5,
    'SPECIAL', '2025-01-01', TRUE
  );

-- Sample agencies (with accepted offers)
INSERT INTO counterparties (type, name, inn, kpp, account_number, bik, bank_name, offer_accepted_at) VALUES
  ('AGENCY', 'АН "Недвижимость Плюс"', '7701234567', '770101001', '40702810100000001234', '044525225', 'ПАО Сбербанк', NOW()),
  ('AGENT', 'Петров Петр Петрович', '771234567890', NULL, '40817810200000002345', '044525225', 'ПАО Сбербанк', NOW()),
  ('NPD', 'Сидорова Анна Ивановна', '123456789012', NULL, '40817810300000003456', '044525974', 'ПАО ВТБ', NOW());
