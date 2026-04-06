# Unfollowr — Project Context

## Overview
Unfollowr is an Instagram follower-analysis tool that helps users identify accounts they follow that do not follow them back, plus reverse followers ("fans") and mutual counts, using official Instagram export files instead of Instagram login credentials. This repository currently contains two parallel product implementations: a legacy Flask app that parses uploads server-side and a newer Next.js app that parses uploads entirely in the browser.

## Tech Stack
- **Frontend**: Next.js `14.2.10`, React `18.3.1`, React DOM `18.3.1`, Tailwind CSS `3.4.17`, Framer Motion `11.18.2`, Chart.js `4.5.0`, `react-chartjs-2` `5.3.0`, `lucide-react` `0.452.0`, `clsx` `2.1.1`, TypeScript `5.9.2`
- **Backend**: Python `>=3.11` (current local venv includes Python 3.13 bytecode), Flask `3.1.1`, Werkzeug `3.1.3`, BeautifulSoup4 `4.13.4`, `google-genai` `1.32.0`, `google-generativeai` `0.8.5`, Gunicorn `23.0.0`, `email-validator` `2.2.0`
- **Database**: No active relational database usage found. `flask-sqlalchemy` `3.1.1` and `psycopg2-binary` `2.9.10` are installed but unused in application code. Persistent storage is file-based JSON only: [`analytics_counters.json`](/Users/coleh/Downloads/unfollowr/analytics_counters.json) and [`analytics_events.json`](/Users/coleh/Downloads/unfollowr/analytics_events.json).
- **AI**: Google Gemini via [`ai_classifier.py`](/Users/coleh/Downloads/unfollowr/ai_classifier.py). Uses `gemini-1.5-flash` for batch account classification and query translation, and `gemini-2.5-flash` for chat responses in the Flask app.
- **Deployment**: Replit config exists in [`.replit`](/Users/coleh/Downloads/unfollowr/.replit). Its deployment command builds and starts only the Next.js app from `next/`. No Docker, GitHub Actions, Vercel config, Procfile, Alembic migrations, or `.env.example` file were found.

## Architecture
This repo contains two separate application paths:

1. **Legacy Flask app**
   Runs on `http://localhost:5000` via [`main.py`](/Users/coleh/Downloads/unfollowr/main.py) or [`app.py`](/Users/coleh/Downloads/unfollowr/app.py). It serves Jinja templates from [`templates/`](/Users/coleh/Downloads/unfollowr/templates) and static assets from [`static/`](/Users/coleh/Downloads/unfollowr/static). Uploads POST to `/compare`, are parsed on the server, and results are rendered back into HTML.

2. **Next.js app**
   Runs on `http://localhost:3001` via [`next/package.json`](/Users/coleh/Downloads/unfollowr/next/package.json). It uses the App Router in [`next/app/`](/Users/coleh/Downloads/unfollowr/next/app). Upload parsing is entirely client-side in [`next/components/UploadCard.tsx`](/Users/coleh/Downloads/unfollowr/next/components/UploadCard.tsx); data is stored in `sessionStorage`, and the app navigates to `/results`.

There is **no active proxy config or shared API contract** connecting the Next.js app to the Flask backend. The only Next.js API routes are internal routes at `/api/health` and `/api/metrics`. [`next/lib/metrics.ts`](/Users/coleh/Downloads/unfollowr/next/lib/metrics.ts) supports an optional `NEXT_PUBLIC_API_BASE_URL`, but no checked component currently imports or calls `track()`.

Important current-state note:
- [`app.py`](/Users/coleh/Downloads/unfollowr/app.py) contains an `if __name__ == '__main__': app.run(...)` block before the `/privacy` and `/admin/*` route declarations, then another `app.run(...)` at the end. If `python app.py` is used directly, the first `app.run()` can block before later routes are registered.

