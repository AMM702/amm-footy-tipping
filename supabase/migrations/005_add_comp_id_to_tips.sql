-- Purpose: Add comp_id to TIPS table for multi-competition support
-- Author: GitHub Copilot
-- Date: 2025-12-08
-- Description: Adds competition tracking to tips and updates constraints

-- =====================================================
-- Add comp_id column to TIPS table
-- =====================================================

-- Add column (nullable initially to allow for data migration if needed)
ALTER TABLE tips 
ADD COLUMN comp_id INTEGER REFERENCES comps(comp_id) ON DELETE CASCADE;

-- For new system, set comp_id as NOT NULL
-- Note: If you have existing tips data, you'll need to populate comp_id first
ALTER TABLE tips 
ALTER COLUMN comp_id SET NOT NULL;

-- Add index for performance
CREATE INDEX idx_tips_comp_id ON tips(comp_id);

-- =====================================================
-- Update unique constraint
-- =====================================================

-- Drop old unique constraint
ALTER TABLE tips 
DROP CONSTRAINT unique_user_game_tip;

-- Add new unique constraint including comp_id
-- A user can tip on the same game multiple times, once per competition
ALTER TABLE tips 
ADD CONSTRAINT unique_user_game_comp_tip UNIQUE (user_id, game_id, comp_id);

-- Add comment
COMMENT ON COLUMN tips.comp_id IS 'Competition (state) this tip belongs to';
