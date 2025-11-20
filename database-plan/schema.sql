
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  state VARCHAR(3) NOT NULL CHECK (state IN ('QLD', 'NSW', 'VIC', 'WA')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_state ON users(state);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- =====================================================
-- 2. TEAMS TABLE
-- =====================================================
CREATE TABLE teams (
  team_id SERIAL PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL UNIQUE,
  team_abbreviation VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_teams_name ON teams(team_name);

-- =====================================================
-- 3. ROUNDS TABLE
-- =====================================================
CREATE TABLE rounds (
  round_id SERIAL PRIMARY KEY,
  round_number INTEGER NOT NULL UNIQUE,
  round_name VARCHAR(100) NOT NULL,
  is_round_on BOOLEAN DEFAULT FALSE,
  catch_up_game_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rounds_number ON rounds(round_number);
CREATE INDEX idx_rounds_is_on ON rounds(is_round_on);

-- =====================================================
-- 4. GAMES TABLE
-- =====================================================
CREATE TABLE games (
  game_id SERIAL PRIMARY KEY,
  round_id INTEGER NOT NULL REFERENCES rounds(round_id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL,
  home_team_id INTEGER NOT NULL REFERENCES teams(team_id),
  away_team_id INTEGER NOT NULL REFERENCES teams(team_id),
  game_date DATE NOT NULL,
  game_time VARCHAR(20),
  ground VARCHAR(100),
  result INTEGER CHECK (result IN (1, 2)) DEFAULT NULL,
  is_tippable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_game_per_round UNIQUE (round_id, game_number),
  CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

CREATE INDEX idx_games_round ON games(round_id);
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_result ON games(result);
CREATE INDEX idx_games_tippable ON games(is_tippable);

-- Add FK for catch_up_game_id after games table exists
ALTER TABLE rounds ADD CONSTRAINT fk_rounds_catch_up_game 
  FOREIGN KEY (catch_up_game_id) REFERENCES games(game_id);

-- =====================================================
-- 5. TIPS TABLE
-- =====================================================
CREATE TABLE tips (
  tip_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  tip INTEGER NOT NULL CHECK (tip IN (1, 2)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_game_tip UNIQUE (user_id, game_id)
);

CREATE INDEX idx_tips_user ON tips(user_id);
CREATE INDEX idx_tips_game ON tips(game_id);
CREATE INDEX idx_tips_user_game ON tips(user_id, game_id);

-- =====================================================
-- 6. SCORES TABLE
-- =====================================================
CREATE TABLE scores (
  score_id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  round_id INTEGER NOT NULL REFERENCES rounds(round_id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_round_score UNIQUE (user_id, round_id)
);

CREATE INDEX idx_scores_user ON scores(user_id);
CREATE INDEX idx_scores_round ON scores(round_id);
CREATE INDEX idx_scores_user_round ON scores(user_id, round_id);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tips_updated_at BEFORE UPDATE ON tips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user score for a round
CREATE OR REPLACE FUNCTION calculate_round_score(p_user_id UUID, p_round_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_score
  FROM tips t
  JOIN games g ON t.game_id = g.game_id
  WHERE t.user_id = p_user_id
    AND g.round_id = p_round_id
    AND g.result IS NOT NULL
    AND (
      (t.tip = 1 AND g.result = 1) OR
      (t.tip = 2 AND g.result = 2)
    );
  
  RETURN COALESCE(v_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Auto-update scores when game results change
CREATE OR REPLACE FUNCTION update_scores_on_game_result()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.result IS DISTINCT FROM NEW.result) AND NEW.result IS NOT NULL THEN
    INSERT INTO scores (user_id, round_id, score)
    SELECT 
      u.user_id,
      NEW.round_id,
      calculate_round_score(u.user_id, NEW.round_id)
    FROM users u
    ON CONFLICT (user_id, round_id)
    DO UPDATE SET 
      score = calculate_round_score(scores.user_id, scores.round_id),
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scores_on_game_result
  AFTER UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_scores_on_game_result();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can read teams" ON teams FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can read rounds" ON rounds FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can read games" ON games FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can read scores" ON scores FOR SELECT USING (TRUE);

-- User policies (require Supabase auth setup)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Users can update own password" ON users
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- Tips policies
CREATE POLICY "Users can read own tips" ON tips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tips for tippable games" ON tips
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM games WHERE game_id = tips.game_id AND is_tippable = TRUE)
  );

CREATE POLICY "Admins can read all tips" ON tips
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

-- Admin-only write policies
CREATE POLICY "Admins can manage games" ON games
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage rounds" ON rounds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage teams" ON teams
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Admins can manage scores" ON scores
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND is_admin = TRUE)
  );