## Directory Structure
```text
unfollowr/
├─ app.py                         Flask app, parsers, AI routes, admin routes
├─ main.py                        Minimal Flask entrypoint importing app
├─ ai_classifier.py               Gemini-based account classification + query translation
├─ admin_analytics.py             File-backed analytics/event logging for admin dashboard
├─ lib/
│  ├─ classify_connections.py     Heuristic tagging for unfollowers/fans/mutuals
│  ├─ input_validator.py          File, JSON, string, and account validation
│  └─ rate_limiter.py             In-memory Flask rate limiter decorator
├─ templates/                     Flask/Jinja UI templates, including legacy and redesign variants
├─ static/                        Flask CSS and image assets
├─ data/                          Curated brand/sports/celebrity allowlists
├─ analytics_counters.json        Flat counters for page visits and completed analyses
├─ analytics_events.json          Flat event log for admin dashboard
├─ pyproject.toml                 Python project metadata and dependencies
├─ uv.lock                        Locked Python dependency versions
├─ next/
│  ├─ app/                        Next.js App Router pages, layout, metadata, API routes
│  ├─ components/                 Landing, upload, results, SEO, and UI components
│  ├─ lib/                        Client-side classifiers, filters, metrics, rate limiter
│  ├─ public/                     Sample Instagram exports and image assets
│  ├─ package.json                Next.js scripts and dependency manifest
│  ├─ package-lock.json           Exact frontend dependency lockfile
│  ├─ next.config.mjs             Response security headers
│  ├─ tailwind.config.js          Tailwind content config
│  └─ reference/                  JSX prototypes/reference mocks, not runtime code
├─ docs/
│  └─ SEO-competitor-comparison.md
├─ seo-reports/                   Saved competitor SEO HTML/text captures
├─ README.md                      Project overview and local run instructions
├─ SECURITY.md                    Security posture and environment variable guidance
└─ .replit                        Replit runtime/workflow/deploy config
```

## Data Flow
### Upload → Parse → Results
There are two distinct flows.

**Next.js flow (`next/`)**
1. User selects or drags files into [`next/components/UploadCard.tsx`](/Users/coleh/Downloads/unfollowr/next/components/UploadCard.tsx).
2. Accepted file types are `.json`, `.html`, `.htm`, and `.txt` if the MIME/name regex matches.
3. When at least 2 files are present, `handleAnalyze()` auto-runs.
4. Files are read with `File.text()` in the browser.
5. `parseFollowers()` scans files whose names include `followers`.
6. `parseFollowing()` scans files whose names include `following`.
7. JSON parsing expects:
   - followers: array items with `string_list_data`
   - following: object with `relationships_following`, or fallback HTML
8. HTML parsing uses regex-based extraction from Instagram URLs, relative links, `instagram://user?username=...`, and `@username` text.
9. The app computes:
   - non-followers = `following - followers`
   - fans = `followers - following`
   - mutual count = `following - nonfollowers`
10. Results are written to `sessionStorage`:
   - `unfollowr-items`
   - `unfollowr-items-reverse`
   - `unfollowr-stats`
