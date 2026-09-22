# Azure migration plan — Unfollowr

Written 2026-09-22. Prices pulled from the Azure retail pricing API on that date.
Subscription `14ca6838-7957-4a50-8bbc-63d2ce5c1a82` ("Azure subscription 1"),
quota `Sponsored_2016-01-01`, spending limit **off**.

**Both Render services are suspended right now.** `https://www.unfollowr.app/`
and `https://unfollowr-backend.onrender.com/` both return `503` with
`x-render-routing: suspend`. The site is down as of this writing, which moves
Phase 0 (dump the analytics database before Render reclaims it) from "good
hygiene" to "do this first."

---

## 0. Field corrections — verified 2026-09-22 against the Render dashboard

Everything in this section replaces the inferences made elsewhere in the
document. Where this section and a later section disagree, **this section is
right** — it was read off the live dashboard and the live database.

### The database is on Neon, not Render

`DATABASE_URL` on `unfollowr-backend` is `postgresql://neondb_owner:npg_...`.
The analytics database is a **Neon** project named "Unfollowr"
(`empty-water-98804719`, PG 17, `aws-us-west-2`, created 2026-03-20). The
Render "Unfollowr" project contains **two web services and zero databases.**

Consequences:

- Phase 0's stated urgency — dump it "before Render reclaims the suspended
  database" — **rests on a false premise.** No Render database exists to
  reclaim. The data was never at risk.
- **Decision (Cole, 2026-09-22): the database stays on Neon.** Phase 1's
  "create the `unfollowr` database on `tracktoolkit-pg`" and its `pg_restore`
  step are **cancelled.** The Azure backend points `DATABASE_URL` at Neon.
  Rationale: Neon is free, PG 17, already serving this exact table, and
  leaving it there removes a migration step, removes a data-loss window, and
  keeps unfollowr's data blast radius away from `tracktoolkit-pg`. Cost is
  unchanged at $0.
- §2's "Database" row and §4 item 13's shared-database blast radius no longer
  apply. The *compute* blast radius on `tracktoolkit-plan` still does.

### The suspension is a free-tier usage limit

Both services show "Free usage limit reached — Your service is now suspended
until the next billing period." This is Render free-tier instance-hour
exhaustion, **not** non-payment and not a manual suspension. It resumes on its
own next billing period. Nothing is being deleted.

### The real build and start commands (answers open question #2)

Both services: **Free** plan, Oregon, repo `cole-hackman/unfollowr`, branch
`main`, auto-deploy on commit, no pre-deploy command, no health-check path.

| | `unfollowr-backend` | `unfollowr-frontend` |
|---|---|---|
| Runtime | Python 3 | Node |
| Root directory | *(repo root)* | `next` |
| Build | **`uv sync --frozen && uv cache prune --ci`** | **`npm ci && npm run build`** |
| Start | **`gunicorn app:app --preload --workers 2 --timeout 120`** | **`npm start`** |
| Deployed commit | `3a3fef0` | `6662d67` (~4 months old) |

Both inferences in §1 were wrong:

- Build is **uv against `uv.lock`**, not `pip install -r requirements.txt`.
  This is a real Phase 2 change: App Service's `SCM_DO_BUILD_DURING_DEPLOYMENT`
  runs pip, not uv. Either install uv in the build, or generate a requirements
  file from the lock (`uv export --frozen --no-dev -o requirements.txt`) so the
  pinned versions survive. Do not silently fall back to the existing
  `requirements.txt` — it is not the lock and has not been what production builds.
- Start is **`gunicorn app:app`**, not `main:app`. Both resolve (`main.py` is
  `from app import app`), but production runs `app:app`, with
  `--preload --workers 2`. Note **2 workers on a 1-core B1**, and that
  `--preload` forks after import, which matters for the per-process
  `lib/rate_limiter.py` state described in §4 item 11. **The timeout is
  confirmed as `--timeout 120`** (Cole, 2026-09-22) — i.e. production already
  runs exactly what §4 item 8 recommends for keeping the legacy UI, and well
  inside App Service's 230 s front-end idle. Carry it over verbatim.

### Only two environment variables are set per service (revises §1's table)

| Service | Variables actually set |
|---|---|
| `unfollowr-backend` | `ADMIN_SECRET`, `DATABASE_URL` |
| `unfollowr-frontend` | `ADMIN_SECRET`, `NEXT_PUBLIC_API_URL` = `https://unfollowr-backend.onrender.com` |

`SESSION_SECRET`, `ADMIN_PASSWORD_HASH`, `ADMIN_KEY`, `FLASK_ENV` and
`GEMINI_API_KEY` are **unset in production today.** Therefore:

- **§4 item 6 is moot.** There is no `GEMINI_API_KEY` to avoid migrating;
  `AI_ENABLED` is already false and the `/api/ai/*` surface is already closed.
- **§4 item 5 already happened.** `SESSION_SECRET` and `ADMIN_PASSWORD_HASH`
  have been falling back to random per-boot values in production all along
  (`app.py:55-73`), so the legacy Flask admin panel is already non-functional.
  Nothing to preserve; this strengthens the case for open question #4's delete.

### Analytics were recording correctly (answers open question #5)

`NEXT_PUBLIC_API_URL` **was** set in the Render frontend build. Verified against
the live Neon database on 2026-09-22:

| Measure | Value |
|---|---|
| Total rows | **26,804** |
| `min(created_at)` | 2026-03-20 01:42:07 UTC |
| **`max(created_at)`** | **2026-09-21 16:44:26 UTC** |
| Gap at time of check | 19h 34m — stops exactly at the Render suspension |

| event_type | rows | distinct `ip_hash` |
|---|---|---|
| `page_view` | 22,749 | 9,661 |
| `analysis_run` | 4,055 | 2,180 |

