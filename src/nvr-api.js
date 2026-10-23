/**
 * Client for the TheBoringNVR add-on API.
 *
 * Card config (YAML):
 *   nvr_url:    http://homeassistant.local:8765     # add-on port (or your reverse-proxy URL)
 *   nvr_token:  <API token from add-on GUI -> Settings>
 *   nvr_camera: front_door                          # camera id in the add-on
 */
export class NvrApi {
  constructor({ url, token, camera }) {
    this.base = String(url || '').replace(/\/$/, '');
    this.token = token || '';
    this.camera = camera || '';
    this._persons = null;
  }

  get enabled() {
    return !!this.base;
  }

  /** Media URLs are used in <img>/<video>, which cannot send headers -> token as query parameter. */
  media(path) {
    if (!path) return '';
    return `${this.base}${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(this.token)}`;
  }

  async _get(path, params = {}) {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    const r = await fetch(`${this.base}/api/${path}${q.size ? `?${q}` : ''}`, {
      headers: { 'X-API-Key': this.token },
    });
    if (!r.ok) throw new Error(`NVR ${path}: HTTP ${r.status}`);
    return r.json();
  }

  /** person: '' | 'any' | 'unknown' | <person id> */
  events({ since, before, person = '', type = '', limit = 200 } = {}) {
    return this._get('events', { camera: this.camera, since, before, person, type, limit });
  }

  async persons(force = false) {
    if (!this._persons || force) this._persons = await this._get('persons');
    return this._persons;
  }

  webrtc() {
    return this._get(`cameras/${encodeURIComponent(this.camera)}/webrtc`);
  }

  /** Live updates via Server-Sent Events. Returns an unsubscribe function. */
  subscribe(onEvent) {
    if (!this.enabled) return () => {};
    const es = new EventSource(`${this.base}/api/events/stream?token=${encodeURIComponent(this.token)}`);
    es.onmessage = (m) => {
      try {
        const ev = JSON.parse(m.data);
        if (!this.camera || ev.camera === this.camera) onEvent(ev);
      } catch (_) { /* ignore malformed frames */ }
    };
    return () => es.close();
  }
}
