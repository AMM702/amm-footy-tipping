-- supabase/migrations/011_migrate_back_to_app_data.sql
-- Purpose: Re-apply schema migration to app_data (migration 010 rollback was applied by mistake)
-- Author: GitHub Copilot
-- Date: 2025-12-23
--
-- This migration re-applies the app_data schema migration after migration 010 accidentally
-- rolled back to public schema. This is the same as migration 009 but re-applied.

BEGIN;

-- ============================================================================
-- PHASE 1: Create app_data schema (if it doesn't exist)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS app_data;

COMMENT ON SCHEMA app_data IS 'Application data schema for footy tipping tables, isolated from public schema for better security';


-- ============================================================================
-- PHASE 2: Move tables from public to app_data schema
-- ============================================================================

-- Move core tables in dependency order (least dependent first)

-- 1. Reference tables (no dependencies)
ALTER TABLE IF EXISTS public.teams SET SCHEMA app_data;
ALTER TABLE IF EXISTS public.seasons SET SCHEMA app_data;
ALTER TABLE IF EXISTS public.comps SET SCHEMA app_data;

-- 2. User table (no FK dependencies)
ALTER TABLE IF EXISTS public.users SET SCHEMA app_data;

-- 3. Junction table (depends on users and comps)
ALTER TABLE IF EXISTS public.user_comps SET SCHEMA app_data;

-- 4. Round table (depends on seasons, will have FK to games added later)
ALTER TABLE IF EXISTS public.rounds SET SCHEMA app_data;

-- 5. Games table (depends on rounds and teams)
ALTER TABLE IF EXISTS public.games SET SCHEMA app_data;

-- 6. Tips table (depends on users, games, comps)
ALTER TABLE IF EXISTS public.tips SET SCHEMA app_data;

-- 7. Scores table (depends on users, rounds, comps)
ALTER TABLE IF EXISTS public.scores SET SCHEMA app_data;


-- ============================================================================
-- PHASE 3: Update functions to use schema-qualified table names
-- ============================================================================

-- Function 1: update_updated_at_column()
-- Used by triggers on: users, games, rounds, tips, scores
CREATE OR REPLACE FUNCTION app_data.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app_data.update_updated_at_column() IS 'Automatically updates the updated_at timestamp on row modification';


-- Function 2: calculate_round_score(user_id, round_id, comp_id)
-- Calculates correct tips for a user in a round for a competition
CREATE OR REPLACE FUNCTION app_data.calculate_round_score(
    p_user_id UUID,
    p_round_id INTEGER,
    p_comp_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_score
    FROM app_data.tips t
    JOIN app_data.games g ON t.game_id = g.game_id
    WHERE t.user_id = p_user_id
      AND g.round_id = p_round_id
      AND t.comp_id = p_comp_id
      AND g.game_result IS NOT NULL
      AND t.tip = g.game_result;
    
    RETURN COALESCE(v_score, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app_data.calculate_round_score(UUID, INTEGER, INTEGER) IS 'Calculates the number of correct tips for a user in a specific round and competition';


-- Function 3: update_scores_on_game_result()
-- Trigger function that auto-updates scores when game results change
CREATE OR REPLACE FUNCTION app_data.update_scores_on_game_result()
RETURNS TRIGGER AS $$
DECLARE
    v_round_id INTEGER;
    v_user_record RECORD;
BEGIN
    -- Only proceed if game_result actually changed
    IF OLD.game_result IS DISTINCT FROM NEW.game_result THEN
        v_round_id := NEW.round_id;
        
        -- Update scores for all users in all competitions
        FOR v_user_record IN 
            SELECT DISTINCT uc.user_id, uc.comp_id
            FROM app_data.user_comps uc
        LOOP
            INSERT INTO app_data.scores (user_id, round_id, comp_id, round_score)
            VALUES (
                v_user_record.user_id,
                v_round_id,
                v_user_record.comp_id,
                app_data.calculate_round_score(v_user_record.user_id, v_round_id, v_user_record.comp_id)
            )
            ON CONFLICT (user_id, round_id, comp_id)
            DO UPDATE SET 
                round_score = app_data.calculate_round_score(v_user_record.user_id, v_round_id, v_user_record.comp_id),
                updated_at = CURRENT_TIMESTAMP;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app_data.update_scores_on_game_result() IS 'Automatically recalculates all user scores when a game result is updated';


-- ============================================================================
-- PHASE 4: Recreate triggers with new function references
-- ============================================================================

-- Drop old triggers (they point to public schema functions)
DROP TRIGGER IF EXISTS update_users_updated_at ON app_data.users;
DROP TRIGGER IF EXISTS update_games_updated_at ON app_data.games;
DROP TRIGGER IF EXISTS update_rounds_updated_at ON app_data.rounds;
DROP TRIGGER IF EXISTS update_tips_updated_at ON app_data.tips;
DROP TRIGGER IF EXISTS update_scores_updated_at ON app_data.scores;
DROP TRIGGER IF EXISTS trigger_update_scores_on_game_result ON app_data.games;

-- Recreate triggers pointing to app_data schema functions
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON app_data.users
    FOR EACH ROW
    EXECUTE FUNCTION app_data.update_updated_at_column();

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON app_data.games
    FOR EACH ROW
    EXECUTE FUNCTION app_data.update_updated_at_column();

CREATE TRIGGER update_rounds_updated_at
    BEFORE UPDATE ON app_data.rounds
    FOR EACH ROW
    EXECUTE FUNCTION app_data.update_updated_at_column();

CREATE TRIGGER update_tips_updated_at
    BEFORE UPDATE ON app_data.tips
    FOR EACH ROW
    EXECUTE FUNCTION app_data.update_updated_at_column();

CREATE TRIGGER update_scores_updated_at
    BEFORE UPDATE ON app_data.scores
    FOR EACH ROW
    EXECUTE FUNCTION app_data.update_updated_at_column();

CREATE TRIGGER trigger_update_scores_on_game_result
    AFTER UPDATE ON app_data.games
    FOR EACH ROW
    EXECUTE FUNCTION app_data.update_scores_on_game_result();


-- ============================================================================
-- PHASE 5: Clean up old public schema functions
-- ============================================================================

-- Drop old functions from public schema (no longer needed)
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_round_score(UUID, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.update_scores_on_game_result() CASCADE;


-- ============================================================================
-- PHASE 6: Grant appropriate permissions
-- ============================================================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA app_data TO authenticated;
GRANT USAGE ON SCHEMA app_data TO anon;

-- Grant SELECT permissions on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA app_data TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA app_data TO anon;

-- Grant INSERT, UPDATE, DELETE on specific tables for authenticated users
GRANT INSERT, UPDATE ON app_data.tips TO authenticated;
GRANT INSERT, UPDATE ON app_data.scores TO authenticated;
GRANT UPDATE ON app_data.users TO authenticated;

-- Allow sequence usage for auto-incrementing IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app_data TO authenticated;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA app_data 
GRANT SELECT ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA app_data 
GRANT SELECT ON TABLES TO anon;

COMMIT;