11. A `CustomEvent("unfollowr-dataset")` is dispatched.
12. The router navigates to `/results`, where [`next/app/results/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/results/page.tsx) reads `sessionStorage` and renders the UI.

**Flask flow (`app.py`)**
1. User submits the hidden HTML form in [`templates/index-new.html`](/Users/coleh/Downloads/unfollowr/templates/index-new.html) to `POST /compare`.
2. Flask validates both files with [`lib/input_validator.py`](/Users/coleh/Downloads/unfollowr/lib/input_validator.py).
3. Files are decoded as UTF-8 and format-detected by `detect_file_format()`.
4. Parsing functions extract username sets:
   - `parse_followers_json()`
   - `parse_following_json()`
   - `parse_followers_html()`
   - `parse_following_html()`
5. `non_followers = following_set - followers_set`
6. Results are alphabetically grouped with special handling to push non-letter usernames into `#`.
7. Analytics events are appended to [`analytics_events.json`](/Users/coleh/Downloads/unfollowr/analytics_events.json) and counters are updated in [`analytics_counters.json`](/Users/coleh/Downloads/unfollowr/analytics_counters.json).
8. Optional AI enrichment is attempted only if `GEMINI_API_KEY` exists and non-follower count is `<= 100`.
9. Optional heuristic connection classification is applied using [`lib/classify_connections.py`](/Users/coleh/Downloads/unfollowr/lib/classify_connections.py).
10. Flask renders [`templates/results-categorized.html`](/Users/coleh/Downloads/unfollowr/templates/results-categorized.html).

### AI Classification
**Flask AI features**
- Triggered in `/compare` only when:
  - `GEMINI_API_KEY` is present
  - `classifier` imports successfully
  - non-follower count is `<= 100`
- [`ai_classifier.py`](/Users/coleh/Downloads/unfollowr/ai_classifier.py) performs:
  1. Heuristic pass via `classify_account_heuristic()`
  2. LLM fallback for ambiguous accounts via `classify_batch_with_ai()`
- Models used:
  - `gemini-1.5-flash` for batch classification
  - `gemini-1.5-flash` for natural-language filter translation
  - `gemini-2.5-flash` for AI chat in `process_chat_query()`
- Output fields per account:
  - `segment`
  - `confidence`
  - `explanations`
  - computed `suggestionScore`
- Segments: `celebrity`, `creator`, `brand`, `friend`, `spam`, `unknown`
- Results are used in Flask templates to label accounts, surface suggestion scores, and support chat/filter behavior.

**Next.js AI state**
- The Next.js app does **not** call Gemini.
- Components such as [`next/components/AssistantDemo.tsx`](/Users/coleh/Downloads/unfollowr/next/components/AssistantDemo.tsx), [`next/components/GoogleAIBadge.tsx`](/Users/coleh/Downloads/unfollowr/next/components/GoogleAIBadge.tsx), [`next/components/HeuristicChips.tsx`](/Users/coleh/Downloads/unfollowr/next/components/HeuristicChips.tsx), and [`next/components/ai/AIAssistant.tsx`](/Users/coleh/Downloads/unfollowr/next/components/ai/AIAssistant.tsx) are presentational or "coming soon" only.
- The Next app includes a purely local heuristic classifier in [`next/lib/classify.ts`](/Users/coleh/Downloads/unfollowr/next/lib/classify.ts), but it is not wired into the current upload/results flow.

## Key Files
- [`app.py`](/Users/coleh/Downloads/unfollowr/app.py): Main Flask application, all routes, file parsing, AI chat/classification wiring, analytics logging.
- [`main.py`](/Users/coleh/Downloads/unfollowr/main.py): Minimal Flask startup wrapper.
- [`ai_classifier.py`](/Users/coleh/Downloads/unfollowr/ai_classifier.py): Gemini client setup, account classification, query translation, suggestion score logic.
- [`admin_analytics.py`](/Users/coleh/Downloads/unfollowr/admin_analytics.py): Session/event persistence and admin dashboard metrics.
- [`lib/classify_connections.py`](/Users/coleh/Downloads/unfollowr/lib/classify_connections.py): Guaranteed relationship buckets plus heuristic tags from allowlists/keywords.
- [`lib/input_validator.py`](/Users/coleh/Downloads/unfollowr/lib/input_validator.py): Server-side security validation for files, JSON, messages, and account payloads.
- [`lib/rate_limiter.py`](/Users/coleh/Downloads/unfollowr/lib/rate_limiter.py): In-memory Flask rate limiter used on all public/admin/API routes.
- [`templates/results-categorized.html`](/Users/coleh/Downloads/unfollowr/templates/results-categorized.html): Current Flask results UI with AI chat call to `/api/ai/chat`.
- [`next/components/UploadCard.tsx`](/Users/coleh/Downloads/unfollowr/next/components/UploadCard.tsx): Current Next upload/parser implementation; core client-side data flow.
- [`next/app/results/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/results/page.tsx): Current Next results experience using `sessionStorage`.
- [`next/app/layout.tsx`](/Users/coleh/Downloads/unfollowr/next/app/layout.tsx): Global metadata, JSON-LD, header/footer.
- [`next/app/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/page.tsx): Home route entry for the Next app.
- [`next/app/api/metrics/route.ts`](/Users/coleh/Downloads/unfollowr/next/app/api/metrics/route.ts): Internal POST metrics endpoint with validation/rate limiting.
- [`next/app/api/health/route.ts`](/Users/coleh/Downloads/unfollowr/next/app/api/health/route.ts): Health check route.
- [`.replit`](/Users/coleh/Downloads/unfollowr/.replit): Replit workflow and production run target.

## Database Schema
No SQL schema, ORM model definitions, migration files, Alembic setup, or active PostgreSQL connection code were found.

Persistent data currently consists of two JSON files:

**`analytics_counters.json`**
- `page_visits: number`
- `analyses_completed: number`
- `start_date: string`
- `last_updated: string`
- `analysis_history: Array<{ timestamp, followers_count, following_count, non_followers_count, file_types }>`

**`analytics_events.json`**
- array of `AnalyticsEvent`
- each event contains:
  - `session_id: string`
  - `event_type: string`
  - `timestamp: ISO datetime string`
  - `metadata: object`

Relationships:
- none beyond logical grouping by `session_id`

User upload data:
- Flask: ephemeral in request memory only
- Next.js: ephemeral in browser `sessionStorage` only

## API Routes
All Flask routes are defined in [`app.py`](/Users/coleh/Downloads/unfollowr/app.py).

| Method | Path | Purpose | Returns |
|---|---|---|---|
| `GET` | `/` | Main Flask landing/upload page | `index-new.html` |
| `GET` | `/faq` | FAQ page | `faq.html` |
| `GET` | `/admin/stats` | Simple stats page gated by `?key=` and `ADMIN_KEY` | Inline HTML string or `403` |
| `POST` | `/compare` | Validate and parse uploaded followers/following files, compute non-followers, optionally AI-enrich and classify | `results-categorized.html` or redirect with flash errors |
| `POST` | `/api/ai/translate-query` | Convert natural-language query into filter JSON | JSON filter object or error JSON |
| `POST` | `/api/ai/classify-batch` | AI-enrich up to 50 submitted accounts | `{ "accounts": [...] }` JSON |
| `POST` | `/api/ai/chat` | Gemini-backed chat using current category/account context | `{ "response": string, "actions"?: object }` JSON |
| `GET` | `/privacy` | Privacy policy page | `privacy.html` |
| `GET` | `/admin` | Admin login form | `admin_login.html` or redirect to dashboard |
| `POST` | `/admin` | Admin password submission | Redirect to dashboard or re-render login with flash |
| `GET` | `/admin/dashboard` | Authenticated analytics dashboard | `admin_dashboard.html` |
| `GET` | `/admin/chart-data` | Authenticated chart data endpoint with `range=7d|30d|90d` | `{ labels, data }` JSON or `401` |
| `GET` | `/admin/export-csv` | Authenticated analytics CSV export | CSV download response |
| `GET` | `/admin/logout` | Clear session auth | Redirect to `/admin` |

Error handler:
- `413` file-too-large handler redirects to `/` with a flash error

## Frontend Pages
### Next.js pages/routes
| Route | File | Purpose |
|---|---|---|
| `/` | [`next/app/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/page.tsx) | Main marketing/upload page |
| `/results` | [`next/app/results/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/results/page.tsx) | Client-side results dashboard from `sessionStorage` |
| `/privacy` | [`next/app/privacy/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/privacy/page.tsx) | Privacy policy page |
| `/terms` | [`next/app/terms/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/terms/page.tsx) | Terms of service page |
| `/guides` | [`next/app/guides/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/guides/page.tsx) | Guides index |
| `/guides/how-to-see-who-doesnt-follow-you-instagram` | [`next/app/guides/how-to-see-who-doesnt-follow-you-instagram/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/guides/how-to-see-who-doesnt-follow-you-instagram/page.tsx) | Educational guide page |
| `/guides/instagram-unfollower-tools-safe` | [`next/app/guides/instagram-unfollower-tools-safe/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/guides/instagram-unfollower-tools-safe/page.tsx) | Safety guide page |
| `/guides/download-instagram-followers-data` | [`next/app/guides/download-instagram-followers-data/page.tsx`](/Users/coleh/Downloads/unfollowr/next/app/guides/download-instagram-followers-data/page.tsx) | Export-download instructions |
| `/robots.txt` | [`next/app/robots.ts`](/Users/coleh/Downloads/unfollowr/next/app/robots.ts) | Generated robots file |
| `/sitemap.xml` | [`next/app/sitemap.ts`](/Users/coleh/Downloads/unfollowr/next/app/sitemap.ts) | Generated sitemap |
| `/api/health` | [`next/app/api/health/route.ts`](/Users/coleh/Downloads/unfollowr/next/app/api/health/route.ts) | Health check JSON |
| `/api/metrics` | [`next/app/api/metrics/route.ts`](/Users/coleh/Downloads/unfollowr/next/app/api/metrics/route.ts) | Metrics ingest JSON |

### Flask-rendered pages/templates
| Route/Page | File | Notes |
|---|---|---|
| `/` | [`templates/index-new.html`](/Users/coleh/Downloads/unfollowr/templates/index-new.html) | Current Flask landing page |
| `/faq` | [`templates/faq.html`](/Users/coleh/Downloads/unfollowr/templates/faq.html) | Dedicated FAQ page |
| `/privacy` | [`templates/privacy.html`](/Users/coleh/Downloads/unfollowr/templates/privacy.html) | Privacy page |
| `/admin` | [`templates/admin_login.html`](/Users/coleh/Downloads/unfollowr/templates/admin_login.html) | Admin login |
| `/admin/dashboard` | [`templates/admin_dashboard.html`](/Users/coleh/Downloads/unfollowr/templates/admin_dashboard.html) | Admin analytics |
| `/compare` result | [`templates/results-categorized.html`](/Users/coleh/Downloads/unfollowr/templates/results-categorized.html) | Current Flask results page |

Legacy/template variants present but not referenced by active route rendering:
- [`templates/index.html`](/Users/coleh/Downloads/unfollowr/templates/index.html)
- [`templates/results.html`](/Users/coleh/Downloads/unfollowr/templates/results.html)
- [`templates/results-new.html`](/Users/coleh/Downloads/unfollowr/templates/results-new.html)
- [`templates/results-refined.html`](/Users/coleh/Downloads/unfollowr/templates/results-refined.html)
- [`templates/results-redesign.html`](/Users/coleh/Downloads/unfollowr/templates/results-redesign.html)

## Environment Variables
- `GEMINI_API_KEY`: Enables Flask AI features in [`app.py`](/Users/coleh/Downloads/unfollowr/app.py) and initializes Gemini client in [`ai_classifier.py`](/Users/coleh/Downloads/unfollowr/ai_classifier.py).
- `SESSION_SECRET`: Flask session secret; if missing, insecure development fallback is used.
- `ADMIN_PASSWORD_HASH`: Werkzeug password hash for `/admin`; if missing, insecure fallback hash is used.
- `ADMIN_KEY`: Required for `/admin/stats?key=...`; dev fallback `"admin123"` is used only when `FLASK_ENV=development`.
- `FLASK_ENV`: Used to enable development-only admin fallbacks.
- `PORT`: Used by `next start -p $PORT` in [`next/package.json`](/Users/coleh/Downloads/unfollowr/next/package.json) and Replit deployment.
- `NEXT_PUBLIC_API_BASE_URL`: Optional base URL in [`next/lib/metrics.ts`](/Users/coleh/Downloads/unfollowr/next/lib/metrics.ts); no current consumer found in runtime components.

Not found:
- `.env.example`
- `DATABASE_URL`
- `config.py`

## Current SEO Setup
**Next.js**
- Global metadata in [`next/app/layout.tsx`](/Users/coleh/Downloads/unfollowr/next/app/layout.tsx):
  - `metadataBase`
  - title
  - description
  - keywords
  - robots
  - Open Graph
  - Twitter card
  - Google site verification
- Canonicals defined on page metadata for:
  - `/`
  - `/privacy`
  - `/terms`
  - `/guides`
  - each guide page
- JSON-LD in layout:
  - `WebApplication`
  - `FAQPage`
  - `HowTo`
- Additional `FAQPage` schema on each guide page
- Generated `robots.txt` via [`next/app/robots.ts`](/Users/coleh/Downloads/unfollowr/next/app/robots.ts)
- Generated `sitemap.xml` via [`next/app/sitemap.ts`](/Users/coleh/Downloads/unfollowr/next/app/sitemap.ts)
- Security headers in [`next/next.config.mjs`](/Users/coleh/Downloads/unfollowr/next/next.config.mjs):
  - `Strict-Transport-Security`
  - `X-Frame-Options`
  - `X-Content-Type-Options`

**Flask**
- Basic meta title/description tags are present in individual templates.
- No centralized sitemap/robots generation found for the Flask side.

## Known Patterns & Conventions
- The repo currently maintains **two parallel UIs** for the same product: Flask/Jinja and Next.js/App Router.
- Flask code is monolithic: most server behavior lives in [`app.py`](/Users/coleh/Downloads/unfollowr/app.py).
- Flask route protection uses:
  - `@rate_limit(...)`
  - `validator.*` calls from [`lib/input_validator.py`](/Users/coleh/Downloads/unfollowr/lib/input_validator.py)
- Flask storage is file-based JSON, not database-backed.
- Next.js favors small reusable presentational components under [`next/components/ui/`](/Users/coleh/Downloads/unfollowr/next/components/ui).
- Next upload/results state is browser-only:
  - `sessionStorage` for data
  - `localStorage` for persisted UI preferences
- Many Next components mention AI, but current active flow does not invoke server AI.
- There are several legacy/prototype artifacts:
  - multiple unused Flask result templates
  - [`next/reference/`](/Users/coleh/Downloads/unfollowr/next/reference) mockups
  - unused Next helper modules like [`next/lib/classify.ts`](/Users/coleh/Downloads/unfollowr/next/lib/classify.ts)
- Styling stacks differ:
  - Flask: Bootstrap + custom CSS
  - Next: Tailwind + CSS variables in [`next/app/globals.css`](/Users/coleh/Downloads/unfollowr/next/app/globals.css)

## Development Setup
### Flask app
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
python main.py
```
Runs on `http://localhost:5000`.

### Next.js app
```bash
cd next
npm install
npm run dev
```
Runs on `http://localhost:3001`.

### Replit
[`README.md`](/Users/coleh/Downloads/unfollowr/README.md) says to run both servers locally, but [`.replit`](/Users/coleh/Downloads/unfollowr/.replit) is configured to develop/deploy only the Next app.

## Additional Notes
### Product Split
The most important current-state fact is that the repo is not a single integrated web app:
- Flask has the live Gemini-backed AI and admin analytics system.
- Next.js has the modern marketing/upload/results experience.
- The Next app does not call Flask for parsing or AI.
- Replit deployment currently targets Next only.

### Security/Operational Notes
- [`SECURITY.md`](/Users/coleh/Downloads/unfollowr/SECURITY.md) describes good production practices, but some code paths still use insecure development fallbacks if env vars are missing.
- Both Flask and Next rate limiters are in-memory only.
- README and some page copy describe PostgreSQL and fully local-only processing, but the actual repo state is mixed:
  - no active PostgreSQL usage found
  - Flask upload flow processes files server-side
  - Next upload flow processes files browser-side

### Unclear / Needs Investigation
- [UNCLEAR — needs investigation] Which frontend is intended to be the canonical production product long-term: Flask templates or the Next.js app.
- [UNCLEAR — needs investigation] Whether the Flask AI/admin features are planned to be migrated into Next.js or retained separately.
- [UNCLEAR — needs investigation] Whether the route-order issue in [`app.py`](/Users/coleh/Downloads/unfollowr/app.py) affects the currently used startup path in production.
