import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Environment, Lightformer, ContactShadows } from '@react-three/drei';
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
  wrap(ctx, p.desc, 56, 410, 500, 34);

  // Mockup del proyecto
  const mx = 600, my = 230, mw = 368, mh = 280;
  const g = ctx.createLinearGradient(mx, my, mx + mw, my + mh);
  g.addColorStop(0, `rgba(${p.accent},0.35)`);
  g.addColorStop(1, `rgba(${p.accent},0.05)`);
  rr(ctx, mx, my, mw, mh, 24);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.stroke();

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(mx + 28 + i * 20, my + 28, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
  }
  rr(ctx, mx + 28, my + 64, 200, 16, 8);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fill();
  rr(ctx, mx + 28, my + 96, 140, 12, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fill();
  rr(ctx, mx + 28, my + 140, 150, 100, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fill();
  rr(ctx, mx + 190, my + 140, 150, 100, 14);
  ctx.fill();

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
  const k = ease(Math.min(Math.max((local - (SLIDE_TIME - TRANS)) / TRANS, 0), 1));

  drawProject(ctx, PROJECTS[cur], -k * 90, 1 - k);
  drawProject(ctx, PROJECTS[next], (1 - k) * 90, k);

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

  ctx.restore();
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
    ? { cx: 0.79, cy: 0.5, w: 0.34, h: 0.6 }   // mitad blanca
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
            <meshStandardMaterial color="#3f3f46" metalness={1} roughness={0.32} />
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

      <ContactShadows position={[0, -1.9, 0]} opacity={0.45} scale={9} blur={2.8} far={4} />
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