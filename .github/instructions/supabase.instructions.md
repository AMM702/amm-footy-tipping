---
description: Workflow for making Supabase database schema changes
applyTo: 'supabase/**'
---

# Supabase Database Change Workflow

This workflow guides AI assistants (GitHub Copilot, Claude, etc.) through the process of making database schema changes safely and correctly.

## When to Use This Workflow

- User asks to add/remove/modify database fields
- User asks to create new tables
- User asks to add indexes or constraints
- User asks about current database structure
- User mentions database, schema, SQL, tables, fields, columns, migration

## Workflow Steps

### Step 1: Get Current Database Schema

**Always start by understanding the current state.**

**First, read the local reference schema:**
```bash
cat supabase/schema/current_schema.sql
```

**Then, query production database to compare:**

```javascript
// Get table structure from production
mcp_supabase_-_ef_list_tables({ schemas: ["public"] })

// Get specific table details from production
mcp_supabase_-_ef_execute_sql({
  query: `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'TABLE_NAME'
    ORDER BY ordinal_position;
  `
})
```

**Compare the two:**
- If they match → reference is up to date
- If they differ → someone made manual changes or reference is stale
- Always trust production database as source of truth

### Step 2: Understand the Request

Ask clarifying questions if needed:
- What table needs to be changed?
- What is the purpose of the new field/table?
- Should it be nullable or required?
- What's the expected data type?
- Should there be a default value?
- Do we need an index for performance?

### Step 3: Propose the Change

Show the user a diff of what will change:

```sql
-- Example: Adding priority field to jobs table
ALTER TABLE public.jobs 
ADD COLUMN priority text DEFAULT 'normal';

CREATE INDEX idx_jobs_priority ON public.jobs (priority);
```

Explain:
- What the migration does
- Why each part is needed
- Any potential impacts (data loss, breaking changes, etc.)

### Step 4: Create Migration File

**Find the next migration number:**

```bash
# List existing migrations
ls -1 supabase/migrations/ | sort | tail -1

# Next number would be: 011, 012, 013, etc.
```

**Create the migration file:**

```bash
# Format: XXX_descriptive_name.sql
touch supabase/migrations/011_add_priority_to_jobs.sql
```

**Write the migration:**

```sql
-- supabase/migrations/011_add_priority_to_jobs.sql
-- Purpose: Add priority field to jobs for task management
-- Author: GitHub Copilot
-- Date: 2025-12-08

-- Add priority field
ALTER TABLE public.jobs 
ADD COLUMN priority text DEFAULT 'normal';

-- Add index for filtering by priority
CREATE INDEX idx_jobs_priority ON public.jobs (priority);

-- Add check constraint to ensure valid values
ALTER TABLE public.jobs
ADD CONSTRAINT jobs_priority_check 
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
```

### Step 5: Verify GitHub Actions Workflow

**Check that the workflow exists and is correct:**

```bash
cat .github/workflows/deploy-supabase.yml
```

**Expected workflow structure:**

```yaml
name: Deploy Supabase

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy Supabase migrations
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Set up Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Link Supabase project
        run: supabase link --project-ref $SUPABASE_PROJECT_ID
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
      
      - name: Push database migrations
        run: supabase db push --debug
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

**If workflow is missing or incorrect, fix it.**

### Step 6: Test Locally (Optional but Recommended)

If user wants to test before deploying:

```bash
# Link to production
supabase link --project-ref gfcffsvhxaecafpdqumn

# Check what will be applied
supabase db push --dry-run

# Apply migration
supabase db push --debug

# Verify migration was applied
supabase migration list
```

### Step 7: Commit and Push

**Stage the migration:**

```bash
git add supabase/migrations/011_add_priority_to_jobs.sql
git status
```

**Commit with descriptive message:**

```bash
git commit -m "feat(db): add priority field to jobs table

