import { useState } from 'react';
import { useStore } from '../store/useStore';
import Login from '../components/Login';
import TableGrid from '../components/TableGrid';
import TableDialog from '../components/TableDialog';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { toast } from 'sonner';

const Index = () => {
  const { currentUser } = useStore();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Funções para atalhos de teclado
  const handleSearch = () => {
    // Focar no campo de busca se existir
    const searchInput = document.querySelector('input[placeholder*="buscar"], input[placeholder*="Buscar"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    } else {
      toast.info('Navegue para uma tela com busca para usar este atalho');
    }
  };

  const handleHelp = () => {
    toast.info('Atalhos disponíveis: F1-Buscar, F2-Receber, F3-Encerrar, F4-Cancelar, F5-Imprimir, F6-Histórico, F7-Utilitários, F8-Delivery, F9-Comandas');
  };

  // Configurar atalhos de teclado
  useKeyboardShortcuts({
    onNavigate: () => {},
    onSearch: handleSearch,
    onNewSale: () => {},
    onPrint: () => toast.info('Funcionalidade de impressão em desenvolvimento'),
    onHelp: handleHelp,
    onConfirm: () => toast.success('✅ Ação confirmada'),
    onCancel: () => toast.info('❌ Ação cancelada'),
    enabled: !!currentUser,
    allowedViews: ['sales'],
    currentView: 'sales'
  });

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="h-screen">
      {/* Se nenhuma mesa selecionada, mostrar grid */}
      {selectedTable === null ? (
        <TableGrid onTableSelect={setSelectedTable} />
      ) : (
        /* Se mesa selecionada, mostrar dialog da mesa */
        <TableDialog
          isOpen={true}
          tableNumber={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </div>
  );
};

export default Index;