# Manarkeni Video Scraper

A simple Playwright utility to collect Manarkeni video URLs and generate YAML references for TNEBooks.

---

## Requirements

- Node.js 18+
- npm

Check:

```bash
node -v
npm -v
```

---

## Installation

Clone the repository.

```bash
git clone <repo-url>
cd manarkeni-video-scraper
```

Install dependencies.

```bash
npm install
```

Install Playwright browser.

```bash
npx playwright install chromium
```

---

# First Time Setup (Only Once)

Authentication is required only once.

Run

```bash
node login.js
```

A Chromium browser opens.

1. Login to Manarkeni.
2. Wait until the home page loads.
3. Press Enter in the terminal.
4. Authentication will be saved as

```
auth.json
```

From now on, login is not required unless the session expires.

> **Do not commit `auth.json` to Git.**

---

# Running the Scraper

```bash
npm start
```

or

```bash
node scrape.js
```

---

# Usage

1. Open any chapter.
2. Open a section.
3. Press **Enter** in the terminal to start a new `references:` block.
4. Open videos one by one.
5. Every video is automatically appended to `references.md`.
6. Repeat for the next section.

Stop anytime with

```
Ctrl + C
```

---

# Output

Generated file:

```
references.md
```

Example:

```yaml
references:
  videos:
    - custom:
        title: "Introduction"
        desc: "Introduction"
        url: "https://...mp4"
    - custom:
        title: "Adjoint Of A Square Matrix"
        desc: "Adjoint of a Square Matrix"
        url: "https://...mp4"

references:
  videos:
    - custom:
        title: "Row-Echelon Form"
        desc: "Row-Echelon Form"
        url: "https://...mp4"
```

---

# Files

| File | Description |
|------|-------------|
| login.js | Saves login session |
| scrape.js | Watches opened videos and writes YAML |
| auth.json | Saved login session (generated automatically) |
| references.md | Generated output |

---

# Notes

- Login is required only once.
- If authentication expires, simply run:

```bash
node login.js
```

again.

- `references.md` is automatically generated.# Video--Scraper
