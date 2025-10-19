import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OperationLoadingProps {
  isVisible: boolean;
  operation: string;
  onComplete?: () => void;
  onError?: () => void;
  duration?: number;
}

const OperationLoading = ({ 
  isVisible, 
  operation, 
  onComplete, 
  onError,
  duration = 2000 
}: OperationLoadingProps) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      // Simular sucesso na maioria dos casos
      const success = Math.random() > 0.1; // 90% de sucesso
      setStatus(success ? 'success' : 'error');
      
      setTimeout(() => {
        if (success && onComplete) onComplete();
        if (!success && onError) onError();
      }, 1000);
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onComplete, onError]);

  if (!isVisible) return null;

  const getStatusInfo = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-blue-600" />,
          title: 'Processando...',
          message: operation,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          title: 'Sucesso!',
          message: `${operation} concluída com sucesso`,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <XCircle className="h-8 w-8 text-red-600" />,
          title: 'Erro!',
          message: `Falha ao ${operation.toLowerCase()}`,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border-2 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl`}>
        <div className="flex flex-col items-center text-center space-y-4">
          {statusInfo.icon}
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-800">{statusInfo.title}</h3>
            <p className="text-sm text-gray-600">{statusInfo.message}</p>
          </div>
          
          {status === 'error' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onError}
              className="mt-2"
            >
              Tentar Novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationLoading;





