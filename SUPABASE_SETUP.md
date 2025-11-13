# Supabase Setup Guide

This guide will help you set up Supabase for the M2 Split application.

## Prerequisites

- Supabase account (https://supabase.com)
- Node.js 18+ installed
- Access to the project repository

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: m2split (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get Environment Variables

1. In your Supabase project dashboard, click on the "Settings" icon (⚙️) in the sidebar
2. Go to "API" section
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (looks like: `eyJhbGc...`)

## Step 3: Configure Environment Variables

Create a `.env.local` file in the project root with the following content:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 4: Run Database Migrations

### Option A: Using Supabase SQL Editor (Recommended for first-time setup)

1. In your Supabase project, go to the **SQL Editor** (📝 icon in sidebar)
2. Click "New query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute
6. Repeat for `supabase/migrations/002_events_table.sql`

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your_project_ref

# Run migrations
supabase db push
```

## Step 5: Verify Database Setup

1. Go to the **Table Editor** in your Supabase dashboard
2. You should see the following tables:
   - `counterparties` - Contractors/developers
   - `projects` - Developer projects
   - `tariffs` - Tariff card
   - `deals` - Deals/transactions
   - `deal_participants` - Deal share splits
   - `registries` - Payment registries
   - `registry_items` - Registry line items
   - `documents` - Document uploads
   - `payments` - Payment records
   - `events` - Audit log

3. Check that sample data was inserted:
   - 2 developers in `counterparties`
   - 2 projects in `projects`
   - 2 tariffs in `tariffs`
   - 3 agencies/agents in `counterparties`

## Step 6: Import Tariff Card Data (Optional)

If you have tariff card data to import:

1. Go to the **SQL Editor**
2. Use the following template:

```sql
-- Import tariff card from CSV
INSERT INTO tariffs (
  tariff_id, developer_id, developer_name, developer_legal_entity,
  project_id, project_name, region, city, segment, object_category,
  payment_stage, commission_scheme_type, commission_total_percent,
  promo_flag, valid_from, is_active
)
SELECT
  'TAR-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 4, '0'),
  d.id,
  d.name,
  d.name,
  p.id,
  p.project_name,
  p.region,
  p.city,
  'FLATS', -- Update based on your data
  '1_ROOM', -- Update based on your data
  'ADVANCE', -- Update based on your data
  'PERCENT_OF_CONTRACT',
  3.0, -- Commission percent
  'BASE',
  '2025-01-01',
  TRUE
FROM projects p
JOIN counterparties d ON d.id = p.developer_id
WHERE d.type = 'DEVELOPER';
```

Or use the import script:
```bash
node scripts/import-tariffs.js path/to/tariffs.csv
```

## Step 7: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Open http://localhost:3000 in your browser
3. Try creating a deal or contractor
4. Check the browser console - you should NOT see "Using mock data" warnings
5. Verify data appears in Supabase Table Editor

## Step 8: Configure Row Level Security (RLS) - Production Only

For production deployments, enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE counterparties ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE registry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies based on your authentication setup
-- Example: Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON counterparties
  FOR ALL USING (auth.role() = 'authenticated');

-- Repeat for other tables...
```

> 📝 **Note**: RLS configuration depends on your authentication setup. Adjust policies based on your security requirements.

## Troubleshooting

### Connection Issues

**Problem**: Application shows "Using mock data (Supabase not configured)"

**Solutions**:
1. Verify `.env.local` file exists and has correct values
2. Restart the development server (`npm run dev`)
3. Check Supabase project is active (not paused)
4. Verify API keys are correct (no extra spaces)

### Migration Errors

**Problem**: SQL errors when running migrations

**Solutions**:
1. Check you're using PostgreSQL 14+ (Supabase default)
2. Run migrations in order (001, then 002)
3. Check for existing tables - drop them if needed:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```

### Performance Issues

**Problem**: Slow queries

**Solutions**:
1. Check indexes are created (see migration files)
2. Use Supabase query analyzer: Database → Query Performance
3. Consider adding composite indexes for frequent queries

## Environment-Specific Setup

### Development
- Use `.env.local` for local environment variables
- Sample data is automatically inserted by migrations
- No RLS needed for development

### Staging/Production
- Use Vercel environment variables or similar
- Enable RLS (see Step 8)
- Disable sample data insertion in migrations
- Configure backup policies in Supabase dashboard

## Next Steps

1. ✅ Database schema created
2. ✅ Environment variables configured
3. ✅ Migrations applied
4. ✅ Sample data loaded
5. ✅ Connection tested

You're ready to use M2 Split with Supabase! 🎉

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [M2 Split Data Model](./DATA_MODEL_TABLES.md)
- [Project README](./README.md)

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review Supabase logs in the dashboard
3. Check browser console for errors
4. Consult the project documentation
