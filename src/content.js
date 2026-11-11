import { createContext } from 'react';

// true cuando ya "entramos" a la pantalla de la tablet
export const EnteredCtx = createContext(false);

/* ===================== EDITA TUS DATOS AQUÍ ===================== */
export const COMPANY = {
  name: 'CODE.WEB',
  tagline: 'Creative Web Studio & Automation',
  logo: null, // ej: '/logo.png' (en la carpeta public). Si es null se muestra el monograma "CW"
  monogram: 'CW',
  // EDITA: textos inventados, cámbialos por la historia real
  lead: 'Somos un estudio creativo con una sola obsesión:',
  about:
    'Combinamos diseño, animación 3D y automatización para que negocios y emprendimientos tengan una presencia digital que destaque y trabaje por ellos, incluso cuando no están mirando.',
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
    { v: '100%', l: 'Desarrollo a medida' },
    { v: '3', l: 'Áreas de servicio' },
    { v: '4', l: 'Pasos, de la idea al lanzamiento' },
  ],
};

// EDITA: pon los datos reales de la empresa
export const CONTACT = {
  instagram: { handle: 'tu_empresa', href: 'https://instagram.com/tu_empresa' },
  whatsapp: { label: '+57 300 000 0000', href: 'https://wa.me/573000000000' },
  email: { label: 'hola@tuempresa.com', href: 'mailto:hola@tuempresa.com' },
};

export const TABS = [
  { id: 'sobre-mi', label: 'Perfil' },
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'contacto', label: 'Contacto' },
];

export const CATALOGO = [
  // price: precio "desde" en pesos colombianos. Si es null se muestra "Cotización a medida".
  {
    title: 'Landing pages',
    desc: 'Sitios rápidos y animados que convierten visitas en clientes.',
    price: '$600.000',
    c: '125,170,255',
  },
  {
    title: 'Apps web a medida',
    desc: 'Sistemas hechos para tu negocio: citas y reservas, pedidos, inventario o un panel para tener todo en un solo lugar.',
    price: '$1.200.000',
    c: '180,140,255',
  },
  {
    title: 'Automatización',
    desc: 'Procesos que se ejecutan solos para que ahorres tiempo.',
    price: null,
    c: '110,231,183',
  },
];
/* ================================================================ */
