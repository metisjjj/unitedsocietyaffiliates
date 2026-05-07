# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **United Society Affiliates**, a Syracuse-based nonprofit that connects underserved communities to vital resources. No build tools, no package manager, no framework — pure HTML5, CSS3, and vanilla JavaScript.

## Deployment

Hosted on **GitHub Pages** at https://metisjjj.github.io/unitedsocietyaffiliates/. Changes pushed to the `main` branch are deployed automatically.

## Running Locally

Open `index.html` directly in a browser, or serve via a simple HTTP server:

```
python -m http.server 8000
```

## File Structure

| File | Purpose |
|---|---|
| `index.html` | Main landing page — navigation, hero, founder bio, services, contact form |
| `neutral-ground.html` | Neutral Ground program page |
| `pal-program.html` | P.A.L. (Publish A Life) program page |
| `styles.css` | Shared stylesheet for all active pages |
| `script.js` | Shared JS — mobile menu, dropdown nav, contact form validation |
| `option-*.html` | Design prototypes (not linked in navigation, kept for reference) |
| `images/` | Program diagrams and timeline graphics |

## Architecture

All three active pages (`index.html`, `neutral-ground.html`, `pal-program.html`) share `styles.css` and `script.js`. Pages link to each other via a top navigation bar with a Programs dropdown.

**CSS** uses CSS custom properties (defined at `:root`) for theming, a 1200px max-width container pattern, and breakpoints at 768px and 1024px.

**JS** is organized around three concerns: mobile hamburger menu toggle, dropdown menu handling for touch/mouse, and contact form validation.

## Content & Programs

- **Neutral Ground**: Converting vacant Syracuse land into community green/wellness spaces
- **P.A.L. (Publish A Life)**: Community publishing program for underserved voices
- Founder: Clifford Ryan Jr. (`clifford-ryan-jr.png` used on index.html)
