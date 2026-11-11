import { useEffect, useRef, useState } from 'react';
import Hero3D from './Hero3D';
import LoaderScreen from './LoaderScreen';
import Sections from './Sections';
import useVirtualScroll from './useVirtualScroll';
import { COMPANY, EnteredCtx, TABS } from './content';

function HeroBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 dots-dark" />
      <div data-p className="split-panel">
        <div className="grid-light" />
      </div>
      <div className="grain" />
    </div>
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

// Marco de tablet: bisel, barra de estado y dock de navegación
function TabletChrome({ active, entered, goTo }) {
  const current = TABS.find((t) => t.id === active)?.label ?? '';
  return (
    <div data-p className={`tablet-chrome ${entered ? 'is-entered' : ''}`}>
      <div className="tablet-fade" />
      <div className="tablet-fade-bottom" />
      <div className="tablet-mask" />
      <div className="tablet-sheen" />
      <div className="tablet-camera" />

      {/* Barra de estado: hora · "dirección" de la sección actual · batería */}
      <div className="tablet-status">
        <Clock />
        <span className="tablet-address">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>
            code.web/
            <span key={current} className="tablet-address-page">
              {current.toLowerCase()}
            </span>
          </span>
        </span>
        <span className="flex items-center justify-end gap-2">
          <span className="tracking-widest">5G</span>
          <span className="inline-block w-6 h-[11px] rounded-[3px] border border-white/60 p-[1.5px]">
            <span className="block h-full w-[78%] rounded-[1.5px] bg-white/80" />
          </span>
        </span>
      </div>

      {/* Dock flotante: inicio + pestañas */}
      <nav className="tablet-dock" aria-label="Secciones">
        <button
          onClick={() => goTo('inicio')}
          aria-label="Volver al inicio"
          title="Volver al inicio"
          className="font-accent shrink-0 w-10 h-10 rounded-full grid place-items-center text-xl bg-white text-[#051a24] transition-transform duration-200 active:scale-90"
        >
          {COMPANY.monogram.slice(0, 1)}
        </button>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => goTo(t.id)}
            aria-current={active === t.id ? 'page' : undefined}
            className={`h-10 px-3 sm:px-5 rounded-full text-[11px] sm:text-[13px] font-medium transition-[background-color,color,transform] duration-200 active:scale-95 ${
              active === t.id ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

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

    const sheen = root.querySelector('.tablet-sheen');
    const onScroll = () => {
      const max = sc.scrollHeight - sc.clientHeight;
      sheen?.style.setProperty('--sy', max > 0 ? (sc.scrollTop / max).toFixed(3) : '0');
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

  return (
    <EnteredCtx.Provider value={entered}>
      <div
        ref={rootRef}
        className="fixed inset-0 bg-black text-white overflow-hidden selection:bg-white selection:text-black"
      >
        {isLoading && <LoaderScreen onLoadingComplete={() => setIsLoading(false)} />}

        {/* Menú del hero: se desvanece al entrar a la tablet (ahí lo reemplaza el menú de pestañas) */}
        <header
          data-p
          className="hero-header fixed top-0 left-0 right-0 z-50"
          style={{
            opacity: 'clamp(0, calc(1 - (var(--p, 0) - 0.82) * 12), 1)',
            pointerEvents: entered ? 'none' : 'auto',
          }}
        >
          <div className="mx-auto max-w-[1500px] p-6 lg:p-10 flex justify-between items-center">
            <button onClick={() => goTo('inicio')} className="hero-logo text-xl font-black tracking-widest">
              CODE<span className="opacity-50">.WEB</span>
            </button>
            <nav className="hero-nav hidden md:flex gap-8 text-sm tracking-widest uppercase">
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
            data-p
            className="absolute inset-0 z-10 flex items-start lg:items-center pt-28 lg:pt-0 px-6 sm:px-12 lg:px-20 pointer-events-none"
            style={{
              opacity: 'clamp(0, calc(1 - var(--p, 0) * 3.5), 1)',
              transform: 'translateY(calc(var(--p, 0) * -60px))',
            }}
          >
            <div className="mx-auto w-full max-w-[1400px]">
              <div className="max-w-xl lg:max-w-[42%] flex flex-col items-start">
                <span className="text-zinc-400 font-medium tracking-[0.3em] uppercase text-xs mb-5 border-l-2 border-white pl-3">
                  Creative Web Studio & Automation
                </span>
                <h1 className="text-4xl sm:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold tracking-[-0.035em] leading-[1.02] mb-6 text-balance">
                  Construimos el futuro digital de tu negocio.
                </h1>
                <p className="text-zinc-300 text-base sm:text-lg font-normal leading-relaxed mb-9 max-w-[46ch]">
                  Somos un estudio que diseña y desarrolla páginas web y apps web a medida.
                  Entra a la tablet para conocernos y ver nuestros proyectos.
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    onClick={() => goTo('contacto')}
                    className="pointer-events-auto px-8 py-4 bg-white text-black font-semibold text-sm tracking-wider uppercase rounded-full hover:bg-zinc-200 active:scale-[0.97] transition-all shadow-lg"
                  >
                    Iniciar Proyecto
                  </button>
                  <button
                    onClick={() => goTo('proyectos')}
                    className="hidden sm:inline-block pointer-events-auto px-7 py-4 border border-white/25 text-white font-semibold text-sm tracking-wider uppercase rounded-full hover:bg-white/10 hover:border-white/50 active:scale-[0.97] transition-all"
                  >
                    Ver proyectos <span aria-hidden="true">→</span>
                  </button>
                  <span className="lg:hidden text-zinc-400 text-xs tracking-widest uppercase ml-1">
                    ↓ Desliza
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de scroll (escritorio): el scroll es la interacción principal del hero */}
          <div
            data-p
            className="hidden lg:block absolute z-10 inset-x-0 bottom-10 px-20 pointer-events-none"
            style={{ opacity: 'clamp(0, calc(1 - var(--p, 0) * 8), 1)' }}
          >
            <div className="mx-auto w-full max-w-[1400px] flex items-center gap-4">
              <span className="scroll-cue" />
              <span className="text-zinc-400 text-[11px] tracking-[0.3em] uppercase">
                Scroll para entrar a la tablet
              </span>
            </div>
          </div>
        </div>

        {/* ===== SECCIONES: viven "dentro" de la pantalla de la tablet ===== */}
        <div
          ref={scrollerRef}
          data-p
          className="tablet-scroller fixed inset-0 z-20 overflow-y-auto overflow-x-hidden bg-[#050507] no-scrollbar"
          style={{
            opacity: 'clamp(0, calc((var(--p, 0) - 0.9) * 10), 1)',
            transform: 'scale(calc(1.06 - clamp(0, calc((var(--p, 0) - 0.9) * 10), 1) * 0.06))',
          }}
        >
          {/* Resplandor fijo al fondo (sticky de alto 0 = no se mueve con el scroll) */}
          <div className="sticky top-0 h-0 z-0 pointer-events-none">
            <div className="absolute left-0 top-0 w-full h-dvh tablet-glow" />
          </div>

          <Sections goTo={goTo} />
        </div>

        {/* ===== Marco de tablet (encima de todo) ===== */}
        <TabletChrome active={active} entered={entered} goTo={goTo} />
      </div>
    </EnteredCtx.Provider>
  );
}