# Ceefax News

Retro Ceefax/teletext-style website for positive news stories from the games industry.

- **Frontend**: Plain HTML + vanilla JS (no framework, no build step)
- **Backend**: Supabase (`ceefax_stories` table), loaded via CDN `<script>`
- **Hosted**: news.fandoster.com (nginx); legacy Surge mirror at ceefax-nmr-news.surge.sh

## Structure

Everything served to the browser lives in [`public/`](public/):

- `index.html` — **P100** index / headlines
- `story.html?p=101` — **P101+** individual story pages
- `admin.html` — **P199** admin (Supabase auth required)
- `common.js` — shared helpers (Supabase client, CEEFAX wordmark, header/clock, FASTEXT)
- `styles.css` — teletext styling; `fonts/`, `images/` — assets

The Supabase URL + publishable anon key are in `common.js`. The anon key is
public by design; writes are protected by row-level security (see
`supabase-setup.sql`).

## Dev

Serve `public/` with any static file server, e.g.:

```bash
python3 -m http.server 5174 --directory public
# then open http://localhost:5174
```

(A plain `file://` open won't work — the Supabase CDN script and fetches need HTTP.)

## Deploy

The live site at news.fandoster.com is served by nginx from the server's copy
of `public/` — update that copy (e.g. `git pull` on the server) to release.

Push to `main` also triggers the GitHub Actions workflow, which publishes
`public/` to the legacy Surge mirror (no build). Manual Surge deploy:
`./deploy.sh` (needs SURGE_LOGIN + SURGE_TOKEN env vars).
