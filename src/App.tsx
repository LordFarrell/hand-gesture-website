import React, { useCallback, useMemo, useState } from "react";
import { SolarSystemScene } from "./solar/SolarSystemScene";
import { PlanetList } from "./ui/PlanetList";
import { PlanetPanel } from "./ui/PlanetPanel";
import { Hints } from "./ui/Hints";
import { HandTracker } from "./hand/HandTracker";
import { HandCursorOverlay } from "./hand/HandCursorOverlay";
import type { HandGestureState } from "./hand/handTypes";
import type { PlanetId } from "./solar/planetData";

export function App() {
  const [selectedId, setSelectedId] = useState<PlanetId>("earth");
  const [hoveredId, setHoveredId] = useState<PlanetId | null>(null);
  const [handEnabled, setHandEnabled] = useState(true);
  const [hand, setHand] = useState<HandGestureState | null>(null);

  const onHandState = useCallback((s: HandGestureState) => setHand(s), []);

  const handStatus = useMemo(() => {
    if (!handEnabled) return { label: "Hands off", cls: "warn", dot: "warn" as const };
    if (!hand) return { label: "Initializing…", cls: "", dot: "" as const };
    if (!hand.hasHands) return { label: "Show your hand", cls: "", dot: "" as const };
    return { label: hand.handsCount === 2 ? "Hands: 2 (zoom)" : "Hands: 1", cls: "live", dot: "live" as const };
  }, [hand, handEnabled]);

  return (
    <div className="app">
      <div className="header">
        <div className="brand">
          <div className="brandTitle">Solar System Hand Explorer</div>
          <div className="brandSub">Point • Pinch • Zoom — explore planetary facts</div>
        </div>
        <div className="chipRow">
          <div className="chip">
            <span className={`dot ${handStatus.dot}`} />
            <span>{handStatus.label}</span>
          </div>
          <button className="btn" onClick={() => setHandEnabled((v) => !v)}>
            {handEnabled ? "Disable webcam hands" : "Enable webcam hands"}
          </button>
        </div>
      </div>

      <PlanetList selectedId={selectedId} hoveredId={hoveredId} onSelect={setSelectedId} />

      <div className="sceneWrap" aria-label="3D solar system scene">
        <SolarSystemScene
          selectedId={selectedId}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          onSelect={setSelectedId}
          hand={handEnabled ? hand : null}
        />
        <HandCursorOverlay state={handEnabled ? hand : null} mirrorX />
        <HandTracker enabled={handEnabled} onState={onHandState} className="" showMiniVideo />
      </div>

      <div style={{ display: "grid", gap: 14, gridAutoRows: "minmax(0, auto)" }}>
        <PlanetPanel selectedId={selectedId} hoveredId={hoveredId} />
        <Hints />
      </div>
    </div>
  );
}


