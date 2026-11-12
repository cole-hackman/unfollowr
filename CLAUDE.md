# unfollowr

Instagram follower-tracker site. Next.js static export in `next/` (Azure Static Web App), Flask analytics API in `wsgi.py` and `analytics_api.py` (Azure App Service), analytics database on Neon. Read `STATE.md` first; it names the live URLs, the open problems and the settled decisions.

## Ship policy (default from the 2026-11-10 audit; Cole to edit)

- May do without asking: commit and push to a feature branch, open a PR, and for interface, content and documentation changes merge your own PR once review is clean, then verify. This repo has no CI, so there are no checks to wait for. Commits follow the global rules in `~/.claude/CLAUDE.md` (no tool attribution, no trailers).
- Always stops for Cole: backend deploys and App Service app settings, anything on Neon (SQL, dumps, password rotation), `ADMIN_SECRET` and other secrets, DNS at name.com, the `ALLOWED_ORIGINS` list, and deleting or stopping anything on Render.
- Stricter rules already in `STATE.md` stay: the analytics database stays on Neon (Decisions #1), and nothing is deleted on Render without Cole's approval.
- "Verified" means the live URL after the deploy picked up the commit: `curl -s https://www.unfollowr.app` shows the changed text or asset, and for the API `curl -si -X OPTIONS -H 'Origin: https://www.unfollowr.app' https://api.unfollowr.app/api/analytics/event` returns 204 with the origin header. A build log or a green push is not verification.
- State file: `STATE.md` (rewritten, not appended; 60 lines or fewer). History is in `docs/log/`, older decisions in `docs/decisions.md`.
