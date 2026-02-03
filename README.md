# OCLA — Open Cyber LLM Arena

Local-first benchmarking for evaluating LLMs on cybersecurity tasks, with optional anonymous
sharing to a public leaderboard.

## Quickstart

1. Install deps: `npm install`
2. Run dev server: `npm run dev`
3. Open: `http://localhost:3000`

## Database (optional uploads + leaderboard)

Uploads and the public leaderboard require Postgres.

1. Copy `.env.example` → `.env.local` and set `DATABASE_URL` (keep `.env.local` private)
2. Create tables: `npm run db:push`

Neon tip: use the pooled URL for `DATABASE_URL`, and use the unpooled URL for `DATABASE_URL_UNPOOLED` if
`db:push` fails due to pooling/pgbouncer limitations.

## Offline runner (integrity-hash included)

The repo includes a downloadable Node.js runner at `public/ocla-runner.mjs`.

- Prompt pack: `public/prompt-packs/ocla-safe-v1.json`
- Runner hash pin (generated): `public/ocla-runner.sha256`

Example:

`node public/ocla-runner.mjs --base-url http://localhost:11434/v1 --model llama3.1 --prompt-pack public/prompt-packs/ocla-safe-v1.json`

## Notes

- The in-browser benchmark runner is designed to keep API keys in the browser (never sent to OCLA
  server routes).
- The repo ships with a **safe example** prompt pack. You can import your own prompt packs for
  internal testing.
