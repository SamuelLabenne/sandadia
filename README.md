# sandadia

Single-page site that opens when someone scans the QR code on the Sanda Dia mural in Leuven.
Live at https://sandadia.com (hosted on Cloudflare).

- `index.html` — the whole site. No build step, no dependencies.
  The three family photos are currently embedded in the HTML as base64,
  so the file works on its own when uploaded.
- `images/` — for new pictures.

## Photo gallery (Google Drive)

The "Herinneringen" section shows every photo in one Google Drive folder.
Only people invited to that folder can add photos; there is no upload on
the site. The section stays hidden until the folder is set up and has photos.

1. **Folder**: create it in Google Drive. *Share* → add the people who may
   post as **Editor**. Under *General access* choose **Anyone with the link →
   Viewer** (the site needs this to read it). Copy the folder ID: the part of
   the folder URL after `/folders/`.
2. **API key**: at https://console.cloud.google.com create a project, then
   *APIs & Services → Library* → enable **Google Drive API**. Then
   *Credentials → Create credentials → API key*, and edit the key:
   - Application restrictions → **Websites**: `sandadia.com/*` and `www.sandadia.com/*`
   - API restrictions → **Google Drive API** only
3. Put both values in `index.html` (`DRIVE_FOLDER_ID`, `DRIVE_API_KEY`) and
   upload once to Cloudflare. After that, changes in the folder show up on
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
