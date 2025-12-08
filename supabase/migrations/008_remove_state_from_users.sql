-- Purpose: Remove state column from USERS table
-- Author: GitHub Copilot
-- Date: 2025-12-08
-- Description: Clean up old state-based system after migration to multi-comp

-- =====================================================
-- Drop state-related constraints and indexes
-- =====================================================

-- Drop index
DROP INDEX IF EXISTS idx_users_state;

-- Drop CHECK constraint
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_state_check;

-- =====================================================
-- Drop state column
-- =====================================================

-- This is safe to do now because:
-- 1. User state data has been migrated to user_comps table (migration 004)
-- 2. Tips and scores now track comp_id instead of deriving from user state
ALTER TABLE users 
DROP COLUMN state;

-- Add comment documenting the change
COMMENT ON TABLE users IS 'User accounts for footy tipping. Competition membership tracked in user_comps table.';
