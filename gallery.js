// Photo and video galleries fed by Google Drive folders. Every
// <section data-drive-folder="FOLDER_ID" hidden> on a page shows the images
// and videos in that folder, and stays hidden if the folder is empty or can't
// be read. Setup (folder sharing + API key) is described in README.md.
(() => {
  // Set in config.js, which is uploaded to Cloudflare but kept out of git.
  const DRIVE_API_KEY = window.DRIVE_API_KEY;

  const sections = [...document.querySelectorAll('[data-drive-folder]')];
  if (!sections.length || !DRIVE_API_KEY) return;

  // Drive serves resized copies (and still frames for videos), so phones never
  // download the full original.
  const src = (id, w) => `https://lh3.googleusercontent.com/d/${id}=w${w}`;
  const fallback = (id, w) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;
  const withFallback = (img, id, w, onFail) => {
    img.onerror = () => {
      img.onerror = onFail || null;
      img.src = fallback(id, w);
    };
    img.src = src(id, w);
  };
  const isVideo = file => file.mimeType.startsWith('video/');
  const label = file => file.description || (isVideo(file) ? 'Gedeelde video' : 'Gedeelde foto');

  // Pixel size as shown, if Drive knows it.
  function size(file) {
    const v = file.videoMediaMetadata;
    if (v && v.width && v.height) return { w: v.width, h: v.height };
    const m = file.imageMediaMetadata;
    if (m && m.width && m.height) {
      const turned = m.rotation % 2 === 1;
      return { w: turned ? m.height : m.width, h: turned ? m.width : m.height };
    }
    return null;
  }

  const viewer = document.createElement('dialog');
  viewer.className = 'viewer';
  viewer.innerHTML = '<button type="button">Sluiten</button><div class="viewer-media"></div><p hidden></p>';
  document.body.append(viewer);
  const viewerMedia = viewer.querySelector('.viewer-media');
  const viewerCaption = viewer.querySelector('p');
  viewer.addEventListener('click', () => viewer.close());
  // Emptying the viewer also stops a playing video.
  viewer.addEventListener('close', () => viewerMedia.replaceChildren());

  function open(file) {
    if (isVideo(file)) {
      const s = size(file) || { w: 16, h: 9 };
      const frame = document.createElement('iframe');
      frame.src = `https://drive.google.com/file/d/${file.id}/preview`;
      frame.title = label(file);
      frame.allow = 'autoplay; fullscreen';
      frame.allowFullscreen = true;
      frame.style.aspectRatio = `${s.w} / ${s.h}`;
      frame.style.width = `min(94vw, calc(80dvh * ${s.w / s.h}))`;
      viewerMedia.replaceChildren(frame);
    } else {
      const img = document.createElement('img');
      img.alt = label(file);
      img.referrerPolicy = 'no-referrer';
      withFallback(img, file.id, 2000);
      viewerMedia.replaceChildren(img);
    }
    viewerCaption.textContent = file.description || '';
    viewerCaption.hidden = !file.description;
    viewer.showModal();
  }

  async function listFiles(folderId) {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and (mimeType contains 'image/' or mimeType contains 'video/') and trashed = false`,
      orderBy: 'createdTime desc',
      pageSize: '200',
      fields: 'nextPageToken,files(id,mimeType,description,imageMediaMetadata(width,height,rotation),videoMediaMetadata(width,height))',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
      key: DRIVE_API_KEY,
    });
    const files = [];
    do {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
      if (!res.ok) throw new Error(`Drive API ${res.status}`);
      const data = await res.json();
      files.push(...(data.files || []));
      if (data.nextPageToken) params.set('pageToken', data.nextPageToken);
      else params.delete('pageToken');
    } while (params.has('pageToken'));
    return files;
  }

  function render(section, files) {
    if (!files.length) return;
    const grid = section.querySelector('.grid');
    for (const file of files) {
      const video = isVideo(file);
      const fig = document.createElement('figure');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', video ? `Video afspelen: ${label(file)}` : 'Foto vergroten');
      const img = document.createElement('img');
      img.alt = label(file);
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      // Reserve roughly the right space before the image loads.
      const s = size(file);
      if (s) { img.width = s.w; img.height = s.h; }
      img.addEventListener('load', () => img.classList.add('loaded'));
      // A video Drive is still processing has no still frame yet: show an
      // empty frame with the play icon instead.
      withFallback(img, file.id, 800, video ? () => {
        img.remove();
        btn.classList.add('no-thumb');
        if (s) btn.style.aspectRatio = `${s.w} / ${s.h}`;
      } : null);
      btn.append(img);
      if (video) {
        btn.classList.add('is-video');
        btn.insertAdjacentHTML('beforeend', '<span class="play" aria-hidden="true"></span>');
      }
      btn.addEventListener('click', () => open(file));
      fig.append(btn);
      if (file.description) {
        const cap = document.createElement('figcaption');
        cap.textContent = file.description;
        fig.append(cap);
      }
      grid.append(fig);
    }
    section.hidden = false;
  }

  for (const section of sections) {
    listFiles(section.dataset.driveFolder)
      .then(files => render(section, files))
      .catch(err => console.warn('Galerij niet geladen:', err));
  }
})();
