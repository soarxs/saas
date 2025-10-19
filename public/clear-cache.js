// Script para limpar completamente o cache e Service Workers
console.log('🧹 Iniciando limpeza de cache...');

// 1. Remover todos os Service Workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log(`📋 Encontrados ${registrations.length} Service Workers`);
    
    registrations.forEach(function(registration) {
      registration.unregister().then(function(boolean) {
        console.log('✅ Service Worker removido:', registration.scope, boolean);
      });
    });
  });
}

// 2. Limpar todos os caches
if ('caches' in window) {
  caches.keys().then(function(cacheNames) {
    console.log(`📦 Encontrados ${cacheNames.length} caches`);
    
    cacheNames.forEach(function(cacheName) {
      caches.delete(cacheName).then(function(boolean) {
        console.log('🗑️ Cache removido:', cacheName, boolean);
      });
    });
  });
}

// 3. Limpar localStorage
try {
  localStorage.clear();
  console.log('💾 localStorage limpo');
} catch (e) {
  console.log('❌ Erro ao limpar localStorage:', e);
}

// 4. Limpar sessionStorage
try {
  sessionStorage.clear();
  console.log('🔒 sessionStorage limpo');
} catch (e) {
  console.log('❌ Erro ao limpar sessionStorage:', e);
}

// 5. Forçar reload após 2 segundos
setTimeout(function() {
  console.log('🔄 Recarregando página...');
  window.location.reload(true);
}, 2000);





