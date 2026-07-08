# Ceefax NMR News

Retro Ceefax/teletext-style website for positive news stories from the games industry.

- **Frontend**: React + Vite
- **Backend**: Supabase (ceefax_stories table)
- **Hosted**: Surge at ceefax-nmr-news.surge.sh

## Pages

- **P100** — Index / headlines
- **P101+** — Individual story pages  
- **P199** — Admin (Supabase auth required)

## Dev

```bash
npm install
npm run dev
```

## Deploy

Push to `main` triggers GitHub Actions deploy to Surge.

Manual deploy: `./deploy.sh` (needs SURGE_LOGIN + SURGE_TOKEN env vars)
