-- M2 Split Initial Database Schema
-- Version: 1.0.0
-- Description: Complete schema for MVP (counterparties, deals, registries, payments, documents)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- COUNTERPARTIES (Контрагенты)
-- ============================================================================
CREATE TABLE counterparties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('developer', 'agency', 'agent', 'ip', 'npd')),

  -- Tax Info
  inn TEXT NOT NULL UNIQUE,
  kpp TEXT,
  tax_regime TEXT NOT NULL CHECK (tax_regime IN ('VAT', 'USN', 'NPD')),
  vat_rate INTEGER CHECK (vat_rate IN (0, 10, 20, 22)),

  -- Banking
  account_number TEXT NOT NULL,
  bik TEXT NOT NULL,
  bank_name TEXT NOT NULL,

  -- Address
  address TEXT NOT NULL,

  -- Offer
  offer_accepted BOOLEAN DEFAULT false,
  offer_accepted_at TIMESTAMPTZ,
  offer_acceptance_channel TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DEALS (Сделки)
-- ============================================================================
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Object Info
  object_name TEXT NOT NULL,
  object_address TEXT NOT NULL,
  lot_number TEXT,

  -- Amount
  total_amount BIGINT NOT NULL CHECK (total_amount > 0),

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'in_progress', 'in_registry', 'approved',
    'sent_to_bank', 'paid', 'partially_paid', 'cancelled'
  )),

  -- Developer
  developer_id UUID NOT NULL REFERENCES counterparties(id) ON DELETE RESTRICT,

  -- Contract
  contract_basis TEXT,
  contract_number TEXT,
  contract_date DATE,
  special_account_receipt_date DATE,

  -- Responsible
  responsible_user_id TEXT,

  -- Initiator (immutable)
  initiator_role TEXT NOT NULL,
  initiator_party_id TEXT NOT NULL,
  initiator_user_id TEXT NOT NULL,
  initiator_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DEAL PARTICIPANTS (Участники сделок / Сплит долей)
-- ============================================================================
CREATE TABLE deal_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  counterparty_id UUID NOT NULL REFERENCES counterparties(id) ON DELETE RESTRICT,

  -- Role
  role TEXT NOT NULL CHECK (role IN ('agency', 'agent', 'ip', 'npd')),

  -- Share
  share_percent DECIMAL(5,2) NOT NULL CHECK (share_percent > 0 AND share_percent <= 100),
  amount BIGINT NOT NULL CHECK (amount >= 0),

  -- Tax
  tax_regime TEXT NOT NULL CHECK (tax_regime IN ('VAT', 'USN', 'NPD')),
  vat_rate INTEGER CHECK (vat_rate IN (0, 10, 20, 22)),

  -- Contract
  contract_number TEXT,
  contract_date DATE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(deal_id, counterparty_id)
);

-- ============================================================================
-- REGISTRIES (Реестры выплат)
-- ============================================================================
CREATE TABLE registries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Registry Info
  registry_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'approved', 'sent_to_bank',
    'executed', 'partially_executed', 'error'
  )),

  -- Amounts
  total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
  lines_count INTEGER NOT NULL DEFAULT 0 CHECK (lines_count >= 0),

  -- Users
  creator_id TEXT NOT NULL,
  approver_id TEXT,

  -- Dates
  approved_at TIMESTAMPTZ,
  sent_to_bank_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,

  -- Rejection
  rejection_comment TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REGISTRY ITEMS (Строки реестров)
-- ============================================================================
CREATE TABLE registry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  registry_id UUID NOT NULL REFERENCES registries(id) ON DELETE CASCADE,
  counterparty_id UUID NOT NULL REFERENCES counterparties(id) ON DELETE RESTRICT,

  -- Role
  role TEXT NOT NULL CHECK (role IN ('agency', 'agent', 'ip', 'npd')),

  -- Payment Info
  inn TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bik TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),

  -- Tax
  tax_regime TEXT NOT NULL CHECK (tax_regime IN ('VAT', 'USN', 'NPD')),
  vat_rate INTEGER CHECK (vat_rate IN (0, 10, 20, 22)),

  -- Contract
  contract_number TEXT,
  contract_date DATE,

  -- Comment
  comment TEXT,

  -- Payment Status
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'accepted_by_bank', 'executed', 'error'
  )),
  bank_error_code TEXT,
  bank_error_text TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PAYMENTS (Детализация выплат)
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  registry_id UUID NOT NULL REFERENCES registries(id) ON DELETE CASCADE,
  registry_item_id UUID NOT NULL REFERENCES registry_items(id) ON DELETE CASCADE,
  counterparty_id UUID NOT NULL REFERENCES counterparties(id) ON DELETE RESTRICT,

  -- Amount
  amount BIGINT NOT NULL CHECK (amount > 0),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted_by_bank', 'executed', 'error'
  )),

  -- Bank Response
  bank_reference TEXT,
  bank_error_code TEXT,
  bank_error_text TEXT,
  executed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS (Первичные документы)
