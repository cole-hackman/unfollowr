# Decisions

Settled choices, equally binding with the Decisions section of STATE.md. Moved word for word from STATE.md on 2026-11-12 (original numbering and order kept).

2. **2026-09-22 — The Phase 4 security headers move to `staticwebapp.config.json`.**
   `next.config.mjs` `headers()` is not applied under `output: 'export'`, so the
   plan's CSP edit would be a no-op and the site would ship with no CSP/HSTS/
   X-Frame-Options. Recorded in plan §0. *(Cole approved writing this into the
   plan.)*

7. **2026-09-23 — The legacy Flask UI is not served.** A new `wsgi.py`
   registers only the analytics blueprint; `app.py` is left untouched in the
   repo. Justification: `analytics_api.py` is a self-contained Blueprint whose
   entire transitive dependency set is flask + werkzeug + psycopg2, so the split
   is clean. The live product's whole server surface is those 5 endpoints.
   Dropping the 14 legacy routes removes a 50 MB upload surface running
   BeautifulSoup and the unauthenticated `/api/ai/*` endpoints from a B1 that is
   **shared with tracktoolkit** — that shared blast radius is what tipped it.
   No user-facing bookmark is affected: the legacy routes live on the *backend*
   host, which users never visit; the site itself is the Next.js frontend.
   **Reversible without a redeploy** — set the startup command back to
   `gunicorn app:app --preload --workers 2 --timeout 120`.

6. **2026-09-23 — Dependencies install from a lock-derived requirements.txt.**
   `uv export --frozen --no-dev --no-hashes --no-emit-project` regenerates
   `requirements.txt` from `uv.lock` as 106 exact `==` pins. App Service's Oryx
   build runs pip unchanged; no uv on the server. This closes the gap where the
   committed `requirements.txt` held loose `>=` pins that would have resolved to
   different versions than the six months of production. Hashes omitted
   deliberately: exact pins give the parity that matters, and `--require-hashes`
   makes pip brittle about platform wheels on a first deploy. `uv.lock` retains
   the hashes for auditing.

5. **2026-09-23 — Always On, HTTPS-only, and no `--preload`.** Always On per
   plan §4 item 7. HTTPS-only because nothing needs plaintext. `--preload` is
   dropped from production's start command — see the instrumentation note in
   the Phase 2 evidence below; it is incompatible with initialising the
   telemetry SDK correctly.

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