**The traffic numbers in this document and in the README are real.**

Two things the data corrects:

- `count(DISTINCT session_id) == count(*)` for both event types. `session_id`
  is regenerated per request and is **not** a session identifier. Unique-user
  figures must use `ip_hash`. The README's "~2,000 unique users all-time"
  corresponds to the **2,180** distinct `ip_hash` values that ran an analysis.
- Monthly volume is 2,757–6,460 rows (avg ~3,800), 1,024–2,033 unique IPs,
  ~1 MB/month of metadata, 42 MB total Neon storage. §3's assumptions
  (~3,300 rows/mo, ~1 MB/mo) hold; the cost model is unaffected.

### The CSP fix in Phase 4 is a no-op as written

§4 item 1 and Phase 4 step 1 say to change `connect-src` in
`next/next.config.mjs`. **That edit does nothing under `output: 'export'`.**
Confirmed in the installed Next 14.2.10 source
(`next/node_modules/next/dist/export/index.js`):

> `rewrites, redirects, and headers are not applied when exporting your application`

So the failure mode is not "a stale CSP blocks the analytics POST" — it is that
the exported site ships with **no CSP, no HSTS and no X-Frame-Options at all**,
silently dropping every security header the app has today. That is a
regression, not a break.

**Fix:** move the headers to a `staticwebapp.config.json` `globalHeaders` block
at the Static Web App deploy root, with `connect-src` pointing at
`https://api.unfollowr.app`. Keep the `next.config.mjs` `headers()` block for
`next dev` parity, but treat the SWA config as the production source of truth.

---

## 1. Current state

No deploy configuration exists anywhere in the repo — no `render.yaml`, no
`Dockerfile`, no `Procfile`, no `.github/`. Everything below marked *(inferred)*
is reconstructed from the code and from live DNS/HTTP probes; the authoritative
build and start commands live only in the Render dashboard and should be
screenshotted before Render is touched.

### Services

| | Frontend | Backend |
|---|---|---|
| Render service | `unfollowr-frontend` | `unfollowr-backend` |
| Region | `gcp-us-west1` (Oregon), per DNS CNAME chain | same |
| Source | `next/` | repo root |
| Runtime | Node; Next.js 14.2.10, React 18.3.1 (`next/package.json`) | Python 3.11 (`pyproject.toml:6`) |
| Build *(inferred)* | `npm install && npm run build` | `pip install -r requirements.txt` |
| Start *(inferred)* | `npm start` → `next start -p $PORT` (`next/package.json:7`) | `gunicorn main:app` — `main.py` exposes `app`, gunicorn is in `requirements.txt:7` |
| Status | `503`, suspended | `503`, suspended |

### What the backend actually does per request

**The server never receives the Instagram export.** Parsing is entirely
client-side: `next/components/UploadCard.tsx:96` reads each file with
`await f.text()`, parses in-browser, and writes results to `sessionStorage`
(`UploadCard.tsx:117-119`). The frontend's total server surface is **one POST**:

- `POST /api/analytics/event` (`analytics_api.py:76`) — fired from
  `next/lib/analytics.ts:6`, called at `UploadCard.tsx:108` (`analysis_run`) and
  `components/PageViewTracker.tsx:12` (`page_view`).
- Body is counts only — `accounts_count`, `non_followers`, `fans`, `mutuals`,
  `export_format`, `ai_used` (`UploadCard.tsx:108-115`). **No usernames.**
- Hard-capped at 10,240 bytes (`analytics_api.py:85`). Realistic body: ~200 bytes.
- Duration: one `psycopg2.connect()` + one `INSERT`
  (`lib/postgres_analytics.py:103-118`). Sub-second.

Four admin endpoints (`/api/admin/kpis|trends|breakdowns|recent`) sit behind a
bearer token (`analytics_api.py:56-70`) and back `next/app/admin`. The slowest
is `/api/admin/breakdowns`, which pulls every row in the window and aggregates in
Python (`postgres_analytics.py:_fetch_page_view_rows` → `get_breakdowns`) — a few
thousand rows today, still sub-second, but O(rows) with no pagination.

The legacy server-rendered app in `app.py` (routes `/`, `/compare`, `/faq`,
`/admin/*`, `/api/ai/*`) accepts 50 MB uploads (`app.py:79`) and runs
BeautifulSoup + Gemini server-side. **Nothing in the live product reaches it** —
`ai_used: false` is hardcoded, and `next/components/ai/AIAssistant.tsx` makes no
network calls at all. It is reachable by URL and sets the timeout and
request-size floor *only if you choose to keep deploying it*.

### Is PostgreSQL load-bearing?

**No.** One table, defined at `lib/postgres_analytics.py:15-23`:

```sql
analytics_events(id SERIAL, event_type VARCHAR(50), metadata JSONB,
                 session_id VARCHAR(64), ip_hash VARCHAR(64), created_at TIMESTAMPTZ)
```

Append-only. Three permitted event types (`postgres_analytics.py:29`). IPs are
SHA-256 hashed (`:74`). Writers: `analytics_api.py:97` and three call sites in
`app.py` (`:701`, `:741`, `:891`). Readers: the admin dashboard only.

No user state, no accounts, no cached classifier data. Losing the database costs
you the admin dashboard and the historical numbers in the README — nothing a user
would notice. Schema self-initialises via `CREATE TABLE IF NOT EXISTS` on first
request (`ensure_schema`, `:49`), so there is no migration step, but the DB role
needs `CREATE` rights.

Volume: ~3,300 rows/month at ~300 bytes → **~1 MB/month, ~12 MB/year.**

### Background work

