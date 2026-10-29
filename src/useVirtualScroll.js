import { useCallback, useEffect, useRef, useState } from 'react';

const WHEEL_SPEED = 0.0008; // más alto = zoom más rápido con la rueda
const TOUCH_SPEED = 0.0022; // sensibilidad en celular
const KEY_STEP = 0.18;      // avance por flecha / PageDown
const ENTER_AT = 0.995;     // a partir de aquí "entramos" a las secciones
const EXIT_DELAY = 450;     // ms: evita salir sin querer por inercia del trackpad

export default function useVirtualScroll({ rootRef, scrollerRef, enabled = true }) {
  const progress = useRef(0);
  const target = useRef(0);
  const enteredRef = useRef(false);
  const pendingId = useRef(null);
  const enabledRef = useRef(enabled);
  const lastScrollAt = useRef(0);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const setBoth = useCallback((v) => {
    enteredRef.current = v;
    setEntered(v);
  }, []);

  const scrollToPending = useCallback(() => {
    const id = pendingId.current;
    const sc = scrollerRef.current;
    if (!id || !sc) return;
    const el = sc.querySelector(`#${id}`);
    if (el) sc.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
    pendingId.current = null;
  }, [scrollerRef]);

  useEffect(() => {
    const root = rootRef.current;
    const sc = scrollerRef.current;
    if (!root || !sc) return;
    let raf;

    // dp = cambio de progreso (+ avanza hacia la tablet, - retrocede)
    const push = (dp) => {
      if (!enabledRef.current) return false;

      if (enteredRef.current) {
        // Dentro de las secciones: solo regresamos a la tablet si estamos arriba de todo
        const quiet = Date.now() - lastScrollAt.current > EXIT_DELAY;
        if (dp < 0 && sc.scrollTop <= 0 && quiet) {
          setBoth(false);
          target.current = 0.985;
          return true;
        }
        return false; // scroll nativo normal
      }

      target.current = Math.min(Math.max(target.current + dp, 0), 1);
      return true;
    };

    const onWheel = (e) => {
      const dy = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
      const clamped = Math.max(-150, Math.min(150, dy));
      if (push(clamped * WHEEL_SPEED)) e.preventDefault();
    };

    let lastY = null;
    const onTouchStart = (e) => {
      lastY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (lastY == null) return;
      const y = e.touches[0].clientY;
      const dy = lastY - y;
      lastY = y;
      if (push(dy * TOUCH_SPEED)) e.preventDefault();
    };
    const onTouchEnd = () => {
      lastY = null;
    };

    const onKey = (e) => {
      if (enteredRef.current) return;
      if (e.target.closest?.('a,button,input,textarea')) return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        push(KEY_STEP);
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        push(-KEY_STEP);
      }
    };

    const onInnerScroll = () => {
      lastScrollAt.current = Date.now();
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);
    sc.addEventListener('scroll', onInnerScroll, { passive: true });

    // Bucle: el progreso "persigue" al objetivo para que todo sea suave
    const loop = () => {
      const diff = target.current - progress.current;
      progress.current =
        Math.abs(diff) < 0.0002 ? target.current : progress.current + diff * 0.08;
      root.style.setProperty('--p', progress.current.toFixed(4));

      if (!enteredRef.current && target.current >= 1 && progress.current >= ENTER_AT) {
        progress.current = 1;
        setBoth(true);
        scrollToPending();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
      sc.removeEventListener('scroll', onInnerScroll);
    };
  }, [rootRef, scrollerRef, setBoth, scrollToPending]);

  // Para los links del menú
  const goTo = useCallback(
    (id) => {
      const sc = scrollerRef.current;
      if (id === 'inicio') {
        pendingId.current = null;
        if (sc) sc.scrollTop = 0;
        setBoth(false);
        target.current = 0;
        return;
      }
      pendingId.current = id;
      target.current = 1;
      if (enteredRef.current) scrollToPending();
    },
    [scrollerRef, setBoth, scrollToPending]
  );

  return { progress, entered, goTo };
}