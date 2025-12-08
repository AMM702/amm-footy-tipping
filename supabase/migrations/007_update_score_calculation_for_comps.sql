-- Purpose: Update score calculation functions to support multi-competition
-- Author: GitHub Copilot
-- Date: 2025-12-08
-- Description: Modifies calculate_round_score() and trigger to handle comp_id

-- =====================================================
-- Update calculate_round_score function to accept comp_id
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_round_score(p_user_id UUID, p_round_id INTEGER, p_comp_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_score
  FROM tips t
  JOIN games g ON t.game_id = g.game_id
  WHERE t.user_id = p_user_id
    AND t.comp_id = p_comp_id
    AND g.round_id = p_round_id
    AND g.result IS NOT NULL
    AND (
      (t.tip = 1 AND g.result = 1) OR
      (t.tip = 2 AND g.result = 2)
    );
  
  RETURN COALESCE(v_score, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Update trigger function to handle comp_id
-- =====================================================

CREATE OR REPLACE FUNCTION update_scores_on_game_result()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.result IS DISTINCT FROM NEW.result) AND NEW.result IS NOT NULL THEN
    -- Update scores for all users in all competitions
    INSERT INTO scores (user_id, round_id, comp_id, score)
    SELECT 
      uc.user_id,
      NEW.round_id,
      uc.comp_id,
      calculate_round_score(uc.user_id, NEW.round_id, uc.comp_id)
    FROM user_comps uc
    ON CONFLICT (user_id, round_id, comp_id)
    DO UPDATE SET 
      score = calculate_round_score(scores.user_id, scores.round_id, scores.comp_id),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The trigger itself (trigger_update_scores_on_game_result) doesn't need to be recreated
-- as it already exists and will use the updated function automatically
