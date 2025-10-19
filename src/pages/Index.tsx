
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
import { useKeyboardShortcuts, useShowShortcuts } from '../hooks/useKeyboardShortcuts';
import { toast } from 'sonner';

const Index = () => {
  const { currentUser, currentShift } = useStore();
  const [currentView, setCurrentView] = useState('sales');
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sempre aberto por padrão
  const showShortcuts = useShowShortcuts();
  
  // Inicializar sistema de backup automático
  useBackup();
  
  // Inicializar sistema offline
  useOffline();

  // Funções para atalhos de teclado
  const handleNewSale = () => {
    setCurrentView('sales');
    toast.success('Nova venda iniciada');
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
    allowedViews: ['sales', 'tables', 'dashboard', 'deliveries', 'shifts'], // Views onde atalhos gerais funcionam
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
        return <TableManager sidebarOpen={sidebarOpen} />;
      case 'sales-view':
        return <SalesView />;
      case 'products':
        return <ProductManager />;
      case 'reports':
        return <Reports />;
      case 'shift':
        return <ShiftManager />;
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
        />

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto">
            {renderCurrentView()}
          </main>
        </div>
      </div>

      {/* Status de Conexão */}
      <ConnectionStatus />
    </div>
  );
};

export default Index;