- Add priority text field with default 'normal'
- Add index for performance
- Add constraint for valid values (low, normal, high, urgent)
"
```

**Push to trigger deployment:**

```bash
git push origin main
```

### Step 8: Monitor Deployment

**Check GitHub Actions:**

Use the debug script:
```bash
./debug-supabase-deploy.sh
```

Or manually check:
```bash
gh run list --workflow=deploy-supabase.yml --limit 5
gh run view <run-id> --log
```

**Expected output:**
- ✅ Checkout repository
- ✅ Set up Supabase CLI
- ✅ Link Supabase project
- ✅ Push database migrations

**If deployment fails:**
1. Check the logs for error messages
2. Common issues:
   - Syntax errors in SQL
   - Table/column already exists
   - Foreign key violations
   - Missing secrets (SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_ID)

### Step 9: Verify in Production Database

**Use Supabase MCP to confirm the change:**

```javascript
// Check if column exists
mcp_supabase_-_ef_execute_sql({
  query: `
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'jobs'
      AND column_name = 'priority';
  `
})

// Check if index exists
mcp_supabase_-_ef_execute_sql({
  query: `
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' 
      AND tablename = 'jobs'
      AND indexname = 'idx_jobs_priority';
  `
})

// Test data query
mcp_supabase_-_ef_execute_sql({
  query: `
    SELECT clickup_id, job_name, priority
    FROM public.jobs
    LIMIT 5;
  `
})
```

### Step 10: Update Reference Schema

**Regenerate the reference file:**

```bash
# Extract current schema from production
supabase db pull > supabase/schema/current_schema.sql

# Commit the updated reference
git add supabase/schema/current_schema.sql
git commit -m "docs(db): update schema reference after priority field addition"
git push origin main
```

## Common Patterns

### Adding a Field

```sql
-- migrations/XXX_add_field_to_table.sql
ALTER TABLE public.TABLE_NAME 
ADD COLUMN field_name data_type [NOT NULL] [DEFAULT value];

-- Add index if field will be queried frequently
CREATE INDEX idx_table_field ON public.TABLE_NAME (field_name);
```

### Removing a Field

```sql
-- migrations/XXX_remove_field_from_table.sql
-- Warning: This will permanently delete data!
ALTER TABLE public.TABLE_NAME 
DROP COLUMN field_name;
```

### Creating a Table

```sql
-- migrations/XXX_create_table_name.sql
CREATE TABLE public.table_name (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_table_name_name ON public.table_name (name);

-- Add foreign keys if needed
ALTER TABLE public.table_name
ADD CONSTRAINT fk_parent
FOREIGN KEY (parent_id) REFERENCES public.parent_table (id);
```

### Modifying a Field

```sql
-- migrations/XXX_modify_field_in_table.sql

-- Change data type
ALTER TABLE public.TABLE_NAME 
ALTER COLUMN field_name TYPE new_data_type;

-- Change nullable
ALTER TABLE public.TABLE_NAME 
ALTER COLUMN field_name SET NOT NULL;

-- Change default
ALTER TABLE public.TABLE_NAME 
ALTER COLUMN field_name SET DEFAULT new_value;
```

## Error Handling

### "Table already exists"

**Diagnosis:**
```bash
supabase migration list
```

**Solution:**
```bash
# If migration shows as applied, mark it
supabase migration repair --status applied XXX

# If table exists but migration not applied (manual creation)
# Either: Drop the table and re-run migration
# Or: Mark migration as applied and document
```

### "Migration history mismatch"

**Diagnosis:**
```bash
supabase migration list
# Shows different Local vs Remote migrations
```

**Solution:**
```bash
# Mark missing migrations as applied
supabase migration repair --status applied 001
supabase migration repair --status applied 002
# ... etc
```

### "Column already exists"

**Solution:**
```sql
-- Use conditional creation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'TABLE_NAME' 
        AND column_name = 'field_name'
    ) THEN
        ALTER TABLE public.TABLE_NAME 
        ADD COLUMN field_name data_type;
    END IF;
END $$;
```

### GitHub Actions Secrets Missing

**Check secrets:**
```bash
gh secret list
```

**Expected:**
- `SUPABASE_ACCESS_TOKEN` (starts with `sbp_`)
- `SUPABASE_PROJECT_ID` (e.g., `gfcffsvhxaecafpdqumn`)

**Set if missing:**
```bash
# Get token from: https://supabase.com/dashboard/account/tokens
gh secret set SUPABASE_ACCESS_TOKEN

