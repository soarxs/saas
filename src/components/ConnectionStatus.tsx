import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, 
  Clock, Database, RotateCcw, Trash2
} from 'lucide-react';
import { useOffline } from '../hooks/useOffline';
import { toast } from 'sonner';

const ConnectionStatus = () => {
  const {
    isOnline,
    isReconnecting,
    queueLength,
    lastSync,
    pendingOperations,
    forceSync,
    clearOfflineQueue,
    getOperationLabel
  } = useOffline();

  const [showDetails, setShowDetails] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Simular progresso de sincronização
  useEffect(() => {
    if (isReconnecting && queueLength > 0) {
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 0;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setSyncProgress(0);
    }
  }, [isReconnecting, queueLength]);

  const getStatusColor = () => {
    if (isReconnecting) return 'text-blue-600';
    if (isOnline) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isReconnecting) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (isOnline) return <Wifi className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isReconnecting) return 'Sincronizando...';
    if (isOnline) return 'Online';
    return 'Offline';
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return lastSync.toLocaleDateString('pt-BR');
  };

  const getOperationTypeCount = (type: string) => {
    return pendingOperations.filter(op => op.type === type).length;
  };

  if (!showDetails && isOnline && queueLength === 0) {
    return null; // Não mostrar quando tudo está normal
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className={`border-l-4 ${
        isOnline ? 'border-l-green-500' : 'border-l-red-500'
      }`}>
        <CardContent className="p-4">
          {/* Status Principal */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={getStatusColor()}>
                {getStatusIcon()}
              </div>
              <div>
                <div className="font-medium text-sm">{getStatusText()}</div>
                {queueLength > 0 && (
                  <div className="text-xs text-gray-500">
                    {queueLength} operação(ões) pendente(s)
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
                className="h-6 w-6 p-0"
              >
                {showDetails ? '−' : '+'}
              </Button>
            </div>
          </div>

          {/* Progresso de Sincronização */}
          {isReconnecting && queueLength > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Sincronizando dados...</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-1" />
            </div>
          )}

          {/* Detalhes Expandidos */}
          {showDetails && (
            <div className="space-y-3">
              {/* Informações de Sincronização */}
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Última sincronização: {formatLastSync()}</span>
                </div>
                
                {queueLength > 0 && (
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3" />
                    <span>Operações pendentes: {queueLength}</span>
                  </div>
                )}
              </div>

              {/* Breakdown de Operações Pendentes */}
              {queueLength > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Operações pendentes:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {['sale', 'product', 'ingredient', 'promotion'].map(type => {
                      const count = getOperationTypeCount(type);
                      if (count === 0) return null;
                      
                      return (
                        <div key={type} className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {count}
                          </Badge>
                          <span className="text-xs">{getOperationLabel(type as any)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                {isOnline && queueLength > 0 && (
                  <Button
                    size="sm"
                    onClick={forceSync}
                    disabled={isReconnecting}
                    className="flex-1 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Sincronizar
                  </Button>
                )}
                
                {queueLength > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja limpar todas as operações pendentes?')) {
                        clearOfflineQueue();
                      }
                    }}
                    className="text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Aviso Offline */}
              {!isOnline && (
                <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <AlertTriangle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-yellow-800">Modo Offline</div>
                    <div className="text-yellow-700">
                      Suas operações serão salvas localmente e sincronizadas quando a conexão voltar.
                    </div>
                  </div>
                </div>
              )}

              {/* Status de Conexão */}
              {isOnline && (
                <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-green-800">Conexão Ativa</div>
                    <div className="text-green-700">
                      Todos os dados estão sendo sincronizados em tempo real.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionStatus;
