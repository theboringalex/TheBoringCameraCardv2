/**
 * HKSV-style face badge + person filter bar for TheBoringCameraCardv2.
 * Framework-agnostic (plain DOM) so it can be dropped into the existing card's thumbnail renderer.
 */

export const FACE_BADGE_CSS = `
  .tbc-thumb { position: relative; overflow: hidden; }
  .tbc-face {
    position: absolute; left: 6px; bottom: 6px; width: 38px; height: 38px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.92); background: #2a2e3a center / cover no-repeat;
    box-shadow: 0 2px 8px rgba(0,0,0,.55); opacity: 0; transform: scale(.7);
    animation: tbc-pop .32s cubic-bezier(.2,.9,.3,1.3) .05s forwards; pointer-events: none;
  }
  .tbc-face.unknown { display: grid; place-items: center; color: #fff; font: 700 18px/1 system-ui; }
  .tbc-face.unknown::after { content: '?'; }
  .tbc-name {
    position: absolute; left: 50px; bottom: 12px; max-width: calc(100% - 58px); padding: 2px 8px;
    border-radius: 10px; background: rgba(20,22,28,.72); backdrop-filter: blur(6px);
    color: #fff; font: 600 12px/1.5 system-ui, sans-serif; white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; pointer-events: none; opacity: 0; animation: tbc-fade .3s ease .15s forwards;
  }
  .tbc-header-person { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; }
  .tbc-header-person img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
  .tbc-filter { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 8px; scrollbar-width: none; }
  .tbc-filter::-webkit-scrollbar { display: none; }
  .tbc-chip {
    flex: none; display: flex; align-items: center; gap: 6px; padding: 3px 12px 3px 3px; border-radius: 999px;
    border: 1.5px solid transparent; background: var(--secondary-background-color, #23262f);
    color: var(--primary-text-color, #fff); font: 500 13px system-ui, sans-serif; cursor: pointer;
    transition: border-color .2s, transform .15s;
  }
  .tbc-chip.plain { padding: 6px 12px; }
  .tbc-chip:active { transform: scale(.96); }
  .tbc-chip.on { border-color: var(--primary-color, #03a9f4); }
  .tbc-chip img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
  @keyframes tbc-pop { to { opacity: 1; transform: scale(1); } }
  @keyframes tbc-fade { to { opacity: 1; } }
`;

/** Add the stylesheet once (call from the card's connectedCallback / render root). */
export function injectFaceBadgeStyles(root) {
  if (root.querySelector('style[data-tbc-face]')) return;
  const s = document.createElement('style');
  s.dataset.tbcFace = '1';
  s.textContent = FACE_BADGE_CSS;
  root.appendChild(s);
}

/**
 * Overlay a round face + name on a thumbnail element (must have class `tbc-thumb` or be positioned).
 * `ev` is an NVR event: { person: {name, avatar}|null, face, status, type }
 */
export function applyFaceBadge(thumbEl, ev, api) {
  thumbEl.querySelectorAll('.tbc-face, .tbc-name').forEach((n) => n.remove());
  if (ev.type !== 'person') return;

  const badge = document.createElement('div');
  badge.className = 'tbc-face';
  const img = ev.person?.avatar || ev.face;
  if (img) badge.style.backgroundImage = `url("${api.media(img)}")`;
  else if (ev.status === 'unknown' || ev.status === 'new') badge.classList.add('unknown');
  else return;                                      // no_face: show nothing
  thumbEl.appendChild(badge);

  const label = ev.person?.name || (ev.status === 'unknown' ? 'Unknown' : '');
  if (label) {
    const name = document.createElement('div');
    name.className = 'tbc-name';
    name.textContent = label;
    thumbEl.appendChild(name);
  }
}

/** Prominent name in the event header (player overlay / detail view). */
export function buildEventHeader(ev, api) {
  const el = document.createElement('div');
  el.className = 'tbc-header-person';
  if (ev.person) {
    if (ev.person.avatar) {
      const i = document.createElement('img');
      i.src = api.media(ev.person.avatar);
      i.alt = '';
      el.appendChild(i);
    }
    el.append(ev.person.name);
  } else {
    el.append(ev.type === 'person' ? 'Unknown person' : ev.type[0].toUpperCase() + ev.type.slice(1));
  }
  return el;
}

/**
 * Person filter chips: "All · Known · Unknown · Alex · Kristina …".
 * onChange(value) receives '' | 'any' | 'unknown' | '<person id>' -> pass to NvrApi.events({person}).
 */
export function buildPersonFilter(persons, selected, api, onChange) {
  const bar = document.createElement('div');
  bar.className = 'tbc-filter';
  const items = [
    { v: '', label: 'All' },
    { v: 'unknown', label: 'Unknown' },
    ...persons.map((p) => ({ v: String(p.id), label: p.name, avatar: p.avatar })),
  ];
  for (const it of items) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `tbc-chip${it.avatar ? '' : ' plain'}${selected === it.v ? ' on' : ''}`;
    if (it.avatar) {
      const i = document.createElement('img');
      i.src = api.media(it.avatar);
      i.alt = '';
      chip.appendChild(i);
    }
    chip.append(it.label);
    chip.addEventListener('click', () => {
      bar.querySelectorAll('.tbc-chip').forEach((c) => c.classList.remove('on'));
      chip.classList.add('on');
      onChange(it.v);
    });
    bar.appendChild(chip);
  }
  return bar;
}
