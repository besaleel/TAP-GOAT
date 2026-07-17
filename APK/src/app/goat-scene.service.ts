import { Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';

export type GoatCoat = 'cream' | 'spotted' | 'black' | 'brown' | 'white';
export type GoatStyle = 'fofa' | 'realista' | 'selvagem';

const COAT_MAP: Record<GoatCoat, [string, string, boolean]> = {
  cream: ['#f3e9d4', '#e4d5b6', false],
  spotted: ['#f2ece0', '#e4d5b6', true],
  black: ['#34302b', '#26231f', false],
  brown: ['#8a5a34', '#6f4526', false],
  white: ['#f7f4ee', '#e7ddcb', false],
};

const SOUND_FILES = [
  'assets/goat/sounds/cabra-01.mp3',
  'assets/goat/sounds/cabra-02.mp3',
  'assets/goat/sounds/cabra-03.mp3',
  'assets/goat/sounds/cabra-04.mp3',
  'assets/goat/sounds/cabra-05.mp3',
  'assets/goat/sounds/cabra-06.mp3',
];

interface GoatParts {
  body: THREE.Mesh;
  head: THREE.Group;
  jaw: THREE.Group;
  tongue: THREE.Mesh;
  eyeL: THREE.Mesh;
  eyeR: THREE.Mesh;
  pupilL: THREE.Mesh;
  pupilR: THREE.Mesh;
  earL: THREE.Group;
  earR: THREE.Group;
  legFL: THREE.Group;
  legFR: THREE.Group;
  legBL: THREE.Group;
  legBR: THREE.Group;
  tail: THREE.Mesh;
  hornL: THREE.Group;
  hornR: THREE.Group;
  beard: THREE.Mesh;
  chest: THREE.Mesh;
  rump: THREE.Mesh;
}

interface GoatUserData {
  heading: number;
  targetHeading: number;
  turnTimer: number;
  t: number;
  careta: number;
  face: number;
  faceIntensity: number;
  coat: { main: THREE.MeshStandardMaterial; second: THREE.MeshStandardMaterial; spots: THREE.Mesh[] };
  parts: GoatParts;
}

/** Cena 3D da cabra: geometria, wandering, reação ao toque e som. Portado do protótipo GOAT.dc.html. */
@Injectable({ providedIn: 'root' })
export class GoatSceneService {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private goat!: THREE.Group;
  private clouds: THREE.Group[] = [];
  private raycaster = new THREE.Raycaster();
  private clock = new THREE.Clock();
  private raf = 0;
  private ro?: ResizeObserver;
  private alive = false;
  private onPointer?: (e: PointerEvent) => void;
  private canvas!: HTMLCanvasElement;
  private overlay!: HTMLDivElement;
  private style: GoatStyle = 'realista';
  private audioPool: HTMLAudioElement[] = [];
  private lastSoundIndex = -1;
  private onTap?: (intensity: number) => void;
  soundEnabled = true;

  constructor(private zone: NgZone) {}

  preloadSounds(): void {
    if (this.audioPool.length) return;
    this.audioPool = SOUND_FILES.map((src) => {
      const a = new Audio(src);
      a.preload = 'auto';
      return a;
    });
  }

  init(canvas: HTMLCanvasElement, overlay: HTMLDivElement, style: GoatStyle, onTap?: (intensity: number) => void): void {
    this.canvas = canvas;
    this.overlay = overlay;
    this.style = style;
    this.onTap = onTap;
    this.alive = true;
    this.preloadSounds();

    // Three.js faz muito trabalho síncrono por frame; roda fora da zone do Angular
    // para não disparar change detection a cada requestAnimationFrame.
    this.zone.runOutsideAngular(() => this.initScene());
  }

  destroy(): void {
    this.alive = false;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    if (this.onPointer && this.canvas) this.canvas.removeEventListener('pointerdown', this.onPointer);
    this.renderer?.dispose();
  }

  setCoat(code: GoatCoat): void {
    if (!this.goat) return;
    const c = (this.goat.userData as GoatUserData).coat;
    const m = COAT_MAP[code] || COAT_MAP.cream;
    c.main.color.set(m[0]);
    c.second.color.set(m[1]);
    c.spots.forEach((s) => (s.visible = m[2]));
  }

  private initScene(): void {
    const canvas = this.canvas;
    const parent = canvas.parentElement!;
    let W = parent.clientWidth || 372;
    let H = parent.clientHeight || 806;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = this.makeSky();
    scene.fog = new THREE.Fog(0xc4e7c8, 16, 34);

    const camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 120);
    camera.position.set(0, 4.4, 11);
    camera.lookAt(0, 0.7, -1.5);

    scene.add(new THREE.HemisphereLight(0xd7ecff, 0x6f9a3c, 0.95));
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.45);
    sun.position.set(6, 11, 7);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const sc = sun.shadow.camera;
    sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 30;
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: 0x8bd056, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0, 7.5, 64), new THREE.MeshStandardMaterial({ color: 0x7cc44a, roughness: 1 }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    const tuftGeo = new THREE.ConeGeometry(0.13, 0.42, 5);
    const tuftMat = new THREE.MeshStandardMaterial({ color: 0x5fa835, roughness: 1 });
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2, r = 1.5 + Math.random() * 11;
      const m = new THREE.Mesh(tuftGeo, tuftMat);
      m.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r);
      m.rotation.y = Math.random() * 3;
      m.scale.y = 0.7 + Math.random() * 0.9;
      scene.add(m);
    }
    const flCol = [0xffe14d, 0xff7db0, 0xffffff, 0xb08bff];
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 9;
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        new THREE.MeshStandardMaterial({ color: flCol[i % 4], roughness: 0.8, emissive: flCol[i % 4], emissiveIntensity: 0.15 })
      );
      m.position.set(Math.cos(a) * r, 0.12, Math.sin(a) * r);
      scene.add(m);
    }

    const mkTree = (x: number, z: number, s: number) => {
      const T = new THREE.Group();
      const barkMat = new THREE.MeshStandardMaterial({ color: 0x7a5636, roughness: 0.95 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 1.7, 9), barkMat);
      trunk.position.y = 0.85; trunk.rotation.z = 0.04; T.add(trunk);
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.9, 7), barkMat);
      b1.position.set(0.35, 1.45, 0.05); b1.rotation.z = -0.8; T.add(b1);
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.7, 7), barkMat);
      b2.position.set(-0.3, 1.5, -0.05); b2.rotation.z = 0.7; T.add(b2);
      const leaf1 = new THREE.MeshStandardMaterial({ color: 0x4c9636, roughness: 1 });
      const leaf2 = new THREE.MeshStandardMaterial({ color: 0x63ad42, roughness: 1 });
      const leaf3 = new THREE.MeshStandardMaterial({ color: 0x7cc353, roughness: 1 });
      ([[0, 2.5, 0, 1.05, leaf1], [0.75, 2.15, 0.15, 0.72, leaf2], [-0.7, 2.1, -0.1, 0.68, leaf2], [0.3, 2.95, -0.2, 0.62, leaf3], [-0.35, 2.85, 0.25, 0.58, leaf3], [0, 2.2, 0.55, 0.55, leaf1]] as const)
        .forEach(([px, py, pz, r, m]) => {
          const c = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), m);
          c.position.set(px, py, pz); c.scale.y = 0.85; c.castShadow = true; T.add(c);
        });
      T.position.set(x, 0, z); T.scale.setScalar(s);
      T.traverse((o: THREE.Object3D) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
      scene.add(T);
    };
    mkTree(-5.2, -6.5, 1.5);
    mkTree(5.8, -8.5, 1.9);

    const hillMat = new THREE.MeshStandardMaterial({ color: 0x74bb52, roughness: 1 });
    ([[-13, -17, 7], [10, -19, 9], [0, -22, 11]] as const).forEach(([x, z, s]) => {
      const h = new THREE.Mesh(new THREE.SphereGeometry(s, 20, 16), hillMat);
      h.position.set(x, -s * 0.72, z);
      scene.add(h);
    });
    const disc = new THREE.Mesh(new THREE.SphereGeometry(2.4, 24, 24), new THREE.MeshBasicMaterial({ color: 0xfff4c2 }));
    disc.position.set(9, 12, -24);
    scene.add(disc);

    const clouds: THREE.Group[] = [];
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.08 });
    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      ([[0, 0, 0, 1.6], [1.4, -0.2, 0, 1.1], [-1.3, -0.15, 0.2, 1.2], [0.4, 0.5, 0, 1]] as const).forEach(([x, y, z, s]) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 10), cloudMat);
        b.position.set(x, y, z);
        g.add(b);
      });
      g.position.set(-14 + i * 9, 7 + Math.random() * 3, -14 - Math.random() * 6);
      g.scale.setScalar(0.8 + Math.random() * 0.5);
      scene.add(g);
      clouds.push(g);
    }

    const goat = this.buildGoat();
    scene.add(goat);

    this.renderer = renderer; this.scene = scene; this.camera = camera; this.goat = goat; this.clouds = clouds;
    this.applyStyle(goat);

    this.onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera({ x: nx, y: ny } as THREE.Vector2, camera);
      const hits = this.raycaster.intersectObject(goat, true);
      if (hits.length) {
        let intensity: number;
        if (e.pointerType === 'touch') {
          const area = (e.width || 1) * (e.height || 1);
          const sizeF = Math.min(area / 2400, 1);
          intensity = e.pressure && e.pressure > 0 ? e.pressure : sizeF > 0.03 ? sizeF : 0.55;
        } else {
          intensity = 0.4 + Math.random() * 0.55;
        }
        intensity = Math.max(0.2, Math.min(1, intensity));
        this.triggerCareta(intensity, e.clientX - rect.left, e.clientY - rect.top);
        if (this.onTap) this.zone.run(() => this.onTap!(intensity));
      }
    };
    canvas.addEventListener('pointerdown', this.onPointer);

    this.ro = new ResizeObserver(() => {
      const w = parent.clientWidth, h = parent.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    this.ro.observe(parent);

    this.clock = new THREE.Clock();
    const loop = () => {
      if (!this.alive) return;
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this.updateGoat(dt);
      for (const c of this.clouds) {
        c.position.x += dt * 0.35;
        if (c.position.x > 18) c.position.x = -18;
      }
      renderer.render(scene, camera);
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  private makeSky(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 8; c.height = 256;
    const g = c.getContext('2d')!;
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#6db9ec'); grad.addColorStop(0.55, '#a7d9f0'); grad.addColorStop(1, '#e4f6df');
    g.fillStyle = grad; g.fillRect(0, 0, 8, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private buildGoat(): THREE.Group {
    const G = new THREE.Group();
    const cream = new THREE.MeshStandardMaterial({ color: 0xf3e9d4, roughness: 0.85 });
    const shade = new THREE.MeshStandardMaterial({ color: 0xe4d5b6, roughness: 0.85 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x3d3226, roughness: 0.7 });
    const horn = new THREE.MeshStandardMaterial({ color: 0x8a745a, roughness: 0.6 });
    const pink = new THREE.MeshStandardMaterial({ color: 0xe79aa8, roughness: 0.7 });
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 26, 20), cream);
    body.scale.set(0.82, 0.88, 1.42); body.position.set(0, 1.04, -0.05); G.add(body);
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.44, 20, 16), cream);
    chest.scale.set(0.95, 1, 1); chest.position.set(0, 1.12, 0.5); G.add(chest);
    const rump = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), cream);
    rump.scale.set(0.95, 0.9, 1); rump.position.set(0, 1.08, -0.62); rump.rotation.x = 0.3; G.add(rump);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 16), shade);
    belly.scale.set(0.8, 0.7, 1.15); belly.position.set(0, 0.8, -0.05); G.add(belly);

    const spotMat = new THREE.MeshStandardMaterial({ color: 0x5b4327, roughness: 0.85 });
    const spots: THREE.Mesh[] = [];
    ([[0.45, 0.2, 0.35], [-0.5, -0.1, -0.2], [0.2, 0.45, -0.4], [-0.3, -0.35, 0.4], [0.4, -0.3, -0.35], [-0.15, 0.4, 0.45]] as const).forEach((p) => {
      const dir = new THREE.Vector3(p[0], p[1], p[2]).normalize().multiplyScalar(0.6);
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), spotMat);
      m.position.copy(dir); m.visible = false; m.castShadow = false; body.add(m); spots.push(m);
    });

    const legMat = shade;
    const mkLeg = (x: number, z: number) => {
      const grp = new THREE.Group(); grp.position.set(x, 0.78, z);
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.075, 0.42, 10), legMat); thigh.position.y = -0.19; grp.add(thigh);
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.36, 9), legMat); shin.position.y = -0.55; grp.add(shin);
      const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.13, 8), dark); hoof.position.y = -0.76; grp.add(hoof);
      G.add(grp); return grp;
    };
    const legFL = mkLeg(-0.3, 0.5), legFR = mkLeg(0.3, 0.5), legBL = mkLeg(-0.3, -0.55), legBR = mkLeg(0.3, -0.55);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 8), cream);
    tail.position.set(0, 1.15, -0.72); tail.rotation.x = 0.9; G.add(tail);

    const head = new THREE.Group(); head.position.set(0, 1.66, 0.78); G.add(head);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 0.72, 14), cream);
    neck.position.set(0, 1.36, 0.6); neck.rotation.x = 0.45; G.add(neck);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.34, 22, 18), cream); skull.scale.set(0.82, 0.95, 1.05); head.add(skull);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 14), cream); muzzle.scale.set(0.62, 0.55, 1.25); muzzle.position.set(0, -0.14, 0.34); head.add(muzzle);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 12), pink); nose.scale.set(1, 0.65, 0.6); nose.position.set(0, -0.08, 0.62); head.add(nose);
    const brow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), cream); brow.scale.set(0.85, 0.6, 0.9); brow.position.set(0, 0.18, 0.14); head.add(brow);

    const jaw = new THREE.Group(); jaw.position.set(0, -0.26, 0.18); head.add(jaw);
    const jawM = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), cream); jawM.scale.set(0.55, 0.35, 1); jawM.position.set(0, -0.02, 0.26); jaw.add(jawM);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.3), dark); mouth.position.set(0, 0.05, 0.28); jaw.add(mouth);
    const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), pink); tongue.scale.set(0.8, 0.4, 1.1); tongue.position.set(0, 0.02, 0.4); tongue.visible = false; jaw.add(tongue);
    const beard = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 8), white); beard.position.set(0, -0.14, 0.16); beard.rotation.x = Math.PI - 0.25; jaw.add(beard);

    const amber = new THREE.MeshStandardMaterial({ color: 0xd8b25e, roughness: 0.4 });
    const mkEye = (x: number) => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 14), amber); e.position.set(x, 0.06, 0.16); e.scale.set(0.8, 1, 1); head.add(e);
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.045, 0.1), dark); p.position.set(x > 0 ? x + 0.055 : x - 0.055, 0.06, 0.18); head.add(p);
      return { e, p };
    };
    const L = mkEye(-0.235), R = mkEye(0.235);

    const mkEar = (x: number) => {
      const ear = new THREE.Group(); ear.position.set(x, 0.18, -0.04);
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), cream); m.scale.set(0.42, 0.2, 1.15); m.position.set(x > 0 ? 0.12 : -0.12, -0.08, 0.02); ear.add(m);
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), pink); inner.scale.set(0.35, 0.15, 0.9); inner.position.set(x > 0 ? 0.12 : -0.12, -0.055, 0.05); ear.add(inner);
      ear.rotation.z = x > 0 ? -1.15 : 1.15; ear.rotation.x = 0.25; head.add(ear); return ear;
    };
    const earL = mkEar(-0.3), earR = mkEar(0.3);

    const mkHorn = (x: number) => {
      const hg = new THREE.Group(); hg.position.set(x, 0.3, -0.02);
      let ang = -0.5, px = 0, py = 0, pz = 0;
      for (let i = 0; i < 4; i++) {
        const r = 0.065 - i * 0.014;
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.012, r, 0.16, 8), horn);
        seg.position.set(px, py, pz); seg.rotation.x = ang; hg.add(seg);
        ang -= 0.38; py += Math.cos(ang) * 0.14; pz += Math.sin(ang) * 0.14;
      }
      hg.rotation.z = x > 0 ? -0.12 : 0.12; head.add(hg); return hg;
    };
    const hornL = mkHorn(-0.14), hornR = mkHorn(0.14);

    G.traverse((o: THREE.Object3D) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });

    const userData: GoatUserData = {
      heading: 0, targetHeading: 0, turnTimer: 1.5, t: 0, careta: 0, face: 0, faceIntensity: 1,
      coat: { main: cream, second: shade, spots },
      parts: { body, head, jaw, tongue, eyeL: L.e, eyeR: R.e, pupilL: L.p, pupilR: R.p, earL, earR, legFL, legFR, legBL, legBR, tail, hornL, hornR, beard, chest, rump },
    };
    G.userData = userData;
    G.position.set(0, 0, 0);
    return G;
  }

  private applyStyle(goat: THREE.Group): void {
    const p = (goat.userData as GoatUserData).parts;
    if (this.style === 'fofa') {
      p.head.scale.setScalar(1.42);
      p.body.scale.set(0.95, 0.95, 1.15); p.chest.scale.multiplyScalar(1.1); p.rump.scale.multiplyScalar(1.1);
      p.hornL.scale.setScalar(0.55); p.hornR.scale.setScalar(0.55);
      p.earL.scale.setScalar(1.2); p.earR.scale.setScalar(1.2);
      goat.scale.setScalar(0.92);
    } else if (this.style === 'selvagem') {
      p.hornL.scale.setScalar(1.65); p.hornR.scale.setScalar(1.65);
      p.body.scale.set(0.78, 0.86, 1.5); p.head.scale.setScalar(0.95);
      p.beard.scale.setScalar(1.6);
      goat.scale.setScalar(1.06);
    }
  }

  private triggerCareta(intensity: number, sx: number, sy: number): void {
    const ud = this.goat.userData as GoatUserData;
    ud.careta = 0.9 + intensity * 0.7;
    ud.faceIntensity = 0.55 + intensity * 0.9;
    this.playBleat();
    this.spawnBubble(intensity, sx, sy);
  }

  private updateGoat(dt: number): void {
    const g = this.goat, ud = g.userData as GoatUserData, p = ud.parts;
    ud.t += dt;
    ud.turnTimer -= dt;
    if (ud.turnTimer <= 0) { ud.targetHeading = Math.random() * Math.PI * 2; ud.turnTimer = 2 + Math.random() * 3.5; }
    const cx = 0, cz = -0.8, R = 3.4;
    const dist = Math.hypot(g.position.x - cx, g.position.z - cz);
    if (dist > R) { ud.targetHeading = Math.atan2(cx - g.position.x, cz - g.position.z); ud.turnTimer = 1.5 + Math.random() * 2; }
    let dh = ud.targetHeading - ud.heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    ud.heading += dh * Math.min(1, dt * 1.8);
    g.rotation.y = ud.heading;
    const careta = ud.careta > 0;
    const speed = careta ? 0 : 1.05;
    g.position.x += Math.sin(ud.heading) * speed * dt;
    g.position.z += Math.cos(ud.heading) * speed * dt;
    const d2 = Math.hypot(g.position.x - cx, g.position.z - cz);
    if (d2 > R) { g.position.x = cx + (g.position.x - cx) / d2 * R; g.position.z = cz + (g.position.z - cz) / d2 * R; }

    const wk = careta ? 0 : 1;
    const ph = ud.t * 9;
    p.legFL.rotation.x = Math.sin(ph) * 0.55 * wk;
    p.legFR.rotation.x = Math.sin(ph + Math.PI) * 0.55 * wk;
    p.legBL.rotation.x = Math.sin(ph + Math.PI) * 0.55 * wk;
    p.legBR.rotation.x = Math.sin(ph) * 0.55 * wk;
    g.position.y = Math.abs(Math.sin(ph)) * 0.04 * wk;
    p.body.rotation.z = Math.sin(ph) * 0.03 * wk;
    p.tail.rotation.z = Math.sin(ud.t * 6) * 0.4;

    const target = careta ? 1 : 0;
    ud.face += (target - ud.face) * Math.min(1, dt * 9);
    const f = ud.face * ud.faceIntensity;
    p.jaw.rotation.x = 0.04 + f * 0.75;
    p.tongue.visible = f > 0.2;
    p.tongue.scale.set(0.8, 0.4 + f * 0.3, 1.1 + f * 0.6);
    const es = 0.8 * (1 + f * 0.55), esy = 1 + f * 0.55;
    p.eyeL.scale.set(es, esy, esy); p.eyeR.scale.set(es, esy, esy);
    p.pupilL.position.x = -0.29 + f * 0.09; p.pupilR.position.x = 0.29 - f * 0.09;
    p.earL.rotation.x = 0.3 - f * 0.7; p.earR.rotation.x = 0.3 - f * 0.7;
    const camYaw = -ud.heading;
    p.head.rotation.y = camYaw * f * 0.85;
    p.head.rotation.x = -f * 0.3;
    p.head.rotation.z = f * Math.sin(ud.t * 32) * 0.14;

    if (ud.careta > 0) { ud.careta -= dt; if (ud.careta < 0) ud.careta = 0; }
  }

  private playBleat(): void {
    if (!this.soundEnabled || !this.audioPool.length) return;
    let idx = Math.floor(Math.random() * this.audioPool.length);
    if (this.audioPool.length > 1 && idx === this.lastSoundIndex) {
      idx = (idx + 1) % this.audioPool.length;
    }
    this.lastSoundIndex = idx;
    const src = this.audioPool[idx];
    const player = src.cloneNode(true) as HTMLAudioElement;
    player.play().catch(() => {});
  }

  private spawnBubble(intensity: number, x: number, y: number): void {
    const ov = this.overlay; if (!ov) return;
    const es = 'é'.repeat(1 + Math.round(intensity * 6));
    const el = document.createElement('div');
    el.textContent = 'Bé' + es + '!';
    const fs = 15 + intensity * 24;
    el.style.cssText = `position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);font-family:Fredoka,sans-serif;font-weight:700;font-size:${fs}px;color:#3a2a14;background:#fff;padding:6px 14px;border-radius:16px 16px 16px 4px;box-shadow:0 8px 20px -6px rgba(30,40,15,.5);white-space:nowrap;will-change:transform,opacity`;
    ov.appendChild(el);
    el.animate(
      [
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 },
        { transform: 'translate(-50%,-70%) scale(1)', opacity: 1, offset: 0.25 },
        { transform: 'translate(-50%,-160%) scale(1)', opacity: 0 },
      ],
      { duration: 900 + intensity * 300, easing: 'cubic-bezier(.2,.7,.3,1)' }
    ).onfinish = () => el.remove();

    const size = 30 + intensity * 90;
    const r = document.createElement('div');
    r.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;margin:-${size / 2}px 0 0 -${size / 2}px;border:3px solid rgba(255,255,255,.9);border-radius:50%;will-change:transform,opacity`;
    ov.appendChild(r);
    r.animate(
      [{ transform: 'scale(.2)', opacity: 0.9 }, { transform: 'scale(1.6)', opacity: 0 }],
      { duration: 520, easing: 'ease-out' }
    ).onfinish = () => r.remove();
  }
}
