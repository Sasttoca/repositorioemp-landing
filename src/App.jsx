import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Hero3D from './Hero3D';
import LoaderScreen from './LoaderScreen';
import useVirtualScroll from './useVirtualScroll';
import { PROJECTS } from './projects';

const EnteredCtx = createContext(false);

/* ===================== EDITA TUS DATOS AQUÍ ===================== */
const COMPANY = {
  name: 'CODE.WEB',
  tagline: 'Creative Web Studio & Automation',
  logo: null, // ej: '/logo.png' (en la carpeta public). Si es null se muestra el monograma "CW"
  monogram: 'CW',
  // EDITA: textos inventados, cámbialos por la historia real
  about: [
    'Somos un estudio creativo formado por un grupo de profesionales   con la misma obsesión: convertir ideas en experiencias web que se sienten vivas.',
    'Combinamos diseño, animación 3D y automatización para que negocios y emprendimientos tengan una presencia digital que destaque y trabaje por ellos, incluso cuando no están mirando.',
  ],
  skills: [
    { n: 'React', s: 'Re', c: '97,218,251' },
    { n: 'Node', s: 'No', c: '110,231,183' },
    { n: 'Tailwind', s: 'Tw', c: '56,189,248' },
    { n: 'Vite', s: 'Vi', c: '167,139,250' },
    { n: 'Firebase', s: 'Fb', c: '251,191,36' },
    { n: 'Git', s: 'Git', c: '248,113,113' },
    { n: 'WordPress', s: 'WP', c: '147,197,253' },
  ],
  process: [
    { title: 'Escuchamos', sub: 'Entendemos tu negocio y tu meta' },
    { title: 'Diseñamos', sub: 'Prototipo y dirección visual' },
    { title: 'Construimos', sub: 'Código limpio y a medida' },
    { title: 'Acompañamos', sub: 'Lanzamiento y mejoras' },
  ],
  values: [
    { title: 'Creatividad', sub: 'Ideas que no se parecen a nadie' },
    { title: 'Precisión', sub: 'Detalle en cada píxel y cada línea' },
    { title: 'Cercanía', sub: 'Trabajamos contigo, no para ti' },
  ],
  stats: [
    { v: '+4', l: 'Proyectos publicados' },
    { v: '100%', l: 'Desarrollo a medida' },
    { v: '3', l: 'Áreas de servicio' },
  ],
};

// EDITA: pon los datos reales de la empresa
const CONTACT = {
  instagram: { handle: 'tu_empresa', href: 'https://instagram.com/tu_empresa' },
  whatsapp: { label: '+57 300 000 0000', href: 'https://wa.me/573000000000' },
  email: { label: 'hola@tuempresa.com', href: 'mailto:hola@tuempresa.com' },
};

const TABS = [
  { id: 'sobre-mi', label: 'Perfil' },
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'contacto', label: 'Contacto' },
];

const CATALOGO = [
  { title: 'Landing pages', desc: 'Sitios rápidos y animados que convierten visitas en clientes.', c: '125,170,255' },
  { title: 'Apps web a medida', desc: 'Paneles, agendamiento y sistemas con React y Firebase.', c: '180,140,255' },
  { title: 'Automatización', desc: 'Procesos que se ejecutan solos para que ahorres tiempo.', c: '110,231,183' },
];
/* ================================================================ */

// Aparece suavemente, pero solo cuando ya entramos a las secciones
function Reveal({ children, className = '' }) {
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
      { threshold: 0.15 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [entered, shown]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

const Label = ({ children }) => (
  <span className="text-zinc-500 font-medium tracking-[0.3em] uppercase text-xs border-l-2 border-white pl-3">
    {children}
  </span>
);

const SubTitle = ({ children }) => (
  <h3 className="text-sm font-extrabold tracking-[0.22em] uppercase text-white mb-4">{children}</h3>
);

function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 dots-dark" />
      <div className="split-panel">
        <div className="grid-light" />
      </div>
    </div>
  );
}

function InstagramIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Distribución del mosaico: el 1.º es grande, el 2.º ancho, el resto normales
const TILE_LAYOUT = ['sm:col-span-2 sm:row-span-2', 'sm:col-span-2', '', ''];

function ProjectTile({ p }) {
  return (
    <article className="group relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0e]">
      {/* Captura real (p.image) o arte generado con el color del proyecto */}
      {p.image ? (
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
          style={{
            background: `radial-gradient(120% 90% at 20% 10%, rgba(${p.accent},0.55), transparent 60%), radial-gradient(80% 70% at 90% 100%, rgba(${p.accent},0.25), transparent 70%), #0a0a0e`,
          }}
        >
          <span className="absolute -right-4 -bottom-10 select-none text-[9rem] font-black leading-none opacity-10">
            {p.name.slice(0, 1)}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <span className="text-[11px] font-semibold tracking-wider" style={{ color: `rgb(${p.accent})` }}>
          {p.tag}
        </span>
        <h3 className="text-xl sm:text-2xl font-extrabold leading-tight">{p.name}</h3>
        {/* En pantallas con mouse aparece al pasar encima; en celular se ve siempre */}
        <p className="overflow-hidden text-sm font-light leading-snug text-zinc-300 mt-1 sm:max-h-0 sm:opacity-0 sm:transition-all sm:duration-500 sm:group-hover:max-h-24 sm:group-hover:opacity-100">
          {p.desc}
        </p>
        {p.url && (
          <a
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm font-semibold hover:underline"
            style={{ color: `rgb(${p.accent})` }}
          >
            Ver sitio ↗
          </a>
        )}
      </div>
    </article>
  );
}

function Clock() {
  const fmt = () =>
    new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 20000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

// Marco de tablet: bisel, barra de estado, menú de pestañas y barra de inicio
function TabletChrome({ active, entered, goTo }) {
  return (
    <div className={`tablet-chrome ${entered ? 'is-entered' : ''}`}>
      <div className="tablet-fade" />
      <div className="tablet-mask" />
      <div className="tablet-sheen" />
      <div className="tablet-camera" />

      {/* Barra de estado */}
      <div className="tablet-status">
        <Clock />
        <span className="flex items-center gap-2">
          <span className="tracking-widest">5G</span>
          <span className="inline-block w-6 h-[11px] rounded-[3px] border border-white/60 p-[1.5px]">
            <span className="block h-full w-[78%] rounded-[1.5px] bg-white/80" />
          </span>
        </span>
      </div>

      {/* Menú de pestañas */}
      <div className="tablet-nav">
        <button
          onClick={() => goTo('inicio')}
          className="hidden md:block justify-self-start text-base font-black tracking-widest"
        >
          CODE<span className="text-zinc-500">.WEB</span>
        </button>

        <nav className="col-start-2 flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1 backdrop-blur-md max-md:col-span-3 max-md:justify-self-center">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => goTo(t.id)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs tracking-widest uppercase transition-colors ${
                active === t.id
                  ? 'bg-sky-200 text-slate-900 font-semibold'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="tablet-home" />
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState('sobre-mi');
  const rootRef = useRef(null);
  const scrollerRef = useRef(null);

  const { progress, entered, goTo } = useVirtualScroll({
    rootRef,
    scrollerRef,
    enabled: !isLoading,
  });

  // Mientras no hemos entrado, las secciones no son enfocables ni clickeables
  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.inert = !entered;
  }, [entered]);

  // Pestaña activa según la sección visible + reflejo del cristal según el scroll
  useEffect(() => {
    const sc = scrollerRef.current;
    const root = rootRef.current;
    if (!sc || !root) return;

    const onScroll = () => {
      const max = sc.scrollHeight - sc.clientHeight;
      root.style.setProperty('--sy', max > 0 ? (sc.scrollTop / max).toFixed(3) : '0');
    };
    sc.addEventListener('scroll', onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { root: sc, rootMargin: '-45% 0px -50% 0px' }
    );
    TABS.forEach((t) => {
      const el = sc.querySelector(`#${t.id}`);
      if (el) io.observe(el);
    });

    return () => {
      sc.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  const year = new Date().getFullYear();

  return (
    <EnteredCtx.Provider value={entered}>
      <div
        ref={rootRef}
        className="fixed inset-0 bg-black text-white overflow-hidden selection:bg-white selection:text-black"
      >
        {isLoading && <LoaderScreen onLoadingComplete={() => setIsLoading(false)} />}

        {/* Menú del hero: se desvanece al entrar a la tablet (ahí lo reemplaza el menú de pestañas) */}
        <header
          className="fixed top-0 left-0 right-0 z-50 text-white mix-blend-difference"
          style={{
            opacity: 'clamp(0, calc(1 - (var(--p, 0) - 0.82) * 12), 1)',
            pointerEvents: entered ? 'none' : 'auto',
          }}
        >
          <div className="mx-auto max-w-[1500px] p-6 lg:p-10 flex justify-between items-center">
            <button onClick={() => goTo('inicio')} className="text-xl font-black tracking-widest">
              CODE<span className="opacity-50">.WEB</span>
            </button>
            <nav className="hidden md:flex gap-8 text-sm tracking-widest uppercase">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => goTo(t.id)}
                  className="opacity-70 hover:opacity-100 transition-opacity uppercase tracking-widest"
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* ===== HERO: estático, el scroll solo controla el zoom ===== */}
        <div
          className={`absolute inset-0 touch-none transition-opacity duration-1000 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <HeroBackground />

          <div className="absolute inset-0">
            <Hero3D progress={progress} active={!entered} />
          </div>

          <div
            className="absolute inset-0 z-10 flex items-start lg:items-center pt-28 lg:pt-0 px-6 sm:px-12 lg:px-20 pointer-events-none"
            style={{
              opacity: 'clamp(0, calc(1 - var(--p, 0) * 3.5), 1)',
              transform: 'translateY(calc(var(--p, 0) * -60px))',
            }}
          >
            <div className="mx-auto w-full max-w-[1400px]">
              <div className="max-w-xl lg:max-w-[42%] flex flex-col items-start">
                <span className="text-zinc-500 font-medium tracking-[0.3em] uppercase text-xs mb-4 border-l-2 border-white pl-3">
                  Creative Web Studio & Automation
                </span>
                <h1 className="text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                  Construimos el futuro digital de tu negocio.
                </h1>
                <p className="text-zinc-400 text-base sm:text-lg lg:text-xl font-light leading-relaxed mb-8">
                  Desarrollamos experiencias web inmersivas y sistemas automatizados de alto rendimiento con precisión milimétrica.
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    onClick={() => goTo('contacto')}
                    className="pointer-events-auto px-8 py-4 bg-white text-black font-semibold text-sm tracking-wider uppercase rounded-full hover:bg-zinc-200 transition-all shadow-lg"
                  >
                    Iniciar Proyecto
                  </button>
                  <span className="text-zinc-500 text-xs tracking-widest uppercase ml-2">
                    ↓ Scroll para explorar
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECCIONES: viven "dentro" de la pantalla de la tablet ===== */}
        <div
          ref={scrollerRef}
          className="fixed inset-0 z-20 overflow-y-auto bg-black no-scrollbar snap-y snap-proximity"
          style={{
            opacity: 'clamp(0, calc((var(--p, 0) - 0.9) * 10), 1)',
            transform: 'scale(calc(1.06 - clamp(0, calc((var(--p, 0) - 0.9) * 10), 1) * 0.06))',
          }}
        >
          {/* Resplandor fijo al fondo (sticky de alto 0 = no se mueve con el scroll) */}
          <div className="sticky top-0 h-0 z-0 pointer-events-none">
            <div className="absolute left-0 top-0 w-full h-dvh tablet-glow" />
          </div>

          <div className="relative z-10">
            {/* ---------- NOSOTROS ---------- */}
            <section
              id="sobre-mi"
              className="snap-start min-h-dvh flex items-center px-8 sm:px-14 lg:px-24 pt-36 pb-28"
            >
              <div className="max-w-[1100px] mx-auto w-full grid lg:grid-cols-[minmax(0,300px)_1fr] gap-12 lg:gap-20 items-center">
                <Reveal className="flex flex-col items-center text-center">
                  <div className="relative w-52 h-52 sm:w-60 sm:h-60">
                    <div className="absolute inset-[-25%] rounded-full bg-sky-500/25 blur-3xl" />
                    {COMPANY.logo ? (
                      <img src={COMPANY.logo} alt={COMPANY.name} className="relative w-full h-full object-contain" />
                    ) : (
                      <div className="relative w-full h-full rounded-[2.5rem] grid place-items-center text-6xl font-black tracking-widest bg-gradient-to-br from-sky-400/30 to-slate-900 border border-white/15">
                        {COMPANY.monogram}
                      </div>
                    )}
                  </div>
                  <p className="mt-8 text-zinc-400 tracking-[0.3em] text-xs uppercase">Somos</p>
                  <h2 className="text-2xl font-extrabold tracking-wide uppercase mt-1">{COMPANY.name}</h2>
                  <p className="text-sky-200/80 text-sm mt-1">{COMPANY.tagline}</p>
                </Reveal>

                <div className="space-y-10">
                  <Reveal>
                    <SubTitle>Sobre nosotros</SubTitle>
                    {COMPANY.about.map((t, i) => (
                      <p key={i} className="text-zinc-400 text-base lg:text-lg font-light leading-relaxed max-w-xl mb-3">
                        {t}
                      </p>
                    ))}
                  </Reveal>

                  <Reveal>
                    <SubTitle>Tecnologías</SubTitle>
                    <div className="flex flex-wrap gap-4">
                      {COMPANY.skills.map((s) => (
                        <div key={s.n} className="flex flex-col items-center gap-2 w-16">
                          <div
                            className="w-14 h-14 rounded-2xl grid place-items-center text-sm font-extrabold"
                            style={{
                              background: `rgba(${s.c},0.16)`,
                              color: `rgb(${s.c})`,
                              boxShadow: `inset 0 0 0 1px rgba(${s.c},0.4)`,
                            }}
                          >
                            {s.s}
                          </div>
                          <span className="text-[11px] text-zinc-400">{s.n}</span>
                        </div>
                      ))}
                    </div>
                  </Reveal>

                  <Reveal className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <SubTitle>Cómo trabajamos</SubTitle>
                      <ol className="space-y-3 text-sm">
                        {COMPANY.process.map((s, i) => (
                          <li key={s.title} className="flex gap-3">
                            <span className="text-sky-200 font-bold">0{i + 1}</span>
                            <span>
                              <span className="font-semibold">{s.title}</span>
                              <span className="block text-zinc-500">{s.sub}</span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <SubTitle>Lo que nos mueve</SubTitle>
                      <div className="space-y-3 text-sm">
                        {COMPANY.values.map((v) => (
                          <div key={v.title}>
                            <p className="font-semibold">{v.title}</p>
                            <p className="text-zinc-500">{v.sub}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>

                  <Reveal className="grid grid-cols-3 gap-4 max-w-md">
                    {COMPANY.stats.map((s) => (
                      <div key={s.l} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center">
                        <p className="text-2xl font-black text-sky-200">{s.v}</p>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-tight">{s.l}</p>
                      </div>
                    ))}
                  </Reveal>
                </div>
              </div>
            </section>

            {/* ---------- CATÁLOGO ---------- */}
            <section
              id="catalogo"
              className="snap-start min-h-dvh flex items-center px-8 sm:px-14 lg:px-24 pt-36 pb-28"
            >
              <div className="max-w-[1100px] mx-auto w-full">
                <Reveal>
                  <Label>Catálogo</Label>
                  <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mt-6 mb-12">
                    Lo que puedo hacer por ti
                  </h2>
                </Reveal>
                <div className="grid md:grid-cols-3 gap-6">
                  {CATALOGO.map((c, i) => (
                    <Reveal key={c.title} className={i === 1 ? 'delay-150' : i === 2 ? 'delay-300' : ''}>
                      <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm hover:bg-white/[0.07] transition-colors">
                        {/* Ícono estilo "app" de tablet */}
                        <div
                          className="w-14 h-14 rounded-2xl mb-6"
                          style={{
                            background: `linear-gradient(135deg, rgba(${c.c},0.5), rgba(${c.c},0.1))`,
                            boxShadow: `inset 0 0 0 1px rgba(${c.c},0.5)`,
                          }}
                        />
                        <h3 className="text-xl font-bold mb-3">{c.title}</h3>
                        <p className="text-zinc-400 font-light leading-relaxed">{c.desc}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            {/* ---------- PROYECTOS ---------- */}
            <section
              id="proyectos"
              className="snap-start min-h-dvh flex items-center px-8 sm:px-14 lg:px-24 pt-36 pb-28"
            >
              <div className="max-w-[1100px] mx-auto w-full">
                <Reveal className="text-center mb-10">
                  <h2 className="text-3xl lg:text-5xl font-black tracking-wide uppercase text-zinc-300">
                    Recap de proyectos {year}
                  </h2>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-4 auto-rows-[220px] sm:auto-rows-[190px] gap-4 sm:[grid-auto-flow:dense]">
                  {PROJECTS.map((p, i) => (
                    <Reveal key={p.name} className={TILE_LAYOUT[i] ?? ''}>
                      <ProjectTile p={p} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            {/* ---------- CONTACTO ---------- */}
            <section
              id="contacto"
              className="snap-start min-h-dvh flex items-center px-8 sm:px-14 lg:px-24 pt-36 pb-28"
            >
              <div className="max-w-[1100px] mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
                <Reveal>
                  <SubTitle>Hablemos</SubTitle>
                  <p className="text-zinc-400 font-light leading-relaxed max-w-sm mb-8">
                    Cuéntanos tu idea. Respondemos por Instagram, WhatsApp o correo.
                  </p>

                  {/* Botón principal: Instagram */}
                  <a
                    href={CONTACT.instagram.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex rounded-full p-[1.5px] bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 transition-shadow hover:shadow-[0_0_40px_rgba(244,63,94,0.35)]"
                  >
                    <span className="flex items-center gap-3 rounded-full bg-black px-6 py-4 transition-colors group-hover:bg-transparent">
                      <InstagramIcon className="w-5 h-5" />
                      <span className="text-sm font-semibold tracking-wider uppercase">Síguenos en Instagram</span>
                      <span className="hidden sm:inline text-xs text-zinc-400 group-hover:text-white">
                        @{CONTACT.instagram.handle}
                      </span>
                    </span>
                  </a>

                  {/* Opciones secundarias */}
                  <div className="mt-8 space-y-4">
                    {[
                      { name: 'WhatsApp', short: 'WA', text: CONTACT.whatsapp.label, href: CONTACT.whatsapp.href },
                      { name: 'Correo', short: '@', text: CONTACT.email.label, href: CONTACT.email.href },
                    ].map((c) => (
                      <a key={c.name} href={c.href} target="_blank" rel="noreferrer" className="flex items-center gap-4 group w-fit">
                        <span className="w-11 h-11 rounded-full grid place-items-center border border-white/20 bg-white/[0.05] text-xs font-bold group-hover:bg-sky-200 group-hover:text-slate-900 transition-colors">
                          {c.short}
                        </span>
                        <span className="text-sm">
                          <span className="block text-zinc-500 text-xs uppercase tracking-widest">{c.name}</span>
                          <span className="font-semibold break-all">{c.text}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                </Reveal>

                <Reveal className="text-center lg:text-right">
                  <p className="text-5xl sm:text-7xl font-black leading-[0.95] text-zinc-700 uppercase">
                    Gracias
                    <br />
                    {year}
                  </p>
                  <p className="mt-6 text-zinc-500 text-sm tracking-widest uppercase">{COMPANY.name}</p>
                </Reveal>
              </div>
            </section>
          </div>
        </div>

        {/* ===== Marco de tablet (encima de todo) ===== */}
        <TabletChrome active={active} entered={entered} goTo={goTo} />
      </div>
    </EnteredCtx.Provider>
  );
}