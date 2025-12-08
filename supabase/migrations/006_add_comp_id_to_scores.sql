-- Purpose: Add comp_id to SCORES table for multi-competition support
-- Author: GitHub Copilot
-- Date: 2025-12-08
-- Description: Adds competition tracking to scores and updates constraints

-- =====================================================
-- Add comp_id column to SCORES table
-- =====================================================

-- Add column (nullable initially to allow for data migration if needed)
ALTER TABLE scores 
ADD COLUMN comp_id INTEGER REFERENCES comps(comp_id) ON DELETE CASCADE;

-- For new system, set comp_id as NOT NULL
-- Note: If you have existing scores data, you'll need to populate comp_id first
ALTER TABLE scores 
ALTER COLUMN comp_id SET NOT NULL;

-- Add index for performance
CREATE INDEX idx_scores_comp_id ON scores(comp_id);

-- =====================================================
-- Update unique constraint
-- =====================================================

-- Drop old unique constraint
ALTER TABLE scores 
DROP CONSTRAINT unique_user_round_score;

-- Add new unique constraint including comp_id
-- A user can have multiple scores per round, one per competition
ALTER TABLE scores 
ADD CONSTRAINT unique_user_round_comp_score UNIQUE (user_id, round_id, comp_id);

-- Add comment
COMMENT ON COLUMN scores.comp_id IS 'Competition (state) this score belongs to';
