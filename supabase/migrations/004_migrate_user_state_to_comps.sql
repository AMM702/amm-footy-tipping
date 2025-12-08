-- Purpose: Migrate existing user state data to USER_COMPS table
-- Author: GitHub Copilot
-- Date: 2025-12-08
-- Description: Maps each user's state column to their corresponding competition

-- =====================================================
-- Migrate user states to USER_COMPS
-- =====================================================

-- Insert user_comps records by mapping state to comp_id
INSERT INTO user_comps (user_id, comp_id)
SELECT 
  u.user_id,
  c.comp_id
FROM users u
JOIN comps c ON u.state = c.name;

-- =====================================================
-- Verification query (commented out - for manual checking)
-- =====================================================

-- Verify all users have been migrated:
-- SELECT 
--   u.user_id, 
--   u.username, 
--   u.state AS old_state,
--   c.name AS new_comp
-- FROM users u
-- LEFT JOIN user_comps uc ON u.user_id = uc.user_id
-- LEFT JOIN comps c ON uc.comp_id = c.comp_id;

-- Count verification:
-- SELECT 
--   'Total users' AS metric, 
--   COUNT(*) AS count 
-- FROM users
-- UNION ALL
-- SELECT 
--   'Users with comps' AS metric, 
--   COUNT(DISTINCT user_id) AS count 
-- FROM user_comps;
