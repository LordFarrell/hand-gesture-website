type NormalizedLandmark = { x: number; y: number; z?: number };

function dist2(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export type GestureComputeInput = {
  // MediaPipe Hands landmarks: array per hand of length 21
  hands: NormalizedLandmark[][];
  // Previous cursor position for smoothing
  prevCursor?: { x: number; y: number } | null;
  prevPinch?: boolean;
  prevTwoHandDist?: number | null;
};

export type GestureComputeOutput = {
  handsCount: 0 | 1 | 2;
  cursor: { x: number; y: number } | null;
  pinch: { isPinching: boolean; justPinched: boolean; strength: number; pinchDistNorm?: number };
  rotate: { dx: number; dy: number; isActive: boolean };
  zoom: { delta: number; isActive: boolean; twoHandDist?: number };
};

export function computeGestures(input: GestureComputeInput): GestureComputeOutput {
  const handsCount = (Math.min(2, input.hands.length) as 0 | 1 | 2) ?? 0;
  if (handsCount === 0) {
    return {
      handsCount: 0,
      cursor: null,
      pinch: { isPinching: false, justPinched: false, strength: 0 },
      rotate: { dx: 0, dy: 0, isActive: false },
      zoom: { delta: 0, isActive: false }
    };
  }

  // Use first hand for cursor + pinch.
  const h0 = input.hands[0];
  const thumbTip = h0[4];
  const indexTip = h0[8];
  const wrist = h0[0];
  const indexMcp = h0[5];

  // Normalization scale: approximate hand size in frame.
  const scale = Math.max(1e-6, dist2(wrist, indexMcp));
  const pinchDistNorm = dist2(thumbTip, indexTip) / scale;

  // Hysteresis thresholds (tuned for webcam variability).
  const pinchOn = 0.50;
  const pinchOff = 0.62;
  const wasPinching = Boolean(input.prevPinch);
  const isPinching = wasPinching ? pinchDistNorm < pinchOff : pinchDistNorm < pinchOn;

  // Strength: closer = stronger.
  const strength = clamp01(1 - (pinchDistNorm - 0.35) / 0.45);

  const justPinched = isPinching && !wasPinching;

  // Cursor: index tip position. MediaPipe gives normalized coords already.
  // We'll mirror in the UI layer (video is mirrored); keep scene coords consistent.
  const rawCursor = { x: indexTip.x, y: indexTip.y };

  // Simple smoothing (critically improves stability).
  const prev = input.prevCursor;
  const alpha = 0.28; // lower = smoother
  const cursor = prev
    ? { x: prev.x + (rawCursor.x - prev.x) * alpha, y: prev.y + (rawCursor.y - prev.y) * alpha }
    : rawCursor;

  // Rotate gesture: when NOT pinching, treat cursor deltas as orbit drag.
  const rotateActive = !isPinching && prev != null;
  const dx = rotateActive ? (cursor.x - prev.x) : 0;
  const dy = rotateActive ? (cursor.y - prev.y) : 0;

  // Zoom: if two hands, use distance between index tips as pinch-zoom.
  let zoomDelta = 0;
  let isZoomActive = false;
  let twoHandDist: number | undefined;
  if (handsCount === 2) {
    const h1 = input.hands[1];
    const d = dist2(h0[8], h1[8]);
    twoHandDist = d;
    const prevD = input.prevTwoHandDist ?? null;
    if (prevD != null) {
      const delta = d - prevD; // >0 means hands moved apart
      zoomDelta = -delta * 6.5; // invert: farther apart => zoom OUT feels wrong; this makes farther apart => zoom IN
      isZoomActive = Math.abs(delta) > 0.002;
    }
  }

  return {
    handsCount,
    cursor,
    pinch: { isPinching, justPinched, strength, pinchDistNorm },
    rotate: { dx, dy, isActive: rotateActive },
    zoom: { delta: zoomDelta, isActive: isZoomActive, twoHandDist }
  };
}


