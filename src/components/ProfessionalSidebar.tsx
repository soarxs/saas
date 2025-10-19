import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard,
  ShoppingCart, 
  Receipt,
  Truck,
  Package, 
  BarChart3, 
  Users,
  Clock,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ChefHat,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfessionalSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isCollapsed?: boolean; // Opcional, não será usado para auto-collapse
  onToggle?: () => void; // Opcional, apenas para mobile
  onNewOrder?: () => void; // Função para abrir novo pedido
}

const ProfessionalSidebar = ({ 
  currentView, 
  onViewChange, 
  isCollapsed = false, // Sempre expandido por padrão
  onToggle,
  onNewOrder
}: ProfessionalSidebarProps) => {
  const { currentUser, currentShift, setCurrentUser } = useStore();


  const handleLogout = () => {
    setCurrentUser(null);
    toast.success('Logout realizado com sucesso');
  };

  const navItems = [
    { 
      id: 'sales', 
      label: 'Mesas', 
      icon: ShoppingCart,
      description: 'Gerenciar mesas e pedidos'
    },
    { 
      id: 'deliveries', 
      label: 'Delivery', 
      icon: Truck,
      description: 'Gerenciar entregas'
    },
    { 
      id: 'kitchen', 
      label: 'Cozinha', 
      icon: ChefHat,
      description: 'Display da cozinha'
    },
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Visão geral do sistema'
    },
    { 
      id: 'sales-view', 
      label: 'Vendas', 
      icon: Receipt,
      description: 'Histórico de vendas'
    },
    ...(currentUser?.role === 'admin' ? [
      { 
        id: 'products', 
        label: 'Produtos', 
        icon: Package,
        description: 'Catálogo de produtos'
      },
      { 
        id: 'reports', 
        label: 'Relatórios', 
        icon: BarChart3,
        description: 'Análises e relatórios'
      },
    ] : []),
    { 
      id: 'shift', 
      label: 'Turno', 
      icon: Clock,
      description: 'Gerenciar turnos'
    },
  ];

  return (
    <>
      {/* Overlay para mobile - removido para evitar interferência */}

      {/* Sidebar - largura fixa, sempre expandido */}
      <div className="
        bg-white border-r border-gray-200 flex flex-col
        fixed lg:static inset-y-0 left-0 z-50
        w-64 lg:w-64
        shadow-lg lg:shadow-none
        h-full
      ">
        {/* Mobile Toggle Button */}
        <div className="lg:hidden p-2 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-green-600 hover:text-green-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Botão Novo Pedido */}
        {onNewOrder && (
          <div className="p-4 border-b border-gray-200">
            <Button
              onClick={onNewOrder}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Pedido
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full text-left p-3 rounded-xl flex items-center space-x-3
                    transition-all duration-300 group relative
                    ${isActive 
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-700 hover:shadow-sm'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-green-600'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm">{item.label}</p>
                    <p className={`text-xs truncate ${isActive ? 'text-green-100' : 'text-gray-400'}`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="space-y-3">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-700 hover:bg-white hover:shadow-sm transition-all duration-200 rounded-lg"
            >
              <Settings className="w-5 h-5" />
              <span className="ml-3 font-medium">Configurações</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 hover:shadow-sm transition-all duration-200 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3 font-medium">Sair</span>
            </Button>
            
            <div className="pt-2 text-center">
              <p className="text-xs text-gray-500 font-medium">Saas PDV v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfessionalSidebar;

