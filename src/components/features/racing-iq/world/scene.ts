import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  Tweens,
  easeInOutSine,
  easeOutCubic,
  lerp,
  damp,
} from "./tween";

/**
 * Racing IQ — the race world.
 *
 * Stylized 3D, broadcast-camera language. The peloton is an instanced
 * low-poly bunch whose *behaviour* (accordion, echelons, climbing
 * gaps) carries the realism; the landscape is layered ridgelines and
 * fog doing atmospheric-perspective work. Everything is tuned for the
 * 60fps-on-a-mid-range-phone floor: one rider draw call, no shadows,
 * no post-processing — the freeze treatment is CSS on the canvas.
 *
 * The world is a treadmill: riders hold station near the origin while
 * road furniture scrolls past and recycles. The camera only ever moves
 * for a reason.
 */

export type FormationKind =
  | "bunch"
  | "paceline"
  | "echelon"
  | "climb"
  | "descent"
  | "sprint";

export interface WorldMoment {
  environment: "valley" | "plain" | "forest" | "town";
  /** 0 = cold morning, 1 = golden-hour finale. */
  timeOfDay: number;
  formation: FormationKind;
  /** Player's race position — controls second-group staging. */
  position: "bunch" | "break" | "chasing" | "dropped";
  /** Scroll speed, m/s. */
  speed: number;
  /** Road pitch in degrees. Positive = climbing. */
  grade?: number;
  wind?: boolean;
  wet?: boolean;
  crowd?: boolean;
}

interface Palette {
  skyTop: THREE.Color;
  skyHorizon: THREE.Color;
  sun: THREE.Color;
  sunHeight: number; // 0 low, 1 high
  fog: THREE.Color;
  fogNear: number;
  fogFar: number;
  ground: THREE.Color;
  ridgeNear: THREE.Color;
  ridgeFar: THREE.Color;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  sunIntensity: number;
}

const c = (hex: number) => new THREE.Color(hex);

/** Time-of-day keyframes; environment then nudges ground/ridge hues. */
const DAY_KEYS: { t: number; p: Palette }[] = [
  {
    t: 0,
    p: {
      skyTop: c(0x1b1740), skyHorizon: c(0x8a7aa8), sun: c(0xffd9b0), sunHeight: 0.16,
      fog: c(0x9087ab), fogNear: 60, fogFar: 420,
      ground: c(0x3d4438), ridgeNear: c(0x3a3358), ridgeFar: c(0x6c628f),
      hemiSky: c(0xbcb3d8), hemiGround: c(0x4a4a44), sunIntensity: 1.5,
    },
  },
  {
    t: 0.35,
    p: {
      skyTop: c(0x2c3a6e), skyHorizon: c(0xc8c3b4), sun: c(0xfff2d8), sunHeight: 0.7,
      fog: c(0xc3bfb2), fogNear: 80, fogFar: 520,
      ground: c(0x575a40), ridgeNear: c(0x49476a), ridgeFar: c(0x8d87a3),
      hemiSky: c(0xdcd9cc), hemiGround: c(0x57543e), sunIntensity: 1.9,
    },
  },
  {
    t: 0.62,
    p: {
      skyTop: c(0x27265c), skyHorizon: c(0xd8a878), sun: c(0xffc878), sunHeight: 0.4,
      fog: c(0xb39a8e), fogNear: 55, fogFar: 430,
      ground: c(0x47422f), ridgeNear: c(0x403457), ridgeFar: c(0x8a6f86),
      hemiSky: c(0xd9c2ae), hemiGround: c(0x4c4434), sunIntensity: 1.7,
    },
  },
  {
    t: 0.95,
    p: {
      skyTop: c(0x210140), skyHorizon: c(0xe88a55), sun: c(0xff9e4d), sunHeight: 0.12,
      fog: c(0x8f5d63), fogNear: 45, fogFar: 380,
      ground: c(0x39302e), ridgeNear: c(0x33204a), ridgeFar: c(0x7a4f68),
      hemiSky: c(0xe0a98c), hemiGround: c(0x3d322e), sunIntensity: 1.6,
    },
  },
];

function paletteAt(t: number): Palette {
  const keys = DAY_KEYS;
  if (t <= keys[0].t) return keys[0].p;
  if (t >= keys[keys.length - 1].t) return keys[keys.length - 1].p;
  let i = 0;
  while (keys[i + 1].t < t) i++;
  const a = keys[i], b = keys[i + 1];
  const f = (t - a.t) / (b.t - a.t);
  const mix = (ka: THREE.Color, kb: THREE.Color) => ka.clone().lerp(kb, f);
  return {
    skyTop: mix(a.p.skyTop, b.p.skyTop),
    skyHorizon: mix(a.p.skyHorizon, b.p.skyHorizon),
    sun: mix(a.p.sun, b.p.sun),
    sunHeight: lerp(a.p.sunHeight, b.p.sunHeight, f),
    fog: mix(a.p.fog, b.p.fog),
    fogNear: lerp(a.p.fogNear, b.p.fogNear, f),
    fogFar: lerp(a.p.fogFar, b.p.fogFar, f),
    ground: mix(a.p.ground, b.p.ground),
    ridgeNear: mix(a.p.ridgeNear, b.p.ridgeNear),
    ridgeFar: mix(a.p.ridgeFar, b.p.ridgeFar),
    hemiSky: mix(a.p.hemiSky, b.p.hemiSky),
    hemiGround: mix(a.p.hemiGround, b.p.hemiGround),
    sunIntensity: lerp(a.p.sunIntensity, b.p.sunIntensity, f),
  };
}

