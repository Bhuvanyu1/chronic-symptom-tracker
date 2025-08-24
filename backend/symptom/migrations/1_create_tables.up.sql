CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  conditions TEXT[] NOT NULL DEFAULT '{}',
  check_in_time TEXT NOT NULL DEFAULT '09:00',
  join_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE symptom_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  timestamp BIGINT NOT NULL,
  pain INTEGER NOT NULL CHECK (pain >= 1 AND pain <= 10),
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10),
  energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 10),
  sleep INTEGER NOT NULL CHECK (sleep >= 1 AND sleep <= 10),
  notes TEXT,
  triggers TEXT[] NOT NULL DEFAULT '{}',
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_symptom_entries_user_date ON symptom_entries(user_id, date DESC);
CREATE INDEX idx_symptom_entries_timestamp ON symptom_entries(timestamp DESC);
