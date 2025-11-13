# M2 Split Scripts

This directory contains utility scripts for database setup, data import, and maintenance.

## Prerequisites

1. Supabase project created and configured
2. `.env.local` file with Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Available Scripts

### Data Import Scripts

#### `import-tariffs.js`
Imports tariff card data for all developers and projects.

**Usage:**
```bash
node scripts/import-tariffs.js
```

**What it does:**
- Fetches existing developers and projects from Supabase
- Creates tariff records for each developer/project combination
- Uses maximum commission rates (always assumes unique client)
- Sets appropriate validity periods based on developer

**Output:**
- Imports tariffs for Level Group (1.8% - 4.5%)
- Imports tariffs for Группа «Самолет» (2.7%)
- Imports tariffs for ГК ФСК (3.15%)
- Imports tariffs for Брусника (2.7%)
- Imports tariffs for ДОНСТРОЙ (3.06%)
- Imports tariffs for ГК «ОСНОВА» (2.7%)

#### `import-data.js`
General purpose data import script (developers, projects, contractors).

**Usage:**
```bash
node scripts/import-data.js
```

### Database Utility Scripts

#### `check-schema.js`
Verifies database schema and table structure.

**Usage:**
```bash
node scripts/check-schema.js
```

**What it checks:**
- Table existence
- Column definitions
- Indexes
- Foreign key constraints

#### `list-tables.js`
Lists all tables in the database with row counts.

**Usage:**
```bash
node scripts/list-tables.js
```

**Output:**
```
📋 Tables in database:
   - counterparties (5 rows)
   - projects (15 rows)
   - tariffs (45 rows)
   - deals (0 rows)
   ...
```

#### `test-tariff-service.js`
Tests tariff lookup service functionality.

**Usage:**
```bash
node scripts/test-tariff-service.js
```

**What it tests:**
- Tariff lookup by developer and project
- Commission calculation
- Validity date filtering
- Active tariff filtering

### SQL Scripts

#### `create-missing-tables.sql`
SQL script to create any missing tables.

**Usage:**
Run in Supabase SQL Editor when tables are missing.

#### `import-developers-projects.sql`
SQL script to bulk import developers and projects.

**Usage:**
```sql
-- In Supabase SQL Editor
\i scripts/import-developers-projects.sql
```

#### `import-tariffs.sql`
SQL version of tariff import (alternative to .js version).

**Usage:**
```sql
-- In Supabase SQL Editor
\i scripts/import-tariffs.sql
```

## Complete Setup Workflow

For a fresh Supabase project, follow these steps:

### 1. Run Migrations
```bash
# In Supabase SQL Editor, run:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_events_table.sql
```

### 2. Verify Tables
```bash
node scripts/list-tables.js
```

### 3. Import Tariffs
```bash
node scripts/import-tariffs.js
```

### 4. Test Connection
```bash
node scripts/test-tariff-service.js
```

### 5. Start Application
```bash
npm run dev
```

## Troubleshooting

### "Supabase not configured" Error

**Problem:** Scripts can't connect to Supabase

**Solution:**
1. Check `.env.local` exists and has correct values
2. Verify Supabase project is active (not paused)
3. Check API keys are valid

### "Table does not exist" Error

**Problem:** Missing database tables

**Solution:**
1. Run migrations in Supabase SQL Editor
2. Or run `scripts/create-missing-tables.sql`
3. Verify with `node scripts/list-tables.js`

### Import Script Fails

**Problem:** Data import errors

**Solution:**
1. Check required tables exist
2. Verify foreign key constraints
3. Check data format matches schema
4. Review error messages for specific issues

## Development Notes

### Adding New Developers

1. Insert into `counterparties` table:
   ```sql
   INSERT INTO counterparties (type, name, inn, kpp, offer_accepted_at)
   VALUES ('DEVELOPER', 'New Developer', '1234567890', '123401001', NOW());
   ```

2. Insert projects for the developer:
   ```sql
   INSERT INTO projects (developer_id, project_name, region, city, is_active)
   VALUES (
     (SELECT id FROM counterparties WHERE name = 'New Developer'),
     'New Project',
     'Москва',
     'Москва',
     TRUE
   );
   ```

3. Run tariff import script:
   ```bash
   node scripts/import-tariffs.js
   ```

### Updating Tariff Rates

To update commission rates:

```sql
UPDATE tariffs
SET commission_total_percent = 3.0
WHERE developer_name = 'Level Group'
  AND project_name = 'ЖК «Level Кавказский бульвар»';
```

Or modify `scripts/import-tariffs.js` and re-run.

### Backing Up Data

Use Supabase dashboard:
1. Go to Database → Backups
2. Click "Create Backup"
3. Or use SQL export

## Best Practices

1. **Always run in development first** - Test scripts in dev environment
2. **Backup before import** - Create backup before running import scripts
3. **Verify after import** - Use list-tables.js and check-schema.js
4. **Use transactions** - SQL imports should use BEGIN/COMMIT
5. **Log everything** - Scripts output detailed logs for debugging

## Resources

- [Main Setup Guide](../SUPABASE_SETUP.md)
- [Data Model](../DATA_MODEL_TABLES.md)
- [Supabase Docs](https://supabase.com/docs)
