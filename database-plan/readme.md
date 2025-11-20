Complete Database Schema for AFL Footy Tipping Application
Based on comprehensive analysis of all frontend files, here's the complete database schema for Supabase (PostgreSQL):

 Database Tables Overview

1. USERS - User accounts and authentication
2. TEAMS - AFL team information
3. ROUNDS - Season rounds
4. GAMES - Individual matches
5. TIPS - User predictions
6. SCORES - Calculated user scores per round

🔑 Field Descriptions
USERS
user_id: UUID primary key (auto-generated)
state: QLD | NSW | VIC | WA (for leaderboard grouping)
is_admin: Admin privileges flag
GAMES
result: 1 = home team won, 2 = away team won, NULL = not played
is_tippable: Whether users can still submit tips
TIPS
tip: 1 = tipped home team, 2 = tipped away team
ROUNDS
is_round_on: Current active round flag
catch_up_game_id: Special game with double points

📈 Key Relationships
users (1) ----< (many) tips
users (1) ----< (many) scores
games (1) ----< (many) tips
rounds (1) ----< (many) games
rounds (1) ----< (many) scores
teams (1) ----< (many) games [as home_team]
teams (1) ----< (many) games [as away_team]


