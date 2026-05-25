# AI for Developers — slide deck

A self-contained, offline HTML slideshow for presenting "how to use AI well" to
developers who already use it day to day. No build step, no dependencies, no internet required.

## Run it

Just open the file:

```bash
open index.html        # macOS
```

Or serve it locally (nicer URLs / fullscreen behaves better in some browsers):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Controls

| Key | Action |
| --- | --- |
| `→` / `Space` / `PgDn` | Next slide |
| `←` / `PgUp` | Previous slide |
| `Home` / `End` | First / last slide |
| `O` | Overview grid (jump to any slide) |
| `N` | Speaker notes panel |
| `F` | Fullscreen |
| `?` | Keyboard shortcuts |
| `Esc` | Close any overlay |

You can also click the on-screen arrows or swipe on touch devices. The URL tracks
the current slide (`#/12`), so you can bookmark or share a specific slide.

## Editing

- **Slides** live in `index.html` as `<section class="slide" data-title="...">` blocks.
  Add, remove, or reorder them freely — navigation, the counter, and the overview grid
  all update automatically.
- **Speaker notes** go in an `<aside class="notes">` inside each slide (shown with `N`).
- **Theme** is driven by CSS variables at the top of `styles.css` (`--blue`, `--bg`, fonts…).
  Change a few tokens to re-skin the whole deck.
- **Navigation behavior** is in `deck.js`.

## Files

```
index.html   slides (content) + page chrome
styles.css   all styling / theme tokens
deck.js      navigation, notes, overview, deep-linking
```
