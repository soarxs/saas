import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface KeyboardShortcutsProps {
  onNavigate: (view: string) => void;
  onSearch: () => void;
  onNewSale: () => void;
  onPrint: () => void;
  onHelp: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onAddToCart?: () => void;
  onRemoveFromCart?: () => void;
  onPaymentMethod?: (method: string) => void;
  enabled?: boolean;
  allowedViews?: string[];
  currentView?: string;
}

const SHORTCUTS = {
  // Navegação
  'F1': { action: 'help', description: 'Ajuda' },
  'F2': { action: 'confirm', description: 'Confirmar' },
  'F3': { action: 'search', description: 'Buscar' },
  'F4': { action: 'new-sale', description: 'Nova Venda' },
  'F5': { action: 'print', description: 'Imprimir' },
  'F12': { action: 'clear-cart', description: 'Limpar Carrinho' },
  
  // Controles
  'Enter': { action: 'confirm', description: 'Confirmar/Próximo' },
  'Escape': { action: 'cancel', description: 'Cancelar' },
  'ArrowUp': { action: 'previous', description: 'Anterior' },
  'ArrowDown': { action: 'next', description: 'Próximo' },
  'ArrowLeft': { action: 'previous', description: 'Anterior' },
  'ArrowRight': { action: 'next', description: 'Próximo' },
  
  // Vendas
  '+': { action: 'add-to-cart', description: 'Adicionar ao Carrinho' },
  '-': { action: 'remove-from-cart', description: 'Remover do Carrinho' },
  
  // Pagamentos
  '1': { action: 'payment-dinheiro', description: 'Dinheiro' },
  '2': { action: 'payment-debito', description: 'Débito' },
  '3': { action: 'payment-credito', description: 'Crédito' },
  '4': { action: 'payment-pix', description: 'PIX' },
  '5': { action: 'payment-cortesia', description: 'Cortesia' },
};

export const useKeyboardShortcuts = ({
  onNavigate, onSearch, onNewSale, onPrint, onHelp,
  onConfirm, onCancel, onNext, onPrevious, onAddToCart, onRemoveFromCart, onPaymentMethod,
  enabled = true, allowedViews = [], currentView = ''
}: KeyboardShortcutsProps) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || (allowedViews.length > 0 && !allowedViews.includes(currentView))) {
      return;
    }

    // Ignorar se estiver digitando em input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const key = event.key;
    const shortcut = SHORTCUTS[key as keyof typeof SHORTCUTS];
    
    if (!shortcut) return;

    event.preventDefault();

    switch (shortcut.action) {
      case 'help':
        onHelp();
        break;
      case 'confirm':
        onConfirm?.();
        break;
      case 'search':
        onSearch();
        break;
      case 'new-sale':
        onNewSale();
        break;
      case 'print':
        onPrint();
        break;
      case 'cancel':
        onCancel?.();
        break;
      case 'next':
        onNext?.();
        break;
      case 'previous':
        onPrevious?.();
        break;
      case 'add-to-cart':
        onAddToCart?.();
        break;
      case 'remove-from-cart':
        onRemoveFromCart?.();
        break;
      case 'clear-cart':
        toast.info('Carrinho limpo!');
        break;
      default:
        if (shortcut.action.startsWith('payment-')) {
          const method = shortcut.action.replace('payment-', '');
          onPaymentMethod?.(method);
        }
    }
  }, [enabled, allowedViews, currentView, onNavigate, onSearch, onNewSale, onPrint, onHelp, onConfirm, onCancel, onNext, onPrevious, onAddToCart, onRemoveFromCart, onPaymentMethod]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export const useShowShortcuts = () => {
  const showShortcuts = useCallback(() => {
    const shortcutsList = Object.entries(SHORTCUTS)
      .map(([key, { description }]) => `${key}: ${description}`)
      .join('\n');
    
    toast.info(`Atalhos disponíveis:\n${shortcutsList}`, {
      duration: 10000,
    });
  }, []);

  return { showShortcuts };
};