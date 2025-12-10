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
