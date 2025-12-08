-- Purpose: Create competitions (comps) table to replace state-based system
-- Author: GitHub Copilot
-- Date: 2025-12-08
-- Description: Adds COMPS table with Australian states as competitions

-- =====================================================
-- Create COMPS table
-- =====================================================
CREATE TABLE comps (
  comp_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_comps_name ON comps(name);

-- =====================================================
-- Insert static competition data
-- =====================================================
INSERT INTO comps (name) VALUES 
  ('QLD'),
  ('NSW'),
  ('VIC'),
  ('WA');

-- Add comment
COMMENT ON TABLE comps IS 'Competition reference table - each Australian state is a separate competition';
COMMENT ON COLUMN comps.name IS 'State abbreviation (QLD, NSW, VIC, WA)';
