import { useEffect } from 'react';
import { toast } from 'sonner';

interface BackupData {
  timestamp: number;
  sales: any[];
  tables: any[];
  shifts: any[];
  products: any[];
  users: any[];
}

export const useBackup = () => {
  // Backup automático diário
  useEffect(() => {
    const performBackup = () => {
      try {
        const backupData: BackupData = {
          timestamp: Date.now(),
          sales: JSON.parse(localStorage.getItem('sales-store') || '[]'),
          tables: JSON.parse(localStorage.getItem('table-store') || '[]'),
          shifts: JSON.parse(localStorage.getItem('shift-store') || '[]'),
          products: JSON.parse(localStorage.getItem('product-store') || '[]'),
          users: JSON.parse(localStorage.getItem('auth-store') || '[]')
        };

        // Salvar backup com timestamp
        const backupKey = `backup-${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(backupKey, JSON.stringify(backupData));

        // Manter apenas os últimos 7 backups
        const backupKeys = Object.keys(localStorage)
          .filter(key => key.startsWith('backup-'))
          .sort()
          .reverse();

        if (backupKeys.length > 7) {
          backupKeys.slice(7).forEach(key => {
            localStorage.removeItem(key);
          });
        }

        console.log('Backup automático realizado:', backupKey);
      } catch (error) {
        console.error('Erro no backup automático:', error);
      }
    };

    // Backup imediato
    performBackup();

    // Backup a cada 24 horas
    const interval = setInterval(performBackup, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Função para backup manual
  const createManualBackup = () => {
    try {
      const backupData: BackupData = {
        timestamp: Date.now(),
        sales: JSON.parse(localStorage.getItem('sales-store') || '[]'),
        tables: JSON.parse(localStorage.getItem('table-store') || '[]'),
        shifts: JSON.parse(localStorage.getItem('shift-store') || '[]'),
        products: JSON.parse(localStorage.getItem('product-store') || '[]'),
        users: JSON.parse(localStorage.getItem('auth-store') || '[]')
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupKey = `manual-backup-${timestamp}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));

      toast.success('Backup manual criado com sucesso!');
      return backupKey;
    } catch (error) {
      console.error('Erro no backup manual:', error);
      toast.error('Erro ao criar backup');
      return null;
    }
  };

  // Função para exportar backup
  const exportBackup = () => {
    try {
      const backupData: BackupData = {
        timestamp: Date.now(),
        sales: JSON.parse(localStorage.getItem('sales-store') || '[]'),
        tables: JSON.parse(localStorage.getItem('table-store') || '[]'),
        shifts: JSON.parse(localStorage.getItem('shift-store') || '[]'),
        products: JSON.parse(localStorage.getItem('product-store') || '[]'),
        users: JSON.parse(localStorage.getItem('auth-store') || '[]')
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-cia-do-lanche-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Backup exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar backup:', error);
      toast.error('Erro ao exportar backup');
    }
  };

  // Função para importar backup
  const importBackup = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backupData: BackupData = JSON.parse(e.target?.result as string);
          
          // Validar estrutura do backup
          if (!backupData.sales || !backupData.tables || !backupData.shifts || !backupData.products || !backupData.users) {
            throw new Error('Arquivo de backup inválido');
          }

          // Restaurar dados
          localStorage.setItem('sales-store', JSON.stringify(backupData.sales));
          localStorage.setItem('table-store', JSON.stringify(backupData.tables));
          localStorage.setItem('shift-store', JSON.stringify(backupData.shifts));
          localStorage.setItem('product-store', JSON.stringify(backupData.products));
          localStorage.setItem('auth-store', JSON.stringify(backupData.users));

          toast.success('Backup importado com sucesso! Recarregue a página.');
          resolve(backupData);
        } catch (error) {
          console.error('Erro ao importar backup:', error);
          toast.error('Erro ao importar backup');
          reject(error);
        }
      };

      reader.onerror = () => {
        toast.error('Erro ao ler arquivo');
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsText(file);
    });
  };

  // Função para listar backups disponíveis
  const getAvailableBackups = () => {
    return Object.keys(localStorage)
      .filter(key => key.startsWith('backup-') || key.startsWith('manual-backup-'))
      .map(key => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            return {
              key,
              timestamp: parsed.timestamp,
              date: new Date(parsed.timestamp).toLocaleString('pt-BR')
            };
          } catch {
            return null;
          }
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => b!.timestamp - a!.timestamp);
  };

  return {
    createManualBackup,
    exportBackup,
    importBackup,
    getAvailableBackups
  };
};





