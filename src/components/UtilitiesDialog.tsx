import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

interface UtilitiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const UtilitiesDialog: React.FC<UtilitiesDialogProps> = ({
  isOpen,
  onClose
}) => {
  const { currentShift, openShift, closeShift } = useStore();

  // Atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // F2 - Abrir/Fechar Turno
      if (e.key === 'F2') {
        e.preventDefault();
        handleShiftToggle();
      }

      // F3 - Relatórios
      if (e.key === 'F3') {
        e.preventDefault();
        handleReports();
      }

      // F4 - Menu Gerencial
      if (e.key === 'F4') {
        e.preventDefault();
        handleManagerMenu();
      }

      // F5 - Configurações
      if (e.key === 'F5') {
        e.preventDefault();
        handleSettings();
      }

      // F6 - Sair
      if (e.key === 'F6') {
        e.preventDefault();
        handleExit();
      }

      // Escape - Fechar
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  // Função para abrir/fechar turno
  const handleShiftToggle = () => {
    if (currentShift?.isActive) {
      closeShift();
      toast.success('Turno fechado com sucesso');
    } else {
      openShift();
      toast.success('Turno aberto com sucesso');
    }
  };

  // Função para relatórios
  const handleReports = () => {
    toast.info('Funcionalidade de relatórios em desenvolvimento');
    onClose();
  };

  // Função para menu gerencial
  const handleManagerMenu = () => {
    toast.info('Menu gerencial em desenvolvimento');
    onClose();
  };

  // Função para configurações
  const handleSettings = () => {
    toast.info('Configurações em desenvolvimento');
    onClose();
  };

  // Função para sair
  const handleExit = () => {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      window.location.reload();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Menu Opções</DialogTitle>
          <DialogDescription className="sr-only">
            Menu de utilitários do sistema PDV
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 p-4">
          {/* Abrir/Fechar Turno */}
          <button 
            onClick={handleShiftToggle}
            className="w-full legacy-button legacy-button-green text-left"
          >
            <span className="font-bold">Abrir/ Fechar Turno(F2)</span>
            <div className="text-sm opacity-90">
              {currentShift?.isActive ? 'Turno Ativo' : 'Turno Fechado'}
            </div>
          </button>

          {/* Relatórios */}
          <button 
            onClick={handleReports}
            className="w-full legacy-button legacy-button-gray text-left"
          >
            <span className="font-bold">Relatórios(F3)</span>
            <div className="text-sm opacity-90">
              Relatórios de vendas e operações
            </div>
          </button>

          {/* Menu Gerencial */}
          <button 
            onClick={handleManagerMenu}
            className="w-full legacy-button legacy-button-gray text-left"
          >
            <span className="font-bold">Menu Gerencial(F4)</span>
            <div className="text-sm opacity-90">
              Funções administrativas
            </div>
          </button>

          {/* Configurações */}
          <button 
            onClick={handleSettings}
            className="w-full legacy-button legacy-button-gray text-left"
          >
            <span className="font-bold">Configurações(F5)</span>
            <div className="text-sm opacity-90">
              Configurações do sistema
            </div>
          </button>

          {/* Sair */}
          <button 
            onClick={handleExit}
            className="w-full legacy-button legacy-button-red text-left"
          >
            <span className="font-bold">Sair(F6)</span>
            <div className="text-sm opacity-90">
              Sair do sistema
            </div>
          </button>
        </div>

        {/* Informações de atalhos */}
        <div className="text-center text-sm text-gray-600 mt-4">
          Use F2-F6 para selecionar opções, Esc para fechar
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UtilitiesDialog;
