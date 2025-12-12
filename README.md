# Solar System Hand Explorer

An interactive solar system website with **webcam hand controls**:

- **Point** with your index finger to move a cursor
- **Pinch** (thumb + index) to select a planet
- **Two hands** to zoom (change distance between hands)
- Mouse/touch fallback: drag to rotate, scroll to zoom

## Run locally

1) Install deps

```bash
npm install
```

2) Start dev server

```bash
npm run dev
```

Then open the printed local URL and allow **camera permissions**.

## Notes

- Hand tracking uses **MediaPipe Hands** in the browser via CDN-loaded assets.
- Video preview is mirrored for natural “selfie” control.


