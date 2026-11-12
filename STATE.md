# STATE: unfollowr

Rewritten 2026-11-12. History: `docs/log/2026-09.md`. Plan: `docs/azure-migration-plan.md`. Ship policy: `CLAUDE.md`.

## Now (2026-11-12)

Live on Azure since 2026-09-23 (Render suspended it; about 2 days down). `www` serves. The apex does not.
Stack: Next.js static export (`next/`) on Static Web App `unfollowr-web`; Flask analytics API (`wsgi.py` -> `analytics_api.py`) on App Service `unfollowr-api`; Postgres on Neon. Azure resources are in `rg-unfollowr`.
Git: the 10 commits ahead of `origin/main` (migration phases and docs) are on `origin/azure-migration` and local `main`, not on `origin/main` (it moved on by README PRs #1 and #2). This handoff is a PR into `azure-migration`.

| URL checked with curl on 2026-11-12 | Result |
|---|---|
| https://www.unfollowr.app | 200, no redirect |
| http://www.unfollowr.app | redirects once to https://www.unfollowr.app, then 200 |
| https://unfollowr.app | TLS verify fails (curl 60): cert is `*.msha-slice-2-wus2-0-ase.p.azurewebsites.net`; with `-k`, 404 |
| http://unfollowr.app | 404 |
| https://api.unfollowr.app | 404 on `/`; `OPTIONS /api/analytics/event` returns 204 with `Access-Control-Allow-Origin: https://www.unfollowr.app` |

Deploy: no CI, no GitHub link on the Static Web App; both halves are deployed by hand with `az`. The exact commands were not recorded. Known: frontend build is `NEXT_PUBLIC_API_URL=https://api.unfollowr.app npm run build` (output `out/`, headers from `next/public/staticwebapp.config.json`); backend startup is `gunicorn wsgi:app --workers 2 --timeout 120`, App Service builds with pip from `requirements.txt` (regenerate: `uv export --frozen --no-dev --no-hashes --no-emit-project -o requirements.txt`).

## Next

1. Cole: fix the apex. `unfollowr.app` resolves to 20.80.136.242 (an azurewebsites stamp), not the Static Web App (20.72.253.180). Intended: ANAME `@` -> `lemon-smoke-00821241e.2.azurestaticapps.net` at name.com, and the apex bound as a custom domain on `unfollowr-web`.
2. Cole: decide how `origin/azure-migration` reaches `main` (merge `origin/main` into it first; it is README only), so GitHub shows the live code.
3. Not approved, do not do without Cole: SM-UF-2 drop the `unfollowr.com` origins (`analytics_api.py:26-27`) and redeploy; SM-UF-3 decommission Render; SM-UF-4 deploy runbook.

## Decisions

Older decisions, equally binding: docs/decisions.md (6 entries)

1. **2026-09-22 — The analytics database stays on Neon.** It is not migrated to
   `tracktoolkit-pg`. Plan Phase 1 steps 2–3 are cancelled; the Azure backend
   will point `DATABASE_URL` at the existing Neon project
   (`empty-water-98804719`). Rationale: the plan's migration was justified by a
   Render-reclaim risk that does not exist — the DB was never on Render. Neon is
   free, PG 17, already serving this table. Staying removes a migration step and
   a data-loss window, and keeps unfollowr's data blast radius away from
   tracktoolkit. Cost unchanged at $0. *(Cole's call, load-bearing — do not
   revisit without asking.)*

## Landmines

- Apex is down over HTTPS (see table). Cause not diagnosed: Azure was not queried on 2026-11-12.
- `ADMIN_SECRET` is unset in production: `GET https://api.unfollowr.app/api/admin/kpis` returns 403 "admin secret not configured" (2026-11-12). The admin dashboard cannot work until Cole sets it.
- `ALLOWED_ORIGINS` (`analytics_api.py:23-30`) still lists `unfollowr.com` and `www.unfollowr.com`, with credentialed CORS. That domain is not Cole's.
- Render is not verified: its two `onrender.com` hosts timed out at 20 s on 2026-11-12. Rollback to Render is impossible (the old DNS records were lost 2026-09-23). Delete nothing on Render without Cole.
- The Neon `neondb_owner` password was pasted into a 2026-09-22 session transcript; no rotation is recorded (see "Housekeeping note" in `docs/log/2026-09.md`).
- Commits such as `054430f` carry a Co-Authored-By Claude trailer. History is not rewritten.

## Verify

`curl -sI https://www.unfollowr.app` is 200 and `curl -s` shows the changed text; the OPTIONS call above returns 204 with the origin header; `curl -sSI https://unfollowr.app` succeeds without `-k`.
