import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseTableNavigationProps {
  onNavigateToTable: (tableNumber: number) => void;
  maxTables?: number;
  enabled?: boolean; // Novo: controla se o hook está ativo
  allowedViews?: string[]; // Novo: views onde o atalho deve funcionar
  currentView?: string; // Novo: view atual
}

export const useTableNavigation = ({ 
  onNavigateToTable, 
  maxTables = 20,
  enabled = true,
  allowedViews = ['sales', 'tables'],
  currentView = ''
}: UseTableNavigationProps) => {
  const digitBuffer = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearBuffer = useCallback(() => {
    digitBuffer.current = '';
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const processTableNavigation = useCallback((tableNumber: number) => {
    if (tableNumber >= 1 && tableNumber <= maxTables) {
      onNavigateToTable(tableNumber);
      toast.success(`📋 Abrindo Mesa ${tableNumber}`, { duration: 1500 });
    } else {
      toast.error(`❌ Mesa ${tableNumber} não existe (1-${maxTables})`, { duration: 2000 });
    }
    clearBuffer();
  }, [onNavigateToTable, maxTables, clearBuffer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // BLOQUEIO UNIVERSAL - Verificações críticas
      
      // 1. Verificar se o hook está habilitado
      if (!enabled) {
        return;
      }

      // 2. Verificar se a view atual está permitida
      if (allowedViews.length > 0 && !allowedViews.includes(currentView)) {
        return;
      }

      // 3. Ignorar se estiver digitando em um input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // 4. Verificar se é Ctrl + dígito
      if (event.ctrlKey && /^[0-9]$/.test(event.key)) {
        event.preventDefault();
        
        // Adicionar dígito ao buffer
        digitBuffer.current += event.key;
        
        // Limpar timeout anterior
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Se temos 2 dígitos, processar imediatamente
        if (digitBuffer.current.length === 2) {
          const tableNumber = parseInt(digitBuffer.current, 10);
          processTableNavigation(tableNumber);
          return;
        }

        // Se temos 1 dígito, aguardar mais 1 segundo por outro dígito
        if (digitBuffer.current.length === 1) {
          timeoutRef.current = setTimeout(() => {
            // Se passou 1 segundo e só temos 1 dígito, limpar buffer
            // Não processar mesas com 1 dígito - apenas 2 dígitos
            clearBuffer();
          }, 1000);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearBuffer();
    };
  }, [processTableNavigation, clearBuffer, enabled, allowedViews, currentView]);

  return {
    currentBuffer: digitBuffer.current,
    isWaitingForDigit: digitBuffer.current.length === 1
  };
};
