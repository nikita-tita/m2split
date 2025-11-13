const { Client } = require('pg');

// Supabase PostgreSQL connection via pooler
// Using port 6543 for connection pooling (transaction mode)
const connectionString = 'postgresql://postgres.xkyghmqeawfzocpbxaxt:Bastet070@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

const createTablesSQL = `
-- Create missing tables: projects and tariffs

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

CREATE TABLE IF NOT EXISTS tariffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tariff_id TEXT UNIQUE NOT NULL,
  developer_id UUID NOT NULL REFERENCES counterparties(id),
  developer_name TEXT NOT NULL,
  developer_legal_entity TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id),
  project_name TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  segment TEXT NOT NULL CHECK (segment IN ('APARTMENTS', 'FLATS', 'COMMERCIAL', 'HOUSES', 'TOWNHOUSES', 'PARKING')),
  object_category TEXT NOT NULL CHECK (object_category IN ('STUDIO', '1_ROOM', '2_ROOM', '3_ROOM', '4_ROOM', 'OTHER')),
  payment_stage TEXT NOT NULL CHECK (payment_stage IN ('ADVANCE', 'DEAL', 'ACT', 'COMBINED')),
  commission_scheme_type TEXT NOT NULL CHECK (commission_scheme_type IN ('PERCENT_OF_CONTRACT', 'FIXED_AMOUNT', 'STEP_SCALE')),
  commission_total_percent DECIMAL(5,2),
  commission_fixed_amount DECIMAL(15,2),
  commission_min_amount DECIMAL(15,2),
  commission_max_amount DECIMAL(15,2),
  promo_flag TEXT NOT NULL DEFAULT 'BASE' CHECK (promo_flag IN ('BASE', 'SPECIAL', 'ONLY_M2', 'ACTION')),
  promo_description TEXT,
  valid_from DATE NOT NULL,
  valid_to DATE,
  is_active BOOLEAN DEFAULT TRUE,
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
`;

async function createTables() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    console.log('🔧 Creating tables...');
    await client.query(createTablesSQL);
    console.log('✅ Tables created successfully!\n');

    // Verify tables exist
    const { rows } = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('projects', 'tariffs')
      ORDER BY table_name;
    `);

    console.log('📋 Verified tables:');
    rows.forEach(row => console.log(`   ✓ ${row.table_name}`));
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Connection closed\n');
  }
}

createTables();
