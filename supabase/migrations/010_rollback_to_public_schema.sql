-- supabase/migrations/010_rollback_to_public_schema.sql
-- Purpose: EMERGENCY ROLLBACK - Move all tables back from app_data to public schema
-- Author: GitHub Copilot
-- Date: 2025-12-22
-- 
-- ⚠️ WARNING: Only use this migration if migration 009 causes critical issues
-- 
-- This migration reverses the schema migration performed in 009 by:
-- 1. Moving all tables back to public schema
-- 2. Recreating functions in public schema
-- 3. Recreating triggers to point to public schema functions
-- 4. Dropping the app_data schema
--
-- After running this migration, also revert supabase/config.toml changes:
--   schemas = ["public", "graphql_public"]
--   extra_search_path = ["public", "extensions"]

BEGIN;

-- ============================================================================
-- PHASE 1: Move tables back to public schema
-- ============================================================================

-- Move all tables from app_data back to public
ALTER TABLE IF EXISTS app_data.users SET SCHEMA public;
ALTER TABLE IF EXISTS app_data.comps SET SCHEMA public;
ALTER TABLE IF EXISTS app_data.user_comps SET SCHEMA public;
ALTER TABLE IF EXISTS app_data.teams SET SCHEMA public;
ALTER TABLE IF EXISTS app_data.seasons SET SCHEMA public;
ALTER TABLE IF EXISTS app_data.rounds SET SCHEMA public;
ALTER TABLE IF EXISTS app_data.games SET SCHEMA public;
ALTER TABLE IF EXISTS app_data.tips SET SCHEMA public;
ALTER TABLE IF EXISTS app_data.scores SET SCHEMA public;


-- ============================================================================
-- PHASE 2: Recreate functions in public schema
-- ============================================================================

-- Function 1: update_updated_at_column()
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at timestamp on row modification';


-- Function 2: calculate_round_score(user_id, round_id, comp_id)
CREATE OR REPLACE FUNCTION public.calculate_round_score(
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

COMMENT ON FUNCTION public.calculate_round_score(UUID, INTEGER, INTEGER) IS 'Calculates the number of correct tips for a user in a specific round and competition';


-- Function 3: update_scores_on_game_result()
CREATE OR REPLACE FUNCTION public.update_scores_on_game_result()
RETURNS TRIGGER AS $$
DECLARE
    v_round_id INTEGER;
    v_user_record RECORD;
BEGIN
    IF OLD.game_result IS DISTINCT FROM NEW.game_result THEN
        v_round_id := NEW.round_id;
        
        FOR v_user_record IN 
            SELECT DISTINCT uc.user_id, uc.comp_id
            FROM public.user_comps uc
        LOOP
            INSERT INTO public.scores (user_id, round_id, comp_id, round_score)
            VALUES (
                v_user_record.user_id,
                v_round_id,
                v_user_record.comp_id,
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

COMMENT ON FUNCTION public.update_scores_on_game_result() IS 'Automatically recalculates all user scores when a game result is updated';


-- ============================================================================
-- PHASE 3: Recreate triggers with public schema function references
-- ============================================================================

-- Drop old triggers (pointing to app_data functions)
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_games_updated_at ON public.games;
DROP TRIGGER IF EXISTS update_rounds_updated_at ON public.rounds;
DROP TRIGGER IF EXISTS update_tips_updated_at ON public.tips;
DROP TRIGGER IF EXISTS update_scores_updated_at ON public.scores;
DROP TRIGGER IF EXISTS trigger_update_scores_on_game_result ON public.games;

-- Recreate triggers pointing to public schema functions
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON public.games
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rounds_updated_at
    BEFORE UPDATE ON public.rounds
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tips_updated_at
    BEFORE UPDATE ON public.tips
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scores_updated_at
    BEFORE UPDATE ON public.scores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_update_scores_on_game_result
    AFTER UPDATE ON public.games
    FOR EACH ROW
    EXECUTE FUNCTION public.update_scores_on_game_result();


-- ============================================================================
-- PHASE 4: Clean up app_data schema
-- ============================================================================

-- Drop app_data schema functions
DROP FUNCTION IF EXISTS app_data.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS app_data.calculate_round_score(UUID, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS app_data.update_scores_on_game_result() CASCADE;

-- Drop app_data schema (should be empty now)
DROP SCHEMA IF EXISTS app_data CASCADE;

COMMIT;

-- ============================================================================
-- POST-ROLLBACK MANUAL STEPS
-- ============================================================================

-- After this migration completes, manually revert supabase/config.toml:
--
-- [api]
-- schemas = ["public", "graphql_public"]
-- extra_search_path = ["public", "extensions"]
--
-- Then commit and push the config change to complete the rollback.
