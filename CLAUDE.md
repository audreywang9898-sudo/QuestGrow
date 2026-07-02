# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

QuestGrow is a gamified family chore/habit-tracking app (RPG-themed). Parents assign quests to kids; kids complete them to earn EXP, gold, and gacha tickets, level up, and redeem gacha cards / family wishlist rewards. UI text is bilingual (Traditional Chinese primary, English secondary).

Stack: React 18 + Vite (frontend) and Express + PostgreSQL (backend), as **two separate npm projects** in one repo — root (`/`) is the frontend, `server/` is the backend, each with its own `package.json`/`node_modules`.

## Commands

Frontend (run from repo root):
```
npm run dev       # Vite dev server on http://localhost:3000, calls http://localhost:5000/api
npm run build      # Build to dist/
npm run preview
```

Backend (run from `server/`):
```
npm run dev        # nodemon index.js — API on http://localhost:5000
npm start          # node index.js (production)
npm run setup-db    # node setup_db.js — initializes/seeds the database
```

There is no configured test runner (no Jest/Vitest/etc). "Tests" are standalone Node scripts in `server/` (`test_*.js`) that connect to the real/dev Postgres DB via `server/config/db.js` and exercise flows directly (e.g. task swap, gacha cooldown, task generation). Run one directly, e.g.:
```
node server/test_task_swap.js
```
Files named `scratch_*.js` in `server/` are similarly ad hoc, throwaway DB inspection/debug scripts, not part of any suite.

Database schema lives in `schema.sql` (also includes seed/mock data for a demo family). Individual one-off migration scripts (`server/*_migration.js`) are plain Node+`pg` scripts, not a migration framework; `server/run_all_migrations.js` runs them all in sequence.

Local setup requires `.env` at repo root and `server/.env` (both gitignored) — see the variable names referenced in `server/config/db.js`, `server/index.js`, and `authController.js`/`lineBotController.js` (`DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID`, `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`, `LINE_CHANNEL_ID`/`LINE_CHANNEL_SECRET`/`LINE_CHANNEL_ACCESS_TOKEN`, etc). `DEPLOYMENT.md` documents the full Render/Vercel deployment flow (backend root dir = `server`, frontend static site publishes `dist`, SPA rewrite `/*` → `/index.html`).

## Architecture

### Data model (`schema.sql`)
`families` → `users` (login accounts, `role` in `parent`/`kid`/`admin`, may link `google_id` and/or a LINE user id) → `children` (the kid's RPG character: level, exp, gold, tickets, `attributes` JSONB for Wisdom/Responsibility/Courage/Empathy/Creativity). A `users` row of role `kid` has a `child_id` back-reference to its `children` row.

Other core tables: `tasks` (quests — `type` is one of the five virtues 智/德/體/美/群, `status` flows `未指派`→`進行中`→`待覆核`→`已完成`/`已退回`), `inventory` (gacha cards owned by a child, with `rarity` and a redemption `status`), `wishlist` / `parent_goals` (family-level and parent-level goals), `redeem_logs`, `weekly_competition`, `event_logs` (telemetry), `daily_proverbs`, `admin_notifications`.

### Backend (`server/`)
Express app entry is `server/index.js`: Helmet (with COOP disabled — required for the Google OAuth popup's `postMessage` to work), CORS (open by default; set `ALLOWED_ORIGINS` env var for strict mode), rate limiting on `/api/auth/*` and general `/api/*`, JSON body parsing that also captures `req.rawBody` (needed for webhook signature verification), then mounts one router per domain under `/api/<domain>` (`auth`, `users`, `tasks`, `items`, `family`, `admin`, `proverbs`, `feedback`, `push`, `line`). Non-`/api` routes fall through to serving `dist/index.html` (SPA).

Each domain follows `routes/<x>Routes.js` → `controllers/<x>Controller.js` → `config/db.js` (raw `pg` Pool, no ORM). Auth: `middleware/authMiddleware.js` provides `authenticateToken`, `optionalAuthenticateToken`, and `requireRole(...roles)`, populating `req.user` from a JWT (`{ id, email, role, family_id, child_id }`).

**Server-side messages are centralized in `server/system_message.md`**, not hardcoded in controllers. It's a bilingual (`Chinese | English`) markdown list parsed at startup by `server/utils/messageManager.js` into a `{ KEY: { zh, en } }` map; `getMessage(key, params)` picks the language from the current request's `Accept-Language` header (propagated via `AsyncLocalStorage`, set by `languageMiddleware`) and interpolates `{placeholder}` values. **To add or change a user-facing server response message, edit `system_message.md`**, then reference the key via `getMessage('KEY', { ...params })` in the controller — do not inline strings in controllers.

Accounts can authenticate via password, Google (`google-auth-library`), or LINE (`@line/bot-sdk`), and a single account can link/unlink Google and LINE afterward (`authController.js`: `linkGoogleAccount`/`linkLineAccount`/`unlinkLineAccount`). `server/utils/lineBot.js` also sends LINE Flex Message push notifications (e.g. notifying a parent via LINE when a kid submits a task for review), separate from the Web Push flow (`server/utils/pushNotifier.js` + `src/utils/pushManager.js`, VAPID-based).

### Frontend (`src/`)
No React Router — `App.jsx` holds `currentUser`/`role` state (restored from `localStorage` + a `/api/auth/me` refresh on mount) and conditionally renders one top-level portal: `LoginPortal`, `ParentPortal`, `KidPortal`, or `AdminPortal`. These portal components are large, self-contained monoliths (`ParentPortal.jsx` and `KidPortal.jsx` are each 150–300KB+) rather than being split into many small files — when working in one, expect most of a feature's UI, state, and API calls to live inside that single component tree rather than being spread across a directory.

`src/utils/api.js` is the single fetch client: it derives the API base URL (falls back to `/api` on `onrender.com` hosts, else `http://localhost:5000/api`, overridable via `VITE_API_URL`), attaches the JWT from `localStorage['questgrow_jwt_token']` and an `Accept-Language` header from `localStorage['questgrow_language']`, and exposes one method per backend endpoint.

Frontend UI text uses a separate i18n system from the backend: `src/utils/translations.js` (a `{ zh: {...}, en: {...} }` dictionary) plus `LanguageContext.jsx`'s `t(key, interpolations)`, toggled independently of the server-side `system_message.md` dictionary described above.
