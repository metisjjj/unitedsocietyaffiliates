---
name: i18n-site-translation
description: Add languages or newly-tagged pages to this site's client-side i18n system, or answer questions about how it works and what future translation work costs. Use when the user wants to add a new language, translate an untagged page, extend the language switcher, or asks how much effort/context a translation task will take.
---

# Site i18n: adding languages and pages

This site (United Society Affiliates) uses a hand-rolled, client-side, no-build-step i18n system. There is no framework, no server-side rendering, and no per-language HTML file duplication. Everything lives in three pieces:

1. **Tagged HTML** — translatable elements carry `data-i18n="some.key"`.
2. **`/i18n/i18n.js`** — a vanilla-JS loader. On page load (and on switcher click) it fetches a dictionary, swaps `textContent`/`innerHTML` on every tagged element, sets `dir`/`lang` on `<html>`, and remembers the choice in `localStorage`.
3. **`/i18n/{lang}.json`** — one flat JSON dictionary per language. Every language file must contain the exact same key set as `en.json`. A missing key just leaves the English text in place — nothing breaks.

Read `/i18n/i18n.js` before making changes; it's short (~70 lines) and is the actual source of truth for behavior described here.

## Current state (check before trusting these numbers — they drift)

Run this to see live counts:
```
node -e "const en=require('./i18n/en.json'); console.log(Object.keys(en).length)"
grep -c 'data-i18n=' index.html big-cuzin.html chess-wars.html pal-program.html
```

As of the last update: `en.json`/`es.json`/`vi.json`/`ar.json` each hold 494 keys in full parity. Tagged pages: `index.html`, `big-cuzin.html`, `chess-wars.html`, `pal-program.html`. **Not tagged**: `neutral-ground.html`, `big-cuzin-mentor-application.html`, `state-of-the-streets-address.html` (deliberately excluded — see below), and the unused `option-*.html` prototypes.

Supported languages live in `i18n.js`'s `SUPPORTED` / `RTL_LANGS` / `LANG_META` constants — currently `en`, `es`, `vi`, `ar` (`ar` is RTL).

## What actually costs effort — answer this before doing anything

The two costs are **independent** and don't multiply against each other:

- **Tagging a page** (adding `data-i18n` attributes, extracting the English key list) scales with *how much text is on that page*. This is the expensive, manual part — it means reading the whole page and deciding a key per string.
- **Translating a key list into N languages** scales with *how many new keys there are*, not with how many languages already exist. Translating into 1 new language costs about the same wall-clock as translating into 3, because translation agents for different languages run in parallel and don't depend on each other.

So: **adding a new language to already-tagged pages is cheap** — one translation pass over the existing key list, no tagging, no code changes. **Tagging a new page is the real cost**, independent of how many languages you'll eventually translate it into. Tagging + translating into 3 languages at once (as was done for the initial rollout) is roughly the same total effort as tagging + translating into 1, since the translation step parallelizes.

If the user asks "how much will X cost," answer with this framing before doing anything — don't just start working.

## Task: add a new language to already-tagged pages

