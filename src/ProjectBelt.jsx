import { useContext, useEffect, useRef } from 'react';
import { PROJECTS } from './projects';
import { EnteredCtx } from './content';

/*
  Cinta de proyectos con "escáner": las capturas avanzan hacia la izquierda y,
  al cruzar la línea central, se deshacen en partículas y dejan ver su código.
  Se puede arrastrar (o usar la rueda horizontal) para adelantar o reconstruir.
*/

// Proyectos con captura (los que tengan `showcase: false` no entran en la cinta)
const BASE = PROJECTS.filter((p) => p.image && p.showcase !== false);
// La cinta necesita al menos 4 tarjetas para dar la vuelta sin huecos
const ITEMS = BASE.length ? Array.from({ length: Math.max(4, BASE.length) }, (_, i) => BASE[i % BASE.length]) : [];

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const mod = (a, n) => ((a % n) + n) % n;

// Hash entero de 32 bits → número entre 0 y 1 (siempre el mismo para la misma celda)
function hash(a, b, c) {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Paleta de 7 tonos a partir del color del proyecto: del color puro al casi blanco
function palette(accent) {
  const [r, g, b] = accent.split(',').map(Number);
  return [0, 0.08, 0.18, 0.34, 0.56, 0.8, 0.93].map((t) => {
    const m = (v) => Math.round(v + (255 - v) * t);
    return `rgb(${m(r)},${m(g)},${m(b)})`;
  });
}

// "Código" de cada proyecto, generado con sus propios datos
function codeFor(p) {
  const slug = p.name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const words = p.desc.split(' ');
  const comments = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).length > 52 && line) {
      comments.push(line);
      line = w;
    } else line = line ? `${line} ${w}` : w;
  }
  comments.push(line);

  const body = [
    `<main class="${slug}">`,
    `  <header class="nav">`,
    `    <a class="logo" href="/">${p.name}</a>`,
    `    <nav aria-label="Principal">`,
    `      <a href="#inicio">Inicio</a>`,
    `      <a href="#servicios">Servicios</a>`,
    `      <a href="#contacto">Contacto</a>`,
    `    </nav>`,
    `  </header>`,
    `  <section class="hero" data-animate="fade-up">`,
    `    <span class="tag">${p.tag}</span>`,
    `    <h1>${p.name}</h1>`,
    `    <button class="cta" type="button">`,
    `      Empezar ahora`,
    `    </button>`,
    `  </section>`,
    `  <section class="grid" data-columns="3">`,
    `    <article class="card"></article>`,
    `    <article class="card"></article>`,
    `    <article class="card"></article>`,
    `  </section>`,
    `  <footer class="footer">`,
    `    <small>Hecho por CODE.WEB</small>`,
    `  </footer>`,
    `</main>`,
  ];
  return [
    { c: true, t: `<!-- ${p.name} · ${p.tag} -->` },
    ...comments.slice(0, 3).map((t) => ({ c: true, t: `<!-- ${t} -->` })),
    ...body.map((t) => ({ t })),
    ...body.map((t) => ({ t })),
  ];
}

const CODES = ITEMS.map(codeFor);
const PALETTES = ITEMS.map((p) => palette(p.accent));

