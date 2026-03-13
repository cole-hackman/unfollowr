# Competitor SEO Analysis & Implemented Improvements

**Note:** The `seomator` CLI was not available (package not found on npm). This analysis was done by fetching competitor and our site HTML and comparing meta tags, schema, and structure.

---

## Competitor comparison table

| SEO area | Unfollowr (before) | unfollowtool.com | theunfollower.com | safeunfollow.app | unfollowgram.com | igunfollowerstracker.com |
|----------|--------------------|------------------|-------------------|------------------|------------------|---------------------------|
| **Title pattern** | "Instagram Unfollowers Tool (Free & Safe) – No Login \| Unfollowr" | "Instagram Unfollowers Tracker & Checker (2026) - Free & No Login" | "Instagram Unfollower Tracker: Check Who Unfollowed You \| TheUnfollower.com" | (dynamic) | "See Who Unfollowed You on Instagram \| Unfollowers Tracker" | (fetch failed) |
| **Meta description** | "Track Instagram unfollowers and see who doesn't follow you back..." | "The safest Instagram Unfollowers Tracker (2026). Check who unfollowed you online without login. Free tool using your data export. No bans, 100% private." | "Perform a free unfollowers check... safe follower tracker... without an app" | "Check who unfollowed you on Instagram without login. Upload your ZIP file... 100% free, privacy-first, handles 1M+ accounts. Works offline." | "Track who unfollows you... No password needed. 100% safe." | — |
| **Meta keywords** | None | None | — | Yes (instagram unfollowers, who unfollowed me...) | Yes (who unfollowed me, instagram unfollowers, how to see...) | — |
| **H1 / headline** | "See who doesn't follow you back" (no "Instagram") | "Instagram Unfollowers Tracker & Checker / See Who Unfollowed You" | — | — | — | — |
| **Structured data** | WebApplication, FAQPage | (not visible in snippet) | — | — | WebPage (ld+json) | — |
| **Canonical** | (via metadataBase) | Yes, explicit link | Yes | — | Yes | — |
| **OG site_name / locale** | No | No | — | Yes (Safe Unfollow) | Yes (UnfollowGram), og:locale | — |
| **Robots (max-snippet etc.)** | index, follow only | index, follow | — | — | index, follow, max-image-preview:large, max-snippet:-1 | — |
| **Sitemap / robots.txt** | Yes (sitemap.ts, robots.ts) | — | — | — | — | — |
| **Dedicated pages** | Home, 3 guides, privacy, terms | Home, tutorial, TikTok tracker | — | Multi-language | — | — |

---

## Our gaps (before fixes)

1. **Title:** Missing year (2026) and "Tracker & Checker" wording that competitors use for relevance.
2. **Meta description:** Didn’t lead with "Check who unfollowed you" or stress "data export" / "no bans" / "100% private" as clearly as unfollowtool/safeunfollow.
3. **Keywords:** No meta keywords; unfollowgram and safeunfollow target phrases we care about.
4. **H1:** Hero used "See who doesn't follow you back" only; no "Instagram" or "unfollowers" in the main heading.
5. **OG/Twitter:** No `siteName` or `locale`; competitors use them for consistency.
6. **Robots:** No `max-image-preview` / `max-snippet` for richer snippets (unfollowgram uses them).
7. **Canonical:** No explicit `alternates.canonical` in metadata (only metadataBase).
8. **Structured data:** No HowTo schema for the 4-step process (we had WebApplication + FAQPage only).

---

## Fixes implemented (Next.js app only)

### 1. `next/app/layout.tsx`

- **Title:**  
  `"Instagram Unfollowers Tracker & Checker (2026) – Free & No Login | Unfollowr"`  
  (aligned with competitor pattern and year.)
- **Description:**  
  `"Check who unfollowed you on Instagram without login. Free Instagram unfollowers tracker using your data export. 100% private, no bans, local processing."`  
  (clear value, data export, no bans, privacy.)
- **Keywords:**  
  Added `keywords` array: instagram unfollowers, who unfollowed me instagram, instagram unfollower tracker, check who unfollowed you instagram, who doesn't follow me back instagram, instagram follower tracker, unfollowers checker no login.
- **Robots:**  
  `index: true`, `follow: true`, and `googleBot`: `max-image-preview: "large"`, `max-snippet: -1`, `max-video-preview: -1`.
- **Open Graph:**  
  Updated title/description to match; added `siteName: "Unfollowr"`, `locale: "en_US"`.
- **Twitter:**  
  Title and description aligned with new messaging.
- **Canonical:**  
  `alternates: { canonical: "https://unfollowr.app" }`.
- **WebApplication schema:**  
  Description updated to: "Check who unfollowed you on Instagram. Free unfollowers tracker & checker, no login, 100% private."
- **HowTo schema:**  
  New JSON-LD for "How to see who doesn't follow you back on Instagram" with 4 steps (download export, upload to Unfollowr, local processing, see results).

### 2. `next/app/(site)/components/Hero.tsx`

- **H1:**  
  From "See who doesn't follow you back" to:  
  `"Instagram unfollowers: see who doesn't follow you back"`  
  (keyword-rich, two lines kept for layout.)

### 3. Unchanged (already in place)

- **Sitemap** (`next/app/sitemap.ts`): Home, privacy, terms, guides index, 3 guide URLs — no change.
- **Robots** (`next/app/robots.ts`): Allow all, sitemap URL — no change.
- **FAQPage schema:** Already present; left as is.
- **Flask templates:** Not modified (per instructions).

---

## Files changed

| File | Changes |
|------|--------|
| `next/app/layout.tsx` | Metadata (title, description, keywords, robots, OG, Twitter, canonical), WebApplication description, HowTo JSON-LD |
| `next/app/(site)/components/Hero.tsx` | H1 text to include "Instagram unfollowers" |
| `docs/SEO-competitor-comparison.md` | New file: this comparison and implementation summary |

---

## Suggested follow-ups (not implemented)

- **Dedicated landing URLs:** Competitors like unfollowtool use paths such as `/tutorial`, `/tiktok/`. We already have `/guides/...`; consider a clear `/check-unfollowers` or similar if you want a dedicated keyword URL.
- **Blog/guides section:** We have 3 guides; expanding with more long-tail articles (e.g. "who unfollowed me instagram 2026") could mirror competitor content strategy.
- **Review/Rating schema:** None of the audited competitors showed Review schema; can be added later if you have testimonials or ratings.
