<p align="center">
  <img src="https://raw.githubusercontent.com/theboringalex/TheBoringCameraCardv2/main/assets/logo.svg" width="160" alt="BoringNVR logo">
</p>

# The Boring Camera Card v2

Fork of [TheBoringCameraCard](https://github.com/theboringalex/TheBoringCameraCard) with
HomeKit-Secure-Video-style face recognition, powered by the
[TheBoringNVR](https://github.com/theboringalex/TheBoringNVR) add-on.

## What is new in v2

- Round face badge on the thumbnail of every person event (bottom left), with the person's name next to it
- Person name (and avatar) in the event header
- Timeline filter chips: *All*, *Unknown* and one chip per person ("show only events with Alex")
- Live updates through the NVR event stream (SSE)
- Unchanged: interactive timeline with colour-coded events, push-to-talk, WebRTC via go2rtc

## Configuration

```yaml
type: custom:the-boring-camera-card-v2
entity: camera.front_door
nvr_url: http://homeassistant.local:8765
nvr_token: <token shown in TheBoringNVR -> Settings>
nvr_camera: front_door
```

## Repository layout

```
TheBoringCameraCardv2/
|- hacs.json
|- assets/logo.svg
|- the-boring-camera-card-v2.js     bundled card (original card + src/ modules)
|- src/
|  |- nvr-api.js                    NVR REST/SSE client
|  |- face-badge.js                 badge, header, person filter + CSS
|  '- integration-example.js        hook points for the existing card
'- docs/INTEGRATION.md
```

## Installation

1. HACS -> Custom repositories -> add this repository as type **Dashboard**.
2. Download, reload the browser, add the resource if HACS did not.
3. Install and configure the TheBoringNVR add-on first (see its README).

> Note: the files in `src/` are the new modules. They still have to be wired into the original card file
> as described in `docs/INTEGRATION.md`.