None. No cron, no scheduler, no queue, no worker, no dataset-refresh script — a
grep for `schedule|cron|APScheduler|Thread|celery|Timer|atexit` across the Python
returns nothing. `analytics_counters.json` is a stray local-file counter
(`admin_analytics.py:44`) that writes to the container's ephemeral disk and is
gitignored; it is already effectively dead.

### Environment variables

| Var | Read at | Needed by | Notes |
|---|---|---|---|
| `DATABASE_URL` | `lib/postgres_analytics.py:37` | backend | Only true requirement |
| `ADMIN_SECRET` | `analytics_api.py:58` | backend | Bearer token for `/api/admin/*` |
| `SESSION_SECRET` | `app.py:55` | backend (legacy) | **Silently falls back to a random per-boot value** (`app.py:57`) |
| `ADMIN_PASSWORD_HASH` | `app.py:66` | backend (legacy) | Same silent random fallback (`app.py:72`) |
| `ADMIN_KEY` | `app.py:482` | backend (legacy) | Undocumented in the README |
| `GEMINI_API_KEY` | `app.py:21`, `ai_classifier.py:19` | backend (legacy only) | **Do not set** — see §4 |
| `FLASK_ENV` | `app.py:58`, `analytics_api.py:102` | backend | Controls `secure` cookie flag |
| `NEXT_PUBLIC_API_URL` | `next/lib/analytics.ts:1`, `components/admin/AdminDashboard.tsx:45` | frontend | **Baked in at build time** |
| `NEXT_PUBLIC_API_BASE_URL` | `next/lib/metrics.ts:2` | — | Points at `/api/metrics`, which validates and discards. Dead. |

### Host assumptions to change

- `next/next.config.mjs:16` — CSP `connect-src` pins
  `https://unfollowr-backend.onrender.com`. **The one hard break.**
- `analytics_api.py:24-29` — CORS allowlist. `unfollowr.app` and
  `www.unfollowr.app` survive the move untouched. `unfollowr.com` /
  `www.unfollowr.com` resolve to `13.223.25.84` on `namebrightdns.com` — **that
  domain is not yours.** Drop those two entries.
- `lib/classify_connections.py:53-55` loads `data/*.json` by **relative** path, so
  the process CWD must be the repo root. Legacy path only; ~3 KB of allowlists.

### Static assets and the classifier

- Production build (`npm run build`, run 2026-09-22, exit 0): **all 16 page
  routes prerender static (`○`).** Only `/api/health` and `/api/metrics` are
  dynamic (`ƒ`), and both are dead weight — health is trivial, metrics discards
  its input. `robots.txt` and `sitemap.xml` are static.
- Shared first-load JS 87.2 kB; heaviest route `/` at 132 kB total.
- `next/public/` is 1.7 MB, of which **1.38 MB is `unfollowr-logo-clean.png`,
  which nothing references.** `erasebg-transformed.png` (149 KB) and
  `unfollowr-logo.png` (146 KB) are also unreferenced. Only `wordmark.webp`
  (9.5 KB, `components/Header.tsx`) and `favicon.webp` (71 KB, `app/layout.tsx`)
  are used.
- Whole deployable static site ≈ **3 MB**.
- There is **no bundled classifier dataset in the live product.**
  `next/lib/classify.ts` is 2.1 KB of pure token heuristics — three hardcoded
  word lists, no data file. The `data/*.json` allowlists (3.2 KB total) belong to
  the Python legacy path.

### Next.js rendering

No `middleware.ts`. No `generateStaticParams`, no ISR, no `revalidate`, no
`cookies()`/`headers()` in any page, no `fetch()` in any server component. Every
page is static. `next/image` appears only in the two blog posts, pointed at
remote Supabase URLs — and `next.config.mjs` has **no `images.remotePatterns`**,
so the optimizer rejects those hosts and **those six images are already broken in
production today.**

**Conclusion: the frontend needs no server.**

---

## 2. Target architecture

Region: **West US 3** for everything except the Static Web App, which is not
offered there (`Microsoft.Web/staticSites` locations: Central US, East US 2,
West US 2, West Europe, East Asia) and goes in **West US 2**. westus3 is where
your existing `rg-tracktoolkit` resources live; West US 2 is the nearest SWA
control-plane region and the closest match to Render's current `gcp-us-west1`.
SWA content is served from the global edge regardless of resource region.

| Concern | Choice | Runner-up, and why it lost |
|---|---|---|
| Frontend | **Azure Static Web Apps, Free plan** (new, West US 2). Requires `output: 'export'`. Global CDN, free auto-renewing TLS, GitHub Actions deploy built in. | *Container Apps running `next start`* — pays compute and eats a cold start to serve files that are already fully prerendered, and gives up the CDN. |
| Backend | **A second Linux Web App on the existing `tracktoolkit-plan` (B1)**, `PYTHON\|3.12`, `gunicorn main:app`. Runs the Flask app unmodified. $0 marginal — the plan bills 24/7 whether or not unfollowr is on it. | *Container Apps Consumption* — genuinely free at this volume (see §3) and properly decoupled, but costs a Dockerfile, a registry, and a second platform to maintain, to save $0. Kept as the escape hatch in §5, Phase 7. |
| Database | **A new `unfollowr` database on the existing `tracktoolkit-pg`** (Burstable B1ms, PG 17, westus3). Firewall already has `AllowAllAzureServicesAndResourcesWithinAzureIps`, so App Service reaches it with no new rule. Separate database = separate credentials and clean `pg_dump` boundary. | *A dedicated Flexible Server* — $16.09/mo, blows the $10 target to hold 12 MB/year. *Table Storage* — ~$0.01/mo, but `lib/postgres_analytics.py` is 400 lines of SQL aggregation that would all have to be rewritten. |
| Secrets | **App Service application settings.** Five secrets, one consumer, no compliance driver, and it matches what `tracktoolkit` already does (its `DATABASE_URL`/`SESSION_SECRET` are plain app settings). | *Key Vault* — `tracktoolkit-kv` already exists and Key Vault references are a one-line upgrade, but it adds a managed identity, an access policy, and a failure mode, for five values that never rotate. Not warranted. |
| Observability | **Application Insights**, wired to the existing `tracktoolkit-logs` workspace, sampling on, **0.1 GB/day cap**. Today the only observability is the analytics events themselves. | *Nothing* — defensible at this scale and $0, but you currently cannot see a 500 in the analytics endpoint at all, and the 5 GB/month free ingest makes this free anyway. |
| CI/CD | **GitHub Actions**, two workflows, **OIDC federated credentials** (see §7). | *azd* — see §7. |

