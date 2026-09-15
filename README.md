# usaodatov.com

Minimal single-page site, in the same spirit as [umexim.com](https://umexim.com):
a wordmark and location, with the whole viewport given to one hero moment.

The hero is a hand-coded canvas animation of a sunny meadow, painted in
loose pointillist daubs (a nod to late Monet). Two children — a
10-year-old girl and her 7-year-old brother — run in wide circles across
the field, chasing one another, before slowing down near the middle to
talk, then running off to play again. The cycle repeats.

## Structure

```
index.html    markup + wordmark
styles.css    layout, type, colors
script.js     the meadow + children animation (vanilla canvas, no deps)
```

No build step and no dependencies — open `index.html` directly, or serve
the folder with any static file server:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Notes

- All motion is drawn procedurally on `<canvas>`; the background (sky,
  sun, hedge line, pointillist grass) is painted once to an offscreen
  canvas and blitted each frame, so only the two figures are redrawn.
- Respects `prefers-reduced-motion`: the scene renders one calm frame
  and holds still instead of looping.
- Figures are deliberately abstract/painterly (colored daubs, not
  literal illustrations), in keeping with the impressionist treatment.
- Colors, type (Cormorant Garamond), and layout are defined as a small
  token set at the top of `styles.css` / `script.js` if you want to
  retheme.
