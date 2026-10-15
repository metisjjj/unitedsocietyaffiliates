---
name: local-browser-verification
description: How to run real-browser verification (Playwright) against this static site in this specific sandbox, where the bundled Chromium download is unreachable. Use whenever a task calls for loading a page in an actual browser to check rendering, JS behavior, console errors, or screenshots — before writing a Playwright script, or before reporting that "Playwright isn't available."
---

# Local browser verification in this environment

This project has no `package.json` and no build tooling (see root `CLAUDE.md`) — it's a plain static HTML/CSS/JS site. Verification scripts are always ad hoc, written into the session scratchpad, never checked into the repo.

## The one fact that keeps getting re-discovered

**`npx playwright install chromium` fails in this sandbox** — the browser-binary CDN (`cdn.playwright.dev`) is unreachable/times out. There is no cached Chromium under `%LOCALAPPDATA%\ms-playwright` (only leftover `ffmpeg-*`/`winldd-*` helper binaries, no actual browser). Don't spend a turn re-verifying this — assume it's true and go straight to the fallback below. If a future session finds this has changed (the CDN download succeeds, or a browser is now cached), update this skill rather than silently reverting to guessing each time.

**The fix**: the system has Google Chrome installed at a normal path. Launch Playwright against it directly instead of the bundled browser:

```js
const { chromium } = require('playwright');
const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
});
```

This has been confirmed working multiple times in this environment. Microsoft Edge is also present at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` as a second fallback if Chrome is ever missing, but Chrome has been the reliable default so far.

## Getting the `playwright` npm package itself

The `playwright` package (the driver library, not the browser binary) installs fine from npm — only the post-install browser *download* is what fails. Two ways to get it into a throwaway script:

- `npx --package=playwright node <script.js>` — pulls the package on the fly, runs the script, no lingering install.
- Or `npm install playwright` inside a scratch directory, then `node script.js` from there.

Either way, write the verification script itself into the session scratchpad directory (never into the site repo), and point `executablePath` at system Chrome as shown above.

## Serving the site — never use `file://`

This site's i18n system (`i18n/i18n.js`) uses `fetch()` to load `i18n/{lang}.json`. Browsers block `fetch()` on `file://` origins, so opening an HTML file directly (`file:///C:/Users/.../index.html`) makes language-switching silently fail and fall back to English — this looks like a real bug but isn't. Always serve over HTTP first:

```
cd "<repo root>" && python -m http.server 8000
```

Point Playwright (or the user, if they're testing manually) at `http://localhost:8000/<page>.html`, never the `file://` path. Stop the server (`Get-NetTCPConnection -LocalPort 8000 | ... Stop-Process`) once verification is done.

## Worked pattern for a verification script

```js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.goto('http://localhost:8000/some-page.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'C:\\path\\to\\scratchpad\\screenshot.png', fullPage: true });

  console.log('console errors:', JSON.stringify(consoleErrors));
  await browser.close();
})();
```

## When a background verification agent reports "Playwright unavailable, verified via static inspection instead"

That's a real, valid fallback for confirming file existence, JSON validity, or markup structure — but it is **not** equivalent to a live-render check (actual layout, computed styles, console errors, click-driven interactions). If the task specifically needs live-render confirmation (visual layout, JS-driven behavior like a modal or language switcher, console-error checking), don't accept the static-only result as final — dispatch a follow-up agent with this skill's fallback instructions so it gets a real browser instead of re-attempting (and re-failing) the bundled Chromium download from scratch.