export default function ProjectBelt() {
  const entered = useContext(EnteredCtx);
  const enteredRef = useRef(entered);
  const wrap = useRef(null);
  const canvas = useRef(null);
  const nameEl = useRef(null);
  const pctEl = useRef(null);
  const lineEl = useRef(null);
  const cardEls = useRef([]);
  const codeEls = useRef([]);

  useEffect(() => {
    enteredRef.current = entered;
  }, [entered]);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    if (!el || !cv || !ITEMS.length) return;
    const ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const AUTO = reduce ? 0 : -55; // px/s hacia la izquierda
    const n = ITEMS.length;

    let W = 0, H = 0, cw = 0, ch = 0, top = 0, step = 0, total = 0, Lx = 0, rad = 0, dpr = 1;
    let off = 0, vel = AUTO, started = false;
    let dragging = false, lastX = 0, lastT = 0;
    let visible = false, raf = 0, prev = 0, time = 0;
    let current = -2, shown = 0;
    const sparks = [];

    const measure = () => {
      const card = cardEls.current[0];
      W = el.clientWidth;
      H = el.clientHeight;
      cw = card.offsetWidth;
      ch = card.offsetHeight;
      top = card.offsetTop;
      step = cw + W * (W <= 767 ? 0.07 : 0.047);
      total = step * n;
      Lx = W / 2;
      rad = Math.max(12, W * 0.016);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      if (!started && cw > 0) {
        // Arranca con la primera tarjeta a medio cruzar
        off = Lx - cw * 0.35 + step;
        started = true;
      }
    };

    const drawFx = (crossers) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const R = 0.3 * cw;
      const rows = Math.floor(ch / 3);
      const tick = reduce ? 0 : Math.floor(time * 9) + 97;

      for (const { i, x, cut } of crossers) {
        const pal = PALETTES[i];
        const accent = ITEMS[i].accent;

        // 1. Bruma de color junto a la línea
        const hw = Math.min(150, x + cw - Lx);
        if (hw > 0) {
          const g = ctx.createLinearGradient(Lx, 0, Lx + 150, 0);
          g.addColorStop(0, `rgba(${accent},0.42)`);
          g.addColorStop(1, `rgba(${accent},0)`);
          ctx.fillStyle = g;
          ctx.fillRect(Lx, top, hw, ch);
        }

        // 2. Partículas tramadas, fijas a la superficie de la tarjeta
        const gx0 = Math.ceil(cut / 3);
        const gx1 = Math.min(Math.floor(cw / 3), Math.floor((cut + R) / 3));
        for (let gx = gx0; gx <= gx1; gx++) {
          const sx = x + gx * 3;
          const d = sx - Lx;
          if (d < 0 || d > R) continue;
          const p = Math.pow(1 - d / R, 1.7);
          for (let row = -5; row < rows + 5; row++) {
            const out = row < 0 ? -row : row >= rows ? row - rows + 1 : 0;
            const thr = out ? p * 0.16 * (1 - out / 6) : p * 0.92;
            if (hash(gx, row, i) >= thr) continue;
            if (!reduce && hash(gx, row, tick) < 0.22) continue; // parpadeo
            const h2 = hash(row, gx, i + 31);
            const idx = d < 10 ? 4 + Math.floor(h2 * 3) : Math.floor(h2 * h2 * 7);
            const size = 1.1 + h2 * 1.7;
            const jx = reduce ? 0 : (hash(gx, row, i + 53) - 0.5) * 1.6;
            const jy = reduce ? 0 : (hash(row, gx, i + 71) - 0.5) * 1.6;
            ctx.fillStyle = pal[idx];
            ctx.fillRect(sx + jx, top + row * 3 + jy, size, size);
          }
        }

        // 3. Chispas libres
        if (!reduce) {
          for (let k = 0; k < 3; k++) {
            if (Math.random() > 0.7 || sparks.length > 160) continue;
            const life = 0.3 + Math.random() * 0.8;
            sparks.push({
              x: Lx + Math.random() * 30,
              y: top - 10 + Math.random() * (ch + 20),
              vx: -30 + Math.random() * 70 + vel * 0.6,
              vy: (Math.random() - 0.5) * 50,
              s: 0.8 + Math.random() * 1.8,
              life,
              c: pal[Math.floor(Math.random() * pal.length)],
            });
          }
        }
      }

      for (let k = sparks.length - 1; k >= 0; k--) {
        const s = sparks[k];
        if (s.life <= 0) {
          sparks.splice(k, 1);
          continue;
        }
        ctx.globalAlpha = Math.min(1, s.life * 2.2);
        ctx.fillStyle = s.c;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - prev) / 1000 || 0);
      prev = now;
      if (!visible || !enteredRef.current || !cw) return;
      time += dt;

      if (!dragging) {
        vel += (AUTO - vel) * Math.min(1, dt * 2.2);
        off += vel * dt;
      }
      for (const s of sparks) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
      }

      const crossers = [];
      let crossing = -1;
      let crossCut = 0;
      for (let i = 0; i < n; i++) {
        const x = mod(i * step + off, total) - step;
        const cut = clamp(Lx - x, 0, cw);
        const card = cardEls.current[i];
        const code = codeEls.current[i];
        const tf = `translate3d(${x.toFixed(1)}px,0,0)`;

        card.style.transform = tf;
        if (cut > 0) {
          const c = cut.toFixed(1);
          card.style.clipPath = `inset(0 0 0 ${c}px round 0 ${rad}px ${rad}px 0)`;
          const mask = `linear-gradient(90deg, transparent ${c}px, #000 ${(cut + 26).toFixed(1)}px)`;
          card.style.webkitMaskImage = mask;
          card.style.maskImage = mask;
        } else {
          card.style.clipPath = '';
          card.style.webkitMaskImage = '';
          card.style.maskImage = '';
        }

        // El código aparece justo donde la tarjeta ya fue "leída"
        code.style.transform = tf;
        code.style.clipPath = `inset(0 ${(cw - cut).toFixed(1)}px 0 0)`;
        code.style.visibility = cut > 0 ? 'visible' : 'hidden';

        if (cut > 0 && x + cw > Lx) crossers.push({ i, x, cut });
        if (cut > 0 && cut < cw) {
          crossing = i;
          crossCut = cut;
        }
      }

      // Contador sobre la línea: sigue a la tarjeta que está cruzando
      if (crossing !== current) {
        current = crossing;
        if (crossing >= 0) {
          nameEl.current.textContent = ITEMS[crossing].name;
          lineEl.current.style.setProperty('--accent', ITEMS[crossing].accent);
          shown = (crossCut / cw) * 100;
        }
      }
      if (crossing >= 0) {
        shown += ((crossCut / cw) * 100 - shown) * Math.min(1, dt * 14);
        pctEl.current.textContent = `${Math.round(shown)}%`;
      }

      drawFx(crossers);
    };

    // Arrastre
    const onDown = (e) => {
      if (e.button) return;
      dragging = true;
      lastX = e.clientX;
      lastT = performance.now();
      el.setPointerCapture?.(e.pointerId);
      el.classList.add('is-dragging');
    };
    const onMove = (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dts = Math.max(0.008, (now - lastT) / 1000);
      off += dx;
      vel = clamp(vel * 0.6 + (dx / dts) * 0.4, -3000, 3000);
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = () => {
      dragging = false;
      el.classList.remove('is-dragging');
    };
    // Rueda horizontal (trackpad)
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      vel = clamp(vel - e.deltaX * 6, -3000, 3000);
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  if (!ITEMS.length) return null;

  return (
    <div ref={wrap} className="belt" aria-label="Cinta de proyectos: arrastra para explorar">
      {/* Tamaño de referencia: define el alto de la cinta */}
      <div className="belt-size" aria-hidden="true" />

      {/* Capa de código (se desvanece hacia el borde izquierdo) */}
      <div className="belt-codes" aria-hidden="true">
        {ITEMS.map((p, i) => (
          <pre key={i} ref={(n) => (codeEls.current[i] = n)} className="belt-item belt-code">
            {CODES[i].map((l, k) => (
              <span key={k} style={l.c ? { color: `rgba(${p.accent},0.85)` } : undefined}>
                {l.t}
                {'\n'}
              </span>
            ))}
          </pre>
        ))}
      </div>

      {/* Tarjetas */}
      {ITEMS.map((p, i) => (
        <div key={i} ref={(n) => (cardEls.current[i] = n)} className="belt-item belt-card">
          <img src={p.image} alt={`Captura de ${p.name}`} draggable="false" loading="lazy" />
          <div className="belt-caption">
            <span className="font-mono text-[10px] sm:text-xs" style={{ color: `rgb(${p.accent})` }}>
              {p.tag}
            </span>
            <span className="font-accent block text-2xl sm:text-4xl lg:text-5xl leading-none mt-1">{p.name}</span>
            <span className="hidden md:block mt-2 max-w-md text-sm text-zinc-300">{p.desc}</span>
          </div>
        </div>
      ))}

      <canvas ref={canvas} className="belt-fx" aria-hidden="true" />

      {/* Escáner + contador */}
      <div ref={lineEl} className="belt-line" aria-hidden="true">
        <span className="belt-pill">
          <span className="belt-pill-dot" />
          <span ref={nameEl}>{ITEMS[0].name}</span>
          <span className="opacity-50">→ código</span>
          <span ref={pctEl} className="tabular-nums">
            0%
          </span>
        </span>
      </div>
    </div>
  );
}
