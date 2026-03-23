-- ============================================================
-- RAMI SCORE TRACKER — Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. MATCHES
CREATE TABLE IF NOT EXISTS matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),
  penalty_rules JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at   TIMESTAMPTZ
);

-- Migration for existing databases (run once if table already exists):
-- ALTER TABLE matches ADD COLUMN IF NOT EXISTS penalty_rules JSONB NOT NULL DEFAULT '[]';

-- 2. PLAYERS
CREATE TABLE IF NOT EXISTS players (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL,
  text_color TEXT NOT NULL,
  position   INTEGER NOT NULL
);

-- 3. ROUNDS
CREATE TABLE IF NOT EXISTS rounds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id     UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ROUND SCORES
CREATE TABLE IF NOT EXISTS round_scores (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id  UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  score     INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  penalties INTEGER NOT NULL DEFAULT 0
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_matches_user_id    ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_status     ON matches(status);
CREATE INDEX IF NOT EXISTS idx_players_match_id   ON players(match_id);
CREATE INDEX IF NOT EXISTS idx_rounds_match_id    ON rounds(match_id);
CREATE INDEX IF NOT EXISTS idx_round_scores_round ON round_scores(round_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE matches      ENABLE ROW LEVEL SECURITY;
ALTER TABLE players      ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds       ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_scores ENABLE ROW LEVEL SECURITY;

-- matches: users own their matches
CREATE POLICY "users_own_matches" ON matches
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- players: users own players of their matches
CREATE POLICY "users_own_players" ON players
  FOR ALL
  USING (
    match_id IN (SELECT id FROM matches WHERE user_id = auth.uid())
  )
  WITH CHECK (
    match_id IN (SELECT id FROM matches WHERE user_id = auth.uid())
  );

-- rounds: users own rounds of their matches
CREATE POLICY "users_own_rounds" ON rounds
  FOR ALL
  USING (
    match_id IN (SELECT id FROM matches WHERE user_id = auth.uid())
  )
  WITH CHECK (
    match_id IN (SELECT id FROM matches WHERE user_id = auth.uid())
  );

-- round_scores: users own scores of their rounds
CREATE POLICY "users_own_round_scores" ON round_scores
  FOR ALL
  USING (
    round_id IN (
      SELECT r.id FROM rounds r
      JOIN matches m ON r.match_id = m.id
      WHERE m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    round_id IN (
      SELECT r.id FROM rounds r
      JOIN matches m ON r.match_id = m.id
      WHERE m.user_id = auth.uid()
    )
  );
