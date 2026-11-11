import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { PROJECTS } from './projects';

// Medidas del dispositivo
const W = 3.8;
const H = 2.5;
const D = 0.12;
const BEZEL = 0.14;
const SCREEN_W = W - BEZEL * 2;
const SCREEN_H = H - BEZEL * 2;
const SCREEN_Z = D / 2 + 0.0135; // plano donde está la pantalla
const CAM_Z = 7.5;
const FOV = 45;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const smooth = (x) => x * x * (3 - 2 * x);
const seg = (p, a, b) => THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);

// El canvas conserva la misma proporción que la pantalla (evita estirar el contenido)
const CW = 1024;
const CH = Math.round(CW * (SCREEN_H / SCREEN_W));

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

const SLIDE_TIME = 4;   // segundos que se ve cada proyecto
const TRANS = 0.9;      // duración de la transición
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function wrap(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lh;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

// Capturas reales de los proyectos, precargadas para pintarlas en la pantalla
const IMAGES = {};
if (typeof Image !== 'undefined') {
  PROJECTS.forEach((p) => {
    if (!p.image) return;
    const img = new Image();
    img.src = p.image;
    IMAGES[p.image] = img;
  });
}

function drawProject(ctx, p, dx, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(dx, 0);

  // Etiqueta
  ctx.font = '600 20px system-ui, sans-serif';
  const tw = ctx.measureText(p.tag).width;
  rr(ctx, 56, 236, tw + 32, 40, 20);
  ctx.fillStyle = `rgba(${p.accent},0.16)`;
  ctx.fill();
  ctx.strokeStyle = `rgba(${p.accent},0.5)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = `rgb(${p.accent})`;
  ctx.fillText(p.tag, 72, 263);

  // Título y descripción
  ctx.fillStyle = '#fff';
  ctx.font = '800 64px system-ui, sans-serif';
  ctx.fillText(p.name, 56, 360);
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '400 24px system-ui, sans-serif';
  wrap(ctx, p.desc, 56, 410, 470, 34);

  // Mockup del proyecto: ventana de navegador con la captura real (si existe)
  const mx = 584, my = 214, mw = 388, mh = 300, bar = 40;
  const img = p.image ? IMAGES[p.image] : null;
  const ready = img && img.complete && img.naturalWidth > 0;

  // Sombra bajo la ventana
  ctx.save();
  ctx.shadowColor = `rgba(${p.accent},0.35)`;
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 20;
  rr(ctx, mx, my, mw, mh, 22);
  ctx.fillStyle = '#0c0c10';
  ctx.fill();
  ctx.restore();

  ctx.save();
  rr(ctx, mx, my, mw, mh, 22);
  ctx.clip();

  if (ready) {
    // Ajuste tipo "cover", anclado arriba (donde suele estar lo importante de una web)
    const aw = mw, ah = mh - bar;
    const s = Math.max(aw / img.naturalWidth, ah / img.naturalHeight);
    const sw = aw / s, sh = ah / s;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, 0, sw, sh, mx, my + bar, aw, ah);
  } else {
    const g = ctx.createLinearGradient(mx, my, mx + mw, my + mh);
    g.addColorStop(0, `rgba(${p.accent},0.4)`);
    g.addColorStop(1, `rgba(${p.accent},0.06)`);
    ctx.fillStyle = g;
    ctx.fillRect(mx, my, mw, mh);
    rr(ctx, mx + 28, my + bar + 28, 210, 16, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
    rr(ctx, mx + 28, my + bar + 60, 150, 12, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();
    rr(ctx, mx + 28, my + bar + 100, 158, 110, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    rr(ctx, mx + 202, my + bar + 100, 158, 110, 14);
    ctx.fill();
  }

  // Barra superior de la ventana
  ctx.fillStyle = 'rgba(14,14,18,0.92)';
  ctx.fillRect(mx, my, mw, bar);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(mx + 24 + i * 18, my + bar / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
  }
  rr(ctx, mx + 96, my + 10, mw - 124, 20, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.restore();

  rr(ctx, mx, my, mw, mh, 22);
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

function drawScreen(ctx, t) {
  const w = CW;
  const h = CH;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  rr(ctx, 0, 0, w, h, 36);
  ctx.clip();
  ctx.fillStyle = '#060608';
  ctx.fillRect(0, 0, w, h);

  // Luces de fondo (movimiento lento = sin parpadeo)
  const blobs = [
    { x: 0.2, y: 0.3, r: 420, c: '255,255,255', a: 0.1 },
    { x: 0.85, y: 0.75, r: 460, c: '125,170,255', a: 0.18 },
  ];
  blobs.forEach((b, i) => {
    const x = w * b.x + Math.sin(t * 0.3 + i * 2) * 80;
    const y = h * b.y + Math.cos(t * 0.25 + i * 3) * 50;
    const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
    g.addColorStop(0, `rgba(${b.c},${b.a})`);
    g.addColorStop(1, `rgba(${b.c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Barra de estado + encabezado
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText('9:41', 56, 52);
  ctx.fillStyle = '#fff';
  ctx.font = '800 40px system-ui, sans-serif';
  ctx.fillText('CODE.WEB', 56, 128);
  ctx.fillStyle = '#71717a';
  ctx.font = '400 22px system-ui, sans-serif';
  ctx.fillText('Proyectos seleccionados', 56, 166);

  // Carrusel con transición suave
  const n = PROJECTS.length;
  const cur = Math.floor(t / SLIDE_TIME) % n;
  const next = (cur + 1) % n;
  const local = t % SLIDE_TIME;
  const tr = Math.min(Math.max((local - (SLIDE_TIME - TRANS)) / TRANS, 0), 1);
  const k = ease(tr);

  // Secuencial: el actual termina de salir antes de que entre el siguiente
  // (así los textos nunca se enciman)
  const out = ease(Math.min(tr / 0.45, 1));
  const inn = ease(Math.max((tr - 0.45) / 0.55, 0));
  drawProject(ctx, PROJECTS[cur], -out * 40, 1 - out);
  drawProject(ctx, PROJECTS[next], (1 - inn) * 40, inn);

  // Indicadores (la activa se ensancha suavemente)
  let x = 56;
  for (let i = 0; i < n; i++) {
    const wgt = i === cur ? 1 - k : i === next ? k : 0;
    const pw = 12 + 36 * wgt;
    rr(ctx, x, h - 64, pw, 8, 4);
    ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.8 * wgt})`;
    ctx.fill();
    x += pw + 10;
  }

  // Viñeta
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, w * 0.7);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);

  // Reflejo diagonal del cristal
  const sh = ctx.createLinearGradient(w * 0.35, 0, w * 0.95, h);
  sh.addColorStop(0, 'rgba(255,255,255,0)');
  sh.addColorStop(0.42, 'rgba(255,255,255,0)');
  sh.addColorStop(0.5, 'rgba(255,255,255,0.055)');
  sh.addColorStop(0.62, 'rgba(255,255,255,0.015)');
  sh.addColorStop(0.63, 'rgba(255,255,255,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

// Textura de sombra suave (degradado radial) para simular que la tablet flota
function makeShadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  g.addColorStop(0.35, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.7, 'rgba(0,0,0,0.12)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

function Screen() {
  const last = useRef(0);

  const { texture, ctx } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = CW;
    canvas.height = CH;
    const context = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.anisotropy = 8;
    return { texture: tex, ctx: context };
  }, []);

  // Limitado a ~30 fps: menos trabajo y sin saltos innecesarios
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (t - last.current < 1 / 30) return;
    last.current = t;
    drawScreen(ctx, t);
    texture.needsUpdate = true;
  });

  return (
    <group position={[0, 0, D / 2 + 0.0135]}>
      <mesh>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshBasicMaterial
          map={texture}
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      <mesh position={[0, 0, 0.003]}>
        <planeGeometry args={[SCREEN_W, SCREEN_H]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.1}
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={2}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
        />
      </mesh>
    </group>
  );
}

function TabletModel({ progress }) {
  const root = useRef();   // posición + escala
  const tilt = useRef();   // rotación
  const bob = useRef();    // flotación
  const mouse = useRef({ x: 0, y: 0 });
  const halo = useRef();   // sombra ambiental detrás
  const floor = useRef();  // sombra de contacto debajo
  const shadowTex = useMemo(() => makeShadowTexture(), []);
  const { camera, size } = useThree();

  useFrame(({ pointer, clock }, delta) => {
  const p = progress.current;
  const aspect = size.width / size.height;
  const desktop = size.width >= 1024;

  // Tamaño visible del mundo a la distancia de la cámara
  const visH = 2 * CAM_Z * TAN;
  const visW = visH * aspect;

  // Zona del viewport donde vive la tablet en reposo (fracciones de 0 a 1)
  // cx/cy = centro, w/h = tamaño máximo
  const zone = desktop
    ? { cx: 0.755, cy: 0.5, w: 0.34, h: 0.6 }   // mitad blanca
    : { cx: 0.5, cy: 0.8, w: 0.82, h: 0.3 };   // franja blanca de abajo

  // La tablet se escala para caber en su zona (nunca más grande que 1)
  const fit = Math.min((zone.w * visW) / W, (zone.h * visH) / H);
  const baseScale = Math.min(1, fit);
  const baseX = (zone.cx - 0.5) * visW;
  const baseY = -(zone.cy - 0.5) * visH;

  // Inclinación más suave en móvil para que no se desborde
  const tiltY = desktop ? -0.35 : -0.2;

  // Tramos de la animación
  const move = smooth(seg(p, 0, 0.45));
  const zoom = smooth(seg(p, 0.15, 0.92));
  const k = 1 - move;

  mouse.current.x = THREE.MathUtils.damp(mouse.current.x, pointer.x, 4, delta);
  mouse.current.y = THREE.MathUtils.damp(mouse.current.y, pointer.y, 4, delta);

  root.current.position.set(baseX * k, baseY * k, 0);
  root.current.scale.setScalar(THREE.MathUtils.lerp(baseScale, 1, move));
  tilt.current.rotation.set(
    (0.12 - mouse.current.y * 0.2) * k,
    (tiltY + mouse.current.x * 0.3) * k,
    0.03 * k
  );

  // ...el resto (flotación, cámara, zEnd) queda igual

    // Flotación que se apaga al llegar a la pantalla
    const t = clock.elapsedTime;
    bob.current.position.y = Math.sin(t * 1.2) * 0.08 * k;
    bob.current.rotation.z = Math.sin(t * 0.8) * 0.01 * k;

    // Sombras: se apagan al acercarnos y "respiran" con la flotación
    const lift = Math.sin(t * 1.2); // -1 abajo, 1 arriba
    halo.current.material.opacity = 0.3 * k;
    floor.current.material.opacity = (0.34 - lift * 0.07) * k;
    floor.current.scale.setScalar(1 + lift * 0.05);

    // Distancia final: la pantalla cubre todo el viewport (96% para evitar bordes)
    const dH = SCREEN_H / (2 * TAN);
    const dW = SCREEN_W / (2 * TAN * aspect);
    const zEnd = SCREEN_Z + Math.min(dH, dW) * 0.96;

    // Interpolación exponencial: el zoom se siente constante, no se acelera al final
    camera.position.z = CAM_Z * Math.pow(zEnd / CAM_Z, zoom);
  });

  return (
    <group ref={root}>
      <group ref={tilt}>
        <group ref={bob}>
          <RoundedBox args={[W, H, D]} radius={0.12} smoothness={8} creaseAngle={0.4}>
            <meshStandardMaterial color="#8b8b94" metalness={1} roughness={0.26} />
          </RoundedBox>

          <RoundedBox
            args={[W - 0.06, H - 0.06, 0.022]}
            radius={0.095}
            smoothness={6}
            position={[0, 0, D / 2]}
          >
            <meshStandardMaterial color="#020203" metalness={0.2} roughness={0.15} />
          </RoundedBox>

          <mesh position={[0, H / 2 - BEZEL / 2, D / 2 + 0.0125]}>
            <circleGeometry args={[0.025, 24]} />
            <meshStandardMaterial color="#0b0b14" metalness={0.8} roughness={0.15} />
          </mesh>

          <RoundedBox args={[0.4, 0.03, 0.05]} radius={0.012} position={[0.9, H / 2 + 0.005, 0]}>
            <meshStandardMaterial color="#52525b" metalness={1} roughness={0.35} />
          </RoundedBox>

          <Screen />
        </group>
      </group>

      {/* Sombra ambiental: separa la tablet del fondo claro */}
      <mesh ref={halo} position={[0.12, -0.3, -0.7]} renderOrder={-2}>
        <planeGeometry args={[W * 1.75, H * 2]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.3} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Sombra de contacto: elipse bajo la tablet, como si flotara sobre una mesa */}
      <mesh ref={floor} position={[0.05, -H / 2 - 0.62, -0.2]} renderOrder={-1}>
        <planeGeometry args={[W * 1.15, 0.5]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.34} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function Hero3D({ progress, active = true }) {
  return (
    <div className="w-full h-full">
      <Canvas
        // Cuando ya entramos a las secciones, se pausa el render (ahorra batería)
        frameloop={active ? 'always' : 'never'}
        dpr={[1, 2]}
        camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.5, far: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[2, 5, 5]} intensity={0.8} />

        <Environment resolution={512}>
          <Lightformer form="rect" intensity={4} position={[-3, 4, 4]} scale={[8, 2.5, 1]} />
          <Lightformer form="rect" intensity={2} position={[5, 1, 3]} scale={[1.5, 5, 1]} />
          <Lightformer form="rect" intensity={1.5} position={[0, -3, -5]} scale={[10, 2, 1]} />
        </Environment>

        <TabletModel progress={progress} />
      </Canvas>
    </div>
  );
}