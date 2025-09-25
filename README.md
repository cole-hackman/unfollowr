unfollowr 2.0

Find out who doesn’t follow you back on Instagram — fast, private, and without logging in.

**Features**
	•	Upload your exported Instagram Followers and Following lists (HTML).
	•	Instantly see:
	•	Not following back (you follow them, they don’t follow you)
	•	Fans (they follow you, you don’t follow them)
	•	Mutuals (you both follow each other)
	•	Works completely offline with your own files — no Instagram login or API.
	•	Sample HTML files included for testing.

Try it now: unfollowr.app

⸻

**Local Setup**

Requirements
	•	Python 3.10+ (3.11 recommended)

1. Clone

git clone https://github.com/cole-hackman/unfollowr-2.o
cd unfollowr-2.o

2. Create virtual environment & install

python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .

3. Run

python main.py
# or python app.py (depending on your setup)

Then open the local URL shown in your terminal.

⸻

Exporting Your Data
	1.	Log into Instagram on desktop.
	2.	Open Followers and Following lists, scroll until fully loaded.
	3.	Save each page as Webpage, HTML only.
	4.	Upload them into unfollowr.

⸻

Project Structure

unfollowr-2.0/
├─ app.py / main.py     # app entrypoints
├─ templates/           # HTML templates
├─ static/              # CSS/JS assets
├─ lib/                 # parsing helpers
├─ instagram_followers_sample.html
├─ instagram_following_sample.html
├─ pyproject.toml
└─ uv.lock


⸻

Privacy
	•	You never log in with your Instagram account.
	•	Everything runs locally with your own files.

