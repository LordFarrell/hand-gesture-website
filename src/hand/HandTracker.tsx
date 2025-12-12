import React, { useEffect, useMemo, useRef, useState } from "react";
import { Hands, HAND_CONNECTIONS, type Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { computeGestures } from "./gesture";
import type { HandGestureState } from "./handTypes";

export type HandTrackerProps = {
  enabled: boolean;
  onState: (state: HandGestureState) => void;
  className?: string;
  showMiniVideo?: boolean;
};

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export const HandTracker: React.FC<HandTrackerProps> = ({
  enabled,
  onState,
  className,
  showMiniVideo = true
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const handsRef = useRef<Hands | null>(null);

  const prevCursorRef = useRef<{ x: number; y: number } | null>(null);
  const prevPinchRef = useRef<boolean>(false);
  const prevTwoHandDistRef = useRef<number | null>(null);
  const lastEmittedAtRef = useRef<number>(0);

  const [initError, setInitError] = useState<string | null>(null);

  const mpHands = useMemo(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.65,
      selfieMode: true
    });
    return hands;
  }, []);

  useEffect(() => {
    handsRef.current = mpHands;
    return () => {
      handsRef.current = null;
    };
  }, [mpHands]);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    async function start() {
      setInitError(null);
      const video = videoRef.current;
      const hands = handsRef.current;
      if (!video || !hands) return;

      hands.onResults((results: Results) => {
        if (disposed) return;

        const landmarks = results.multiHandLandmarks ?? [];
        const computed = computeGestures({
          hands: landmarks as unknown as { x: number; y: number; z?: number }[][],
          prevCursor: prevCursorRef.current,
          prevPinch: prevPinchRef.current,
          prevTwoHandDist: prevTwoHandDistRef.current
        });

        const timestamp = nowMs();
        const state: HandGestureState = {
          hasHands: computed.handsCount > 0,
          handsCount: computed.handsCount,
          cursor: computed.cursor,
          pinch: {
            isPinching: computed.pinch.isPinching,
            justPinched: computed.pinch.justPinched,
            strength: computed.pinch.strength
          },
          rotate: computed.rotate,
          zoom: { delta: computed.zoom.delta, isActive: computed.zoom.isActive },
          timestampMs: timestamp,
          debug: {
            pinchDistNorm: computed.pinch.pinchDistNorm,
            twoHandDist: computed.zoom.twoHandDist
          }
        };

        // Update rolling state
        prevCursorRef.current = computed.cursor;
        prevPinchRef.current = computed.pinch.isPinching;
        prevTwoHandDistRef.current = computed.zoom.twoHandDist ?? null;

        // Throttle emissions a touch to avoid React overload on high-FPS cameras.
        if (timestamp - lastEmittedAtRef.current > 12) {
          lastEmittedAtRef.current = timestamp;
          onState(state);
        }
      });

      try {
        // Request camera access.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: false
        });
        video.srcObject = stream;
        await video.play();

        const cam = new Camera(video, {
          onFrame: async () => {
            await hands.send({ image: video });
          },
          width: 1280,
          height: 720
        });
        cameraRef.current = cam;
        cam.start();
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Could not access camera. Check browser permissions.";
        setInitError(msg);
      }
    }

    start();

    return () => {
      disposed = true;
      // Stop camera tracks if any.
      const video = videoRef.current;
      const stream = video?.srcObject as MediaStream | null;
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
      if (video) video.srcObject = null;

      try {
        cameraRef.current?.stop();
      } catch {
        // ignore
      }
      cameraRef.current = null;
      prevCursorRef.current = null;
      prevPinchRef.current = false;
      prevTwoHandDistRef.current = null;
    };
  }, [enabled, onState]);

  // Provide a tiny "I’m alive" overlay even if errors happen.
  return (
    <div className={className} aria-hidden="true">
      {showMiniVideo ? (
        <div className="miniVideo">
          <div className="miniLabel">
            {enabled ? (initError ? "Camera blocked" : "Webcam + Hands") : "Hands: off"}
          </div>
          <video ref={videoRef} playsInline muted />
        </div>
      ) : (
        <video ref={videoRef} style={{ display: "none" }} playsInline muted />
      )}

      {/* Keep constants referenced so tree-shaking doesn't remove them in some bundlers */}
      <span style={{ display: "none" }}>{String(HAND_CONNECTIONS?.length ?? 0)}</span>
    </div>
  );
};


