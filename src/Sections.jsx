import { useContext, useEffect, useRef, useState } from 'react';
import { PROJECTS } from './projects';
import { CATALOGO, COMPANY, CONTACT, EnteredCtx } from './content';
import ProjectBelt from './ProjectBelt';

const WITH_IMAGE = PROJECTS.filter((p) => p.image);
const SHOWCASE = WITH_IMAGE.filter((p) => p.showcase !== false);

/* ---------- Piezas reutilizables ---------- */

// Aparece subiendo suavemente al entrar en pantalla (solo cuando ya estamos dentro de la tablet).
// `delay` (ms) permite escalonar los elementos de una misma sección.
function Reveal({ children, className = '', delay = 0 }) {
  const entered = useContext(EnteredCtx);
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!entered || shown) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [entered, shown]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      className={`transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Palabra de acento en serif cursiva
const Accent = ({ children }) => <span className="font-accent text-sky-200">{children}</span>;

const Mono = ({ children, className = '' }) => (
  <span className={`font-mono text-[11px] sm:text-xs tracking-wide text-zinc-400 ${className}`}>{children}</span>
);

const BIG = 'text-[32px] sm:text-[40px] lg:text-[46px] leading-[1.08] tracking-[-0.03em] font-semibold';

function Btn({ children, variant = 'primary', className = '', ...rest }) {
  const styles = {
    primary: 'btn-primary bg-white text-[#051a24]',
    secondary: 'bg-white/[0.06] text-white border border-white/15 hover:bg-white/[0.12]',
    dark: 'btn-dark bg-[#051a24] text-white',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition-[transform,background-color] duration-200 active:scale-[0.97] ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function WhatsAppIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" />
      <path d="M9 8.4c0 3.1 2.5 5.6 5.6 5.6l1-1.5-2-1-.8.8a4.3 4.3 0 0 1-2-2l.8-.8-1-2L9 8.4z" />
    </svg>
  );
}

const QuoteIcon = () => (
  <span className="block font-accent text-7xl leading-[0.6] text-sky-200 pt-4" aria-hidden="true">
    “
  </span>
);

/* ---------- Fondo del Perfil: una web que se "maqueta" sola ---------- */
function BuildBackdrop() {
  const d = (sec) => ({ '--d': `${sec}s` });
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 wf-grid" />
      <svg className="wf absolute inset-0 h-full w-full" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" fill="none">
        {/* Ventana del navegador */}
        <rect pathLength="1" style={d(0)} x="90" y="70" width="1260" height="680" rx="22" />
        <path pathLength="1" style={d(0.5)} d="M90 124H1350" />
        {[122, 146, 170].map((cx, i) => (
          <circle key={cx} pathLength="1" className="wf-fill" style={d(0.6 + i * 0.1)} cx={cx} cy="97" r="6" />
        ))}
        {/* Menú */}
        <rect pathLength="1" className="wf-fill" style={d(0.9)} x="130" y="150" width="110" height="18" rx="9" />
        {[980, 1070, 1160].map((x, i) => (
          <rect key={x} pathLength="1" style={d(1.1 + i * 0.12)} x={x} y="153" width="64" height="12" rx="6" />
        ))}
        <rect pathLength="1" style={d(1.5)} x="1250" y="145" width="70" height="28" rx="14" />
        {/* Titular, texto y botón */}
        <rect pathLength="1" className="wf-fill" style={d(1.8)} x="130" y="230" width="420" height="40" rx="8" />
        <rect pathLength="1" className="wf-fill" style={d(2.1)} x="130" y="284" width="300" height="40" rx="8" />
        <rect pathLength="1" style={d(2.5)} x="130" y="352" width="360" height="10" rx="5" />
        <rect pathLength="1" style={d(2.7)} x="130" y="374" width="300" height="10" rx="5" />
        <rect pathLength="1" className="wf-fill" style={d(3)} x="130" y="412" width="160" height="48" rx="24" />
        {/* Imagen */}
        <rect pathLength="1" style={d(3.3)} x="900" y="220" width="420" height="280" rx="18" />
        <path pathLength="1" style={d(3.9)} d="M900 450L1010 350L1090 420L1160 370L1320 480" />
        <circle pathLength="1" className="wf-fill" style={d(4.2)} cx="1250" cy="282" r="22" />
        {/* Tarjetas */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect pathLength="1" style={d(4.6 + i * 0.3)} x={130 + i * 410} y="560" width="370" height="150" rx="18" />
            <rect pathLength="1" className="wf-fill" style={d(4.9 + i * 0.3)} x={156 + i * 410} y="586" width="44" height="44" rx="12" />
            <rect pathLength="1" style={d(5.1 + i * 0.3)} x={156 + i * 410} y="652" width="210" height="10" rx="5" />
            <rect pathLength="1" style={d(5.2 + i * 0.3)} x={156 + i * 410} y="674" width="150" height="10" rx="5" />
          </g>
        ))}
      </svg>
      {/* Cursor que recorre la maqueta */}
      <svg className="wf-cursor" viewBox="0 0 24 24">
        <path d="M5 3l14 8-6 2-2 6z" />
      </svg>
      <div className="absolute inset-0 wf-vignette" />
    </div>
  );
}

/* ---------- Zona con estela de capturas que sigue al cursor ---------- */
function TrailArea({ children, className = '' }) {
  const layer = useRef(null);
  const state = useRef({ t: 0, i: 0 });

  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || !WITH_IMAGE.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const now = performance.now();
    if (now - state.current.t < 90) return;
    state.current.t = now;

    const box = layer.current.getBoundingClientRect();
    const img = document.createElement('img');
    img.src = WITH_IMAGE[state.current.i++ % WITH_IMAGE.length].image;
    img.alt = '';
    img.className = 'trail-img';
    img.style.left = `${e.clientX - box.left}px`;
    img.style.top = `${e.clientY - box.top}px`;
    img.style.setProperty('--r', `${(Math.random() * 20 - 10).toFixed(1)}deg`);
    img.addEventListener('animationend', () => img.remove());
    layer.current.appendChild(img);
  };

  return (
    <div onPointerMove={onMove} className={`relative overflow-hidden ${className}`}>
      <div ref={layer} className="absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ====================================================================== */

export default function Sections({ goTo }) {
  const year = new Date().getFullYear();
  const SECTION = 'min-h-dvh pt-28 sm:pt-32 pb-36';

  return (
    <div className="relative z-10">
      {/* ---------------------------- PERFIL ---------------------------- */}
      <section id="sobre-mi" className="pb-36">
        {/* Presentación a pantalla completa, con una web "maquetándose" de fondo */}
        <div className="relative min-h-dvh flex items-center justify-center overflow-hidden px-6 pt-24 pb-36">
          <BuildBackdrop />
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <Reveal delay={100}>
              <Mono>{COMPANY.tagline}</Mono>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 text-base sm:text-lg text-zinc-300">{COMPANY.lead}</p>
            </Reveal>
            <Reveal delay={300}>
              <h2 className="mt-3 text-[40px] sm:text-6xl lg:text-[84px] leading-[1] tracking-[-0.04em] font-semibold text-balance">
                Convertir ideas en <Accent>experiencias web vivas.</Accent>
              </h2>
            </Reveal>
            <Reveal delay={400}>
              <p className="mx-auto mt-7 max-w-xl text-sm sm:text-base leading-relaxed text-zinc-400">{COMPANY.about}</p>
            </Reveal>
            <Reveal delay={500} className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
              <Btn onClick={() => goTo('contacto')}>Hablemos</Btn>
              <Btn variant="secondary" onClick={() => goTo('proyectos')}>
                Ver proyectos
              </Btn>
            </Reveal>
          </div>
        </div>

        {/* Cita + valores */}
        <div className="mx-auto max-w-2xl px-6 mt-10 sm:mt-16">
          <Reveal delay={100}>
            <QuoteIcon />
          </Reveal>
          <Reveal delay={200}>
            <p className={`${BIG} mt-5`}>
              Trabajamos <Accent>contigo,</Accent> no para ti.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-4 text-sm italic text-zinc-400">— El equipo de {COMPANY.name}</p>
          </Reveal>
          <Reveal delay={400} className="mt-10 grid sm:grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {COMPANY.values.map((v) => (
              <div key={v.title}>
                <p className="text-xl font-medium">{v.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{v.sub}</p>
              </div>
            ))}
          </Reveal>
        </div>

        {/* Proceso + cifras */}
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10 mt-20 sm:mt-28">
          <Reveal className="flex items-end justify-between gap-6 mb-8">
            <h3 className={BIG}>
              Cómo <Accent>trabajamos</Accent>
            </h3>
            <Mono className="hidden sm:block pb-2">04 pasos</Mono>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPANY.process.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="h-full rounded-[28px] border border-white/10 bg-white/[0.04] p-7 transition-colors duration-300 hover:bg-white/[0.07]">
                  <span className="font-accent text-5xl text-sky-200">0{i + 1}</span>
                  <p className="mt-8 text-lg font-medium">{s.title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{s.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100} className="mt-14 grid grid-cols-3 divide-x divide-white/10 border-y border-white/10">
            {COMPANY.stats.map((s) => (
              <div key={s.l} className="py-8 px-2 text-center">
                <p className="font-accent text-5xl sm:text-6xl">{s.v}</p>
                <p className="mt-2 font-mono text-[10px] sm:text-xs text-zinc-400">{s.l}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- CATÁLOGO ---------------------------- */}
      <section id="catalogo" className={`${SECTION} flex items-center`}>
        <div className="mx-auto w-full max-w-[1100px] px-6 sm:px-10">
          <Reveal delay={100}>
            <Mono>Catálogo de servicios</Mono>
          </Reveal>
          <Reveal delay={200}>
            <h2 className={`${BIG} mt-3 mb-10 sm:mb-12`}>
              Lo que podemos hacer <Accent>por ti</Accent>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {CATALOGO.map((c, i) => {
              const light = i === 0; // la primera tarjeta va en claro, como "destacada"
              return (
                <Reveal key={c.title} delay={100 + i * 120}>
                  <div
                    className={`h-full flex flex-col rounded-[36px] p-8 sm:p-9 transition-transform duration-300 hover:-translate-y-1 ${
                      light
                        ? 'bg-[#f4f6f8] text-[#051a24] shadow-[0_30px_80px_-30px_rgba(125,170,255,0.5)]'
                        : 'bg-white/[0.04] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-12 h-12 rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, rgba(${c.c},${light ? 0.95 : 0.55}), rgba(${c.c},${light ? 0.35 : 0.1}))`,
                          boxShadow: `inset 0 0 0 1px rgba(${c.c},0.5)`,
                        }}
                      />
                      <span className={`font-mono text-xs ${light ? 'text-[#273c46]' : 'text-zinc-500'}`}>
                        0{i + 1} / 0{CATALOGO.length}
                      </span>
                    </div>

                    <h3 className="mt-12 sm:mt-16 text-[22px] font-medium tracking-tight">{c.title}</h3>
                    <p className={`mt-2 text-sm sm:text-base leading-relaxed ${light ? 'text-[#273c46]' : 'text-zinc-400'}`}>
                      {c.desc}
                    </p>

                    <div className="mt-auto pt-10">
                      <Btn variant={light ? 'dark' : 'secondary'} onClick={() => goTo('contacto')}>
                        Cotizar <span aria-hidden="true">→</span>
                      </Btn>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------- PROYECTOS ---------------------------- */}
      <section id="proyectos" className={`${SECTION} flex flex-col justify-center`}>
        <div className="mx-auto w-full max-w-[1100px] px-6 sm:px-10">
          <Reveal delay={100}>
            <Mono>Recap {year}</Mono>
          </Reveal>
          <Reveal delay={200} className="flex items-end justify-between gap-6 mt-3 mb-4 sm:mb-8">
            <h2 className={BIG}>
              Proyectos <Accent>seleccionados</Accent>
            </h2>
            <Mono className="hidden sm:block pb-2 text-right">
              Del diseño al código
              <br />← arrastra para explorar →
            </Mono>
          </Reveal>
        </div>

        <Reveal delay={300}>
          <ProjectBelt />
        </Reveal>

        <div className="mx-auto w-full max-w-[1100px] px-6 sm:px-10">
          <Reveal delay={400} className="mt-6 sm:mt-8 flex flex-wrap items-center gap-2.5">
            {SHOWCASE.map((p) =>
              p.url ? (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm transition-colors hover:bg-white/[0.12]"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: `rgb(${p.accent})` }} />
                  {p.name} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <span
                  key={p.name}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: `rgb(${p.accent})` }} />
                  {p.name}
                </span>
              )
            )}
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- CONTACTO ---------------------------- */}
      <section id="contacto" className={`${SECTION} flex flex-col justify-center`}>
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-10">
          <Reveal>
            <TrailArea className="rounded-[40px] border border-white/10 bg-white/[0.03] px-6 py-24 sm:py-36 text-center">
              <Mono>Contacto</Mono>
              <h2 className="font-accent text-[52px] sm:text-[72px] lg:text-[92px] leading-[0.95] mt-4">
                Hablemos de tu <span className="text-sky-200">proyecto</span>
              </h2>
              <p className="mx-auto mt-6 max-w-sm text-sm sm:text-base leading-relaxed text-zinc-400">
                Cuéntanos tu idea. Respondemos por WhatsApp, Instagram o correo.
              </p>

              {/* Botón principal: WhatsApp */}
              <a
                href={CONTACT.whatsapp.href}
                target="_blank"
                rel="noreferrer"
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#25d366] px-7 py-4 text-sm font-medium text-[#05220f] transition-[transform,box-shadow] duration-200 hover:shadow-[0_0_44px_rgba(37,211,102,0.45)] active:scale-[0.97]"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Escríbenos por WhatsApp
                <span className="hidden sm:inline text-xs opacity-70">{CONTACT.whatsapp.label}</span>
              </a>
            </TrailArea>
          </Reveal>

          {/* Pie: otras vías de contacto */}
          <Reveal delay={150} className="mt-10 flex flex-col md:flex-row md:items-start justify-between gap-8 px-2">
            <Btn onClick={() => goTo('sobre-mi')} variant="secondary">
              <span aria-hidden="true">↑</span> Volver al perfil
            </Btn>
            <div className="flex flex-wrap gap-x-14 gap-y-6">
              {[
                { name: 'WhatsApp', text: CONTACT.whatsapp.label, href: CONTACT.whatsapp.href },
                { name: 'Correo', text: CONTACT.email.label, href: CONTACT.email.href },
                { name: 'Instagram', text: `@${CONTACT.instagram.handle}`, href: CONTACT.instagram.href },
              ].map((c) => (
                <a
                  key={c.name}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group block transition-opacity hover:opacity-70"
                >
                  <Mono className="block">{c.name}</Mono>
                  <span className="text-base break-all">
                    {c.text} <span aria-hidden="true">↗</span>
                  </span>
                </a>
              ))}
            </div>
          </Reveal>

          <div className="mt-12 flex justify-between border-t border-white/10 px-2 pt-4 text-sm text-zinc-500">
            <span>{COMPANY.name}</span>
            <span>Gracias · {year}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
