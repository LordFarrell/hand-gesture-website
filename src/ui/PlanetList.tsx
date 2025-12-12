import React from "react";
import { PLANETS, type PlanetId } from "../solar/planetData";

export function PlanetList({
  selectedId,
  hoveredId,
  onSelect
}: {
  selectedId: PlanetId;
  hoveredId: PlanetId | null;
  onSelect: (id: PlanetId) => void;
}) {
  return (
    <div className="panel left">
      <div className="panelInner">
        <div className="panelTitle">
          <span>Planets</span>
          <small>Pinch to select</small>
        </div>
        <div className="list" role="list">
          {PLANETS.map((p) => {
            const active = p.id === selectedId;
            const hovered = p.id === hoveredId;
            return (
              <div
                key={p.id}
                className={`row${active ? " active" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(p.id);
                }}
                style={{
                  borderColor: hovered ? "rgba(124,247,255,.40)" : undefined
                }}
                aria-label={`Select ${p.name}`}
              >
                <div className="swatch" style={{ background: p.color }} />
                <div style={{ minWidth: 0 }}>
                  <div className="rowTitle">{p.name}</div>
                  <div className="rowSub">{p.subtitle}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


