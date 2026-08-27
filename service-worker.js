// Gael Guardería y Estancia — Service Worker
// Estrategia: "app shell" — cachea todas las pantallas al instalar.
// Mientras el proyecto está en desarrollo activo, usa "red primero":
// siempre intenta traer la versión más reciente, y solo recurre a la
// copia en caché si no hay conexión a internet.

const CACHE_NAME = 'gael-v7';

const PRECACHE_URLS = [
  './',
  './index.html',
  './mapa-del-sitio.html',
  './inicio_de_sesi_n.html',
  './restablecer_contrasena.html',
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
  './permisos.html',
  './usuarios.html',
  './gestion_menu_semanal.html',
  './gestion_encuestas.html',
  './reportes.html',
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

  // Network-first: mientras el proyecto sigue cambiando seguido, siempre se busca
  // la versión más reciente en la red primero. Solo se usa la copia en caché como
  // respaldo si no hay conexión — así nunca se queda viendo una versión vieja.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
