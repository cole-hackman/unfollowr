# Unfollowr

[![Standard Readme compliant](https://img.shields.io/badge/readme-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)
[![Python](https://img.shields.io/badge/python-3.11%2B-3776AB.svg)](#run-locally)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](#run-locally)

## 1. What Is the Project?

Unfollowr is a privacy-first web application that helps users find out who doesn't follow them back on Instagram. Users can upload their official Instagram data exports (HTML or JSON) and instantly view their non-followers, fans, and mutual connections—all without ever logging into their Instagram account.

## 2. Why Was This Project Built?

Many third-party Instagram tracker apps require users to hand over their login credentials, which poses significant security risks. Other apps utilize undocumented APIs that can trigger Instagram's anti-bot systems and get user accounts permanently banned. Unfollowr was built to provide a completely secure, local-first alternative that respects user privacy and keeps their Instagram account 100% safe.

## 3. What Problems Did It Solve?

The primary challenge was analyzing Instagram follower data without compromising account security. This was solved by building a robust data parser that reads Instagram's official HTML and JSON data exports directly, meaning no login credentials are required.

A secondary challenge was helping users make sense of their "non-follower" lists. For instance, a user shouldn't be told to unfollow a celebrity or brand just because they don't follow back. This was solved by implementing a hybrid heuristic and LLM-powered classification system (using Google Gemini via `ai_classifier.py`) that intelligently segments accounts and provides "Unfollow Suggestion Scores."

## 4. What Technologies Are Used?

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion, Chart.js
- **Backend**: Python 3.11+, Flask
- **Data Parsing**: BeautifulSoup4 (HTML parsing)
- **AI Integration**: Google Generative AI (Gemini) for account segmentation and natural language search
- **Database**: PostgreSQL (psycopg2-binary)

## 5. What Did You Implement?

- **Privacy-First Data Parsing**: Local processing of Instagram HTML and JSON exports.
- **Connection Comparison Engine**: Logic to accurately cross-reference Followers and Following lists to categorize Non-followers, Fans, and Mutuals.
- **AI Account Segmentation**: Integration with Google Gemini to classify non-followers (e.g., assessing if an account is a brand/celebrity) and score them.
- **Natural Language Search**: A chatbot interface that translates natural language queries into filter parameters.
- **Interactive UI**: A modern dashboard with smooth Framer Motion animations and visual analytics using Chart.js.
- **SEO & discoverability improvements (Next.js App Router)**:
  - Updated homepage title/description to match high-intent “unfollowers tracker/checker” patterns (2026).
  - Added/expanded metadata for Open Graph + Twitter.
  - Added structured data JSON-LD (WebApplication, FAQPage, and HowTo).
  - Included `robots.txt` and `sitemap.xml` routes via `next/app/robots.ts` and `next/app/sitemap.ts`.
  - Added per-page canonicals, favicon tags, and security headers (HSTS, X-Frame-Options, X-Content-Type-Options) based on SEOmator audits.

### Competitor SEO notes

See `docs/SEO-competitor-comparison.md` for a competitor meta/schema/page-structure comparison and the exact gaps + fixes applied.

## 6. How Can Someone Run It Locally?

Running Unfollowr requires Node.js and Python 3.11+. The project is split between a Python backend and a Next.js frontend.

### Step 1: Start the Backend (Flask)

```bash
# Clone the repository
git clone https://github.com/cole-hackman/unfollowr.git
cd unfollowr

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows (PowerShell) use: .venv\Scripts\Activate.ps1

# Install dependencies and start the server
pip install -e .
python app.py  # Runs on http://localhost:5000
```

### Step 2: Start the Frontend (Next.js)

Open a new terminal window and navigate to the same repository root.

```bash
cd next

# Install frontend dependencies
npm install

# Start the development server
npm run dev   # Runs on http://localhost:3001
```

Once both servers are running, open `http://localhost:3001` in your browser. Upload your Instagram Followers/Following HTML or JSON exports to see it in action!

## Contributing

Questions? Open an issue. Pull requests are welcome — please keep changes focused, documented, and tested where feasible.

## License

MIT (SPDX: MIT). © 2025 Cole Hackman.
