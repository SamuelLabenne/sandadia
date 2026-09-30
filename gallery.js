// Photo galleries fed by Google Drive folders. Every
// <section data-drive-folder="FOLDER_ID" hidden> on a page shows the images in
// that folder, and stays hidden if the folder is empty or can't be read.
// Setup (folder sharing + API key) is described in README.md.
(() => {
  const DRIVE_API_KEY = 'PASTE_API_KEY_HERE';

  const sections = [...document.querySelectorAll('[data-drive-folder]')]
    .filter(s => !s.dataset.driveFolder.startsWith('PASTE'));
  if (!sections.length || DRIVE_API_KEY.startsWith('PASTE')) return;

  // Drive serves resized copies, so phones never download the full original.
  const src = (id, w) => `https://lh3.googleusercontent.com/d/${id}=w${w}`;
  const fallback = (id, w) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;
  const withFallback = (img, id, w) => {
    img.onerror = () => { img.onerror = null; img.src = fallback(id, w); };
    img.src = src(id, w);
  };

  const viewer = document.createElement('dialog');
  viewer.className = 'viewer';
  viewer.innerHTML = '<button type="button">Sluiten</button><img alt="" referrerpolicy="no-referrer"><p hidden></p>';
  document.body.append(viewer);
  const viewerImg = viewer.querySelector('img');
  const viewerCaption = viewer.querySelector('p');
  viewer.addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => { viewerImg.removeAttribute('src'); });

  function open(file) {
    viewerImg.alt = file.description || 'Gedeelde foto';
    withFallback(viewerImg, file.id, 2000);
    viewerCaption.textContent = file.description || '';
    viewerCaption.hidden = !file.description;
    viewer.showModal();
  }

  async function listPhotos(folderId) {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      orderBy: 'name',
      pageSize: '200',
      fields: 'nextPageToken,files(id,description,imageMediaMetadata(width,height,rotation))',
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
      const fig = document.createElement('figure');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Foto vergroten');
      const img = document.createElement('img');
      img.alt = file.description || 'Gedeelde foto';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      // Reserve roughly the right space before the photo loads.
      const m = file.imageMediaMetadata;
      if (m && m.width && m.height) {
        const turned = m.rotation % 2 === 1;
        img.width = turned ? m.height : m.width;
        img.height = turned ? m.width : m.height;
      }
      img.addEventListener('load', () => img.classList.add('loaded'));
      withFallback(img, file.id, 800);
      btn.append(img);
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
    listPhotos(section.dataset.driveFolder)
      .then(files => render(section, files))
      .catch(err => console.warn('Fotogalerij niet geladen:', err));
  }
})();