1. Add the language to `i18n.js`: append to `SUPPORTED`, add a `LANG_META` entry (`{ flag: '🇽🇽', code: 'XX' }`), and to `RTL_LANGS` if it's a right-to-left script.
2. Copy `en.json` to `i18n/{lang}.json` as a starting point (or just hand the agent `en.json`'s keys directly).
3. Dispatch **one background translation agent** for the new language (see "Translation agent prompt template" below) — no need to re-translate existing languages.
4. Add a switcher button/row for the new language everywhere the switcher markup is duplicated (currently in the nav of every tagged page — search for `lang-switcher-option` to find all occurrences).
5. Validate key parity (`node` one-liner in the Verification section) and spot-check in a browser.

If the new language is RTL, check `styles.css` for the `[dir="rtl"]` block (search for that string) — it currently patches `.dropdown-menu` positioning, `.dropdown-subitem` padding, `.hero` text-align, and `.lang-switcher` mirroring. Confirm those still cover the new page/language; the site is flexbox/grid-heavy so most layouts don't need RTL-specific CSS at all.

## Task: tag a new page and add it to existing languages

1. Read the whole page first. Walk it top to bottom.
2. Tag every visible, translatable text node with `data-i18n="<page>.<section>.<element>"` — lowercase, dot-namespaced, kebab-case within segments. Reuse `common.*` keys for nav/footer/switcher instead of retagging them. Reuse another page's key (e.g. `chesswars.hero.tagline`) if the exact same string already exists elsewhere — don't create a duplicate key for identical content.
3. Rules that matter (see `i18n.js`'s `applyDictionary`):
   - If the English source string contains any HTML tag or entity (`<strong>`, `&rarr;`, `&amp;`, etc.), the loader uses `innerHTML`; otherwise `textContent`. You don't need to flag this — just tag the wrapping element and keep tags/entities in the dictionary value exactly as they appear in the HTML.
   - **Never nest a `data-i18n` tag inside another `data-i18n` tag's content.** The outer element's `innerHTML` overwrite would destroy the inner one. If a sentence has an inline link, bake the link's markup directly into the outer key's dictionary value instead of tagging it separately.
   - Don't tag `alt`, `placeholder`, `title`, or meta tag attributes — that's an intentionally deferred v1.1 feature, not built into the loader yet.
   - Don't tag proper nouns / brand names as if they need translation (they don't get replaced, but there's no need to tag static untranslatable text like "Big Cuzin'" used as a name rather than a description).
   - Add the switcher markup and `<script src="i18n/i18n.js"></script>` (placed before `script.js`) if the page doesn't have them yet — copy from any already-tagged page's `<nav>` and end-of-`<body>` script block.
4. Extract the new page's key/value pairs into `en.json`. The safest way to avoid manual transcription errors is a small Node script that regex-extracts `data-i18n="key">...</matching-close-tag>` pairs directly from the HTML — do NOT hand-transcribe, and do NOT use a naive "first closing tag" regex (it truncates values that contain a nested tag like `<strong>`, e.g. `<p data-i18n="x"><strong>Label:</strong> rest of sentence</p>`; the script must track matching depth per tag name). Diff the result against the current `en.json` to confirm only new keys were added and no existing values changed.
5. Dispatch translation agents for the new key list only, one per language, in parallel (background agents — don't wait on one before starting the next).
6. Merge the translated key sets into each `{lang}.json` in the same section order as `en.json` (a small merge script keyed by section prefix works well, see "Merge script" below).
7. Validate parity and spot-check locally.

## Translation agent prompt template

Dispatch one `general-purpose` agent per language, in parallel, each given:
- The exact new key/value JSON to translate (extract it to a standalone scratch file first — don't hand over the full 494-key dictionary if only translating new keys).
- The existing `{lang}.json` for that language, so it can match tone/register and see which proper nouns were already left untranslated.
- Explicit rules: keys must match byte-for-byte with no additions/renames; preserve HTML tags and entities exactly, translating only the text between/around them; don't translate proper nouns and brand names (list them explicitly: United Society Affiliates, Big Cuzin', Chess Wars, P.A.L., FORMIDABLE Workshop, Upstate Printing, character names, place/book titles); numbers/ages/dollar amounts stay as literal Western numerals even for Arabic; output must be valid JSON, UTF-8 characters written directly (not unicode-escaped).
- For Arabic specifically: mention the page renders under `dir="rtl"` already, direction is handled elsewhere — the agent should just produce correct MSA text, including leaving `&rarr;`-style directional arrows untouched (accepted limitation, not to be solved by the translator).
- Ask for a self-check: spot-check 8+ entries against the source for entity/tag preservation and natural (non-literal) phrasing before finalizing, and confirm the key set matches exactly (report the count).

Have each agent write directly to a scratch file, not to the live `i18n/{lang}.json` — merge afterward yourself so a bad agent run can't corrupt the live dictionary mid-flight.

## Merge script (keys grouped by page prefix)

```js
// merge new-keys-per-language files into the live dictionaries, preserving en.json's section order
const fs = require('fs');
const en = JSON.parse(fs.readFileSync('i18n/en.json', 'utf-8'));
['es', 'vi', 'ar'].forEach((lang) => {
  const existing = JSON.parse(fs.readFileSync(`i18n/${lang}.json`, 'utf-8'));
  const newKeys = JSON.parse(fs.readFileSync(`scratch/new_keys_${lang}.json`, 'utf-8'));
  const merged = {};
  for (const k of Object.keys(en)) {
    merged[k] = newKeys[k] !== undefined ? newKeys[k] : (existing[k] !== undefined ? existing[k] : en[k]);
  }
  fs.writeFileSync(`i18n/${lang}.json`, JSON.stringify(merged, null, 2), 'utf-8');
});
```

## Verification (run every time, cheap)

```js
// parity + validity check
const fs = require('fs');
const langs = ['en', 'es', 'vi', 'ar']; // add new lang codes here
const data = {};
for (const l of langs) data[l] = JSON.parse(fs.readFileSync(`i18n/${l}.json`, 'utf-8'));
const enKeys = new Set(Object.keys(data.en));
for (const l of langs.filter((x) => x !== 'en')) {
  const keys = new Set(Object.keys(data[l]));
  const missing = [...enKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !enKeys.has(k));
  console.log(l, 'missing:', missing.length, 'extra:', extra.length);
}
```

Also check for HTML-tag balance in any hand-edited or newly-extracted values (nested `<strong>` truncation is the recurring failure mode):
```js
for (const [k, v] of Object.entries(data.en)) {
  const opens = (v.match(/<(?!br\s*\/?>)[a-z]+[^>]*>/gi) || []).length;
  const closes = (v.match(/<\/[a-z]+>/gi) || []).length;
  if (opens !== closes) console.log('MISMATCH', k, v);
}
```

Then functionally verify in a browser (serve over HTTP — `fetch()` is blocked on `file://` origins, so opening the HTML file directly will silently fall back to English and look broken even when everything is correct):
```
python -m http.server 8000
```
Load the tagged page, open the language switcher dropdown, switch languages, confirm text changes with no console errors, confirm RTL languages set `dir="rtl"` and don't break layout, reload to confirm the choice persists via `localStorage`, then stop the server.

## Deliberately out of scope (don't "fix" these unless asked)

- **`state-of-the-streets-address.html`** is auto-patched every 6 hours by `.github/workflows/update-sotsa-episodes.yml`. Don't tag it without checking `.github/scripts/update-sotsa-episodes.js` first — tags could interfere with the bot's regeneration.
- **Meta description / Open Graph / Twitter Card / JSON-LD** are never translated by this system — they're not rendered DOM text, so the loader can't reach them. Non-English visitors' browser tabs and social-share previews stay in English. This is accepted, not a bug.
- **Image text** (Chess Wars slides, program manual covers, etc.) is never translated — out of scope by original design decision.
- **`alt`/`placeholder`/`title` attributes** aren't tagged yet — planned future extension (`data-i18n-attr` mini-syntax), not built.
- **AI-drafted translations should be flagged for native-speaker review** before being treated as final for real visitors, especially anything emotionally weighted (memorials, dedications) or safety/legal-sensitive (application forms, background-check language).
