import { useState, useEffect } from 'react';

export default function LoaderScreen({ onLoadingComplete }) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        onLoadingComplete();
      }, 800);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000', // Fondo negro puro
        color: '#ffffff',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
        opacity: isFading ? 0 : 1,
        transform: isFading ? 'scale(1.05)' : 'scale(1)',
        pointerEvents: isFading ? 'none' : 'auto',
        padding: '1rem',
      }}
    >
      {/* Contenido limpio sin cajas ni bordes */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '0.15em',
            color: '#ffffff', // Texto blanco puro
            margin: 0,
          }}
        >
          CODE
        </h1>
        <p
          style={{
            color: '#71717a', // Gris elegante
            fontSize: '0.75rem',
            marginTop: '1rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
          }}
        >
          WELCOME...
        </p>

        {/* Línea de carga sutil en escala de grises */}
        <div
          style={{
            width: '160px',
            height: '2px',
            backgroundColor: '#27272a',
            borderRadius: '9999px',
            marginTop: '2.5rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff', // Barra blanca en movimiento
              animation: 'loadingProgress 2s ease-in-out infinite',
            }}
          ></div>
        </div>
      </div>

      <style>{`
        @keyframes loadingProgress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}