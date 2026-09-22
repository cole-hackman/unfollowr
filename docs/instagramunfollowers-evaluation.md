# Evaluating davidarroyo1234/InstagramUnfollowers for reuse in Unfollowr

**Date:** 2026-09-22
**Upstream reviewed:** [`davidarroyo1234/InstagramUnfollowers`](https://github.com/davidarroyo1234/InstagramUnfollowers)
at commit `8a5b0f8` (2026-09-10), MIT licensed, ~3,000 lines of React/TypeScript.
**Status:** research only — nothing implemented, no decision made.

File references below point at Unfollowr's `next/` app unless prefixed with `iu/`,
which means the upstream repo.

## Summary

The upstream project's core mechanism is explicitly out of scope for Unfollowr, so
most of it is unusable. A small, genuinely decoupled slice is worth porting. One
real bug in Unfollowr surfaced while comparing the two.

## The headline conflict

InstagramUnfollowers works by pasting a compiled bundle into the Instagram web
console while logged in, reading the `ds_user_id` cookie, and calling Instagram's
private REST API (`/api/v1/friendships/<id>/following/`) with the web client's
app-ID header. It then optionally unfollows for you via
`POST /web/friendships/<id>/unfollow/`, using randomized jitter and long sleeps to
dodge rate limits (`iu/src/main.tsx`, `iu/src/utils/utils.ts`).

Unfollowr's README non-goals say:

> Anything that touches Instagram itself, official API or not. No login, no
> scraping, no automation. That constraint is the entire premise.

plus no unfollowing on the user's behalf.

So the scan engine, the unfollow queue, and all rate-limit pacing — roughly
two-thirds of the codebase, and the part the repo is actually known for — cannot be
used without reversing a settled product decision. Not pursued.

## Worth porting

### 1. The keep-list — the clear win

`iu/src/utils/whitelist-manager.ts` is 144 lines with zero Instagram coupling:
localStorage persistence, JSON export/import, dedupe-merge.

Unfollowr has no equivalent. Its only persisted keys are `unfollowr-view`
(`app/results/page.tsx:52`) and `cookie-ok` (`components/CookieBanner.tsx:7`);
everything else lives in sessionStorage and dies with the tab. Re-running an
analysis next month means re-deciding about every account deliberately kept.

### 2. Bug found while comparing — marks are silently lost

`markSelectedUnfollowed` → `applyMark` calls `setItems(...)` and never writes
sessionStorage (`app/results/page.tsx:196`). The tab-change effect re-reads
`unfollowr-items` from sessionStorage (`app/results/page.tsx:84`).

**Result:** switching to the "fans" tab and back wipes every "unfollowed" mark just
made.

Traced by reading the code, not by running the app — the paths are unambiguous but
confirm in the browser before fixing.

### 3. The preview-fixture pattern

`_getPreviewUsers()` plus a `?preview=scanning` query param renders a fully
populated results screen from synthetic data, no Instagram involved
(`iu/src/main.tsx`).

This is the seed of README "What I'd do next" item #1 (parser fixture tests) and
addresses the #1 named risk — a format change surfacing as user reports rather than
a failing build. One fixtures module could feed both a demo/screenshot mode and,
later, parser tests. A pattern to copy, not code.

### 4. Pagination

Upstream paginates at 50/page (`UNFOLLOWERS_PER_PAGE`, `getMaxPage`,
`getCurrentPageUnfollowers` in `iu/src/utils/utils.ts`). Unfollowr does
`filtered.map(...)` over everything (`app/results/page.tsx:417`) with a
framer-motion card each. Someone following 5,000 accounts renders 5,000 animated
nodes.

## Not wins

Unfollowr already has CSV export, TXT export, copy-to-clipboard, search, and alpha
filtering (`components/results/SelectionBar.tsx`, `app/results/page.tsx:211`).
Upstream's `exportToJSON` / `exportToCSV` / `copyListToClipboard` helpers are
redundant.

## Open strategic question — not decided

Everything that would improve `lib/classify.ts` — verified, private, full name,
avatar, follower counts — is data the Instagram export does not contain. That is
why segmentation is stuck guessing from username tokens. Upstream's `exportToJSON`
emits exactly that richer shape.

A possible middle path: an optional second input where a user runs
InstagramUnfollowers themselves and drops its JSON into Unfollowr. Unfollowr would
still never touch Instagram, hold a credential, or have an upload endpoint. It
would also unlock the default-avatar spam signal
(`WITHOUT_PROFILE_PICTURE_URL_IDS` in `iu/src/constants/constants.ts` matches
Instagram's two known default-avatar image IDs — a much harder signal than
Unfollowr's `NUMERIC_TAIL = /\d{4,}$/` in `lib/classify.ts:34`, which the README
already flags as misfiring).

Against it: it borrows the ban risk Unfollowr markets against, even at arm's
length, and it complicates the one-sentence pitch. **This touches a settled
decision — Cole's call, deliberately left open.**

## Free supporting evidence (not code)

`iu/src/utils/utils.ts` documents that Instagram silently killed the old GraphQL
`query_hash` path: it began returning `200 OK` with the correct total count, zero
edges, and `has_next_page: false`. A structurally valid but data-empty response the
app had no way to detect, so scans "succeeded" with 0 results for a long time.

Citable on the guides pages: the API path doesn't break loudly, it rots quietly.
That is an argument *for* the export-based premise.

## Recommendation

Take #1 and #2 together as one small change — persist the marks, add a keep-list
beside them, both in localStorage with JSON import/export. Highest value per line,
closes a real bug, touches no settled decision.

Ignore the scan and unfollow engines entirely.