Resulting resource list: **one new Static Web App, one new Web App, one new
database, one new Application Insights component.** No new plan, no new server,
no new registry, no VNet, no Key Vault.

`Microsoft.App`, `Microsoft.Storage`, and `Microsoft.ContainerRegistry` are
currently `NotRegistered` on this subscription. The chosen path needs none of
them; the Phase 7 escape hatch needs `Microsoft.App`.

---

## 3. Cost model

Prices from `prices.azure.com/api/retail/prices`, USD, pulled 2026-09-22.
Compute/storage lines are **West US 3**; the SWA line is **West US 2**.

Traffic assumptions — current: ~1,000 monthly users, ~300 analyses/mo (278/28d
per the README), ~3,000 page views, **~3,300 backend requests/mo**, ~250 KB per
page load → **~2 GB/mo frontend egress**, ~1 MB/mo of new database rows.
"10x" multiplies all of those by ten.

| Line | Unit price | Now | At 10x | Scales with usage? |
|---|---|---|---|---|
| Static Web Apps, Free plan | $0.00 | **$0.00** | **$0.00** | Fixed. Capped at 100 GB/mo bandwidth |
| SWA bandwidth | 100 GB/mo included | $0.00 (2 of 100 GB) | $0.00 (20 of 100 GB) | Usage |
| Backend on `tracktoolkit-plan` (B1 Linux) | $0.017/hr = $12.41/mo, **already incurred** | **$0.00 marginal** | **$0.00 marginal** | Fixed |
| `unfollowr` DB on `tracktoolkit-pg` (B1ms) | $0.017/hr = $12.41/mo, **already incurred** | **$0.00 marginal** | **$0.00 marginal** | Fixed |
| Postgres storage growth | $0.115/GB-mo | ~$0.00 (12 MB/yr) | ~$0.01 | Usage |
| Application Insights ingest | $2.30/GB, first 5 GB/mo free | $0.00 | $0.00 | Usage |
| Data transfer out of westus3 | first 100 GB/mo free, then $0.08/GB | $0.00 (~3 MB/mo) | $0.00 | Usage |
| GitHub Actions (public repo) | $0.00 | $0.00 | $0.00 | Fixed |
| **New monthly spend** | | **$0.00** | **~$0.01** | |

Total subscription spend stays at roughly **$28/mo** — `tracktoolkit-plan`
($12.41) + `tracktoolkit-pg` compute ($12.41) + its 32 GB Premium SSD
($0.115 × 32 = $3.68) + backups — exactly what it is today. Unfollowr adds
nothing measurable. Well inside the $10 target.

### Decoupled variant, priced (the Phase 7 escape hatch)

Container Apps Consumption in westus3: active $0.000024/vCPU-s, $0.000003/GiB-s,
requests $0.40/1M. Free grant per subscription per calendar month: **180,000
vCPU-s, 360,000 GiB-s, 2M requests.**

| Line | Now | At 10x |
|---|---|---|
| Container App, 0.25 vCPU / 0.5 GiB, `minReplicas: 0`, ~1 s active per request | 825 vCPU-s of 180,000 free → **$0.00** | 8,250 vCPU-s → **$0.00** |
| Requests | 3,300 of 2M free → $0.00 | 33,000 → $0.00 |
| Environment (no VNet, no private endpoint, no premium ingress) | $0.00 | $0.00 |
| Registry — **ghcr.io, not ACR** | $0.00 | $0.00 |
| *(if you use ACR Basic instead)* | *$0.1666/day = $5.07* | *$5.07* |
| Log Analytics for the CA environment | $0.00 (under 5 GB free) | $0.00 |
| **Compute subtotal** | **$0.00** | **$0.00** |
| Plus a dedicated DB: PG Flexible Server B1ms + 32 GB | $12.41 + $3.68 = **$16.09** | $16.09 |
| Plus Table Storage instead (writes $0.00036/10K, storage $0.045/GB-mo) | **~$0.01** | ~$0.05 |

Compute isolation is genuinely free. **Data isolation is the expensive part** —
$16.09/mo for a dedicated Postgres, or a rewrite of `lib/postgres_analytics.py`
to reach ~$0.01. That asymmetry is why the DB stays on `tracktoolkit-pg`.

### What to watch

Everything above is $0 because of free grants and already-paid fixed costs. The
lines that could actually move: SWA bandwidth past 100 GB/mo (would need ~50x
current traffic), App Insights past 5 GB/mo (sampling + the daily cap prevent
this), and Postgres storage, which only grows if `analytics_events` is never
pruned — at 12 MB/year, the 32 GB disk lasts past 2500.

---

## 4. What breaks in the move

**1. CSP — the one hard break.** `next/next.config.mjs:16` pins
`connect-src ... https://unfollowr-backend.onrender.com`. The browser will block
every analytics POST to the new host until this is changed to
`https://api.unfollowr.app`. Symptom: site works perfectly, admin dashboard goes
flat, no console error the user would notice. Change it in the same commit as the
static-export config.

