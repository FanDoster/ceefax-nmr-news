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

-- Public read — the site is a public news page, anyone can read stories.
CREATE POLICY ceefax_stories_read ON ceefax_stories FOR SELECT USING (true);

-- Admin-only write.
-- IMPORTANT: replace the email below with YOUR Supabase admin account's email,
-- then run this in the SQL editor. Only that signed-in user can create/edit/
-- delete stories; every other user (even one who somehow signs up) is read-only.
-- This DB policy — not the admin UI — is what actually secures the CRUD.
-- To allow more than one admin, use: (auth.jwt() ->> 'email') IN ('a@x.com','b@y.com')
DROP POLICY IF EXISTS ceefax_stories_write ON ceefax_stories;
CREATE POLICY ceefax_stories_write ON ceefax_stories
  FOR ALL
  TO authenticated
  USING      ( (auth.jwt() ->> 'email') = 'your-admin-email@example.com' )
  WITH CHECK ( (auth.jwt() ->> 'email') = 'your-admin-email@example.com' );

-- Recommended: also disable public sign-ups in the Supabase dashboard
-- (Authentication → Sign In / Providers → turn off "Allow new users to sign up").
