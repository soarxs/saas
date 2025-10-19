// Script melhorado para limpeza completa de cache - PROTÓTIPO PDV
console.log('🧹 PROTÓTIPO PDV - Iniciando limpeza completa de cache...');

async function limparCacheCompleto() {
    const resultados = {
        serviceWorkers: 0,
        caches: 0,
        localStorage: false,
        sessionStorage: false,
        indexedDB: 0
    };

    try {
        // 1. Comunicar com Service Worker para limpar cache
        if ('serviceWorker' in navigator) {
            console.log('📋 Comunicando com Service Worker...');
            try {
                const registration = await navigator.serviceWorker.ready;
                if (registration.active) {
                    const messageChannel = new MessageChannel();
                    messageChannel.port1.onmessage = (event) => {
                        if (event.data.success) {
                            console.log('✅ Cache do Service Worker limpo');
                        }
                    };
                    
                    registration.active.postMessage(
                        { type: 'CLEAR_CACHE' },
                        [messageChannel.port2]
                    );
                }
            } catch (e) {
                console.log('⚠️ Erro ao comunicar com Service Worker:', e);
            }
        }

        // 2. Remover todos os Service Workers
        if ('serviceWorker' in navigator) {
            console.log('📋 Removendo Service Workers...');
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log(`📋 Encontrados ${registrations.length} Service Workers`);
            
            for (let registration of registrations) {
                const result = await registration.unregister();
                console.log('✅ Service Worker removido:', registration.scope, result);
                resultados.serviceWorkers++;
            }
        }

        // 3. Limpar todos os caches
        if ('caches' in window) {
            console.log('📦 Limpando caches...');
            const cacheNames = await caches.keys();
            console.log(`📦 Encontrados ${cacheNames.length} caches`);
            
            for (let cacheName of cacheNames) {
                const result = await caches.delete(cacheName);
                console.log('🗑️ Cache removido:', cacheName, result);
                resultados.caches++;
            }
        }

        // 4. Limpar localStorage
        console.log('💾 Limpando localStorage...');
        try {
            localStorage.clear();
            console.log('✅ localStorage limpo');
            resultados.localStorage = true;
        } catch (e) {
            console.log('❌ Erro ao limpar localStorage:', e);
        }

        // 5. Limpar sessionStorage
        console.log('🔒 Limpando sessionStorage...');
        try {
            sessionStorage.clear();
            console.log('✅ sessionStorage limpo');
            resultados.sessionStorage = true;
        } catch (e) {
            console.log('❌ Erro ao limpar sessionStorage:', e);
        }

        // 6. Limpar IndexedDB
        console.log('🗄️ Limpando IndexedDB...');
        if ('indexedDB' in window) {
            const dbNames = ['pdv-database', 'sales-db', 'products-db', 'prototipo-db'];
            for (let dbName of dbNames) {
                try {
                    const deleteReq = indexedDB.deleteDatabase(dbName);
                    deleteReq.onsuccess = () => {
                        console.log('✅ IndexedDB removido:', dbName);
                        resultados.indexedDB++;
                    };
                    deleteReq.onerror = () => {
                        console.log('⚠️ Erro ao remover IndexedDB:', dbName);
                    };
                } catch (e) {
                    console.log('⚠️ Erro ao tentar remover IndexedDB:', dbName, e);
                }
            }
        }

        // 7. Relatório final
        console.log('📊 RELATÓRIO DE LIMPEZA:');
        console.log(`   Service Workers removidos: ${resultados.serviceWorkers}`);
        console.log(`   Caches removidos: ${resultados.caches}`);
        console.log(`   localStorage limpo: ${resultados.localStorage ? '✅' : '❌'}`);
        console.log(`   sessionStorage limpo: ${resultados.sessionStorage ? '✅' : '❌'}`);
        console.log(`   IndexedDB removidos: ${resultados.indexedDB}`);

        console.log('🎉 Limpeza completa finalizada!');
        
        // Perguntar se quer recarregar
        if (confirm('Cache limpo com sucesso! Deseja recarregar a página agora?')) {
            window.location.reload(true);
        }

        return resultados;

    } catch (error) {
        console.error('❌ Erro durante a limpeza:', error);
        return null;
    }
}

// Executar limpeza automaticamente
limparCacheCompleto();

// Disponibilizar função globalmente para uso manual
window.limparCachePDV = limparCacheCompleto;