-- Run this in the Supabase SQL Editor for the ceefax-nmr-news project
-- https://supabase.com/dashboard/project/exmksuzyfbhfybzoxfsg/sql/new

CREATE TABLE IF NOT EXISTS ceefax_stories (
  id SERIAL PRIMARY KEY,
  page_number INT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'NEWS',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ceefax_stories ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY ceefax_stories_read ON ceefax_stories FOR SELECT USING (true);

-- Authenticated write (for admin via Supabase Auth)
CREATE POLICY ceefax_stories_write ON ceefax_stories
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