# Get project ID from Supabase dashboard
gh secret set SUPABASE_PROJECT_ID
```

## Best Practices

### ✅ DO

1. **Always check current schema first** - Use MCP or read `schema/current_schema.sql`
2. **Use descriptive migration names** - `011_add_priority_to_jobs.sql` not `fix.sql`
3. **Add comments to migrations** - Explain WHY, not just WHAT
4. **Include indexes for query performance** - If field will be filtered/sorted
5. **Use transactions for complex changes** - Wrap multiple operations in `BEGIN/COMMIT`
6. **Test locally before pushing** - `supabase db push --dry-run`
7. **Monitor deployment** - Check GitHub Actions logs
8. **Verify in production** - Query the database to confirm changes
9. **Update reference schema** - Keep `schema/current_schema.sql` in sync
10. **Use constraints** - CHECK, NOT NULL, FOREIGN KEY to enforce data integrity

### ❌ DON'T

1. **Don't edit `schema/current_schema.sql` directly** - It's read-only reference
2. **Don't modify already-applied migrations** - Create a new migration instead
3. **Don't skip migration numbers** - Keep sequential: 001, 002, 003...
4. **Don't deploy without testing** - At least do a dry run
5. **Don't forget to commit the migration** - It won't deploy if not in git
6. **Don't use DROP without backups** - Data loss is permanent
7. **Don't hardcode production data** - Use environment-specific values
8. **Don't ignore errors** - Always investigate deployment failures

## Quick Reference Commands

```bash
# List current tables
mcp_supabase_-_ef_list_tables({ schemas: ["public"] })

# Get table structure
cat supabase/schema/current_schema.sql

# Find next migration number
ls -1 supabase/migrations/ | sort | tail -1

# Create migration
touch supabase/migrations/XXX_description.sql

# Test locally
supabase db push --dry-run

# Deploy via git
git add supabase/migrations/XXX_description.sql
git commit -m "feat(db): description"
git push origin main

# Check deployment
./debug-supabase-deploy.sh
# OR
gh run list --workflow=deploy-supabase.yml --limit 5

# Verify in database
mcp_supabase_-_ef_execute_sql({ query: "SELECT * FROM public.TABLE_NAME LIMIT 5;" })

# Update reference
supabase db pull > supabase/schema/current_schema.sql
git add supabase/schema/current_schema.sql
git commit -m "docs(db): update schema reference"
git push origin main
```

## Example: Full Workflow

User asks: "Add a priority field to jobs table"

```bash
# 1. Check current schema
cat supabase/schema/current_schema.sql | grep -A 20 "CREATE TABLE public.jobs"

# 2. Find next migration number
ls -1 supabase/migrations/ | sort | tail -1
# Output: 010_create_swms_table.sql

# 3. Create migration
touch supabase/migrations/011_add_priority_to_jobs.sql

# 4. Write migration (using editor or cat)
cat > supabase/migrations/011_add_priority_to_jobs.sql << 'EOF'
-- Purpose: Add priority field to jobs for task management
-- Date: 2025-12-08

ALTER TABLE public.jobs 
ADD COLUMN priority text DEFAULT 'normal';

CREATE INDEX idx_jobs_priority ON public.jobs (priority);

ALTER TABLE public.jobs
ADD CONSTRAINT jobs_priority_check 
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
EOF

# 5. Test locally (optional)
supabase db push --dry-run

# 6. Commit and push
git add supabase/migrations/011_add_priority_to_jobs.sql
git commit -m "feat(db): add priority field to jobs table"
git push origin main

# 7. Monitor deployment
./debug-supabase-deploy.sh

# 8. Verify in production
# (Use Supabase MCP to query the table)

