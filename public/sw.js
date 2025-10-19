// Service Worker para suporte offline
const CACHE_NAME = 'prototipo-v1.0.2';
const STATIC_CACHE = 'static-v1.2';
const DYNAMIC_CACHE = 'dynamic-v1.2';

// Recursos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  '/robots.txt'
];

// Recursos dinâmicos que devem ser cacheados
const DYNAMIC_PATTERNS = [
  /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
  /\/api\//,
  /\/static\//
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker v1.0.2...');
  
  event.waitUntil(
    // Primeiro, limpar todos os caches antigos
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Depois, cachear os novos recursos
      return caches.open(STATIC_CACHE);
    }).then((cache) => {
      console.log('[SW] Cacheando recursos estáticos...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Recursos estáticos cacheados com sucesso');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Erro ao cachear recursos estáticos:', error);
    })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remover todos os caches antigos que não correspondem aos novos nomes
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && 
                !cacheName.includes('prototipo-v1.0.1')) {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker ativado - cache limpo');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Estratégia: Cache First para recursos estáticos
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Estratégia: Network First para dados dinâmicos
  if (isDynamicAsset(request.url)) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Estratégia: Stale While Revalidate para outros recursos
  event.respondWith(staleWhileRevalidate(request));
});

// Verifica se é um recurso estático
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/.test(url);
}

// Verifica se é um recurso dinâmico
function isDynamicAsset(url) {
  return DYNAMIC_PATTERNS.some(pattern => pattern.test(url));
}

// Estratégia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Erro na estratégia Cache First:', error);
    return new Response('Recurso não disponível offline', { status: 503 });
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Rede indisponível, tentando cache...');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar dados offline padrão se disponível
    return getOfflineResponse(request);
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Resposta offline personalizada
function getOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Dados offline para diferentes endpoints
  if (url.pathname.includes('/api/products')) {
    return new Response(JSON.stringify({
      products: [],
      message: 'Dados offline - produtos não disponíveis'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.pathname.includes('/api/sales')) {
    return new Response(JSON.stringify({
      sales: [],
      message: 'Dados offline - vendas não disponíveis'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Página offline padrão
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline - PROTÓTIPO</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .container {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }
        h1 { margin-bottom: 1rem; }
        p { margin-bottom: 2rem; opacity: 0.9; }
        .status { 
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔄 Modo Offline</h1>
        <p>Você está offline, mas o sistema continua funcionando!</p>
        <p>Suas vendas serão sincronizadas quando a conexão voltar.</p>
        <div class="status">📡 Aguardando conexão...</div>
      </div>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[SW] Sincronização em background:', event.tag);
  
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncSales());
  } else if (event.tag === 'sync-data') {
    event.waitUntil(syncAllData());
  }
});

// Sincronizar vendas
async function syncSales() {
  try {
    console.log('[SW] Sincronizando vendas...');
    // Aqui você implementaria a lógica de sincronização
    // Por exemplo, enviar vendas pendentes para o servidor
    const pendingSales = await getPendingSales();
    if (pendingSales.length > 0) {
      await sendSalesToServer(pendingSales);
      await clearPendingSales();
    }
  } catch (error) {
    console.error('[SW] Erro na sincronização de vendas:', error);
  }
}

// Sincronizar todos os dados
async function syncAllData() {
  try {
    console.log('[SW] Sincronizando todos os dados...');
    await syncSales();
    // Adicionar outras sincronizações conforme necessário
  } catch (error) {
    console.error('[SW] Erro na sincronização geral:', error);
  }
}

// Funções auxiliares para sincronização
async function getPendingSales() {
  // Implementar lógica para obter vendas pendentes do IndexedDB
  return [];
}

async function sendSalesToServer(sales) {
  // Implementar lógica para enviar vendas para o servidor
  console.log('[SW] Enviando vendas para o servidor:', sales.length);
}

async function clearPendingSales() {
  // Implementar lógica para limpar vendas pendentes após sincronização
  console.log('[SW] Vendas sincronizadas com sucesso');
}

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/favicon.ico'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/favicon.ico'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Função para forçar limpeza completa do cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Limpeza de cache solicitada');
    
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Removendo cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[SW] Todos os caches foram limpos');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

console.log('[SW] Service Worker carregado com sucesso');


