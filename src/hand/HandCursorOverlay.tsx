import React from "react";
import type { HandGestureState } from "./handTypes";

export function HandCursorOverlay({
  state,
  mirrorX = true
}: {
  state: HandGestureState | null;
  mirrorX?: boolean;
}) {
  if (!state?.cursor || !state.hasHands) return null;
  const x = mirrorX ? 1 - state.cursor.x : state.cursor.x;
  const y = state.cursor.y;
  const left = `${Math.max(0, Math.min(1, x)) * 100}%`;
  const top = `${Math.max(0, Math.min(1, y)) * 100}%`;
  const cls = `handCursor${state.pinch.isPinching ? " pinch" : ""}`;
  return (
    <div className="overlay" aria-hidden="true">
      <div className={cls} style={{ left, top }} />
    </div>
  );
}


