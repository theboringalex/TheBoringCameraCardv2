# Integrating the face badge into the card

This repository is a fork of [TheBoringCameraCard](https://github.com/theboringalex/TheBoringCameraCard).
The card itself is a single file (`the-boring-camera-card.js`). The new code lives in `src/` as ES modules
and is bundled into `the-boring-camera-card-v2.js`.

## Steps

1. Fork / copy `theboringalex/TheBoringCameraCard`, rename the file to `the-boring-camera-card-v2.js`
   and the custom element to `the-boring-camera-card-v2` (so v1 and v2 can run side by side).
   Update `hacs.json` (`filename`) accordingly.
2. Copy `src/nvr-api.js` and `src/face-badge.js` next to it. Bundle them with esbuild:
   `npx esbuild src/entry.js --bundle --format=esm --minify --outfile=the-boring-camera-card-v2.js`
   where `entry.js` imports the original card code plus the two modules. (Or paste both modules into the
   single file and drop the `export` keywords.)
3. Wire the hook points listed in `src/integration-example.js`:
   - `setConfig`: create `NvrApi` from `nvr_url`, `nvr_token`, `nvr_camera`
   - thumbnail renderer: `applyFaceBadge(thumbEl, nvrEvent, api)` (replaces the top-right `__face__` avatar)
   - event header / player overlay: `buildEventHeader`
   - above the timeline: `mountPersonFilter`
   - live updates: `api.subscribe(...)`
4. Keep the existing colour coding (blue = person, orange = animal, purple = vehicle). The NVR event
   `type` uses the same four values: `person | animal | vehicle | motion`.

## Card configuration

```yaml
type: custom:the-boring-camera-card-v2
entity: camera.front_door
nvr_url: http://homeassistant.local:8765
nvr_token: <token from TheBoringNVR -> Settings>
nvr_camera: front_door
```

## Mixed content / HTTPS

If Home Assistant is opened via HTTPS (Nabu Casa, reverse proxy) the browser blocks `http://` calls to the
add-on port. Put the add-on behind your reverse proxy (HTTPS) and use that URL as `nvr_url`.

## Event API used by the card

| Endpoint | Purpose |
|---|---|
| `GET /api/events?camera=&person=&since=&type=` | timeline data; `person` = id, `any`, `unknown` |
| `GET /api/persons` | filter chips |
| `GET /api/events/stream` | SSE live updates |
| `GET /api/media/<path>?token=` | snapshots, face crops, clips |
