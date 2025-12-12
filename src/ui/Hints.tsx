import React from "react";

export function Hints() {
  return (
    <div className="panel">
      <div className="panelInner">
        <div className="panelTitle">
          <span>Hand controls</span>
          <small>Webcam required</small>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <div className="hint">
            <div className="hintIcon">1</div>
            <div className="hintText">
              Use your <b>index fingertip</b> as a cursor. Keep your hand in view and well-lit for
              stability.
            </div>
          </div>
          <div className="hint">
            <div className="hintIcon">2</div>
            <div className="hintText">
              <b>Pinch</b> (thumb + index) to select the planet you’re pointing at.
            </div>
          </div>
          <div className="hint">
            <div className="hintIcon">3</div>
            <div className="hintText">
              With an <b>open hand</b>, move your fingertip to <b>rotate</b> the view.
            </div>
          </div>
          <div className="hint">
            <div className="hintIcon">4</div>
            <div className="hintText">
              Show <b>two hands</b> and change their distance to <b>zoom</b>.
            </div>
          </div>
          <div className="hint">
            <div className="hintIcon">⌁</div>
            <div className="hintText">
              Mouse/touch fallback: <b>drag</b> to rotate, <b>scroll</b> to zoom.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


