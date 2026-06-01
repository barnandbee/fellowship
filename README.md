# The Sweepstakes Gazette

A World Cup 2026 sweepstakes app — entirely client-side, no build step, no dependencies.

**Live site:** https://barnandbee.github.io/sweep/

## How it works

- Visitors open the page and enter their name; names are saved in each browser's `localStorage`.
- The organiser opens the admin panel (tap the masthead title **5 times**, code `kickoff26` — change this before sharing), runs the draw, and clicks **Copy Export Block**.
- Paste the exported `var RESULTS = …;` block into `index.html`, replacing the existing `null` line, then commit and push.
- Everyone who visits the page now sees the same fixed draw.

## Publishing a draw

```
# after copying the export block from the admin panel:
git add index.html
git commit -m "publish draw"
git push
```

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Entire app — HTML, CSS, and JS in one file |
| `.nojekyll` | Tells GitHub Pages not to run Jekyll |
