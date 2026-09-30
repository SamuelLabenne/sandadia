# sandadia

Single-page site that opens when someone scans the QR code on the Sanda Dia mural in Leuven.

- `index.html` — the whole site. No build step, no dependencies.
- `images/` — pictures used on the page.

## Local preview

Open `index.html` in a browser, or serve it:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Notes

- Mobile-first: nearly every visitor arrives from a phone camera, standing at the mural.
- Content is a placeholder for now; copy and imagery still to come.
- Keep images small (resize to ~1600px wide, compress) — visitors are often on mobile data.
