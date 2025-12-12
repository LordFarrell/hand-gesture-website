import React from "react";
import { getPlanet, type PlanetId } from "../solar/planetData";

function fmtNum(n: number): string {
  if (Math.abs(n) >= 1000) return n.toLocaleString();
  return String(n);
}

export function PlanetPanel({
  selectedId,
  hoveredId
}: {
  selectedId: PlanetId;
  hoveredId: PlanetId | null;
}) {
  const p = getPlanet(selectedId);
  const hover = hoveredId ? getPlanet(hoveredId) : null;
  return (
    <div className="panel right">
      <div className="panelInner">
        <div className="panelTitle">
          <span>Planet details</span>
          <small style={{ color: "rgba(255,255,255,.65)" }}>
            {hover ? `Hovering: ${hover.name}` : " "}
          </small>
        </div>

        <div
          className="card"
          style={{
            borderColor: "rgba(255,255,255,.12)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,.05), rgba(0,0,0,.10))"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="swatch" style={{ background: p.color, width: 16, height: 16 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.2 }}>{p.name}</div>
              <div className="rowSub">{p.subtitle}</div>
            </div>
          </div>

          <div className="kv">
            <div className="card">
              <div className="k">Day length</div>
              <div className="v">{fmtNum(p.dayLengthHours)} h</div>
            </div>
            <div className="card">
              <div className="k">Year length</div>
              <div className="v">{p.yearLengthDays ? `${fmtNum(p.yearLengthDays)} days` : "—"}</div>
            </div>
            <div className="card">
              <div className="k">Mean temp</div>
              <div className="v">{fmtNum(p.meanTempC)} °C</div>
            </div>
            <div className="card">
              <div className="k">Moons</div>
              <div className="v">{fmtNum(p.moons)}</div>
            </div>
            <div className="card">
              <div className="k">Axial tilt</div>
              <div className="v">{fmtNum(p.axialTiltDeg)}°</div>
            </div>
            <div className="card">
              <div className="k">Orbit scale</div>
              <div className="v">{p.orbitRadius === 0 ? "—" : fmtNum(p.orbitRadius)}</div>
            </div>
          </div>
        </div>

        <div style={{ height: 12 }} />

        <div className="panelTitle">
          <span>Quick facts</span>
          <small>High-signal</small>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {p.facts.map((f, idx) => (
            <div key={idx} className="hint">
              <div className="hintIcon">i</div>
              <div className="hintText">{f}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


