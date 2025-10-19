import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Settings, 
  User, 
  Clock, 
  Wifi, 
  WifiOff,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { getAppName } from '../config/app';

interface ProfessionalHeaderProps {
  onToggleSidebar?: () => void;
}

const ProfessionalHeader = ({ onToggleSidebar }: ProfessionalHeaderProps) => {
  const { currentUser, currentShift, setCurrentUser } = useStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleLogout = () => {
    setCurrentUser(null);
    toast.success('Logout realizado com sucesso');
  };

  const handleRefresh = () => {
    window.location.reload();
    toast.success('Sistema atualizado');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-200 group"
              onClick={handleRefresh}
              title="Recarregar página"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-shadow duration-200">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200">{getAppName()}</h1>
              </div>
            </div>
          </div>

          {/* Status e Informações */}
          <div className="flex items-center space-x-6">
            {/* Status de Conexão */}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Status do Turno */}
            {currentShift && (
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <Badge 
                  variant={currentShift.isActive ? "default" : "secondary"}
                  className={currentShift.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                >
                  {currentShift.isActive ? 'Turno Ativo' : 'Turno Fechado'}
                </Badge>
              </div>
            )}

            {/* Usuário Atual */}
            {currentUser && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-600 capitalize font-medium">{currentUser.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                title="Atualizar sistema"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200 relative"
                title="Notificações"
              >
                <Bell className="w-5 h-5" />
                {/* Badge de notificação - pode ser condicional baseado em notificações */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center text-[10px] font-bold">
                  3
                </span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                title="Sair do sistema"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalHeader;

