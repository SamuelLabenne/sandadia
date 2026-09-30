# sandadia

Single-page site that opens when someone scans the QR code on the Sanda Dia mural in Leuven.
Live at https://sandadia.com (hosted on Cloudflare).

- `index.html` — the whole site. No build step, no dependencies.
  The three family photos are currently embedded in the HTML as base64,
  so the file works on its own when uploaded.
- `images/` — for new pictures.

## Local preview

Open `index.html` in a browser, or serve it:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Notes

- Mobile-first: nearly every visitor arrives from a phone camera, standing at the mural.
- Keep images small (resize to ~1600px wide, compress) — visitors are often on mobile data.
