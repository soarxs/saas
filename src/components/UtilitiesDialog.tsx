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
    onClose();
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md legacy-dialog-content">
        <DialogHeader className="legacy-dialog-header">
          <DialogTitle className="text-white text-xl font-bold">Menu Opções</DialogTitle>
          <DialogDescription className="sr-only">
            Menu de opções do sistema, incluindo gerenciamento de turno e saída.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          <button 
            onClick={handleShiftToggle}
            className="legacy-button legacy-button-blue w-full text-lg py-3"
          >
            Abrir/ Fechar Turno(F2)
          </button>
          <button 
            onClick={handleReports}
            className="legacy-button legacy-button-gray w-full text-lg py-3"
          >
            Relátorios(F3)
          </button>
          <button 
            onClick={handleManagerMenu}
            className="legacy-button legacy-button-gray w-full text-lg py-3"
          >
            Menu Gerencial(F4)
          </button>
          <button 
            onClick={handleSettings}
            className="legacy-button legacy-button-gray w-full text-lg py-3"
          >
            Configurações(F5)
          </button>
          <button 
            onClick={handleExit}
            className="legacy-button legacy-button-red w-full text-lg py-3"
          >
            Sair(F6)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UtilitiesDialog;