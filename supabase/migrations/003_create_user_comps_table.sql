-- Purpose: Create USER_COMPS junction table for many-to-many user-competition relationship
-- Author: GitHub Copilot
-- Date: 2025-12-08
-- Description: Tracks which competitions each user participates in (1-4 comps per user)

-- =====================================================
-- Create USER_COMPS table
-- =====================================================
CREATE TABLE user_comps (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  comp_id INTEGER NOT NULL REFERENCES comps(comp_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_comp UNIQUE (user_id, comp_id)
);

-- Create indexes for foreign keys
CREATE INDEX idx_user_comps_user_id ON user_comps(user_id);
CREATE INDEX idx_user_comps_comp_id ON user_comps(comp_id);

-- Add comments
COMMENT ON TABLE user_comps IS 'Junction table tracking user participation in competitions';
COMMENT ON COLUMN user_comps.user_id IS 'Reference to user';
COMMENT ON COLUMN user_comps.comp_id IS 'Reference to competition (state)';
