// Gael Guardería y Estancia — Service Worker
// Estrategia: "app shell" — cachea todas las pantallas al instalar,
// sirve desde caché primero (rápido y funciona offline) y actualiza
// en segundo plano cuando hay red disponible.

const CACHE_NAME = 'gael-v2';

const PRECACHE_URLS = [
  './',
  './index.html',
  './mapa-del-sitio.html',
  './inicio_de_sesi_n.html',
  './dashboard_principal.html',
  './jornada_diaria_detallada.html',
  './salud_y_seguridad.html',
  './seguimiento_estancia.html',
  './Menusemanal.html',
  './finanzas_y_calendario.html',
  './mensajer_a.html',
  './encuestas.html',
  './contacto.html',
  './dashboard_de_administraci_n.html',
  './listado_de_ni_os.html',
  './alta_de_ni_os.html',
  './registro_diario_beb_s.html',
  './gesti_n_financiera.html',
  './fichas_m_dicas_y_salud.html',
  './gesti_n_de_personal.html',
  './manifest.json',
  './assets/logo-gael-icon.png',
  './assets/logo-gael-full.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Solo interceptamos peticiones GET del mismo origen (las páginas del sitio).
  // Los recursos externos (fuentes, Tailwind CDN, imágenes de placeholder) se
  // dejan pasar directo a la red para no romper por problemas de CORS.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached); // sin red: usa lo cacheado si existe

      // Cache-first: responde rápido con lo cacheado y actualiza en segundo plano.
      return cached || network;
    })
  );
});