/** Environment tints applied over the time-of-day palette. */
function applyEnvironment(p: Palette, env: WorldMoment["environment"], wet: boolean): Palette {
  const out = { ...p };
  if (env === "plain") {
    out.ground = p.ground.clone().lerp(c(0x8a7a3e), 0.35);
    out.fogFar = p.fogFar + 120;
  } else if (env === "forest") {
    out.ground = p.ground.clone().lerp(c(0x1f3322), 0.55);
    out.fogNear = p.fogNear * 0.5;
    out.fogFar = p.fogFar * 0.62;
  } else if (env === "town") {
    out.ground = p.ground.clone().lerp(c(0x3a3338), 0.5);
  }
  if (wet) {
    out.fogNear *= 0.7;
    out.fogFar *= 0.8;
    out.ground = out.ground.clone().multiplyScalar(0.8);
  }
  return out;
}

// ── Geometry builders ────────────────────────────────────────────

function pushColor(geo: THREE.BufferGeometry, color: THREE.Color): THREE.BufferGeometry {
  const count = geo.getAttribute("position").count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

/** Low-poly rider, facing -z. Jersey vertices are white so the
 * per-instance color becomes the kit; hardware stays dark. */
function buildRiderGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const dark = c(0x2a2a30);
  const frame = c(0x3a3a42);
  const jersey = c(0xffffff);
  const helmet = c(0xd8d8d8);

  const wheel = (z: number) => {
    const g = new THREE.CylinderGeometry(0.34, 0.34, 0.05, 9);
    g.rotateZ(Math.PI / 2);
    g.translate(0, 0.34, z);
    return pushColor(g, dark);
  };
  parts.push(wheel(-0.52), wheel(0.52));

  const tube = new THREE.BoxGeometry(0.07, 0.09, 0.95);
  tube.rotateX(0.12);
  tube.translate(0, 0.62, 0);
  parts.push(pushColor(tube, frame));

  const seatpost = new THREE.BoxGeometry(0.06, 0.3, 0.06);
  seatpost.translate(0, 0.78, 0.3);
  parts.push(pushColor(seatpost, frame));

  // Torso — leaned forward into the drops.
  const torso = new THREE.CapsuleGeometry(0.155, 0.46, 3, 7);
  torso.rotateX(Math.PI / 2 - 0.42);
  torso.translate(0, 1.0, -0.04);
  parts.push(pushColor(torso, jersey));

  // Upper arms reaching to the bars.
  const arm = (x: number) => {
    const g = new THREE.CapsuleGeometry(0.05, 0.3, 2, 5);
    g.rotateX(Math.PI / 2 - 0.95);
    g.translate(x, 0.98, -0.33);
    return pushColor(g, jersey);
  };
  parts.push(arm(-0.16), arm(0.16));

  // Legs (static — cadence is sold by body bob and speed).
  const leg = (x: number, lift: number) => {
    const g = new THREE.CapsuleGeometry(0.06, 0.34, 2, 5);
    g.rotateX(0.25);
    g.translate(x, 0.62 + lift, 0.12);
    return pushColor(g, dark);
  };
  parts.push(leg(-0.1, 0.04), leg(0.1, -0.02));

  const head = new THREE.SphereGeometry(0.13, 8, 6);
  head.translate(0, 1.27, -0.4);
  parts.push(pushColor(head, helmet));

  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

/** A jagged ridgeline silhouette as a filled shape. */
function buildRidge(width: number, peak: number, seed: number): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  const segments = 24;
  shape.moveTo(-width / 2, -40);
  let y = peak * (0.3 + 0.4 * Math.abs(Math.sin(seed)));
  for (let i = 0; i <= segments; i++) {
    const x = -width / 2 + (i / segments) * width;
    const n =
      Math.sin(i * 1.7 + seed * 7.3) * 0.5 +
      Math.sin(i * 0.6 + seed * 3.1) * 0.35 +
      Math.sin(i * 3.3 + seed * 11.7) * 0.15;
    y = peak * (0.45 + 0.55 * Math.abs(n));
    shape.lineTo(x, y);
  }
  shape.lineTo(width / 2, -40);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

function buildTreeGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(0.18, 0.26, 1.6, 5);
  trunk.translate(0, 0.8, 0);
  parts.push(pushColor(trunk, c(0x2b2118)));
  const cone1 = new THREE.ConeGeometry(1.7, 3.4, 6);
  cone1.translate(0, 3.1, 0);
  parts.push(pushColor(cone1, c(0xffffff)));
  const cone2 = new THREE.ConeGeometry(1.25, 2.6, 6);
  cone2.translate(0, 4.6, 0);
  parts.push(pushColor(cone2, c(0xffffff)));
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

function radialGlowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ── Formations ───────────────────────────────────────────────────

interface Offset { x: number; z: number }

function rand(seed: number): number {
  // Deterministic per-rider jitter so formations don't reshuffle.
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function formationOffsets(kind: FormationKind, n: number): Offset[] {
  const out: Offset[] = [];
  switch (kind) {
    case "bunch": {
      const wide = 6;
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / wide);
        const col = i % wide;
        out.push({
          x: (col - (wide - 1) / 2) * 0.85 + (rand(i) - 0.5) * 0.5,
          z: row * 1.5 + (rand(i + 50) - 0.5) * 0.7,
        });
      }
      break;
    }
    case "sprint": {
      const wide = 7;
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / wide);
        const col = i % wide;
        out.push({
          x: (col - (wide - 1) / 2) * 0.72 + (rand(i) - 0.5) * 0.3,
          z: row * 1.15 + (rand(i + 9) - 0.5) * 0.4,
        });
      }
      break;
    }
    case "paceline": {
      for (let i = 0; i < n; i++) {
        out.push({
          x: (i % 2 === 0 ? -0.4 : 0.4) + (rand(i) - 0.5) * 0.15,
          z: i * 1.35,
        });
      }
      break;
    }
    case "echelon": {
      const fan = Math.min(n, 8);
      for (let i = 0; i < fan; i++) {
        out.push({ x: -2.8 + i * 0.8, z: i * 1.0 });
      }
      for (let i = fan; i < n; i++) {
        // The gutter: single file on the sheltered edge, gaps opening.
        out.push({
          x: 2.9 + (rand(i) - 0.5) * 0.2,
          z: fan * 1.0 + (i - fan) * (1.6 + (i - fan) * 0.22),
        });
      }
      break;
    }
    case "climb": {
      for (let i = 0; i < n; i++) {
        out.push({
          x: (rand(i) - 0.5) * 1.6,
          z: i * (1.6 + i * 0.16),
        });
      }
      break;
    }
    case "descent": {
      for (let i = 0; i < n; i++) {
        out.push({
          x: Math.sin(i * 0.9) * 0.5,
          z: i * 2.4,
        });
      }
      break;
    }
  }
  return out;
}

