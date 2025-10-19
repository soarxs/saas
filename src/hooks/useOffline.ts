import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OfflineQueueItem {
  id: string;
  type: 'sale' | 'product' | 'ingredient' | 'promotion';
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineState {
  isOnline: boolean;
  isReconnecting: boolean;
  queueLength: number;
  lastSync: Date | null;
  pendingOperations: OfflineQueueItem[];
}

export const useOffline = () => {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isReconnecting: false,
    queueLength: 0,
    lastSync: null,
    pendingOperations: []
  });

  // Verificar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Offline] Conexão restaurada');
      setOfflineState(prev => ({
        ...prev,
        isOnline: true,
        isReconnecting: false
      }));
      
      toast.success('🌐 Conexão restaurada! Sincronizando dados...');
      
      // Sincronizar dados pendentes
      syncPendingOperations();
    };

    const handleOffline = () => {
      console.log('[Offline] Conexão perdida');
      setOfflineState(prev => ({
        ...prev,
        isOnline: false,
        isReconnecting: true
      }));
      
      toast.warning('📡 Modo offline ativado - suas vendas serão salvas localmente');
    };

    // Registrar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Carregar operações pendentes do localStorage
    loadPendingOperations();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar operações pendentes do localStorage
  const loadPendingOperations = useCallback(() => {
    try {
      const pending = localStorage.getItem('offline-queue');
      if (pending) {
        const operations = JSON.parse(pending);
        setOfflineState(prev => ({
          ...prev,
          pendingOperations: operations,
          queueLength: operations.length
        }));
      }
    } catch (error) {
      console.error('[Offline] Erro ao carregar operações pendentes:', error);
    }
  }, []);

  // Salvar operações pendentes no localStorage
  const savePendingOperations = useCallback((operations: OfflineQueueItem[]) => {
    try {
      localStorage.setItem('offline-queue', JSON.stringify(operations));
      setOfflineState(prev => ({
        ...prev,
        pendingOperations: operations,
        queueLength: operations.length
      }));
    } catch (error) {
      console.error('[Offline] Erro ao salvar operações pendentes:', error);
    }
  }, []);

  // Adicionar operação à fila offline
  const addToOfflineQueue = useCallback((type: OfflineQueueItem['type'], data: any) => {
    const operation: OfflineQueueItem = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    setOfflineState(prev => {
      const newOperations = [...prev.pendingOperations, operation];
      savePendingOperations(newOperations);
      return {
        ...prev,
        pendingOperations: newOperations,
        queueLength: newOperations.length
      };
    });

    console.log('[Offline] Operação adicionada à fila:', operation);
    
    if (!offlineState.isOnline) {
      toast.info(`📝 ${getOperationLabel(type)} salvo para sincronização`);
    }
  }, [offlineState.isOnline, savePendingOperations]);

  // Sincronizar operações pendentes
  const syncPendingOperations = useCallback(async () => {
    if (!offlineState.isOnline || offlineState.pendingOperations.length === 0) {
      return;
    }

    console.log('[Offline] Iniciando sincronização de operações pendentes...');
    
    setOfflineState(prev => ({ ...prev, isReconnecting: true }));

    const operations = [...offlineState.pendingOperations];
    const successfulOperations: string[] = [];
    const failedOperations: OfflineQueueItem[] = [];

    for (const operation of operations) {
      try {
        await syncOperation(operation);
        successfulOperations.push(operation.id);
        console.log('[Offline] Operação sincronizada:', operation.id);
      } catch (error) {
        console.error('[Offline] Erro ao sincronizar operação:', operation.id, error);
        
        // Incrementar tentativas
        operation.retries += 1;
        
        // Se excedeu o limite de tentativas, remover da fila
        if (operation.retries >= 3) {
          console.warn('[Offline] Operação removida após 3 tentativas:', operation.id);
        } else {
          failedOperations.push(operation);
        }
      }
    }

    // Atualizar fila removendo operações bem-sucedidas
    const remainingOperations = failedOperations;
    savePendingOperations(remainingOperations);

    setOfflineState(prev => ({
      ...prev,
      isReconnecting: false,
      pendingOperations: remainingOperations,
      queueLength: remainingOperations.length,
      lastSync: new Date()
    }));

    if (successfulOperations.length > 0) {
      toast.success(`✅ ${successfulOperations.length} operação(ões) sincronizada(s)`);
    }

    if (failedOperations.length > 0) {
      toast.warning(`⚠️ ${failedOperations.length} operação(ões) falharam na sincronização`);
    }
  }, [offlineState.isOnline, offlineState.pendingOperations, savePendingOperations]);

  // Sincronizar operação individual
  const syncOperation = async (operation: OfflineQueueItem) => {
    // Simular sincronização com servidor
    // Em uma implementação real, você faria chamadas HTTP aqui
    
    switch (operation.type) {
      case 'sale':
        // Simular envio de venda para servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('[Offline] Venda sincronizada:', operation.data);
        break;
        
      case 'product':
        // Simular atualização de produto
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[Offline] Produto sincronizado:', operation.data);
        break;
        
      case 'ingredient':
        // Simular atualização de ingrediente
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[Offline] Ingrediente sincronizado:', operation.data);
        break;
        
      case 'promotion':
        // Simular atualização de promoção
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[Offline] Promoção sincronizada:', operation.data);
        break;
        
      default:
        throw new Error(`Tipo de operação não suportado: ${operation.type}`);
    }
  };

  // Limpar fila offline
  const clearOfflineQueue = useCallback(() => {
    savePendingOperations([]);
    toast.success('🗑️ Fila offline limpa');
  }, [savePendingOperations]);

  // Executar operação (online ou offline)
  const executeOperation = useCallback(async (
    type: OfflineQueueItem['type'],
    data: any,
    onlineCallback?: () => Promise<void>
  ) => {
    if (offlineState.isOnline && onlineCallback) {
      try {
        await onlineCallback();
        console.log('[Offline] Operação executada online:', type);
      } catch (error) {
        console.error('[Offline] Erro na operação online, adicionando à fila:', error);
        addToOfflineQueue(type, data);
      }
    } else {
      addToOfflineQueue(type, data);
    }
  }, [offlineState.isOnline, addToOfflineQueue]);

  // Obter label da operação
  const getOperationLabel = (type: OfflineQueueItem['type']) => {
    switch (type) {
      case 'sale': return 'Venda';
      case 'product': return 'Produto';
      case 'ingredient': return 'Ingrediente';
      case 'promotion': return 'Promoção';
      default: return 'Operação';
    }
  };

  // Forçar sincronização
  const forceSync = useCallback(() => {
    if (offlineState.isOnline) {
      syncPendingOperations();
    } else {
      toast.error('❌ Sem conexão com a internet');
    }
  }, [offlineState.isOnline, syncPendingOperations]);

  return {
    ...offlineState,
    addToOfflineQueue,
    syncPendingOperations,
    clearOfflineQueue,
    executeOperation,
    forceSync,
    getOperationLabel
  };
};





