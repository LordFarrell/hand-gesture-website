export type HandCursor = {
  x: number; // 0..1 (left->right)
  y: number; // 0..1 (top->bottom)
};

export type HandGestureState = {
  hasHands: boolean;
  handsCount: 0 | 1 | 2;
  cursor: HandCursor | null;
  pinch: {
    isPinching: boolean;
    justPinched: boolean;
    strength: number; // 0..1
  };
  zoom: {
    delta: number; // +/- per frame-ish
    isActive: boolean;
  };
  rotate: {
    dx: number; // -1..1
    dy: number; // -1..1
    isActive: boolean;
  };
  timestampMs: number;
  debug?: {
    pinchDistNorm?: number;
    twoHandDist?: number;
  };
};