/** Riders in the player's group per formation. */
function groupSize(kind: FormationKind): number {
  switch (kind) {
    case "bunch": return 34;
    case "sprint": return 26;
    case "paceline": return 8;
    case "echelon": return 16;
    case "climb": return 16;
    case "descent": return 10;
  }
}

// ── Rider sim ────────────────────────────────────────────────────

interface RiderSim {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  phase: number;
  cadence: number;
  visible: boolean;
  scale: number; // eased visibility
}

const RIDER_COUNT = 56;
const KIT_COLORS = [
  0x32323a, 0x1d3a5f, 0x5d2231, 0xcfd2d6, 0x274232, 0x46306b,
  0x6b5a23, 0x222226, 0x83353f, 0x2e4d62, 0x3f3f47, 0x70263d,
];
const PLAYER_COLOR = 0xf16363; // brand coral — the player is the accent

// ── Camera shots ─────────────────────────────────────────────────

interface Shot { pos: THREE.Vector3; look: THREE.Vector3 }

// Shot positions live in a "camera corridor" kept clear of riders
// (|x| ≲ 3.2 around the origin) and trees (see scatterFurniture's
// side bands) so no move ever passes through geometry.
const SHOTS: Record<string, Shot> = {
  heli: { pos: new THREE.Vector3(14, 11.5, 16), look: new THREE.Vector3(0, 0.6, -5) },
  heliHigh: { pos: new THREE.Vector3(-20, 17, -8), look: new THREE.Vector3(0, 0.5, 4) },
  moto: { pos: new THREE.Vector3(6.2, 1.7, 1.5), look: new THREE.Vector3(-0.6, 1.05, 0.2) },
  motoFront: { pos: new THREE.Vector3(-5.2, 1.6, -8.5), look: new THREE.Vector3(0.6, 1.1, 1.5) },
  lowRear: { pos: new THREE.Vector3(1.2, 1.15, 13), look: new THREE.Vector3(-0.3, 1.25, -5) },
  freezeIn: { pos: new THREE.Vector3(4.2, 1.9, -3.8), look: new THREE.Vector3(0, 1.1, 0.3) },
  freezeEnd: { pos: new THREE.Vector3(3.1, 1.55, -2.7), look: new THREE.Vector3(0, 1.1, 0.3) },
  // The verdict shot: a high hold down the road corridor (the one
  // sightline town buildings never block), sunset dead ahead.
  wideIn: { pos: new THREE.Vector3(5.5, 10, 32), look: new THREE.Vector3(-1, 0.5, -30) },
  wideEnd: { pos: new THREE.Vector3(4.5, 8, 25), look: new THREE.Vector3(-1, 0.5, -30) },
};

const RIDE_CYCLE = ["heli", "moto", "lowRear", "heliHigh", "motoFront"] as const;

// ── The scene ────────────────────────────────────────────────────