**2. CORS during the soak.** `analytics_api.py:24-29` allows `unfollowr.app` and
`www.unfollowr.app` — those survive cutover unchanged, so nothing breaks *at*
cutover. But the SWA preview hostname `*.azurestaticapps.net` is **not** in the
list, so while you are testing on the preview URL, analytics silently no-op
(`_cors_origin` returns `""`, `analytics_api.py:35`) *and* `NEXT_PUBLIC_API_URL`
may be unset in that build anyway (`lib/analytics.ts:6` returns early). Expect
zero events during the soak; that is correct behaviour, not a bug. Add the
`azurestaticapps.net` hostname temporarily if you want to verify the write path
end-to-end before DNS moves. Drop the two `unfollowr.com` entries while you're in
there — you don't own that domain.

**3. `next/image` and static export.** `output: 'export'` requires
`images: { unoptimized: true }` or the build fails. Then the six blog images are
fetched directly by the browser and blocked by `img-src 'self' data: blob:`. Note
they are **already broken today** for a different reason (no
`images.remotePatterns` for the Supabase host). Fix properly: add the Supabase
host to `img-src`, or download the six JPEGs into `public/` and serve them
locally. Local is better — it removes a third-party dependency from a static site.

**4. Build-time vs runtime env vars.** `NEXT_PUBLIC_API_URL` is inlined at build
time. It must be set as an `env:` on the build step in the GitHub Actions
workflow. Setting it as an SWA application setting does nothing. If you forget it,
`lib/analytics.ts:6` returns early and analytics silently vanish — the same
failure the README already documents.

**5. Silent secret fallbacks.** `SESSION_SECRET` (`app.py:55-62`) and
`ADMIN_PASSWORD_HASH` (`:66-73`) fall back to random per-boot values with only a
log warning. If you miss them in app settings, the legacy admin panel becomes
unusable with no visible error. Set all five, or delete the legacy routes.

**6. Gemini key — do not migrate it.** The live product never calls Gemini:
`ai_used: false` is hardcoded at `UploadCard.tsx:112` and `AIAssistant.tsx` makes
no network calls. The key is used only by `/api/ai/translate-query`,
`/api/ai/classify-batch`, and `/api/ai/chat` (`app.py:823`, `:861`, `:907`) —
which are public, rate-limited at 5–20/min, and would bill **your** Google account
for anyone who finds them. Leave `GEMINI_API_KEY` unset. `AI_ENABLED` goes false
(`app.py:22`) and those routes return the disabled path. Moving hosts is the
cheapest moment you will ever get to close that surface.

**7. Cold start.** `Always On` is per-app, not per-plan — the existing
`tracktoolkit` app has it, the new one won't by default. Without it, App Service
unloads the app after 20 minutes idle and the first request pays a Python boot
(~5–15 s with this dependency set). B1 supports Always On at no extra cost. Turn
it on. Cold starts are acceptable to you, but there's no reason to accept one here.

