# Emergency Rollback Migration

⚠️ **WARNING**: This migration is for emergency use only!

## When to Use

Only use this if migration 009/011 (app_data schema migration) causes critical production issues.

## How to Apply

1. **Manually rename this file** to move it into the migrations folder:
   ```bash
   cp supabase/rollback/rollback_to_public_schema.sql supabase/migrations/0XX_rollback_to_public_schema.sql
   ```
   (Replace XX with the next migration number)

2. **Commit and push** to trigger deployment:
   ```bash
   git add supabase/migrations/0XX_rollback_to_public_schema.sql
   git commit -m "emergency: rollback to public schema"
   git push origin main
   ```

3. **Revert config.toml changes**:
   ```toml
   [api]
   schemas = ["public", "graphql_public"]
   extra_search_path = ["public", "extensions"]
   ```

4. **Commit and push config**:
   ```bash
   git add supabase/config.toml
   git commit -m "revert: restore public schema config"
   git push origin main
   ```

## What This Migration Does

- Moves all 9 tables back from `app_data` to `public` schema
- Recreates all 3 functions in `public` schema
- Recreates all 6 triggers pointing to `public` schema functions
- Drops the `app_data` schema

## Migration File

See: `supabase/rollback/rollback_to_public_schema.sql`
