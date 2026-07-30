# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **United Society Affiliates**, a Syracuse-based nonprofit that connects underserved communities to vital resources. No build tools, no package manager, no framework — pure HTML5, CSS3, and vanilla JavaScript.

## Deployment

Hosted on **GitHub Pages** at https://unitedsocietyaffiliates.org. Changes pushed to the `main` branch are deployed automatically.

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
| `chess-wars.html` | Chess Wars library — graphic novel pages, trilogy, duel details/index, Chess Wars Academy, warriors gallery |
| `big-cuzin.html` | Big Cuzin' youth mentorship program page |
| `state-of-the-streets-address.html` | State of the Streets Address (SOTSA) podcast page |
| `styles.css` | Shared stylesheet for all active pages |
| `script.js` | Shared JS — mobile menu, dropdown nav, contact form validation |
| `option-*.html` | Design prototypes (not linked in navigation, kept for reference) |
| `images/` | Program diagrams, timeline graphics, and Chess Wars / Big Cuzin' content assets |

## Architecture

All active pages (`index.html`, `neutral-ground.html`, `pal-program.html`, `chess-wars.html`, `big-cuzin.html`, `state-of-the-streets-address.html`) share `styles.css` and `script.js`. Pages link to each other via a top navigation bar with a Programs dropdown; the dropdown includes a "Chess Wars Series" sub-item nested under P.A.L. Program that links to `pal-program.html#chess-wars` (the in-page teaser/overview), which in turn links out to the full `chess-wars.html` library.

**CSS** uses CSS custom properties (defined at `:root`) for theming, a 1200px max-width container pattern, and breakpoints at 768px and 1024px. The Chess Wars section/page uses its own dark gold-and-parchment visual theme (`.chess-wars-*` and `.cw-*` classes) distinct from the rest of the site.

**JS** is organized around three concerns: mobile hamburger menu toggle, dropdown menu handling for touch/mouse, and contact form validation.

## Content & Programs

- **Neutral Ground**: Converting vacant Syracuse land into community green/wellness spaces
- **P.A.L. (Publish A Life)**: Community publishing program for underserved voices
- **Chess Wars**: An original graphic novel series and "Chess Wars Academy" curriculum, both P.A.L. Program originals; overview lives on `pal-program.html`, full content library on `chess-wars.html`
- **Big Cuzin'**: Youth mentorship program (also the organization's general-purpose mascot elsewhere on the site — Chess Wars Academy materials featuring Big Cuzin' are still prefixed `chess-wars-` since Chess Wars is the program context)
- **State of the Streets Address (SOTSA)**: The organization's podcast
- Founder image: `clifford-ryan-jr.png`, used on index.html

## Image Naming Convention

Chess Wars assets use descriptive, sortable filenames (not the UUID names they often arrive with) — see `images/chess-wars-*.png` for the current pattern: `chess-wars-vol{N}-pages-{NN}-{NN}.png` for graphic novel pages (no chapter designation — chapter breaks aren't consistently indicated in the source images), `chess-wars-duel-{N}-details-{name}.png` for single-duel breakdowns, `chess-wars-vol{N}-duel-index.png` for full 16-duel volume posters, `chess-wars-academy-slide-{NN}-{name}.png` for Chess Wars Academy slides, and `chess-wars-academy-big-cuzin-{name}.png` for Big Cuzin' materials tied to the Chess Wars Academy program. Apply the same pattern to new Chess Wars content going forward — see the verification workflow below before renaming or filing anything in.

## Verifying Image Content Before Batch Operations

New content for this site (graphic novel pages, program materials, slides) tends to arrive in volume with non-descriptive filenames (e.g. UUIDs). Before renaming, captioning, or organizing more than a couple of these images:

1. **Read each file individually and state what it actually shows** before assigning it a name or caption — do not infer content from a similar filename, a prior batch's pattern, or a single skim across many files.
2. **Get explicit confirmation per file (or small batch) before executing a rename**, rather than committing a full batch rename and correcting afterward. A wrong guess that becomes 20 wrong filenames is much more expensive to unwind than one caught before the `mv`.
3. **Don't trust a repeated tool call as re-verification.** If a file's content needs to be checked twice, treat identical output with suspicion (verify via checksum or an independent read) rather than assuming the second read confirms the first — image-reading tools have been observed returning stale/cached results for distinct files in this environment.
4. **State confidence honestly.** If a read hasn't been independently verified, say so, rather than presenting a guess as settled fact.

This applies to any bulk operation on images or other binary content where the filename can't be trusted and mistakes are costly to detect after the fact (public-facing pages, published files) — not to low-stakes exploratory work.
