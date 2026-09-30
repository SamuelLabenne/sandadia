# sandadia

Single-page site that opens when someone scans the QR code on the Sanda Dia mural in Leuven.
Live at https://sandadia.com (hosted on Cloudflare).

- `index.html` — homepage (Sanda's story). The three family photos are
  embedded in the HTML as base64.
- `foundation.html` — Sanda Dia Foundation page (sandadia.com/foundation),
  linked from the bottom of the homepage.
- `style.css` — styles shared by both pages.
- `gallery.js` — the Google Drive photo galleries on both pages.
- `images/` — for new pictures.

No build step. Upload the whole folder to Cloudflare, not just one file.

## Photo galleries (Google Drive)

Each page has a gallery that shows every photo in its own Google Drive folder:

| Page | Section | Folder ID goes in |
|---|---|---|
| `index.html` | Herinneringen | `data-drive-folder="…"` on the gallery section |
| `foundation.html` | De bouw | `data-drive-folder="…"` on the gallery section |

Only people invited to a folder can add photos; there is no upload on the
site. A gallery stays hidden until its folder is set up and has photos.
Both galleries use the same API key.

1. **Folders**: create one per gallery in Google Drive. For each: *Share* → add the people who may
   post as **Editor**. Under *General access* choose **Anyone with the link →
   Viewer** (the site needs this to read it). Copy the folder ID: the part of
   the folder URL after `/folders/`.
2. **API key**: at https://console.cloud.google.com create a project, then
   *APIs & Services → Library* → enable **Google Drive API**. Then
   *Credentials → Create credentials → API key*, and edit the key:
   - Application restrictions → **Websites**: `sandadia.com/*` and `www.sandadia.com/*`
   - API restrictions → **Google Drive API** only
3. Put each folder ID in its page (see table), and the key in `gallery.js`
   (`DRIVE_API_KEY`). Upload once to Cloudflare. After that, changes in the folder show up on
   the site by themselves.

- Photos are shown sorted by file name; rename to `01 …`, `02 …` to set the order.
- A file's Drive *description* (file details panel) becomes its caption.
- Anything in the folder is public. Removing a file removes it from the site.
- The key is safe to have in the page source because of the restrictions above.

## Local preview

Open `index.html` in a browser, or serve it:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Notes

- Mobile-first: nearly every visitor arrives from a phone camera, standing at the mural.
- Keep images small (resize to ~1600px wide, compress) — visitors are often on mobile data.
