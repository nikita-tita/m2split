-- M2 Split Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Counterparties (Контрагенты)
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
  offer_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals (Сделки)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_number TEXT UNIQUE,
  object_name TEXT NOT NULL,
  object_address TEXT NOT NULL,
  lot_number TEXT,
  developer_id UUID REFERENCES counterparties(id),
  agency_id UUID REFERENCES counterparties(id),
  total_amount DECIMAL(15,2) NOT NULL,
  commission_amount DECIMAL(15,2) NOT NULL,
  contract_number TEXT,
  contract_date DATE,
  special_account_receipt_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready_for_registry', 'in_registry', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal Participants (Участники сделки / Сплит)
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

-- Registries (Реестры)
CREATE TABLE registries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registry_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('DEVELOPER', 'AGENCY', 'M2_INTERNAL')),
  sender_id UUID REFERENCES counterparties(id),
  date DATE NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  lines_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent_to_bank', 'executed', 'partially_executed', 'error')),
  approved_at TIMESTAMPTZ,
  sent_to_bank_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registry Items (Строки реестра)
CREATE TABLE registry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registry_id UUID NOT NULL REFERENCES registries(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id),
  deal_participant_id UUID REFERENCES deal_participants(id),
  counterparty_id UUID NOT NULL REFERENCES counterparties(id),
  amount DECIMAL(15,2) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('AGENCY', 'AGENT', 'IP', 'NPD')),
  tax_regime TEXT NOT NULL CHECK (tax_regime IN ('OSN', 'USN', 'NPD')),
  vat_rate DECIMAL(5,2),
  inn TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bik TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'accepted_by_bank', 'executed', 'error')),
  bank_error_text TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (Документы)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('ACT', 'INVOICE', 'NPD_RECEIPT')),
  deal_id UUID REFERENCES deals(id),
  registry_id UUID REFERENCES registries(id),
  deal_participant_id UUID REFERENCES deal_participants(id),
  counterparty_id UUID REFERENCES counterparties(id),
  document_number TEXT,
  document_date DATE,
  amount DECIMAL(15,2),
  status TEXT NOT NULL DEFAULT 'awaiting' CHECK (status IN ('awaiting', 'uploaded', 'verified', 'rejected')),
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (Выплаты) - дополнительная таблица для детализации
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registry_item_id UUID REFERENCES registry_items(id),
  amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_date TIMESTAMPTZ,
  bank_reference TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_developer ON deals(developer_id);
CREATE INDEX idx_deals_agency ON deals(agency_id);
CREATE INDEX idx_deal_participants_deal ON deal_participants(deal_id);
CREATE INDEX idx_deal_participants_counterparty ON deal_participants(counterparty_id);
CREATE INDEX idx_registries_status ON registries(status);
CREATE INDEX idx_registries_sender ON registries(sender_id);
CREATE INDEX idx_registry_items_registry ON registry_items(registry_id);
CREATE INDEX idx_registry_items_deal ON registry_items(deal_id);
CREATE INDEX idx_documents_deal ON documents(deal_id);
CREATE INDEX idx_documents_registry ON documents(registry_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO counterparties (type, name, inn, kpp, account_number, bik, bank_name, offer_accepted_at) VALUES
  ('DEVELOPER', 'ООО "СтройДевелопмент"', '7701234567', '770101001', '40702810100000001234', '044525225', 'ПАО Сбербанк', NOW()),
  ('AGENCY', 'АН "Золотой Ключ"', '7702345678', '770201002', '40702810200000002345', '044525225', 'ПАО Сбербанк', NOW()),
  ('AGENT', 'Иванова Мария Ивановна', '123456789012', NULL, '40817810300000003456', '044525225', 'ПАО Сбербанк', NOW()),
  ('IP', 'ИП Петров Петр Петрович', '987654321098', NULL, '40802810400000004567', '044525974', 'АО "Альфа-Банк"', NOW()),
  ('NPD', 'Сидорова Анна Сергеевна', '111222333444', NULL, '40817810500000005678', '044525974', 'АО "Альфа-Банк"', NOW());
