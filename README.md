# unfollowr 

Find out who doesn’t follow you back on Instagram — fast, private, and without logging in.

[![Standard Readme compliant](https://img.shields.io/badge/readme-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)
[![Python](https://img.shields.io/badge/python-3.10%2B-3776AB.svg)](#install)

## Table of Contents

- [Security](#security)
- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Security

- No Instagram login required; you upload saved **Followers** and **Following** HTML files.
- All parsing and comparison run locally on your machine.
- Avoid uploading personal data to third-party services you don’t trust.

## Background

**unfollowr ** compares your Instagram **Followers** and **Following** lists and highlights:
- **Not following back** – you follow them, they don’t follow you
- **Fans** – they follow you, but you don’t follow them
- **Mutuals** – you follow each other

Use it instantly at **https://unfollowr.app**.


## Install

Requires **Python 3.10+** (3.11 recommended).

```bash
git clone https://github.com/cole-hackman/unfollowr-2.o
cd unfollowr-2.o
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows (PowerShell)
# .venv\Scripts\Activate.ps1
pip install -e .
```

### Dependencies
- Standard Python tooling only; installs from `pyproject.toml` if present.

## Usage

Run the app locally:

```bash
python main.py
# or
python app.py
```

Then open the local URL shown in your terminal.

### Getting Instagram Data

1. Log into Instagram on desktop.
2. Open **Followers** and **Following**, scroll until fully loaded.
3. Save each page as **Webpage, HTML only**.
4. Upload both files into the app.

Sample files in the repo:
- `instagram_followers_sample.html`
- `instagram_following_sample.html`

## Maintainers

- [@cole-hackman](https://github.com/cole-hackman)

## Contributing

Questions? Open an [issue](https://github.com/cole-hackman/unfollowr-2.o/issues).
Pull requests are welcome — please keep changes focused, documented, and tested where feasible.

If your change affects parsing, include (sanitized) HTML snippets that reproduce the issue.

## License

MIT (SPDX: MIT). © 2025 Cole Hackman.
