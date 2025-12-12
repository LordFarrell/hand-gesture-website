import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PLANETS, type Planet, type PlanetId } from "./planetData";
import type { HandGestureState } from "../hand/handTypes";
import { Stars } from "@react-three/drei";

type SceneProps = {
  selectedId: PlanetId;
  hoveredId: PlanetId | null;
  onHover: (id: PlanetId | null) => void;
  onSelect: (id: PlanetId) => void;
  hand: HandGestureState | null;
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function makePlanetMaterial(p: Planet): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.color),
    roughness: 0.62,
    metalness: 0.05,
    emissive: new THREE.Color(p.id === "sun" ? p.accent : "#000000"),
    emissiveIntensity: p.id === "sun" ? 0.9 : 0.0
  });
}

function OrbitRings({ planets }: { planets: Planet[] }) {
  const group = useMemo(() => {
    const g = new THREE.Group();
    for (const p of planets) {
      if (p.id === "sun") continue;
      const geom = new THREE.RingGeometry(p.orbitRadius - 0.01, p.orbitRadius + 0.01, 192);
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color("#ffffff"),
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(geom, mat);
      ring.rotation.x = Math.PI / 2;
      ring.userData = { orbitFor: p.id };
      g.add(ring);
    }
    return g;
  }, [planets]);

  return <primitive object={group} />;
}

function SaturnRings({ planet }: { planet: Planet }) {
  const ref = useRef<THREE.Mesh>(null);
  const geom = useMemo(() => new THREE.RingGeometry(planet.radius * 1.35, planet.radius * 2.25, 96), [
    planet.radius
  ]);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#ffe9b0"),
        transparent: true,
        opacity: 0.55,
        roughness: 0.8,
        metalness: 0.05,
        side: THREE.DoubleSide
      }),
    []
  );
  return (
    <mesh
      ref={ref}
      geometry={geom}
      material={mat}
      rotation={[Math.PI / 2.2, 0, 0]}
      position={[0, 0, 0]}
    />
  );
}

function PlanetMesh({
  planet,
  selected,
  hovered
}: {
  planet: Planet;
  selected: boolean;
  hovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => makePlanetMaterial(planet), [planet]);
  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(planet.accent),
        transparent: true,
        opacity: 0.15
      }),
    [planet.accent]
  );

  useFrame((_s, dt) => {
    const m = meshRef.current;
    if (!m) return;
    // Subtle self-rotation
    m.rotation.y += dt * 0.28;
    // Breathe highlight
    const targetScale = selected ? 1.08 : hovered ? 1.05 : 1.0;
    m.scale.setScalar(lerp(m.scale.x, targetScale, 0.12));
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow material={mat}>
        <sphereGeometry args={[planet.radius, 48, 48]} />
      </mesh>
      {(selected || hovered) && (
        <mesh material={glowMat}>
          <sphereGeometry args={[planet.radius * 1.35, 24, 24]} />
        </mesh>
      )}
      {planet.id === "saturn" && <SaturnRings planet={planet} />}
    </group>
  );
}

