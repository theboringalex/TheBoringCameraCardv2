/**
 * Integration sketch for the existing the-boring-camera-card.js.
 * Adapt the marked hook points to the card's real function names (see docs/INTEGRATION.md).
 */
import { NvrApi } from './nvr-api.js';
import { applyFaceBadge, buildEventHeader, buildPersonFilter, injectFaceBadgeStyles } from './face-badge.js';

// 1) setConfig(config): create the client when nvr_url is configured
//    this._nvr = new NvrApi({ url: config.nvr_url, token: config.nvr_token, camera: config.nvr_camera });

// 2) connectedCallback / first render: styles + subscription for live updates
//    injectFaceBadgeStyles(this.shadowRoot);
//    this._unsub = this._nvr.subscribe((ev) => this._upsertNvrEvent(ev));   // disconnectedCallback: this._unsub()

// 3) loading the timeline: merge NVR events with the recordings the card already lists.
//    Match on timestamp (+-5 s) so one thumbnail carries both the recording and the face.
export async function loadNvrEvents(card, personFilter = '') {
  if (!card._nvr?.enabled) return new Map();
  const events = await card._nvr.events({ person: personFilter, limit: 300 });
  const byTs = new Map();
  for (const ev of events) byTs.set(Math.round(ev.ts), ev);
  return byTs;
}

export function findNvrEvent(byTs, recordingTs) {
  for (let d = 0; d <= 5; d++) {
    const hit = byTs.get(Math.round(recordingTs) + d) || byTs.get(Math.round(recordingTs) - d);
    if (hit) return hit;
  }
  return null;
}

// 4) in the thumbnail renderer (where the card already draws the person/animal/vehicle dot):
//    const nvr = findNvrEvent(this._nvrByTs, item.timestamp);
//    if (nvr) applyFaceBadge(thumbEl, nvr, this._nvr);
//    -> keeps the existing colour-coded dot; badge sits bottom-left, name next to it.

// 5) in the player / event header: headerEl.replaceChildren(buildEventHeader(nvr, this._nvr));

// 6) above the timeline: filter chips
export async function mountPersonFilter(card, container) {
  const persons = await card._nvr.persons();
  if (!persons.length) return;
  const bar = buildPersonFilter(persons, card._personFilter || '', card._nvr, async (value) => {
    card._personFilter = value;
    card._nvrByTs = await loadNvrEvents(card, value);
    card._applyTimelineFilter(value ? new Set([...card._nvrByTs.values()].map((e) => Math.round(e.ts))) : null);
  });
  container.prepend(bar);
}

// 7) native WebRTC: the card already plays through go2rtc; nothing to change. For setups without
//    `go2rtc_server*` options you may call `await card._nvr.webrtc()` to get api/ws URLs from the add-on.
