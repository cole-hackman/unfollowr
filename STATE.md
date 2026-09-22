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
| 1 | Azure groundwork (RG + App Insights; **DB steps cancelled**) | Next up |
| 2 | Backend Web App on `tracktoolkit-plan` | Not started |
| 3 | `api.unfollowr.app` custom domain + cert | Not started |
| 4 | Frontend Static Web App | Not started — **has a known spec defect, see Open items** |
| 5 | DNS cutover | Not started — **approval gate** |
| 6 | Soak 48h, then decommission Render | Not started — **approval gate** |
| 7 | Optional: decouple backend to Container Apps | Out of scope for now |

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
| Start command | **`gunicorn app:app --preload --workers 2 --timeou…`** *(truncated in UI — tail not yet captured)* | **`npm start`** |
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

5. **Backend start-command tail not captured.** The Render UI truncates it at
   `--timeou…`. Everything before is confirmed. Tab left open at the backend
   Settings page for Cole to read the last few characters.

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

3. **2026-09-22 — Cole takes the `pg_dump` himself.** Claude's
   `get_connection_string` call was denied by the auto-mode classifier
   (`[Credential Materialization]`). Running it locally keeps the Neon role
   password out of the transcript, which is the better outcome anyway. Claude
   verifies the resulting file.

---

## Next action

**Phase 0 is complete and committed.** Outstanding before Phase 1:

1. **Cole reads the tail of the backend start command** — Render's UI truncates
   at `--timeou…`; the Settings page is open in Chrome.
2. **Cole checks the sponsorship balance/expiry** at
   microsoftazuresponsorships.com (plan open question #1, still the biggest
   unknown). Now lower stakes: with the DB on Neon, a subscription outage costs
   compute and hosting, not data.

### Phase 1, once unblocked

Reduced to two resources by Decision #1:

1. `az group create -n rg-unfollowr -l westus3`
2. Application Insights against the existing `tracktoolkit-logs` workspace,
   sampling on, daily cap 0.1 GB.

The plan's Phase 1 steps 2–3 (create + restore the database on
`tracktoolkit-pg`) are cancelled.

### Housekeeping note

The Neon connection string, including the `neondb_owner` password, was pasted
into the session transcript when the dump was run. It is worth rotating in the
Neon console once the Azure backend is cut over and its `DATABASE_URL` app
setting is being written anyway — so the rotation costs one extra paste rather
than a separate deploy.