**8. Request timeouts and body size.** Live path is a sub-second insert, so this
only matters if you keep the legacy UI. App Service's front end idles out at
**230 s**; gunicorn's default worker timeout is **30 s**. `/compare` accepts 50 MB
(`app.py:79`) and runs BeautifulSoup over it — that can exceed 30 s and will be
killed. If the legacy UI stays, set `--timeout 120`. If it goes, neither number
matters. (SWA's 30 MB request cap is irrelevant — SWA serves no APIs here.)

**9. Egress.** Nothing to do. First 100 GB/mo out of Azure is free; you're at
roughly 2 GB, all of it on SWA's separately-included 100 GB.

**10. Custom domain and TLS.** SWA issues and auto-renews free managed certs for
custom domains. The backend gets `api.unfollowr.app` on App Service with a free
App Service Managed Certificate (available on Basic and above) — you have already
done exactly this for `api.soundcloudtoolkit.com`, so the pattern is proven.
**No CAA records exist on `unfollowr.app`**, so no CA is blocked from issuing.

**11. In-memory rate limiter.** `lib/rate_limiter.py` is per-process state. On one
App Service instance it behaves exactly as it does now. It would become per-replica
and effectively useless under Container Apps with `maxReplicas > 1` — note it if
you ever take the Phase 7 exit.

**12. Connection-per-request Postgres.** `psycopg2.connect()` on every insert
(`postgres_analytics.py:44`), no pooling. Fine at 3,300 req/mo against a shared
B1ms. If this ever becomes a real API, add a pool before you add traffic.

**13. Blast radius, accepted deliberately.** Unfollowr now shares a 1-core/1.75 GB
B1 plan and a Burstable B1ms database server with tracktoolkit. Resizing,
restarting, or deleting either takes both products down. The separate `unfollowr`
database and separate Web App keep the *logical* boundary clean and make the
Phase 7 exit cheap, but the physical boundary is shared. This was the explicit
trade for $0/mo.

---

## 5. Migration sequence

Render stays running — or rather, stays *unsuspended* — until Phase 6. Every
phase is independently revertible.

### Phase 0 — Preserve the data. Do this before anything else.

> **Superseded in part by §0.** The database is on **Neon**, not Render, so
> steps 1–2 below are wrong: there is nothing for Render to reclaim and nothing
> to restore. Step 1's dashboard capture is **done** (results in §0). The dump
> (steps 3–5) is still worth taking as an off-site copy and is still required
> before Phase 1, but it is no longer a race.

The services are suspended *now*, and the historical `analytics_events` table is
the only source for the README's "~2,000 unique users all-time."

1. In the Render dashboard, screenshot both services' Settings pages: build
   command, start command, runtime version, and the full env-var list. This is
   the only copy of your deploy config.
2. Restore service (or at minimum the database) enough to reach Postgres.
3. `pg_dump "$RENDER_DATABASE_URL" -t analytics_events -Fc -f unfollowr-analytics-$(date +%F).dump`
4. Verify: `pg_restore -l` on the dump lists the table, and the file is non-trivial.
5. Store it outside the repo. Do not commit it — it has hashed IPs and session IDs.

**Revert:** nothing changed. **Irreversible if skipped** — this is the only step
in the plan you cannot redo later.

### Phase 1 — Azure groundwork

1. `az group create -n rg-unfollowr -l westus3` — separate RG so unfollowr's
   own resources can be deleted in one command, even though they consume
   tracktoolkit's plan and server.
2. ~~Create the `unfollowr` database on `tracktoolkit-pg`~~ — **CANCELLED per
   §0.** The database stays on Neon (Cole's decision, 2026-09-22). No database
   is created on `tracktoolkit-pg`; the Azure backend points `DATABASE_URL` at
   the existing Neon project. This also removes the "DB role needs `CREATE`
   rights" requirement, since `ensure_schema` already ran there months ago.
3. ~~`pg_restore` the Phase 0 dump into it.~~ — **CANCELLED per §0.** The dump
   is retained as an off-site backup only.
4. Create the Application Insights component against `tracktoolkit-logs`; set the
   daily cap to 0.1 GB.

**Revert:** `az group delete -n rg-unfollowr` and `DROP DATABASE unfollowr`.
Nothing user-facing has moved.

### Phase 2 — Backend, on its azurewebsites.net hostname

1. Create Web App `unfollowr-api` on `tracktoolkit-plan`, `PYTHON|3.12`.
   (`PYTHON|3.11` matches `pyproject.toml` exactly and is supported to
   2027-10-31 if any wheel misbehaves; 3.12 buys a year.)
2. Set `Always On = true`.
3. App settings: `DATABASE_URL`, `ADMIN_SECRET`, `SESSION_SECRET`,
   `ADMIN_PASSWORD_HASH`, `ADMIN_KEY`, `FLASK_ENV=production`,
   `SCM_DO_BUILD_DURING_DEPLOYMENT=true`. **No `GEMINI_API_KEY`.**
4. Startup command `gunicorn main:app` (add `--timeout 120` only if keeping the
   legacy UI).
5. Deploy from the repo root. Verify against
   `https://unfollowr-api.azurewebsites.net`:
   - `POST /api/analytics/event` with `{"event_type":"page_view","metadata":{"path":"/smoke"}}`
     returns `{"ok": true}`, and the row lands in Postgres.
   - `GET /api/admin/kpis` with the bearer token returns real numbers **including
     the restored history**.
   - Confirm `/api/ai/chat` returns the AI-disabled response, not a Gemini call.

**Revert:** delete `unfollowr-api`. Render still serves everything.

### Phase 3 — Backend custom domain

1. Add `api.unfollowr.app` as a custom domain (CNAME + the `asuid` TXT
   validation record at name.com).
2. Bind a free App Service Managed Certificate.
3. Verify `https://api.unfollowr.app/api/analytics/event` over TLS.

**Revert:** delete the DNS records. Nothing points at `api.` yet.

### Phase 4 — Frontend, on its azurestaticapps.net hostname

1. In `next/next.config.mjs`, one commit:
   - `output: 'export'`
   - `images: { unoptimized: true }`
   - CSP `connect-src`: replace `https://unfollowr-backend.onrender.com` with
     `https://api.unfollowr.app`
   - fix the blog images (download to `public/`, or extend `img-src`)
2. Delete `app/api/health/route.ts` and `app/api/metrics/route.ts` — static export
   cannot emit them, and both are dead (metrics validates and discards;
   `lib/metrics.ts` is the only caller and it's unused).
3. Optional and free: delete the 1.38 MB unreferenced
   `public/unfollowr-logo-clean.png`, plus `erasebg-transformed.png` and
   `unfollowr-logo.png`.
4. `npm run build` → confirm `out/`. Expect ~3 MB, far under the 250 MB Free-plan
   limit.
5. Create the Static Web App (Free, West US 2) with a GitHub Actions workflow;
   set `NEXT_PUBLIC_API_URL=https://api.unfollowr.app` as **build-step env**.
6. Verify on the `*.azurestaticapps.net` URL: all 16 routes render, upload flow
   works end-to-end against the sample files, results page populates. **Analytics
   will not record** — see §4 item 2. That is expected.

**Revert:** `git revert` the config commit; Render still serves the live site.

### Phase 5 — DNS cutover

See §6.

### Phase 6 — Soak, then decommission

1. Watch 48 hours: App Insights failure rate, `SELECT count(*) FROM
   analytics_events WHERE created_at > now() - interval '1 day'` tracking against
   historical daily volume, Search Console for crawl errors on the guides/blog
   routes.
2. Only then: take a final `pg_dump`, delete the Render services and database.

**Revert window closes here.** Do not skip the 48 hours.

### Phase 7 — Optional, later: decouple the backend

If tracktoolkit ever needs to move, resize, or go away, the exit is: register
`Microsoft.App`, add a Dockerfile, push to `ghcr.io`, create a Container Apps
environment with `minReplicas: 0`, repoint `api.unfollowr.app`. Still $0 within
the free grant. Nothing in Phases 1–6 makes this harder — which is the point of
the separate resource group and separate database.

---

## 6. DNS cutover and rollback for unfollowr.app

DNS is at **name.com** (`ns1cny`/`ns2kqz`/`ns3jmt`/`ns4lpv.name.com`), not
Cloudflare — the Cloudflare in the current response chain is Render's own CDN.

**Current authoritative records:**

| Name | Type | Value | TTL |
|---|---|---|---|
| `www.unfollowr.app` | CNAME | `unfollowr-frontend.onrender.com` | **300** |
| `unfollowr.app` | A | `216.24.57.16`, `216.24.57.18` | **34** |

**No TTL lowering is needed.** `www` is already at 300 s. The apex answers with a
34-second TTL, which strongly suggests name.com is flattening an ALIAS/ANAME
record rather than serving literal A records — **confirm this in the name.com
panel during Phase 3**, because it decides the apex strategy below. No TXT and no
CAA records exist at the apex, so validation and cert issuance are unobstructed.

### Order

1. **Ownership validation first, while Render still serves traffic.** Add the SWA
   TXT token at `@`, and the App Service `asuid.api` TXT. These are additive and
   change nothing for users. Wait for Azure to show both domains validated.
2. **`www` first.** Repoint `www.unfollowr.app` CNAME → `<name>.azurestaticapps.net`.
   Converged in ~5 minutes at TTL 300. This is the real cutover — `www` is the
   canonical host (`app/layout.tsx:2` sets `metadataBase`, `sitemap.ts:4` and
   `robots.ts:11` both use `www`).
3. **Apex second, after `www` is verified good.** Three options, in order of
   preference:
   - **ALIAS/ANAME at name.com** → `<name>.azurestaticapps.net`. Keeps global
     distribution. Use this if step 1's investigation confirms support.
   - **Forward apex → `www`.** Matches today's behaviour exactly (the apex
     currently 301s to `www`). Zero risk, fully reversible, and costs nothing
     since no traffic lands on the apex anyway.
   - **A record → the SWA `stableInboundIP`.** Last resort: it pins you to one
     regional host and forfeits global distribution. Apex changes can take up to
     72 hours to propagate.
4. `api.unfollowr.app` CNAME was already set in Phase 3 and is independent of
   both.

### Rollback

Revert the `www` CNAME to `unfollowr-frontend.onrender.com` (and the apex to its
prior state). Full propagation in **≤5 minutes** at TTL 300. Render services must
still exist and be unsuspended — that is why Phase 6 comes last.

**Trigger rollback if, within 60 minutes of the `www` cutover, any of:**

- `https://www.unfollowr.app/` returns non-200, or serves the SWA 404 page rather
  than the app;
- the upload → results flow fails on a real Instagram export (test with your own
  before declaring success — the parser has no test coverage, per the README);
- the TLS cert is not yet issued and browsers show a name mismatch;
- `analytics_events` records **zero** new rows in 60 minutes while the site is
  reachable — that means the CSP or `NEXT_PUBLIC_API_URL` change didn't land, and
  it is worth rolling back rather than flying blind.

Do **not** roll back for: the six broken blog images (already broken), a missing
`/api/health` (deliberately deleted), or a cold start on the first backend request.

---

## 7. IaC and CI/CD

**Bicep, not azd, not Terraform.** azd's value is scaffolding a greenfield
environment end to end; here three of the four resources attach to infrastructure
that already exists outside any azd environment (`tracktoolkit-plan`,
`tracktoolkit-pg`, `tracktoolkit-logs`), which is exactly the case azd handles
worst. Terraform means state to host and reconcile for four resources. Bicep is
ARM-native, needs no state backend, and expresses "a `Microsoft.Web/sites` whose
`serverFarmId` points at an existing plan in another resource group" in one line.

Keep it to one file, `infra/main.bicep`, covering: the Web App (with
`serverFarmId` referencing `tracktoolkit-plan`), its app settings, the Static Web
App, and the Application Insights component. **Leave the database out of Bicep** —
it is one `CREATE DATABASE` against a server this template doesn't own, and
declaring it invites a template to drop it.

**Two GitHub Actions workflows**, both path-filtered so a frontend change never
redeploys the backend:

| Workflow | Triggers on | Does |
|---|---|---|
| `frontend.yml` | `next/**` | `npm ci`, `npm run build` with `NEXT_PUBLIC_API_URL` in the build env, deploy `next/out` via `Azure/static-web-apps-deploy` |
| `backend.yml` | `app.py`, `lib/**`, `analytics_api.py`, `admin_analytics.py`, `ai_classifier.py`, `requirements.txt`, `data/**` | `azure/webapps-deploy` to `unfollowr-api` |

**Auth: OIDC federated credentials, no client secret.**

1. Register an app in Entra ID; grant it Contributor on `rg-unfollowr` **and**
   Contributor scoped to the `tracktoolkit` **Web App and plan only** — not the
   whole `rg-tracktoolkit`. The deploy identity must not be able to touch
   tracktoolkit's database or Key Vault.
2. Add a federated credential: issuer `https://token.actions.githubusercontent.com`,
   subject `repo:cole-hackman/unfollowr:ref:refs/heads/main`, audience
   `api://AzureADTokenExchange`.
3. Workflow permissions: `id-token: write`, `contents: read`. Use `azure/login@v2`
   with `client-id`/`tenant-id`/`subscription-id` as repo variables — **no
   `AZURE_CREDENTIALS` secret, no password to rotate or leak.**

SWA's default workflow ships a deployment token instead. Replace it with the OIDC
login, or at minimum keep the token in GitHub Secrets and understand it is a
long-lived credential scoped to that one app.

The repo has **no CI today and no tests** (per the README). Nothing here changes
that; the parser fixture tests the README names as priority #1 remain the single
highest-value thing you could add, and would be the natural first job in
`frontend.yml`.

---

## 8. Cost guardrails

**No budgets exist on this subscription today** (`az consumption budget list`
returns empty). Set these before Phase 2:

1. **Subscription budget, $40/month** — roughly 1.4x the ~$28 steady state.
   Alerts at 50%, 80%, 100% actual and 100% forecast, to
   `colehackman111@gmail.com`. $40 is high enough not to nag and low enough that
   a runaway resource trips it within days.
2. **App Insights daily cap, 0.1 GB/day.** Hard stop, not an alert. At $2.30/GB
   past the 5 GB monthly free grant, this caps the worst case at ~$7/mo even if
   something starts logging in a loop. Enable sampling.
3. **SWA bandwidth alert at 50 GB/month.** Free-plan overage is *unavailable*, not
   billed — past 100 GB the site is throttled. 50 GB is a 25x jump from current
   usage; if you see it, flip Free → Standard in the portal ($9/mo, no redeploy,
   no downtime) rather than wait for the cap.
4. **Cost anomaly alert** on the subscription. Catches shape changes a fixed
   threshold misses.
5. **Quarterly review of `analytics_events` size.** At 12 MB/year this is
   theatre for now, but it's the only line that grows unattended.

### If credits run out while the app is live

This is a **Sponsored** subscription (`quotaId: Sponsored_2016-01-01`) with the
**spending limit off**, under a Microsoft Customer Agreement. Sponsorship credits
expire on a date, not just on exhaustion, and when a sponsorship balance is
depleted or expires the subscription is typically **disabled** rather than
silently converted to paid — which would take unfollowr and tracktoolkit down
together. With the spending limit off, the alternative outcome is charges falling
to the payment method on file. **Confirm which applies** at
`https://www.microsoftazuresponsorships.com` — the CLI does not expose the
sponsorship balance or expiry, and this is the single most important unknown in
this plan.

Have this ready before it matters:

- **Frontend:** SWA Free is $0 and independent of credit state only insofar as the
  subscription stays enabled. If the subscription is disabled, the static site
  goes too — so keep the `out/` build reproducible from a single `npm run build`.
  It is 3 MB of static files; Cloudflare Pages, Netlify, or GitHub Pages will host
  it for free within an hour, and the only change needed is the CSP `connect-src`.
- **Backend:** at ~3,300 requests/month the analytics endpoint can run anywhere.
  This is the component worth *losing* rather than paying to keep — the product
  works with the backend fully down (`lib/analytics.ts:12` swallows the error and
  `UploadCard` never awaits it).
- **Database:** keep the `pg_dump` from Phase 0 current. Add a monthly dump to the
  backend workflow, or run it by hand each quarter. 12 MB/year fits anywhere.

The honest ordering if credits vanish: keep the static site, dump the database,
drop the backend. The product survives losing two of the three.

---

## 9. Open questions

1. **Sponsorship balance and expiry date.** **STILL OPEN — Cole only.** Not
   exposed by the Azure CLI. This determines whether "credits as a budget" means
   6 months or 3 years of runway and whether §8's disable-vs-bill question
   matters soon. *Assumed:* enough runway that a $0-marginal plan is the right
   shape regardless. *(Now partly de-risked: with the database staying on Neon
   per §0, a subscription outage costs the backend and the static host, not the
   data.)*
2. ~~**The actual Render build and start commands.**~~ **ANSWERED 2026-09-22**
   — captured from the dashboard, see §0. Backend
   `uv sync --frozen && uv cache prune --ci` / `gunicorn app:app --preload
   --workers 2 --timeout <N>`; frontend `npm ci && npm run build` / `npm start`
   with root directory `next`. **Both §1 inferences were wrong** — it is uv, not
   pip, and `app:app`, not `main:app`.
3. **Does name.com support ALIAS/ANAME?** The apex's 34-second TTL suggests record
   flattening, but I could not confirm it from outside. *Assumed:* if not, the
   forward-apex-to-`www` option reproduces today's behaviour exactly at no cost.
4. **Is the legacy Flask UI worth deploying at all?** `app.py` is 50 KB of routes
   nothing in the live product calls. Keeping it preserves a URL someone may have
   bookmarked and forces `--timeout 120` plus the 50 MB upload surface. *Assumed:*
   deploy it unchanged in Phase 2 so the migration is a pure lift — but deleting
   it afterwards drops `beautifulsoup4`, `trafilatura`, `google-generativeai`, and
   `google-genai` from the install, and closes the unauthenticated `/api/ai/*`
   endpoints permanently. That is the README's own "What I'd do next" item #3.
   **Update 2026-09-22 (§0):** the case for deleting is stronger than this entry
   assumed — `SESSION_SECRET`, `ADMIN_PASSWORD_HASH` and `ADMIN_KEY` are all
   unset in production, so the legacy admin panel is *already* non-functional
   behind random per-boot secrets, and `GEMINI_API_KEY` is unset so `/api/ai/*`
   is *already* disabled. Deploying it "unchanged" preserves nothing that works.
5. ~~**Was `NEXT_PUBLIC_API_URL` actually set in the Render frontend build?**~~
   **ANSWERED 2026-09-22 — yes.** Set to `https://unfollowr-backend.onrender.com`.
   `max(created_at)` is **2026-09-21 16:44:26 UTC**, which is the moment Render
   suspended; 26,804 rows from 2026-03-20 onward. The traffic numbers in this
   document and the README are real. See §0. *(New finding: `session_id` is
   per-request, not per-session — use `ip_hash` for unique users.)*
6. **`unfollowr.com`.** It resolves to `13.223.25.84` on `namebrightdns.com` and is
   not yours, yet it sits in the CORS allowlist. *Assumed:* dead entries to delete.
   If you intend to buy it, the SWA **Free plan allows only 2 custom domains**,
   which `unfollowr.app` and `www.unfollowr.app` already consume — that alone
   would force the $9/mo Standard plan.
7. **Traffic figures.** Page-view volume is derived from "~1,000 monthly users"
   times an assumed 3 pages/session; SWA bandwidth is derived from a 250 KB page
   weight measured off the production build. Both are within an order of magnitude
   of anything that would change a decision here — every line stays $0 until
   traffic is roughly 25x higher.
