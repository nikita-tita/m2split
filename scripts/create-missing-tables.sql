-- Create missing tables: projects and tariffs

-- ============================================
-- PROJECTS (ЖК/Проекты застройщиков)
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES counterparties(id),
  project_name TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(developer_id, project_name)
);

CREATE INDEX IF NOT EXISTS idx_projects_developer ON projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_projects_city ON projects(city);

-- ============================================
-- TARIFFS (Тарифная карта)
-- ============================================

CREATE TABLE IF NOT EXISTS tariffs (
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

CREATE INDEX IF NOT EXISTS idx_tariffs_developer ON tariffs(developer_id);
CREATE INDEX IF NOT EXISTS idx_tariffs_project ON tariffs(project_id);
CREATE INDEX IF NOT EXISTS idx_tariffs_active ON tariffs(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_tariffs_validity ON tariffs(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_tariffs_lookup ON tariffs(developer_id, project_id, segment, object_category, payment_stage) WHERE is_active = TRUE;