export class RaceScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private tweens = new Tweens();
  private lastTime = performance.now();
  private elapsed = 0;
  private raf = 0;
  private disposed = false;

  private reducedMotion: boolean;
  private timeScale = 1;
  private targetTimeScale = 1;
  private worldTime = 0;

  // Camera state
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private camPosTarget = new THREE.Vector3();
  private camLookTarget = new THREE.Vector3();
  private shotIndex = 0;
  private shotTimer = 0;
  private frozen = false;
  private shake = 0;

  // World objects
  private skyMat: THREE.ShaderMaterial;
  private sun: THREE.Sprite;
  private sunGlow: THREE.Sprite;
  private hemi: THREE.HemisphereLight;
  private dir: THREE.DirectionalLight;
  private terrain = new THREE.Group(); // tilts with grade
  private ground: THREE.Mesh;
  private road: THREE.Mesh;
  private roadSheen: THREE.Mesh;
  private dashes: THREE.InstancedMesh;
  private posts: THREE.InstancedMesh;
  private trees: THREE.InstancedMesh;
  private buildings: THREE.InstancedMesh;
  private barriers: THREE.InstancedMesh;
  private crowd: THREE.InstancedMesh;
  private crowdColors: THREE.Color[] = [];
  private ridges: THREE.Mesh[] = [];
  private windLines: THREE.LineSegments;
  private windData: { x: number; y: number; z: number; len: number; speed: number }[] = [];
  private arch: THREE.Group;
  private playerMarker: THREE.Sprite;

  // Riders
  private riders: THREE.InstancedMesh;
  private sim: RiderSim[] = [];
  private dummy = new THREE.Object3D();
  private breathe = 0; // accordion phase

  private moment: WorldMoment = {
    environment: "valley",
    timeOfDay: 0.05,
    formation: "bunch",
    position: "bunch",
    speed: 10,
  };
  private speed = 10;
  private targetSpeed = 10;
  private gradeAngle = 0;
  private targetGrade = 0;
  private windOpacityTarget = 0;
  private crowdVisible = false;

  // Adaptive quality
  private fpsSamples: number[] = [];
  private degraded = false;

  onFirstFrame?: () => void;
  private firstFrameFired = false;

  constructor(canvas: HTMLCanvasElement, opts: { reducedMotion: boolean }) {
    this.reducedMotion = opts.reducedMotion;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 1200);
    this.scene.fog = new THREE.Fog(0x9087ab, 60, 420);

    // Sky dome
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: c(0x1b1740) },
        horizonColor: { value: c(0x8a7aa8) },
      },
      vertexShader: `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        varying vec3 vPos;
        void main() {
          float h = normalize(vPos).y;
          float t = smoothstep(-0.05, 0.5, h);
          gl_FragColor = vec4(mix(horizonColor, topColor, t), 1.0);
        }`,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 20, 12), this.skyMat);
    this.scene.add(sky);

    // Sun + glow
    const glowTex = radialGlowTexture();
    this.sun = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTex, color: 0xffd9b0, transparent: true, opacity: 0.95, depthWrite: false })
    );
    this.sun.scale.setScalar(46);
    this.sunGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex, color: 0xffd9b0, transparent: true, opacity: 0.35,
        depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    this.sunGlow.scale.setScalar(160);
    this.scene.add(this.sun, this.sunGlow);

    // Lights
    this.hemi = new THREE.HemisphereLight(0xbcb3d8, 0x4a4a44, 1.3);
    this.dir = new THREE.DirectionalLight(0xffd9b0, 1.5);
    this.dir.position.set(-60, 50, -40);
    this.scene.add(this.hemi, this.dir);

    // Ridgelines (outside the tilt group — they're the horizon)
    const ridgeSpecs = [
      { w: 2400, peak: 120, z: -780, seed: 3.1 },
      { w: 2000, peak: 90, z: -620, seed: 7.7 },
      { w: 1700, peak: 55, z: -470, seed: 12.3 },
    ];
    for (const spec of ridgeSpecs) {
      const mesh = new THREE.Mesh(
        buildRidge(spec.w, spec.peak, spec.seed),
        new THREE.MeshBasicMaterial({ color: 0x6c628f, fog: false })
      );
      mesh.position.set(0, 0, spec.z);
      this.ridges.push(mesh);
      this.scene.add(mesh);
    }

    this.scene.add(this.terrain);

    // Ground
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1600, 1400),
      new THREE.MeshLambertMaterial({ color: 0x3d4438 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.z = -300;
    this.terrain.add(this.ground);

    // Road
    this.road = new THREE.Mesh(
      new THREE.PlaneGeometry(8.5, 1400),
      new THREE.MeshLambertMaterial({ color: 0x37373d })
    );
    this.road.rotation.x = -Math.PI / 2;
    this.road.position.set(0, 0.02, -300);
    this.terrain.add(this.road);

    // Wet-road sheen (toggles opacity)
    this.roadSheen = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 1400),
      new THREE.MeshBasicMaterial({
        color: 0xa8b4c8, transparent: true, opacity: 0, depthWrite: false,
      })
    );
    this.roadSheen.rotation.x = -Math.PI / 2;
    this.roadSheen.position.set(0, 0.03, -300);
    this.terrain.add(this.roadSheen);

    // Centre dashes
    const dashGeo = new THREE.PlaneGeometry(0.16, 2.2);
    dashGeo.rotateX(-Math.PI / 2);
    this.dashes = new THREE.InstancedMesh(
      dashGeo,
      new THREE.MeshBasicMaterial({ color: 0xb9b9bd }),
      90
    );
    this.dashes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.terrain.add(this.dashes);

    // Roadside posts — thin, sparse, and muted so perspective doesn't
    // compress them into a phantom fence on long lens-down-the-road shots.
    const postGeo = new THREE.BoxGeometry(0.09, 0.7, 0.09);
    postGeo.translate(0, 0.35, 0);
    this.posts = new THREE.InstancedMesh(
      postGeo,
      new THREE.MeshLambertMaterial({ color: 0x8e8e94 }),
      24
    );
    this.posts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.terrain.add(this.posts);

    // Trees
    this.trees = new THREE.InstancedMesh(
      buildTreeGeometry(),
      new THREE.MeshLambertMaterial({ vertexColors: true }),
      72
    );
    this.trees.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.terrain.add(this.trees);

    // Buildings (town)
    const bGeo = new THREE.BoxGeometry(1, 1, 1);
    bGeo.translate(0, 0.5, 0);
    this.buildings = new THREE.InstancedMesh(
      bGeo,
      new THREE.MeshLambertMaterial({ color: 0x2c2433 }),
      28
    );
    this.buildings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.terrain.add(this.buildings);

    // Barriers (town)
    const barGeo = new THREE.BoxGeometry(9.5, 0.92, 0.1);
    barGeo.translate(0, 0.46, 0);
    this.barriers = new THREE.InstancedMesh(
      barGeo,
      new THREE.MeshLambertMaterial({ color: 0xc9c9ce }),
      24
    );
    this.barriers.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.terrain.add(this.barriers);

    // Crowd (town)
    const personGeo = new THREE.BoxGeometry(0.34, 1.0, 0.26);
    personGeo.translate(0, 0.5, 0);
    this.crowd = new THREE.InstancedMesh(
      personGeo,
      new THREE.MeshLambertMaterial(),
      130
    );
    this.crowd.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < this.crowd.count; i++) {
      const col = c(0x000000).setHSL(rand(i * 3.7), 0.35 + rand(i) * 0.3, 0.3 + rand(i + 7) * 0.35);
      this.crowd.setColorAt(i, col);
      this.crowdColors.push(col);
    }
    this.terrain.add(this.crowd);

    // Flamme rouge arch for the finale
    this.arch = new THREE.Group();
    const archMat = new THREE.MeshLambertMaterial({ color: 0xc4404a });
    const pillar = new THREE.BoxGeometry(0.9, 5.4, 0.9);
    pillar.translate(0, 2.7, 0);
    const left = new THREE.Mesh(pillar, archMat);
    left.position.x = -5;
    const right = new THREE.Mesh(pillar.clone(), archMat);
    right.position.x = 5;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(11, 1.3, 0.9), archMat);
    beam.position.y = 5.4;
    this.arch.add(left, right, beam);
    this.arch.position.z = -95;
    this.arch.visible = false;
    this.terrain.add(this.arch);

    // Wind streaks
    const windCount = 70;
    const windPositions = new Float32Array(windCount * 2 * 3);
    const windGeo = new THREE.BufferGeometry();
    windGeo.setAttribute("position", new THREE.BufferAttribute(windPositions, 3));
    this.windLines = new THREE.LineSegments(
      windGeo,
      new THREE.LineBasicMaterial({ color: 0xe8e4da, transparent: true, opacity: 0 })
    );
    for (let i = 0; i < windCount; i++) {
      this.windData.push({
        x: -40 + rand(i) * 80,
        y: 0.4 + rand(i + 3) * 4.5,
        z: -90 + rand(i + 6) * 130,
        len: 1.6 + rand(i + 9) * 2.6,
        speed: 26 + rand(i + 12) * 16,
      });
    }
    this.scene.add(this.windLines);

    // Riders
    this.riders = new THREE.InstancedMesh(
      buildRiderGeometry(),
      new THREE.MeshLambertMaterial({ vertexColors: true }),
      RIDER_COUNT
    );
    this.riders.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < RIDER_COUNT; i++) {
      this.riders.setColorAt(
        i,
        c(i === 0 ? PLAYER_COLOR : KIT_COLORS[i % KIT_COLORS.length])
      );
      this.sim.push({
        pos: new THREE.Vector3((rand(i) - 0.5) * 4, 0, rand(i + 1) * 20),
        target: new THREE.Vector3(),
        phase: rand(i + 2) * Math.PI * 2,
        cadence: 5.2 + rand(i + 4) * 1.8,
        visible: false,
        scale: 0,
      });
    }
    this.terrain.add(this.riders);

    // Player marker — broadcast tracker diamond over the coral rider
    this.playerMarker = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex, color: PLAYER_COLOR, transparent: true, opacity: 0.85, depthWrite: false,
      })
    );
    this.playerMarker.scale.setScalar(0.5);
    this.terrain.add(this.playerMarker);

    // Scatter static furniture
    this.scatterFurniture();

    // Initial camera
    const s = SHOTS.heli;
    this.camPos.copy(s.pos);
    this.camLook.copy(s.look);
    this.camPosTarget.copy(s.pos);
    this.camLookTarget.copy(s.look);

    this.setMoment(this.moment, { instant: true });
    this.loop();
  }

  // ── Public API ─────────────────────────────────────────────

  setSize(w: number, h: number): void {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setMoment(moment: WorldMoment, opts: { instant?: boolean } = {}): void {
    this.moment = moment;
    const instant = opts.instant || this.reducedMotion;
    const pal = applyEnvironment(paletteAt(moment.timeOfDay), moment.environment, !!moment.wet);

    // Palette transition
    const from = {
      skyTop: (this.skyMat.uniforms.topColor.value as THREE.Color).clone(),
      skyHorizon: (this.skyMat.uniforms.horizonColor.value as THREE.Color).clone(),
      fog: (this.scene.fog as THREE.Fog).color.clone(),
      fogNear: (this.scene.fog as THREE.Fog).near,
      fogFar: (this.scene.fog as THREE.Fog).far,
      ground: (this.ground.material as THREE.MeshLambertMaterial).color.clone(),
      hemiSky: this.hemi.color.clone(),
      hemiGround: this.hemi.groundColor.clone(),
      sun: this.dir.color.clone(),
      sunIntensity: this.dir.intensity,
      ridgeNear: (this.ridges[2].material as THREE.MeshBasicMaterial).color.clone(),
      ridgeFar: (this.ridges[0].material as THREE.MeshBasicMaterial).color.clone(),
      sheen: (this.roadSheen.material as THREE.MeshBasicMaterial).opacity,
    };
    const applyPalette = (t: number) => {
      const fog = this.scene.fog as THREE.Fog;
      (this.skyMat.uniforms.topColor.value as THREE.Color).copy(from.skyTop).lerp(pal.skyTop, t);
      (this.skyMat.uniforms.horizonColor.value as THREE.Color).copy(from.skyHorizon).lerp(pal.skyHorizon, t);
      fog.color.copy(from.fog).lerp(pal.fog, t);
      fog.near = lerp(from.fogNear, pal.fogNear, t);
      fog.far = lerp(from.fogFar, pal.fogFar, t);
      (this.ground.material as THREE.MeshLambertMaterial).color.copy(from.ground).lerp(pal.ground, t);
      this.hemi.color.copy(from.hemiSky).lerp(pal.hemiSky, t);
      this.hemi.groundColor.copy(from.hemiGround).lerp(pal.hemiGround, t);
      this.dir.color.copy(from.sun).lerp(pal.sun, t);
      this.dir.intensity = lerp(from.sunIntensity, pal.sunIntensity, t);
      (this.sun.material as THREE.SpriteMaterial).color.copy(this.dir.color);
      (this.sunGlow.material as THREE.SpriteMaterial).color.copy(this.dir.color);
      (this.ridges[2].material as THREE.MeshBasicMaterial).color.copy(from.ridgeNear).lerp(pal.ridgeNear, t);
      (this.ridges[1].material as THREE.MeshBasicMaterial).color
        .copy(from.ridgeNear).lerp(from.ridgeFar, 0.5)
        .lerp(pal.ridgeNear.clone().lerp(pal.ridgeFar, 0.5), t);
      (this.ridges[0].material as THREE.MeshBasicMaterial).color.copy(from.ridgeFar).lerp(pal.ridgeFar, t);
      (this.roadSheen.material as THREE.MeshBasicMaterial).opacity = lerp(from.sheen, moment.wet ? 0.13 : 0, t);
      // Sun position arcs with the day
      const sunX = lerp(-200, 240, moment.timeOfDay);
      const sunY = lerp(30, 260, pal.sunHeight);
      this.sun.position.set(sunX, sunY, -820);
      this.sunGlow.position.copy(this.sun.position);
      this.dir.position.set(sunX * 0.3, Math.max(sunY * 0.4, 18), -60);
    };
    if (instant) applyPalette(1);
    else this.tweens.add({ duration: 2.6, ease: easeInOutSine, onUpdate: applyPalette });

    // Motion targets
    this.targetSpeed = moment.speed;
    this.targetGrade = THREE.MathUtils.degToRad(moment.grade ?? 0);
    this.windOpacityTarget = moment.wind ? 0.16 : 0;
    this.crowdVisible = !!moment.crowd;
    this.arch.visible = moment.environment === "town";

    this.assignFormation();
    this.scatterFurniture();
    if (instant) {
      // Snap riders to their targets so the scene opens composed.
      for (const r of this.sim) r.pos.copy(r.target);
    }
  }

  /** Cinematic freeze for a decision moment. A hard cut — the
   * broadcast move — so the camera never travels through the bunch
   * to reach the iso shot. Then a barely-perceptible push-in. */
  freeze(kind: "iso" | "wide" = "iso"): void {
    this.frozen = true;
    this.targetTimeScale = 0.05;
    const inShot = kind === "wide" ? SHOTS.wideIn : SHOTS.freezeIn;
    const endShot = kind === "wide" ? SHOTS.wideEnd : SHOTS.freezeEnd;
    this.camPos.copy(inShot.pos);
    this.camLook.copy(inShot.look);
    this.camPosTarget.copy(inShot.pos);
    this.camLookTarget.copy(inShot.look);
    if (this.reducedMotion) return;
    this.tweens.add({
      duration: 28,
      ease: easeInOutSine,
      onUpdate: (t) => {
        if (!this.frozen) return;
        this.camPosTarget.copy(inShot.pos).lerp(endShot.pos, t);
      },
    });
  }

  unfreeze(): void {
    this.frozen = false;
    this.targetTimeScale = 1;
    this.shotTimer = 0;
    this.shotIndex = (this.shotIndex + 1) % RIDE_CYCLE.length;
    this.cutToShot(RIDE_CYCLE[this.shotIndex], 2.2);
  }

  /** A decision just landed — small kinetic kick. */
  pulse(): void {
    if (this.reducedMotion) return;
    this.shake = 0.35;
    const baseSpeed = this.targetSpeed;
    this.tweens.add({
      duration: 1.8,
      ease: easeOutCubic,
      onUpdate: (t) => {
        this.speed = baseSpeed * (1.35 - 0.35 * t);
      },
    });
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.tweens.cancelAll();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    });
    this.renderer.dispose();
  }

  // ── Internals ──────────────────────────────────────────────

  private cutToShot(name: keyof typeof SHOTS, duration: number): void {
    if (this.reducedMotion) {
      this.camPosTarget.copy(SHOTS.heli.pos);
      this.camLookTarget.copy(SHOTS.heli.look);
      return;
    }
    const start = { pos: this.camPosTarget.clone(), look: this.camLookTarget.clone() };
    const shot = SHOTS[name];
    this.tweens.add({
      duration,
      ease: easeInOutSine,
      onUpdate: (t) => {
        if (this.frozen) return;
        this.camPosTarget.copy(start.pos).lerp(shot.pos, t);
        this.camLookTarget.copy(start.look).lerp(shot.look, t);
      },
    });
  }

  private assignFormation(): void {
    const kind = this.moment.formation;
    const n = groupSize(kind);
    const offsets = formationOffsets(kind, n);

    // Player slot: near the front third of the group.
    const playerIdx = Math.min(2, n - 1);

    // Companion group staging by race position.
    const other = this.moment.position === "break"
      ? { count: Math.min(26, RIDER_COUNT - n), anchorZ: 70, kind: "bunch" as const }
      : this.moment.position === "chasing"
        ? { count: Math.min(12, RIDER_COUNT - n), anchorZ: -55, kind: "paceline" as const }
        : this.moment.position === "dropped"
          ? { count: Math.min(14, RIDER_COUNT - n), anchorZ: -110, kind: "bunch" as const }
          : { count: 0, anchorZ: 0, kind: "bunch" as const };
    const otherOffsets = other.count > 0 ? formationOffsets(other.kind, other.count) : [];

    for (let i = 0; i < RIDER_COUNT; i++) {
      const sim = this.sim[i];
      if (i === 0) {
        // Player: anchored so their group plays out around the origin.
        const o = offsets[playerIdx];
        sim.target.set(o.x, 0, 0);
        sim.visible = true;
        continue;
      }
      const gi = i - 1;
      if (gi < n - 1) {
        // Player's group, arranged around the player's slot.
        const o = offsets[gi >= playerIdx ? gi + 1 : gi];
        const po = offsets[playerIdx];
        sim.target.set(o.x, 0, o.z - po.z);
        sim.visible = true;
      } else if (gi - (n - 1) < otherOffsets.length) {
        const o = otherOffsets[gi - (n - 1)];
        sim.target.set(o.x, 0, other.anchorZ + o.z);
        sim.visible = true;
      } else {
        sim.visible = false;
      }
    }
  }

  private scatterFurniture(): void {
    const env = this.moment.environment;
    const m = new THREE.Matrix4();
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);

    // Trees: valley scattered, forest dense + close, plain sparse, town none.
    const treeCount =
      env === "forest" ? 72 : env === "valley" ? 40 : env === "plain" ? 10 : 0;
    for (let i = 0; i < this.trees.count; i++) {
      if (i < treeCount) {
        const side = i % 2 === 0 ? -1 : 1;
        // Side bands keep foliage out of the camera corridor: the
        // right-side shots live at x ≈ 4–14, the left-side helicopter
        // at x ≈ -20, so trees occupy [10, 44] and [-70, -34].
        const near = side > 0 ? (env === "forest" ? 9 : 10) : 34;
        const spread = side > 0 ? (env === "forest" ? 22 : 34) : 36;
        const x = side * (near + rand(i * 1.3) * spread);
        // Trees never enter the stage zone (z > -26) where the riders
        // and every camera live — see the custom wrap in updateFurniture.
        const z = -240 + rand(i * 2.7) * 214;
        const s = 0.8 + rand(i * 3.1) * (env === "forest" ? 0.8 : 0.65);
        m.makeScale(s, s, s).setPosition(x, 0, z);
        this.trees.setMatrixAt(i, m);
        // Foliage tint per environment
        const tint = env === "forest"
          ? c(0x16301e).offsetHSL(0, 0, rand(i) * 0.05)
          : c(0x2e4a28).offsetHSL(0.02 * rand(i), 0, rand(i) * 0.08);
        this.trees.setColorAt(i, tint);
      } else {
        this.trees.setMatrixAt(i, zero);
      }
    }
    this.trees.instanceMatrix.needsUpdate = true;
    if (this.trees.instanceColor) this.trees.instanceColor.needsUpdate = true;

    // Buildings: town only
    for (let i = 0; i < this.buildings.count; i++) {
      if (env === "town") {
        const side = i % 2 === 0 ? -1 : 1;
        const w = 6 + rand(i * 1.7) * 6;
        const h = 7 + rand(i * 2.3) * 11;
        const x = side * (10 + rand(i * 3.7) * 7);
        const z = -230 + (i / this.buildings.count) * 290 + rand(i) * 8;
        m.makeScale(w, h, 7 + rand(i) * 5).setPosition(x, 0, z);
        this.buildings.setMatrixAt(i, m);
      } else {
        this.buildings.setMatrixAt(i, zero);
      }
    }
    this.buildings.instanceMatrix.needsUpdate = true;

    // Barriers: town only, both sides
    for (let i = 0; i < this.barriers.count; i++) {
      if (env === "town") {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -110 + Math.floor(i / 2) * 10;
        m.identity().setPosition(side * 5.4, 0, z);
        m.multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2));
        this.barriers.setMatrixAt(i, m);
      } else {
        this.barriers.setMatrixAt(i, zero);
      }
    }
    this.barriers.instanceMatrix.needsUpdate = true;

    // Posts: rural only, staggered between sides
    for (let i = 0; i < this.posts.count; i++) {
      if (env === "town") {
        this.posts.setMatrixAt(i, zero);
      } else {
        const side = i % 2 === 0 ? -1 : 1;
        const z = -220 + i * 15 + (side > 0 ? 7 : 0);
        m.identity().setPosition(side * 5.0, 0, z);
        this.posts.setMatrixAt(i, m);
      }
    }
    this.posts.instanceMatrix.needsUpdate = true;
  }

  private updateRiders(dt: number, t: number): void {
    const kind = this.moment.formation;
    const climbing = kind === "climb";
    const sprinting = kind === "sprint";
    // The accordion: the bunch breathes — spacing swells and packs.
    this.breathe += dt * 0.35;
    const breathe = 1 + Math.sin(this.breathe) * (kind === "bunch" ? 0.16 : 0.06);
    const lean = this.moment.wind ? 0.085 : 0;
    const grade = this.gradeAngle;

    for (let i = 0; i < RIDER_COUNT; i++) {
      const sim = this.sim[i];
      sim.scale += ((sim.visible ? 1 : 0) - sim.scale) * damp(3, dt);
      if (sim.scale < 0.01) {
        this.dummy.position.set(0, -50, 0);
        this.dummy.scale.setScalar(0.001);
        this.dummy.rotation.set(0, 0, 0);
        this.dummy.updateMatrix();
        this.riders.setMatrixAt(i, this.dummy.matrix);
        continue;
      }

      // Drift toward formation slot — the whole tactical picture is
      // told by riders flowing between formations.
      const rate = damp(i === 0 ? 2.2 : 1.4 + rand(i) * 0.8, dt);
      sim.pos.x += (sim.target.x - sim.pos.x) * rate;
      sim.pos.z += (sim.target.z - sim.pos.z) * rate;

      sim.phase += dt * sim.cadence * (sprinting ? 1.5 : climbing ? 0.75 : 1);
      const bobAmp = climbing ? 0.05 : sprinting ? 0.04 : 0.022;
      const zEff = sim.pos.z * breathe;
      const y = Math.tan(-grade) * zEff + Math.abs(Math.sin(sim.phase)) * bobAmp;

      this.dummy.position.set(
        sim.pos.x + Math.sin(sim.phase * 0.5 + i) * 0.03,
        y,
        zEff
      );
      this.dummy.rotation.set(
        grade * 0.6,
        Math.sin(sim.phase * 0.5) * 0.02,
        lean + Math.sin(sim.phase) * (climbing ? 0.05 : 0.02)
      );
      this.dummy.scale.setScalar(sim.scale);
      this.dummy.updateMatrix();
      this.riders.setMatrixAt(i, this.dummy.matrix);

      if (i === 0) {
        this.playerMarker.position.set(
          this.dummy.position.x,
          this.dummy.position.y + 1.9 + Math.sin(t * 2) * 0.06,
          this.dummy.position.z
        );
      }
    }
    this.riders.instanceMatrix.needsUpdate = true;
  }

  private updateFurniture(dt: number): void {
    const move = this.speed * dt * this.timeScale;
    const m = new THREE.Matrix4();
    const v = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();

    const recycle = (mesh: THREE.InstancedMesh, span: number, maxZ = 60) => {
      let dirty = false;
      for (let i = 0; i < mesh.count; i++) {
        mesh.getMatrixAt(i, m);
        m.decompose(v, q, s);
        if (s.x < 0.01) continue;
        v.z += move;
        if (v.z > maxZ) v.z -= span;
        m.compose(v, q, s);
        mesh.setMatrixAt(i, m);
        dirty = true;
      }
      if (dirty) mesh.instanceMatrix.needsUpdate = true;
    };

    // Trees wrap before the stage zone so foliage never crosses a shot.
    recycle(this.trees, 214, -26);
    recycle(this.posts, 360);
    recycle(this.buildings, 290);
    recycle(this.barriers, 120);

    // Dashes: pure scroll
    for (let i = 0; i < this.dashes.count; i++) {
      const z = ((-280 + i * 7 + this.worldTime * this.speed) % 340) - 280;
      m.identity().setPosition(0, 0.04, z);
      this.dashes.setMatrixAt(i, m);
    }
    this.dashes.instanceMatrix.needsUpdate = true;

    // Crowd
    if (this.crowdVisible) {
      const half = this.degraded ? this.crowd.count / 2 : this.crowd.count;
      for (let i = 0; i < this.crowd.count; i++) {
        if (i >= half) {
          m.makeScale(0, 0, 0);
          this.crowd.setMatrixAt(i, m);
          continue;
        }
        const side = i % 2 === 0 ? -1 : 1;
        const z = -115 + (i / 2) * 1.9 + rand(i) * 1.2;
        const jump = Math.max(0, Math.sin(this.worldTime * (2 + rand(i) * 3) + i)) * 0.16;
        m.makeScale(1, 1 + jump, 1).setPosition(
          side * (5.9 + rand(i * 7) * 1.4),
          0,
          z
        );
        this.crowd.setMatrixAt(i, m);
      }
      this.crowd.instanceMatrix.needsUpdate = true;
      this.crowd.visible = true;
    } else {
      this.crowd.visible = false;
    }

    // Wind streaks
    const windMat = this.windLines.material as THREE.LineBasicMaterial;
    windMat.opacity += (this.windOpacityTarget - windMat.opacity) * damp(2, dt);
    if (windMat.opacity > 0.01) {
      this.windLines.visible = true;
      const positions = this.windLines.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < this.windData.length; i++) {
        const w = this.windData[i];
        w.x += w.speed * dt * this.timeScale;
        if (w.x > 45) w.x = -45;
        positions.setXYZ(i * 2, w.x, w.y, w.z);
        positions.setXYZ(i * 2 + 1, w.x + w.len, w.y + 0.08, w.z + w.len * 0.35);
      }
      positions.needsUpdate = true;
    } else {
      this.windLines.visible = false;
    }
  }

  private updateCamera(dt: number, t: number): void {
    // Idle shot cycling while riding
    if (!this.frozen && !this.reducedMotion) {
      this.shotTimer += dt;
      if (this.shotTimer > 9) {
        this.shotTimer = 0;
        this.shotIndex = (this.shotIndex + 1) % RIDE_CYCLE.length;
        this.cutToShot(RIDE_CYCLE[this.shotIndex], 3.2);
      }
    }

    const smooth = damp(this.frozen ? 2.2 : 3.2, dt);
    this.camPos.lerp(this.camPosTarget, smooth);
    this.camLook.lerp(this.camLookTarget, smooth);

    // Handheld energy: a couple of incommensurate sines, more on the
    // moto shots (close to the ground), less from the helicopter.
    let nx = 0, ny = 0;
    if (!this.reducedMotion) {
      const closeness = THREE.MathUtils.clamp(1 - this.camPos.y / 16, 0.2, 1);
      const amp = (this.frozen ? 0.012 : 0.05) * closeness;
      nx = (Math.sin(t * 1.7) * 0.6 + Math.sin(t * 3.9 + 1.3) * 0.4) * amp;
      ny = (Math.sin(t * 2.3 + 0.7) * 0.6 + Math.sin(t * 5.1) * 0.4) * amp * 0.7;
      if (this.shake > 0.001) {
        nx += Math.sin(t * 51) * this.shake * 0.12;
        ny += Math.sin(t * 47 + 2) * this.shake * 0.1;
        this.shake *= Math.exp(-4 * dt);
      }
    }

    this.camera.position.set(this.camPos.x + nx, this.camPos.y + ny, this.camPos.z);
    this.camera.lookAt(this.camLook.x + nx * 0.4, this.camLook.y + ny * 0.4, this.camLook.z);
  }

  private sampleFps(dt: number): void {
    if (dt > 0) this.fpsSamples.push(1 / dt);
    if (this.fpsSamples.length >= 120 && !this.degraded) {
      const avg = this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length;
      this.fpsSamples = [];
      if (avg < 45) {
        // Frame rate wins over richness, always.
        this.degraded = true;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      }
    } else if (this.fpsSamples.length >= 120) {
      this.fpsSamples = [];
    }
  }

  private loop = (): void => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.elapsed += dt;
    const t = this.elapsed;

    this.tweens.update(dt);
    this.timeScale += (this.targetTimeScale - this.timeScale) * damp(2.5, dt);
    if (!this.frozen) {
      this.speed += (this.targetSpeed - this.speed) * damp(1.2, dt);
    }
    this.gradeAngle += (this.targetGrade - this.gradeAngle) * damp(1.5, dt);
    this.terrain.rotation.x = -this.gradeAngle * 0.5;
    this.worldTime += dt * this.timeScale;

    const simDt = dt * this.timeScale;
    this.updateRiders(simDt, t);
    this.updateFurniture(dt);
    this.updateCamera(dt, t);
    this.sampleFps(dt);

    this.renderer.render(this.scene, this.camera);
    // Fire only once a listener is attached — the first render happens
    // synchronously inside the constructor, before the React wrapper
    // has had a chance to assign the callback.
    if (!this.firstFrameFired && this.onFirstFrame) {
      this.firstFrameFired = true;
      this.onFirstFrame();
    }
  };
}