function SolarObjects({
  selectedId,
  hoveredId
}: {
  selectedId: PlanetId;
  hoveredId: PlanetId | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materials = useMemo(() => new Map<PlanetId, THREE.Material>(), []);
  useMemo(() => {
    for (const p of PLANETS) {
      materials.set(p.id, makePlanetMaterial(p));
    }
  }, [materials]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const g = groupRef.current;
    if (!g) return;
    for (const child of g.children) {
      const p: Planet | undefined = (child as any).userData?.planet;
      if (!p || p.id === "sun") continue;
      // Slightly tilt orbits for depth.
      const tilt = 0.08;
      const a = t * p.orbitSpeed;
      const r = p.orbitRadius;
      child.position.set(Math.cos(a) * r, Math.sin(a * 0.7) * r * tilt, Math.sin(a) * r);
      child.rotation.x = THREE.MathUtils.degToRad(p.axialTiltDeg);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Sun at origin */}
      <group userData={{ planet: PLANETS[0] }}>
        <PlanetMesh
          planet={PLANETS[0]}
          selected={selectedId === "sun"}
          hovered={hoveredId === "sun"}
        />
        <pointLight intensity={90} distance={120} color={"#fff1c8"} />
      </group>

      {PLANETS.filter((p) => p.id !== "sun").map((p) => (
        <group key={p.id} userData={{ planet: p }}>
          <PlanetMesh planet={p} selected={selectedId === p.id} hovered={hoveredId === p.id} />
        </group>
      ))}
    </group>
  );
}

function CameraRig({
  hand,
  selectedId,
  onHover,
  onSelect
}: {
  hand: HandGestureState | null;
  selectedId: PlanetId;
  onHover: (id: PlanetId | null) => void;
  onSelect: (id: PlanetId) => void;
}) {
  const { camera, gl, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointerNdc = useMemo(() => new THREE.Vector2(0, 0), []);

  // Camera orbit params
  const rig = useRef({
    theta: 0.8,
    phi: 1.12,
    radius: 36,
    velTheta: 0,
    velPhi: 0,
    velRad: 0
  });

  // Track hover state for stability.
  const hoverRef = useRef<PlanetId | null>(null);

  useFrame((_state, dt) => {
    // Hand control mapping:
    // - open hand motion (cursor delta) rotates
    // - two hands distance zooms
    // - pinch triggers selection (handled here)
    const h = hand;
    const r = rig.current;

    if (h?.hasHands && h.cursor) {
      const cursorX = 1 - h.cursor.x; // mirror for natural feel (video mirrored)
      const cursorY = h.cursor.y;

      // Hover raycast
      pointerNdc.set(cursorX * 2 - 1, -(cursorY * 2 - 1));
      raycaster.setFromCamera(pointerNdc, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      let hovered: PlanetId | null = null;
      for (const hit of intersects) {
        // Walk up to a group with userData.planet
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          const planet: Planet | undefined = (obj as any).userData?.planet;
          if (planet?.id) {
            hovered = planet.id;
            break;
          }
          obj = obj.parent;
        }
        if (hovered) break;
      }
      if (hovered !== hoverRef.current) {
        hoverRef.current = hovered;
        onHover(hovered);
      }

      // Pinch -> select hovered (or keep current).
      if (h.pinch.justPinched) {
        onSelect(hovered ?? selectedId);
      }

      // Rotate (cursor delta when not pinching)
      if (h.rotate.isActive) {
        r.velTheta += h.rotate.dx * 6.0;
        r.velPhi += h.rotate.dy * 6.0;
      }

      // Zoom
      if (h.zoom.isActive) {
        r.velRad += h.zoom.delta * 18.0;
      }
    } else {
      // No hands => decay hover
      if (hoverRef.current !== null) {
        hoverRef.current = null;
        onHover(null);
      }
    }

    // Mouse fallback: use pointer move + wheel
    // (This is intentionally light; hands are primary.)
    // We capture pointer deltas when dragging.
    // NOTE: Hooking events in r3f via gl.domElement.
    // We'll store drag state on the DOM element for simplicity.
    const el = gl.domElement as any;
    if (!el.__sshevents) {
      el.__sshevents = true;
      el.__drag = { down: false, x: 0, y: 0 };

      el.addEventListener("pointerdown", (e: PointerEvent) => {
        el.setPointerCapture(e.pointerId);
        el.__drag.down = true;
        el.__drag.x = e.clientX;
        el.__drag.y = e.clientY;
      });
      el.addEventListener("pointerup", (e: PointerEvent) => {
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        el.__drag.down = false;
      });
      el.addEventListener("pointermove", (e: PointerEvent) => {
        if (!el.__drag.down) return;
        const dx = (e.clientX - el.__drag.x) / Math.max(1, el.clientWidth);
        const dy = (e.clientY - el.__drag.y) / Math.max(1, el.clientHeight);
        el.__drag.x = e.clientX;
        el.__drag.y = e.clientY;
        r.velTheta += dx * 6.2;
        r.velPhi += dy * 6.2;
      });
      el.addEventListener(
        "wheel",
        (e: WheelEvent) => {
          r.velRad += (e.deltaY / 100) * 2.2;
        },
        { passive: true }
      );
    }

    // Integrate + damping
    r.theta += r.velTheta * dt;
    r.phi += r.velPhi * dt;
    r.radius += r.velRad * dt;

    r.velTheta *= Math.pow(0.001, dt);
    r.velPhi *= Math.pow(0.001, dt);
    r.velRad *= Math.pow(0.001, dt);

    r.phi = clamp(r.phi, 0.34, Math.PI - 0.34);
    r.radius = clamp(r.radius, 10, 75);

    // Look-at target: selected planet position (or origin).
    const target = new THREE.Vector3(0, 0, 0);
    if (selectedId !== "sun") {
      // Find group with planet userData
      scene.traverse((obj) => {
        const planet: Planet | undefined = (obj as any).userData?.planet;
        if (planet?.id === selectedId) {
          obj.getWorldPosition(target);
        }
      });
    }

    const x = target.x + r.radius * Math.sin(r.phi) * Math.cos(r.theta);
    const y = target.y + r.radius * Math.cos(r.phi);
    const z = target.z + r.radius * Math.sin(r.phi) * Math.sin(r.theta);
    camera.position.set(x, y, z);
    camera.lookAt(target);
  });

  return null;
}

export function SolarSystemScene(props: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 12, 40], fov: 50, near: 0.1, far: 300 }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#050712"]} />
      <fog attach="fog" args={["#050712", 30, 130]} />

      <ambientLight intensity={0.25} />
      <directionalLight position={[18, 22, 12]} intensity={0.55} castShadow />

      <Stars radius={160} depth={50} count={1800} factor={3} saturation={0} fade speed={0.7} />

      <OrbitRings planets={PLANETS} />
      <SolarObjects selectedId={props.selectedId} hoveredId={props.hoveredId} />
      <CameraRig
        hand={props.hand}
        selectedId={props.selectedId}
        onHover={props.onHover}
        onSelect={props.onSelect}
      />
    </Canvas>
  );
}


