CREATE TABLE t_p67292840_web_game_raffle.players (
  id BIGINT PRIMARY KEY,
  tg_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT,
  photo_url TEXT,
  city TEXT,
  pvz_address TEXT,
  balance INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  games_won INTEGER NOT NULL DEFAULT 0,
  daily_streak INTEGER NOT NULL DEFAULT 0,
  daily_last_claimed DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE t_p67292840_web_game_raffle.players_id_seq START 1;
ALTER TABLE t_p67292840_web_game_raffle.players ALTER COLUMN id SET DEFAULT nextval('t_p67292840_web_game_raffle.players_id_seq');
