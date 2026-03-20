# Community Guardian

> A calm, intelligent community safety platform that aggregates real threat intelligence, uses AI to detect vulnerabilities, and delivers actionable safety digests.

**Loom Demo:** [Video walkthrough](https://www.loom.com/share/c7f942a104f347e1b10b5ff1324a33a0)
**YouTube Demo:** [Video walkthrough](https://youtu.be/u3Jc1CACNQc)

---

## Candidate Name
Pranav Rao Pernankil

## Scenario Chosen
Option 3 — Community Safety & Digital Wellness

## Estimated Time Spent
~8 hours

---

## Quick Start

### Prerequisites
- Node 18+
- A [Neon](https://neon.tech) account (free) for PostgreSQL
- A [Gemini API key](https://aistudio.google.com) (free)
- Optional: [Ollama](https://ollama.com) for local AI (no API key needed)

### Run Commands

**Frontend:**
```bash
cd community-guardian
cp .env.example .env.local

# Set in .env.local:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

npm install
npm run dev
# → http://localhost:3000
```

**Backend:**
```bash
cd backend
cp .env.example .env

# Set in .env:
# DATABASE_URL=your_neon_connection_string
# AI_PROVIDER=gemini
# GEMINI_API_KEY=your_gemini_api_key
# FRONTEND_ORIGIN=http://localhost:3000

npm install
npx prisma db push
npx prisma db seed
npm run dev
# → http://localhost:4000
```

### Test Commands
```bash
cd community-guardian
npm run test
```

---

## AI Disclosure

**Did you use an AI assistant (Copilot, ChatGPT, etc.)?**  
Yes — Claude (Anthropic).

**How did you verify the suggestions?**  
Every suggestion was read line by line before use. All components, hooks, and backend routes were tested locally — running the dev server, checking the browser console for errors, and hitting the backend with curl. If something didn't work or didn't make sense architecturally, it was debugged, modified, or discarded. Tests were run after each significant change to catch regressions.

**Give one example of a suggestion you rejected or changed:**  
Claude initially suggested using `localStorage` as the primary data store for alerts, calling it "simpler and sufficient for the scope." I rejected this and chose PostgreSQL via Neon + Prisma instead. localStorage would have made server-side filtering, cross-device access, and real data feed persistence impossible. The extra ~3 hours to set up the DB was worth it for production-grade architecture.

---

## Tradeoffs & Prioritization

**What did you cut to stay within the 4–6 hour limit?**  

> Note: I deliberately exceeded the suggested timebox — see reasoning at the bottom of this section.

The following were designed but not implemented to keep scope manageable:
- Real-time WebSocket feed updates (requires always-on infrastructure)
- Push notifications / PWA (service worker complexity out of scope)
- Optimistic rollback on PATCH failure (Zustand store may be momentarily stale on error)
- Separate dev/prod databases (using a single Neon DB for both environments)
- Quiet Hours feature (designed in plan, deprioritised during build)
- User authentication (single-user app — deliberate for case study scope)
- End-to-end encrypted Guardian Circles (implemented as read-only URL share links instead)

**What would you build next if you had more time?**
- Real-time WebSocket threat feed for live alert updates
- PWA with push notifications for critical and "Affects Me" alerts
- Multi-user support with authentication (NextAuth or Clerk)
- Real-time encrypted Guardian Circles with proper access control
- ML-based severity scoring trained on historical alert corpus
- Browser extension for inline phishing URL detection
- Alert correlation engine to detect coordinated attack campaigns
- Threat heatmap by geographic region

**Known limitations:**
- **Render free tier cold starts** — backend spins down after 15 minutes of inactivity. First request after sleep takes ~30 seconds. This is a Render free tier limitation, not an application bug.
- **Neon DB pauses** — Neon free tier pauses the database after inactivity. First query after pause may be slow.
- **No user authentication** — all users share the same data store. Acceptable for a single-user case study but not for production.
- **Guardian Circle share links are URL-based** — not end-to-end encrypted. Anyone with the link can view the digest.
- **Optimistic updates don't rollback** — if a PATCH request fails, the Zustand store may briefly show stale data.
- **Single Neon DB for dev and prod** — local changes can affect production data. Separate environments would be the correct approach.

**Why I went over the timebox:**  
The rubric suggests 4–6 hours. I chose ~8 hours deliberately because I wanted to implement proper seperation of concerns, in the form of concrete frontend and backend file structure, for easier flow understanding and application.

---

## Features

### Core (Rubric Requirements)
- ✅ Create alert — paste text (AI categorize) + manual form
- ✅ View alerts — list page with full filtering
- ✅ Update alert — edit page, mark resolved, "This Affects Me" toggle
- ✅ Search & filter — category, severity, status, source, location, text, affects_me
- ✅ AI categorization — structured output (category, severity, summary, action, reason)
- ✅ Keyword fallback — rules engine when AI unavailable, "Using fallback" banner
- ✅ 4 tests — happy path, edge case, fallback, empty state
- ✅ `data/alerts.json` — over 50 synthetic alerts

### Beyond Rubric
- **Safety Pulse** — "You're caught up" / "N things need attention" at a glance
- **Threat DNA Fingerprint** — deterministic SVG per alert (shape=category, colour=severity, pattern=source)
- **Similar Alerts** — keyword overlap matching after AI categorize
- **"This Affects Me"** — persisted to DB, filter
- **Digest + Focus Mode** — filtered by My Concerns, one-at-a-time focus view
- **Guardian Circle** — up to 5 trusted contacts, share read-only digest/alert links
- **Natural Language Query** — "What phishing scams are active?" → AI answers from real corpus
- **Severity Trend Chart** — 7d/14d/30d/custom range, threat level insights panel
- **Dark mode** — system preference + manual toggle, persisted to DB
- **Read Aloud** — speechSynthesis on detail page
- **Category Checklists** — 1-2-3 action steps, "I'm Good" one-tap when all checked

---

## Real Data Sources

| Source | Feed | Key Required |
|---|---|---|
| [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) | Known Exploited Vulnerabilities | None |
| [NVD CVE](https://nvd.nist.gov/developers/vulnerabilities) | Full CVE database with CVSS scores | None |
| [OpenPhish](https://openphish.com) | Community phishing URL feed | None |

All official public APIs — no scraping. Static snapshot in `/data/alerts.json` for offline use.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 + Tailwind | App Router, client components for optimistic UI |
| State | Zustand | Optimistic cache over DB — instant feedback |
| Backend | Express + TypeScript | Clean frontend/backend separation |
| ORM | Prisma 7 | Type-safe DB access, easy migrations |
| Database | PostgreSQL via Neon | Serverless, free tier, production-grade |
| AI (prod) | Gemini 1.5 Flash | Free, fast, handles structured JSON output |
| AI (local) | Ollama llama3.1:8b | Free, offline, no API key required |
| Tests | Vitest + RTL | Fast, modern, compatible with Next.js |
| Deploy | Vercel + Render | Free tiers, zero-config CI/CD |

---

## Project Structure

```
community-guardian/          ← Frontend (Next.js 14)
├── src/
│   ├── app/                 ← Pages (alerts, digest, create, settings, shared)
│   ├── components/          ← 18 reusable UI components
│   ├── hooks/               ← useAlerts, usePreferences, useGuardians, useFeeds
│   ├── store/               ← Zustand global state
│   ├── lib/                 ← fingerprint, similarity, fallback, constants
│   └── types/               ← Shared TypeScript types
├── data/
│   ├── alerts.json          ← 40 synthetic alerts (rubric requirement)
│   └── category_checklists.json
└── src/tests/               ← 4 test files

backend/                     ← Backend (Express + TypeScript)
├── src/
│   ├── controllers/         ← Alert, Guardian, Preferences, Categorize, Query
│   ├── services/            ← AlertService, GuardianService
│   ├── lib/
│   │   ├── ai/              ← Gemini, Ollama, orchestrator, fallback
│   │   └── db.ts            ← Prisma client singleton
│   └── routes/
└── prisma/
    ├── schema.prisma        ← Alert + UserPreference + Guardian models
    └── seed.ts              ← Seeds 40 synthetic alerts
```

---

## Documentation

- [`README.md`](./README.md) _you are here_ —> Problem, solution, structure, AI design decisions, future scope
- [`HLD_LLD.pdf`](Community_Guardian_HLD_LLD) —> Full HLD & LLD with 6 architecture diagrams
