
import { useState } from 'react';
import { useStore } from '../store/useStore';
import Login from '../components/Login';
import ShiftManager from '../components/ShiftManager';
import TableManager from '../components/TableManager';
import ProductManager from '../components/ProductManager';
import Reports from '../components/Reports';
import SalesView from '../components/SalesView';
import ProfessionalHeader from '../components/ProfessionalHeader';
import ProfessionalSidebar from '../components/ProfessionalSidebar';
import ProfessionalDashboard from '../components/ProfessionalDashboard';
import NewOrderDialog from '../components/NewOrderDialog';
import KitchenDisplay from '../components/KitchenDisplay';
import DeliveryManager from '../components/DeliveryManager';
import TableGrid from '../components/TableGrid';
import TableDialog from '../components/TableDialog';
import { useKeyboardShortcuts, useShowShortcuts } from '../hooks/useKeyboardShortcuts';
import { toast } from 'sonner';

const Index = () => {
  const { currentUser, currentShift } = useStore();
  const [currentView, setCurrentView] = useState('sales');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sempre aberto por padrão
  const [newOrderDialogOpen, setNewOrderDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const showShortcuts = useShowShortcuts();

  // Funções para atalhos de teclado
  const handleNewSale = () => {
    setNewOrderDialogOpen(true);
    toast.success('Novo pedido iniciado');
  };

  const handlePrint = () => {
    toast.info('Funcionalidade de impressão em desenvolvimento');
  };

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
    showShortcuts();
  };

  // Função para navegar (sem fechar sidebar automaticamente)
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    // Reset selectedTable quando navegar para sales
    if (view === 'sales') {
      setSelectedTable(null);
    }
    // Removido o auto-collapse do sidebar
  };

  // Função para navegar para mesas
  const handleNavigateToTable = (tableNumber: number) => {
    if (tableNumber === 0) {
      // Balcão - ir para vendas
      setCurrentView('sales');
      toast.success('🛒 Abrindo vendas rápidas (Balcão)');
    } else {
      // Mesa específica - ir para vendas
      setCurrentView('sales');
      toast.success(`📋 Abrindo Mesa ${tableNumber}`);
    }
  };

  // Sistema de navegação de mesas global (simplificado)
  const currentBuffer = '';
  const isWaitingForDigit = false;

  // Configurar atalhos de teclado
  useKeyboardShortcuts({
    onNavigate: handleNavigate,
    onSearch: handleSearch,
    onNewSale: handleNewSale,
    onPrint: handlePrint,
    onHelp: handleHelp,
    onConfirm: () => {
      // Confirmação geral - pode ser usado em diferentes contextos
      toast.success('✅ Ação confirmada');
    },
    onCancel: () => {
      // Cancelamento geral
      toast.info('❌ Ação cancelada');
    },
    enabled: !!currentUser, // Só ativar se usuário estiver logado
    allowedViews: ['sales', 'tables', 'dashboard', 'deliveries', 'shifts', 'kitchen', 'orders'], // Views onde atalhos gerais funcionam
    currentView: currentView
  });

  if (!currentUser) {
    return <Login />;
  }


  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <ProfessionalDashboard onNavigate={handleNavigate} />;
      case 'sales':
        // Se nenhuma mesa selecionada, mostrar grid
        if (selectedTable === null) {
          return <TableGrid onTableSelect={setSelectedTable} />;
        }
        // Se mesa selecionada, mostrar dialog da mesa
        return (
          <TableDialog
            isOpen={true}
            tableNumber={selectedTable}
            onClose={() => setSelectedTable(null)}
          />
        );
      case 'sales-view':
        return <SalesView />;
      case 'products':
        return <ProductManager />;
      case 'reports':
        return <Reports />;
      case 'shift':
        return <ShiftManager />;
      case 'kitchen':
        return <KitchenDisplay />;
      case 'deliveries':
        return <DeliveryManager />;
      default:
        return <ProfessionalDashboard />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header Profissional */}
      <ProfessionalHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Profissional - sempre expandido */}
        <ProfessionalSidebar 
          currentView={currentView}
          onViewChange={handleNavigate}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNewOrder={() => setNewOrderDialogOpen(true)}
        />

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            {renderCurrentView()}
          </main>
        </div>
      </div>

      {/* Dialog de Novo Pedido */}
      <NewOrderDialog 
        isOpen={newOrderDialogOpen} 
        onClose={() => setNewOrderDialogOpen(false)} 
      />
    </div>
  );
};

export default Index;