-- ============================================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relations
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  counterparty_id UUID NOT NULL REFERENCES counterparties(id) ON DELETE RESTRICT,

  -- Document Info
  document_type TEXT NOT NULL CHECK (document_type IN ('act', 'invoice', 'npd_receipt')),
  document_number TEXT NOT NULL,
  document_date DATE NOT NULL,

  -- Amount
  amount BIGINT NOT NULL CHECK (amount > 0),
  vat_amount BIGINT,

  -- File
  file_url TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'not_requested' CHECK (status IN (
    'not_requested', 'requested', 'uploaded', 'verified', 'rejected'
  )),
  rejection_reason TEXT,

  -- Dates
  uploaded_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Counterparties
CREATE INDEX idx_counterparties_inn ON counterparties(inn);
CREATE INDEX idx_counterparties_type ON counterparties(type);
CREATE INDEX idx_counterparties_offer_accepted ON counterparties(offer_accepted);

-- Deals
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_developer_id ON deals(developer_id);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);

-- Deal Participants
CREATE INDEX idx_deal_participants_deal_id ON deal_participants(deal_id);
CREATE INDEX idx_deal_participants_counterparty_id ON deal_participants(counterparty_id);

-- Registries
CREATE INDEX idx_registries_status ON registries(status);
CREATE INDEX idx_registries_date ON registries(date DESC);
CREATE INDEX idx_registries_created_at ON registries(created_at DESC);

-- Registry Items
CREATE INDEX idx_registry_items_registry_id ON registry_items(registry_id);
CREATE INDEX idx_registry_items_counterparty_id ON registry_items(counterparty_id);
CREATE INDEX idx_registry_items_payment_status ON registry_items(payment_status);

-- Payments
CREATE INDEX idx_payments_registry_id ON payments(registry_id);
CREATE INDEX idx_payments_counterparty_id ON payments(counterparty_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Documents
CREATE INDEX idx_documents_payment_id ON documents(payment_id);
CREATE INDEX idx_documents_counterparty_id ON documents(counterparty_id);
CREATE INDEX idx_documents_status ON documents(status);

-- ============================================================================
-- TRIGGERS (Auto-update timestamps)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_counterparties_updated_at BEFORE UPDATE ON counterparties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_participants_updated_at BEFORE UPDATE ON deal_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registries_updated_at BEFORE UPDATE ON registries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registry_items_updated_at BEFORE UPDATE ON registry_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Sample Counterparties
INSERT INTO counterparties (name, type, inn, kpp, tax_regime, vat_rate, account_number, bik, bank_name, address, offer_accepted, offer_accepted_at) VALUES
('ООО "СтройДевелопмент"', 'developer', '7701234567', '770101001', 'VAT', 20, '40702810100000001234', '044525225', 'ПАО Сбербанк', 'г. Москва, ул. Строителей, д. 1', true, NOW()),
('АН "Недвижимость Плюс"', 'agency', '7702345678', '770201001', 'VAT', 20, '40702810200000002345', '044525225', 'ПАО Сбербанк', 'г. Москва, пр-т Мира, д. 10', true, NOW()),
('ИП Иванов Иван Иванович', 'ip', '770312345678', NULL, 'USN', NULL, '40802810300000003456', '044525225', 'ПАО Сбербанк', 'г. Москва, ул. Ленина, д. 5', true, NOW()),
('Петров Петр Петрович', 'npd', '773401234567', NULL, 'NPD', NULL, '40817810400000004567', '044525593', 'АО "Альфа-Банк"', 'г. Москва, Кутузовский пр-т, д. 32', true, NOW()),
('АН "Элитное жилье"', 'agency', '7705567890', '770501001', 'VAT', 20, '40702810500000005678', '044525593', 'АО "Альфа-Банк"', 'г. Москва, ул. Тверская, д. 15', false, NULL);

COMMENT ON TABLE counterparties IS 'Контрагенты: застройщики, АН, агенты, ИП, НПД';
COMMENT ON TABLE deals IS 'Сделки по объектам недвижимости';
COMMENT ON TABLE deal_participants IS 'Участники сделок с распределением долей';
COMMENT ON TABLE registries IS 'Реестры выплат для отправки в банк';
COMMENT ON TABLE registry_items IS 'Строки реестров выплат';
COMMENT ON TABLE payments IS 'Детализация выплат с данными от банка';
COMMENT ON TABLE documents IS 'Первичные документы (акты, счета, чеки НПД)';
