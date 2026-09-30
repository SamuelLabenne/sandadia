# sandadia

Single-page site that opens when someone scans the QR code on the Sanda Dia mural in Leuven.
Live at https://sandadia.com (hosted on Cloudflare).

- `index.html` — homepage (Sanda's story). The three family photos are
  embedded in the HTML as base64.
- `foundation.html` — Sanda Dia Foundation page (sandadia.com/foundation),
  linked from the nav bar at the top of both pages.
- `style.css` — styles shared by both pages.
- `gallery.js` — the Google Drive photo galleries on both pages.
- `config.js` — the Google API key. **Not in git** (see `config.example.js`);
  it only lives in the folder you upload to Cloudflare.
- `images/` — for new pictures.

No build step. Upload the whole folder to Cloudflare, not just one file.

## Photo galleries (Google Drive)

Each page has a gallery that shows every photo and video in its own Google Drive folder:

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
3. Put each folder ID in its page (see table). Copy `config.example.js` to
   `config.js` and put the key in it. Upload once to Cloudflare, including
   `config.js`. Without `config.js` the galleries simply stay hidden. After that, changes in the folder show up on
   the site by themselves.

- Videos appear as a still frame with a play button and play in Drive's own
  player. A freshly uploaded video can take a few minutes (longer for big
  files) before Drive can play it; until then it shows an empty frame.
- Photos and videos are shown newest first, by when they were added to the folder.
- A file's Drive *description* (file details panel) becomes its caption.
- Anything in the folder is public. Removing a file removes it from the site.
- The key is visible in the live site's source; the restrictions above are what
  protect it. It is kept out of this repository anyway.

## Local preview

Open `index.html` in a browser, or serve it:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Notes

- Mobile-first: nearly every visitor arrives from a phone camera, standing at the mural.
- Keep images small (resize to ~1600px wide, compress) — visitors are often on mobile data.
