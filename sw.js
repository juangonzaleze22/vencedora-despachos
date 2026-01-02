/**
 * Service Worker para Vencedora Despachos
 * Maneja caché offline y sincronización de datos
 */

const CACHE_NAME = 'vencedora-despachos-v1';
const OFFLINE_URL = '/offline.html';

// Archivos esenciales para funcionamiento offline
const CACHE_FILES = [
    '/',
    '/index.html',
    '/src/css/global.css',
    '/src/fonts/fonts.css',
    '/src/js/utils/indexedDB.js',
    '/src/js/vendor/flowbite.min.js',
    '/offline.html',
    '/manifest.json'
];

/**
 * Instalación del Service Worker
 * Cachéa los archivos esenciales
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cacheando archivos esenciales');
                return cache.addAll(CACHE_FILES.map(url => new Request(url, { cache: 'reload' })))
                    .catch((error) => {
                        console.warn('[Service Worker] Error al cachear algunos archivos:', error);
                        // Continuar aunque algunos archivos fallen
                    });
            })
            .then(() => {
                // Forzar activación inmediata del nuevo service worker
                return self.skipWaiting();
            })
    );
});

/**
 * Activación del Service Worker
 * Limpia caches antiguos
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activando...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
            .then(() => {
                // Tomar control de todas las páginas inmediatamente
                return self.clients.claim();
            })
    );
});

/**
 * Estrategia: Network First, luego Cache
 * Intenta obtener de la red primero, si falla usa el cache
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requests que no son GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignorar requests de extensiones del navegador
    if (url.protocol === 'chrome-extension:') {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Si la respuesta es válida, clonarla y guardarla en cache
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, intentar obtener del cache
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    // Si es una navegación y no hay cache, mostrar página offline
                    if (request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                    
                    // Para otros recursos, retornar respuesta vacía
                    return new Response('Recurso no disponible offline', {
                        status: 404,
                        statusText: 'Not Found'
                    });
                });
            })
    );
});

/**
 * Manejo de mensajes desde la aplicación
 * Útil para sincronización de datos
 */
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Mensaje recibido:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME).then(() => {
                return caches.open(CACHE_NAME);
            })
        );
    }
});

/**
 * Sincronización en segundo plano
 * Útil para sincronizar datos cuando vuelve la conexión
 */
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Sincronización en segundo plano:', event.tag);
    
    if (event.tag === 'sync-despachos') {
        event.waitUntil(syncDespachos());
    }
});

/**
 * Función para sincronizar despachos pendientes
 */
async function syncDespachos() {
    try {
        // Aquí implementarías la lógica de sincronización
        // Por ejemplo, obtener datos de IndexedDB y enviarlos al servidor
        console.log('[Service Worker] Sincronizando despachos...');
        
        // Ejemplo de implementación:
        // const db = await openDB();
        // const pendientes = await db.getAll('despachos-pendientes');
        // await enviarAlServidor(pendientes);
        
        return Promise.resolve();
    } catch (error) {
        console.error('[Service Worker] Error en sincronización:', error);
        return Promise.reject(error);
    }
}

/**
 * Notificaciones push (opcional)
 */
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification recibida');
    
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Vencedora Despachos';
    const options = {
        body: data.body || 'Tienes una nueva notificación',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: data.tag || 'notification',
        data: data
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

/**
 * Manejo de clics en notificaciones
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notificación clickeada');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