# 9. Update reference
supabase db pull > supabase/schema/current_schema.sql
git add supabase/schema/current_schema.sql
git commit -m "docs(db): update schema reference"
git push origin main
```

## Project-Specific Information

**Project:** AMM Footy Tipping  
**Repository:** AMM702/amm-footy-tipping  
**Supabase Project ID:** fsrjxbeoyfpybkzfqlcz  
**Database Version:** PostgreSQL 17.6  

**Current Tables:**
- `users` (user accounts with authentication)
- `teams` (NRL teams)
- `seasons` (competition seasons)
- `rounds` (game rounds within seasons)
- `games` (individual matches)
- `tips` (user predictions per game and competition)
- `scores` (user scores per round and competition)
- `comps` (competitions/states: QLD, NSW, VIC, WA)
- `user_comps` (many-to-many: users to competitions)

**Key Files:**
- `.github/workflows/deploy-supabase.yml` - Automated deployment
- `supabase/schema/current_schema.sql` - Reference (read-only)
- `supabase/migrations/*.sql` - Incremental changes (for deployment)
- `supabase/README.md` - Full documentation
- `debug-supabase-deploy.sh` - Deployment monitoring tool

**GitHub Secrets Required:**
- `SUPABASE_ACCESS_TOKEN` (personal access token, starts with `sbp_`)
- `SUPABASE_PROJECT_ID` (project reference ID)

---

## Deployment History

### December 8, 2025 - Initial Migrations Setup

**Issue:** GitHub Actions deployment was failing due to:
1. Empty `SUPABASE_PROJECT_ID` and `SUPABASE_ACCESS_TOKEN` secrets
2. Missing `--yes` flag causing non-interactive prompt to hang
3. Existing `users` table conflicting with migration 001

**Resolution:**
1. **Configured GitHub Secrets:**
   ```bash
   gh secret set SUPABASE_ACCESS_TOKEN  # Value: sbp_xxxxxxxxxxxxxxxxxxxx (get from Supabase dashboard)
   gh secret set SUPABASE_PROJECT_ID    # Value: fsrjxbeoyfpybkzfqlcz
   ```

2. **Fixed Workflow File** (`.github/workflows/deploy-supabase.yml`):
   - Added `--yes` flag to `supabase db push` command for non-interactive CI execution
   - Changed from: `supabase db push --debug`
   - Changed to: `supabase db push --yes --debug`

3. **Fixed Migration 001** (`supabase/migrations/001_initial_schema.sql`):
   - Changed `CREATE TABLE users` to `CREATE TABLE IF NOT EXISTS users`
   - Added `auth_user_id UUID` column (existed in production but not in migration)
   - Changed all user indexes to use `IF NOT EXISTS`
   - This allowed the migration to skip the existing users table without error

**Migrations Applied:**
- ✅ 001_initial_schema.sql - Created tables: teams, seasons, rounds, games, tips, scores + triggers/functions
- ✅ 002_create_comps_table.sql - Created comps table for state-based competitions
- ✅ 003_create_user_comps_table.sql - Created user_comps many-to-many junction table
- ✅ 004_migrate_user_state_to_comps.sql - Migrated state data from users to user_comps
- ✅ 005_add_comp_id_to_tips.sql - Added comp_id foreign key to tips table
- ✅ 006_add_comp_id_to_scores.sql - Added comp_id foreign key to scores table
- ✅ 007_update_score_calculation_for_comps.sql - Updated scoring functions for multi-comp support
- ✅ 008_remove_state_from_users.sql - Removed state column from users table

**Database State Before:**
- Only `users` table existed (created manually with `auth_user_id` column)

**Database State After:**
- 9 tables total: users, teams, seasons, rounds, games, tips, scores, comps, user_comps
- Full multi-competition functionality enabled
- Automated deployment pipeline working via GitHub Actions
- All triggers and functions for score calculation in place

**Key Learnings:**
1. Always use `IF NOT EXISTS` for tables/indexes that might exist in production
2. Always add `--yes` flag to Supabase CLI commands in CI/CD pipelines
3. Use MCP server tools (`mcp_supabase_amm-_execute_sql`) to query production database structure
4. Check `supabase migration list` to verify which migrations are marked as applied
5. Production database is the source of truth - local schema files are reference only
---

### December 22, 2025 - Schema Migration to app_data

**Issue:** All application tables were in the `public` schema, which is less secure and harder to manage for permissions and isolation.

**Solution:** Created migration 009 to move all tables to dedicated `app_data` schema.

**Changes Made:**

1. **Created Migration 009** (`supabase/migrations/009_create_app_data_schema.sql`):
   - Created `app_data` schema
   - Moved all 9 tables from `public` to `app_data` using `ALTER TABLE SET SCHEMA`
   - Recreated 3 functions with schema-qualified table names
   - Recreated all 6 triggers to point to new function locations
   - Added appropriate GRANT permissions for authenticated and anon roles
   - Zero-downtime migration (data preserved during schema move)

2. **Updated Supabase Config** (`supabase/config.toml`):
   - Added `app_data` to exposed schemas: `schemas = ["public", "app_data", "graphql_public"]`
   - Added `app_data` to search_path (first priority): `extra_search_path = ["app_data", "public", "extensions"]`
   - This allows unqualified table names to resolve to `app_data` first

3. **Updated GitHub Actions Workflow** (`.github/workflows/deploy-supabase.yml`):
   - Added post-deployment verification step
   - Queries `information_schema.tables` to confirm all tables in `app_data`
   - Fails workflow if any application tables remain in `public` schema

**Tables Migrated:**
- ✅ users (with triggers)
- ✅ comps (competition reference)
- ✅ user_comps (junction table)
- ✅ teams (NRL teams)
- ✅ seasons (competition years)
- ✅ rounds (game rounds)
- ✅ games (individual matches)
- ✅ tips (user predictions)
- ✅ scores (user round scores)

**Functions Migrated:**
- ✅ `update_updated_at_column()` → `app_data.update_updated_at_column()`
- ✅ `calculate_round_score(UUID, INTEGER, INTEGER)` → `app_data.calculate_round_score()`
- ✅ `update_scores_on_game_result()` → `app_data.update_scores_on_game_result()`

**Verification Steps (Using Supabase MCP - AFTER deployment):**

```javascript
// 1. Verify all tables are in app_data schema
mcp_supabase_amm-_execute_sql({
  query: `
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname IN ('public', 'app_data')
      AND tablename IN ('users', 'teams', 'seasons', 'rounds', 'games', 
                       'tips', 'scores', 'comps', 'user_comps')
    ORDER BY schemaname, tablename;
  `
})
// Expected: All 9 tables should show schemaname = 'app_data'

// 2. List tables in app_data schema
mcp_supabase_amm-_list_tables({
  schemas: ["app_data"]
})
// Expected: 9 tables (users, teams, seasons, rounds, games, tips, scores, comps, user_comps)

// 3. Verify functions are in app_data schema
mcp_supabase_amm-_execute_sql({
  query: `
    SELECT n.nspname as schema, p.proname as function_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname IN ('public', 'app_data')
      AND p.proname IN ('update_updated_at_column', 
                       'calculate_round_score', 
                       'update_scores_on_game_result')
    ORDER BY schema, function_name;
  `
})
// Expected: All 3 functions should show schema = 'app_data'

// 4. Verify all triggers are functioning
mcp_supabase_amm-_execute_sql({
  query: `
    SELECT 
      n.nspname as schema,
      c.relname as table_name,
      t.tgname as trigger_name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'app_data'
      AND NOT t.tgisinternal
    ORDER BY table_name, trigger_name;
  `
})
// Expected: 6 triggers across 5 tables (users, games, rounds, tips, scores)

// 5. Verify row counts preserved
mcp_supabase_amm-_execute_sql({
  query: `
    SELECT 'users' as table_name, COUNT(*) as row_count FROM app_data.users
    UNION ALL SELECT 'teams', COUNT(*) FROM app_data.teams
    UNION ALL SELECT 'seasons', COUNT(*) FROM app_data.seasons
    UNION ALL SELECT 'rounds', COUNT(*) FROM app_data.rounds
    UNION ALL SELECT 'games', COUNT(*) FROM app_data.games
    UNION ALL SELECT 'tips', COUNT(*) FROM app_data.tips
    UNION ALL SELECT 'scores', COUNT(*) FROM app_data.scores
    UNION ALL SELECT 'comps', COUNT(*) FROM app_data.comps
    UNION ALL SELECT 'user_comps', COUNT(*) FROM app_data.user_comps
    ORDER BY table_name;
  `
})
// Compare with pre-migration counts to ensure no data loss

// 6. Test a function to ensure it's working
mcp_supabase_amm-_execute_sql({
  query: `
    -- Test calculate_round_score function (if data exists)
    SELECT app_data.calculate_round_score(
      (SELECT user_id FROM app_data.users LIMIT 1),
      (SELECT round_id FROM app_data.rounds LIMIT 1),
      (SELECT comp_id FROM app_data.comps LIMIT 1)
    ) as test_score;
  `
})
// Expected: Returns a number (score) without error
```

**Rollback Procedure (Emergency Recovery):**

If migration causes issues, rollback with migration 010:

```sql
-- supabase/migrations/010_rollback_to_public_schema.sql
BEGIN;

-- Move tables back to public
ALTER TABLE app_data.users SET SCHEMA public;
ALTER TABLE app_data.comps SET SCHEMA public;
ALTER TABLE app_data.user_comps SET SCHEMA public;
ALTER TABLE app_data.teams SET SCHEMA public;
ALTER TABLE app_data.seasons SET SCHEMA public;
ALTER TABLE app_data.rounds SET SCHEMA public;
ALTER TABLE app_data.games SET SCHEMA public;
ALTER TABLE app_data.tips SET SCHEMA public;
ALTER TABLE app_data.scores SET SCHEMA public;

-- Recreate functions in public schema
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.calculate_round_score(
    p_user_id UUID, p_round_id INTEGER, p_comp_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE v_score INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_score
    FROM public.tips t
    JOIN public.games g ON t.game_id = g.game_id
    WHERE t.user_id = p_user_id
      AND g.round_id = p_round_id
      AND t.comp_id = p_comp_id
      AND g.game_result IS NOT NULL
      AND t.tip = g.game_result;
    RETURN COALESCE(v_score, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_scores_on_game_result()
RETURNS TRIGGER AS $$
DECLARE
    v_round_id INTEGER;
    v_user_record RECORD;
BEGIN
    IF OLD.game_result IS DISTINCT FROM NEW.game_result THEN
        v_round_id := NEW.round_id;
        FOR v_user_record IN 
            SELECT DISTINCT uc.user_id, uc.comp_id FROM public.user_comps uc
        LOOP
            INSERT INTO public.scores (user_id, round_id, comp_id, round_score)
            VALUES (
                v_user_record.user_id, v_round_id, v_user_record.comp_id,
                public.calculate_round_score(v_user_record.user_id, v_round_id, v_user_record.comp_id)
            )
            ON CONFLICT (user_id, round_id, comp_id)
            DO UPDATE SET 
                round_score = public.calculate_round_score(v_user_record.user_id, v_round_id, v_user_record.comp_id),
                updated_at = CURRENT_TIMESTAMP;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_games_updated_at ON public.games;
DROP TRIGGER IF EXISTS update_rounds_updated_at ON public.rounds;
DROP TRIGGER IF EXISTS update_tips_updated_at ON public.tips;
DROP TRIGGER IF EXISTS update_scores_updated_at ON public.scores;
DROP TRIGGER IF EXISTS trigger_update_scores_on_game_result ON public.games;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON public.rounds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tips_updated_at BEFORE UPDATE ON public.tips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON public.scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trigger_update_scores_on_game_result AFTER UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.update_scores_on_game_result();

-- Drop app_data schema
DROP SCHEMA app_data CASCADE;

COMMIT;
```

Also revert `supabase/config.toml`:
```toml
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
```

**Key Learnings:**
1. `ALTER TABLE SET SCHEMA` is fast and preserves all data, indexes, and constraints
2. Functions must be recreated with schema-qualified table names
3. Triggers must be dropped and recreated to point to new function schema
4. Setting `app_data` first in `extra_search_path` allows backward-compatible unqualified table names
5. Always verify with MCP tools AFTER deployment, never use MCP for actual deployment
6. GitHub Actions handles deployment; MCP is for verification and debugging only