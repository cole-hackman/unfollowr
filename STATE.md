# STATE — Unfollowr Azure migration

**Last updated:** 2026-09-22
**Spec:** `docs/azure-migration-plan.md` — written 2026-09-22, amended the same
day with a `§0 Field corrections` section; §0 overrides the rest where they disagree.
**Executing:** phase by phase, one commit per phase.

---

## Situation

Unfollowr is **down**. Both Render services are suspended and return `503`
with `x-render-routing: suspend` (verified by curl, 2026-09-22 12:06 UTC).
The apex still `301`s to `www` via Render's Cloudflare edge.

Migrating to Azure is the fix. Target: $0/mo marginal, attaching the backend to
the existing `tracktoolkit-plan` B1. The **database is not moving** — it is on
Neon and always was (see Decisions #1), so `tracktoolkit-pg` is not involved.

---

## Phase status

| Phase | What | Status |
|---|---|---|
| 0 | Preserve Render config + `pg_dump` analytics_events | **COMPLETE & VERIFIED** 2026-09-22 |
| 1 | Azure groundwork (RG + App Insights; **DB steps cancelled**) | **COMPLETE & VERIFIED** 2026-09-22 |
| 2 | Backend Web App on `tracktoolkit-plan` | Next up — **3 open decisions, see below** |
| 3 | `api.unfollowr.app` custom domain + cert | Not started |
| 4 | Frontend Static Web App | Not started — **has a known spec defect, see Open items** |
| 5 | DNS cutover | Not started — **approval gate** |
| 6 | Soak 48h, then decommission Render | Not started — **approval gate** |
| 7 | Optional: decouple backend to Container Apps | Out of scope for now |

---

## Cost reality (verified 2026-09-23)

| | |
|---|---|
| Actual subscription spend, 2026-09-01 → 09-23 | **$2.97** (~$4/mo run rate) |
| Plan §3's claimed steady state | ~$28/mo — **retail list prices, not the bill** |
| Existing budget | `polyeats-monthly-budget`, **$20/mo, subscription-wide** |
| Unfollowr's marginal compute cost | **$0** — Phase 1 created no compute; Phase 2 attaches to the existing `tracktoolkit-plan` B1 |

`tracktoolkit-plan` is a B1 Basic, 1 worker, currently hosting **1 site**.
Adding `unfollowr-api` makes it 2 sites on one 1-core/1.75 GB instance — no
extra charge, but shared CPU and memory (plan §4 item 13).

**The subscription now hosts three products, not two.** `rg-polyeats-prod`
appeared between 2026-09-22 and 2026-09-23 (Y1 Consumption Function App,
storage, Key Vault, Log Analytics, action group, alert — West US 2). It was not
there when this migration was scoped. Not touched; noted because the $20 budget
is shared across all three.

---

## Verified facts (read-only checks, 2026-09-22)

- Azure CLI logged in as `colehackman111@gmail.com`, subscription
  `14ca6838-7957-4a50-8bbc-63d2ce5c1a82` ("Azure subscription 1"), state **Enabled**.
- Only one resource group exists: `rg-tracktoolkit` (westus3), containing
  `tracktoolkit-plan`, `tracktoolkit-pg`, `tracktoolkit-logs`, `tracktoolkit-kv`,
  the `tracktoolkit` web app, and 5 domain/cert resources.
  **`rg-unfollowr` does not exist yet.**
- Local tooling present: `az` 2.90.0, `psql`/`pg_dump`/`pg_restore` 17.7,
  `gh` 2.90.0, node 26, npm 11.12.1, python3 3.13.7.
- **No Render CLI, no `.env` files, no Render credentials anywhere locally.**
  Phase 0 is therefore fully blocked on Cole.
- The plan's code citations all check out against the repo:
  `DATABASE_URL` at `lib/postgres_analytics.py:37`, the early-return on unset
  `NEXT_PUBLIC_API_URL` at `next/lib/analytics.ts:5`, the Render-pinned CSP
  `connect-src` in `next/next.config.mjs:16`, `main.py` exposing `app`.

---

## Phase 0 findings (captured 2026-09-22 from the Render dashboard)

### The database is on Neon, not Render — the plan's core premise is wrong

`DATABASE_URL` on `unfollowr-backend` is `postgresql://neondb_owner:npg_...`.
The analytics DB is a **Neon** project named "Unfollowr"
(`empty-water-98804719`, PG 17, `aws-us-west-2`, created 2026-03-20).
Compute was last active **2026-09-21T16:44Z**.

**Render suspension never threatened this data.** The plan's Phase 0 urgency
("before Render reclaims the suspended database") rests on a false premise.
There is no Render Postgres at all — the Unfollowr project contains exactly
two web services and zero databases (`Env Groups (0)`, no DB resource).

### Open question #5 — ANSWERED: analytics were recording correctly

`NEXT_PUBLIC_API_URL` **was** set on the Render frontend, to
`https://unfollowr-backend.onrender.com`. The data confirms it:

| | |
|---|---|
| Total rows | **26,804** |
| Earliest | 2026-03-20 01:42:07 UTC |
| **`max(created_at)`** | **2026-09-21 16:44:26 UTC** |
| Staleness at time of check | 19h 34m — i.e. it stopped exactly when Render suspended |

So the traffic numbers are **real**, not phantom. The README's figures stand.

Breakdown:

| event_type | rows | distinct ip_hash |
|---|---|---|
| `page_view` | 22,749 | 9,661 |
| `analysis_run` | 4,055 | 2,180 |

Note `count(DISTINCT session_id) == count(*)` for both event types —
`session_id` is regenerated per request, so it is **not** a session identifier.
Unique-user counts must use `ip_hash`. "~2,000 unique users all-time" in the
README corresponds to the 2,180 distinct `ip_hash` values that ran an analysis.

Monthly volume: 2,757–6,460 rows/mo (avg ~3,800), 1,024–2,033 unique IPs/mo.
~1 MB/month of metadata, 42 MB total Neon storage. The plan's cost model
(~3,300 rows/mo, ~1 MB/mo) holds.

### Open question #2 — ANSWERED: the real Render commands

Both services are **Free** plan, Oregon, repo `cole-hackman/unfollowr`, branch
`main`, auto-deploy On Commit, no pre-deploy command, no health check path.

| | `unfollowr-backend` | `unfollowr-frontend` |
|---|---|---|
| Runtime | Python 3 | Node |
| Root directory | *(repo root)* | `next` |
| Build command | **`uv sync --frozen && uv cache prune --ci`** | **`npm ci && npm run build`** |
| Start command | **`gunicorn app:app --preload --workers 2 --timeout 120`** | **`npm start`** |
| Deployed commit | `3a3fef0` | `6662d67` (~4 months old) |
| Env vars | `ADMIN_SECRET`, `DATABASE_URL` | `ADMIN_SECRET`, `NEXT_PUBLIC_API_URL` |

**Two corrections to the plan:**

- Build is **`uv sync --frozen`** against `uv.lock`, *not*
  `pip install -r requirements.txt`. Phase 2 must either install `uv` on App
  Service or export the lock to a requirements file. `SCM_DO_BUILD_DURING_DEPLOYMENT`
  runs pip, so this is a real Phase 2 change, not a detail.
- Start is **`gunicorn app:app`**, *not* `main:app`. Both work (`main.py` does
  `from app import app`), but the deployed reality is `app:app`, plus
  `--preload --workers 2` — note **2 workers on a 1-core B1**, and `--preload`
  interacts with the per-process rate limiter (`lib/rate_limiter.py`).

### Suspension cause — not what the plan assumed

Both services show **"Free usage limit reached — Your service is now suspended
until the next billing period."** This is Render free-tier instance-hour
exhaustion, not non-payment and not a manual suspension. It **auto-resumes at
the next billing period**. Nothing is being reclaimed or deleted.

### Env vars: only 2 of the plan's 9 are actually set

`SESSION_SECRET`, `ADMIN_PASSWORD_HASH`, `ADMIN_KEY`, `FLASK_ENV`, and
`GEMINI_API_KEY` are **all unset in production today**. Consequences:

- `GEMINI_API_KEY` unset ⇒ `AI_ENABLED` is already false. Plan §4 item 6's
  warning ("do not migrate the key") is moot — there is no key to migrate, and
  the `/api/ai/*` surface is already closed.
- `SESSION_SECRET` / `ADMIN_PASSWORD_HASH` have been falling back to random
  per-boot values in production all along, exactly as `app.py:55-73` warns.
  The legacy Flask admin panel is therefore already non-functional in prod.

---

## Open items / spec defects found

1. **Phase 4 CSP fix is a no-op as written.** The plan says to change
   `connect-src` in `next/next.config.mjs`. But `output: 'export'` does not
   apply `headers()` — confirmed in the installed Next 14.2.10 source
   (`next/node_modules/next/dist/export/index.js`): *"rewrites, redirects, and
   headers are not applied when exporting your application."* Under static
   export the site ships with **no CSP, no HSTS, no X-Frame-Options at all**.
   Those headers have to move to a `staticwebapp.config.json` `globalHeaders`
   block — a new file the plan does not call out. Needs Cole's sign-off
   (approval gate #3). Not yet raised as resolved.

2. ~~**The `pg_dump` is blocked.**~~ **RESOLVED** — Cole ran it locally
   2026-09-22; verified below.

3. **Open question #1 — sponsorship balance and expiry** — only Cole can check
   at microsoftazuresponsorships.com. Biggest unknown in the plan.

4. ~~**Decision needed: does the database move to Azure at all?**~~ **DECIDED —
   stays on Neon.** See Decisions #1.

5. ~~**Backend start-command tail not captured.**~~ **RESOLVED** — Cole
   confirmed `--timeout 120` (2026-09-22). Full command:
   `gunicorn app:app --preload --workers 2 --timeout 120`. Note this is already
   what plan §4 item 8 recommends, and is well inside App Service's 230 s
   front-end idle timeout.

---

## Phase 0 verification evidence (2026-09-22)

Dump taken by Cole from the **unpooled** Neon endpoint, stored outside the repo
at `~/Developer/unfollowr-backups/unfollowr-analytics-2026-09-22.dump`
(1.5 MB, PostgreSQL custom format v1.16-0, source PG 17.11, pg_dump 17.7).
Confirmed not tracked by git.

`pg_restore -l` lists the table, its data, sequence, primary key and both
indexes (`idx_analytics_created_at`, `idx_analytics_event_type`).

Contents verified by decoding the dump's own `COPY` stream — not just the TOC:

| Measure | Live Neon DB | Inside the dump | |
|---|---|---|---|
| Rows | 26,804 | **26,804** | match |
| `min(created_at)` | 2026-03-20 01:42:07 | **2026-03-20 01:42:07.578332+00** | match |
| `max(created_at)` | 2026-09-21 16:44:26 | **2026-09-21 16:44:26.030056+00** | match |
| `page_view` | 22,749 | **22,749** | match |
| `analysis_run` | 4,055 | **4,055** | match |

Every figure matches, `max(created_at)` to the microsecond. **Phase 0 is done.**

---

## Phase 1 verification evidence (2026-09-22)

Two resources created, both in `rg-unfollowr`. Nothing else touched.

```
az group create -n rg-unfollowr -l westus3          → provisioningState: Succeeded
az monitor app-insights component create ...        → provisioningState: Succeeded
az monitor app-insights component billing update    → cap: 0.1
```

`unfollowr-insights` (westus3, `rg-unfollowr`):

| Property | Value |
|---|---|
| `ingestionMode` | `LogAnalytics` (workspace-based, as the plan requires) |
| `workspaceResourceId` | `…/rg-tracktoolkit/…/workspaces/tracktoolkit-logs` |
| Daily cap | **0.1 GB**, warning at 90%, email on cap enabled |
| `retentionInDays` | 90 |
| `applicationType` / `kind` | `web` / `web` |

**Boundary check — `tracktoolkit` was not modified.** Re-read after the work:

| `tracktoolkit-logs` | Before | After |
|---|---|---|
| `sku` | PerGB2018 | PerGB2018 |
| `retentionInDays` | 30 | 30 |
| `workspaceCapping.dailyQuotaGb` | -1 (uncapped) | **-1 (uncapped)** |
| `modifiedDate` | — | **2026-09-20T16:58:56Z** (two days before this session) |

`rg-tracktoolkit` still contains exactly its original **10** resources. The
0.1 GB cap is on the *component*, never on the shared workspace — capping the
workspace would have throttled tracktoolkit's logging too.

### Two things Phase 1 did NOT deliver, stated plainly

1. **Sampling is not enabled.** The plan's §2 says "sampling on", but
   `samplingPercentage` is `None` on the component. For a Python/Flask app,
   sampling is an SDK-side setting, not a component property — it belongs to
   whatever gets wired up in Phase 2. At ~3,300 requests/month it is moot for
   cost; the 0.1 GB daily cap is the hard stop that actually matters.

2. **App Insights currently receives nothing, and will keep receiving nothing
   until Phase 2 wires it up.** The plan never says *how* the Flask app emits
   telemetry, and the backend has **zero** telemetry dependencies —
   `grep -icE 'azure-monitor|opencensus|opentelemetry|applicationinsights'`
   returns 0 across `pyproject.toml`, `requirements.txt` and `uv.lock`. The
   component is a correctly-configured, empty sink. Resolving this is a Phase 2
   decision (see below) and involves a code change.

---

## Decisions

1. **2026-09-22 — The analytics database stays on Neon.** It is not migrated to
   `tracktoolkit-pg`. Plan Phase 1 steps 2–3 are cancelled; the Azure backend
   will point `DATABASE_URL` at the existing Neon project
   (`empty-water-98804719`). Rationale: the plan's migration was justified by a
   Render-reclaim risk that does not exist — the DB was never on Render. Neon is
   free, PG 17, already serving this table. Staying removes a migration step and
   a data-loss window, and keeps unfollowr's data blast radius away from
   tracktoolkit. Cost unchanged at $0. *(Cole's call, load-bearing — do not
   revisit without asking.)*

2. **2026-09-22 — The Phase 4 security headers move to `staticwebapp.config.json`.**
   `next.config.mjs` `headers()` is not applied under `output: 'export'`, so the
   plan's CSP edit would be a no-op and the site would ship with no CSP/HSTS/
   X-Frame-Options. Recorded in plan §0. *(Cole approved writing this into the
   plan.)*

4. **2026-09-23 — No new Azure budget.** Plan §8 item 1 (a $40/month
   subscription budget) is cancelled. Its two premises were both false: a
   subscription-scoped budget already exists (`polyeats-monthly-budget`, $20/mo,
   `filter: None`, alerting at 25/50/75% + 100% forecast to
   colehackman111@gmail.com), and the "~$28/mo steady state" it was sized
   against was computed from Azure **retail list prices**, not this
   subscription's actual bill. Real month-to-date spend is **$2.97** across
   22 days (~$4/mo run rate) on a Sponsored subscription. A second budget would
   only duplicate alerts at a looser threshold.

3. **2026-09-22 — Cole takes the `pg_dump` himself.** Claude's
   `get_connection_string` call was denied by the auto-mode classifier
   (`[Credential Materialization]`). Running it locally keeps the Neon role
   password out of the transcript, which is the better outcome anyway. Claude
   verifies the resulting file.

---

## Next action

**Phases 0 and 1 are complete and committed.** Outstanding:

1. **Cole checks the sponsorship balance/expiry** at
   microsoftazuresponsorships.com (plan open question #1, still the biggest
   unknown). Now lower stakes: with the DB on Neon, a subscription outage costs
   compute and hosting, not data.

### Phase 2 — three decisions needed before provisioning

1. **How the backend installs dependencies.** Production builds with
   `uv sync --frozen` against `uv.lock`; App Service's
   `SCM_DO_BUILD_DURING_DEPLOYMENT` runs **pip** against `requirements.txt`,
   which is *not* the lock (it is loose `>=` pins). Deploying as-is would
   silently install a different dependency set than has been running for six
   months. Proposed: `uv export --frozen --no-dev -o requirements.txt` at build
   time so the pinned versions survive. **Touches a file the plan doesn't call
   out — needs Cole's approval.**

2. **Whether to wire up App Insights at all, and how.** Options: add
   `azure-monitor-opentelemetry` + `configure_azure_monitor()` to the Flask app
   (a code change), use App Service auto-instrumentation for Python, or accept
   the component stays empty for now and revisit. **Needs Cole's call.**

3. **Whether the legacy Flask UI ships.** Plan open question #4. §0 strengthened
   the case for deleting it: the admin panel is already non-functional (random
   per-boot secrets) and `/api/ai/*` is already disabled (no Gemini key), so
   deploying it "unchanged" preserves nothing that works — while keeping a
   50 MB upload surface and the `--timeout 120` requirement.

**The plan's $40/month budget is cancelled** (Decision #4) — a subscription-wide
$20 budget already exists and is tighter. Nothing to do here.

### Housekeeping note

The Neon connection string, including the `neondb_owner` password, was pasted
into the session transcript when the dump was run. It is worth rotating in the
Neon console once the Azure backend is cut over and its `DATABASE_URL` app
setting is being written anyway — so the rotation costs one extra paste rather
than a separate deploy.
