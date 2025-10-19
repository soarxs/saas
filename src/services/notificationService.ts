// Serviço de notificações push para PDV
import { getAppName } from '../config/app';
export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface NotificationSettings {
  enabled: boolean;
  newOrders: boolean;
  lowStock: boolean;
  salesUpdates: boolean;
  systemAlerts: boolean;
  sound: boolean;
  vibration: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private settings: NotificationSettings = {
    enabled: false,
    newOrders: true,
    lowStock: true,
    salesUpdates: false,
    systemAlerts: true,
    sound: true,
    vibration: true
  };

  constructor() {
    this.loadSettings();
    this.requestPermission();
  }

  // Carregar configurações
  private loadSettings() {
    const saved = localStorage.getItem('pdv-notification-settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  // Salvar configurações
  private saveSettings() {
    localStorage.setItem('pdv-notification-settings', JSON.stringify(this.settings));
  }

  // Solicitar permissão para notificações
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Notificações não suportadas neste navegador');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('[Notifications] Permissão negada pelo usuário');
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      this.settings.enabled = this.permission === 'granted';
      this.saveSettings();
      
      if (this.permission === 'granted') {
        console.log('[Notifications] Permissão concedida');
        this.showWelcomeNotification();
      }
      
      return this.permission === 'granted';
    } catch (error) {
      console.error('[Notifications] Erro ao solicitar permissão:', error);
      return false;
    }
  }

  // Verificar se notificações estão disponíveis
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Verificar se tem permissão
  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  // Obter configurações
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Atualizar configurações
  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Mostrar notificação
  async showNotification(data: NotificationData): Promise<void> {
    if (!this.settings.enabled || !this.hasPermission()) {
      console.log('[Notifications] Notificações desabilitadas ou sem permissão');
      return;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/favicon.ico',
        tag: data.tag,
        data: data.data,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        timestamp: data.timestamp || Date.now()
      });

      // Adicionar eventos
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      notification.onerror = (error) => {
        console.error('[Notifications] Erro na notificação:', error);
      };

      // Auto-close após 5 segundos (exceto se requireInteraction for true)
      if (!data.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      console.log('[Notifications] Notificação exibida:', data.title);
      
    } catch (error) {
      console.error('[Notifications] Erro ao exibir notificação:', error);
    }
  }

  // Notificação de novo pedido
  async notifyNewOrder(tableNumber: number, items: string[]): Promise<void> {
    if (!this.settings.newOrders) return;

    const tableName = tableNumber === 0 ? 'Balcão' : `Mesa ${tableNumber}`;
    const itemsText = items.length > 3 
      ? `${items.slice(0, 3).join(', ')} e mais ${items.length - 3}`
      : items.join(', ');

    await this.showNotification({
      title: '🛒 Novo Pedido',
      body: `${tableName}: ${itemsText}`,
      tag: `order-${tableNumber}`,
      data: { type: 'newOrder', tableNumber },
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'Ver Pedido',
          icon: '/favicon.ico'
        },
        {
          action: 'print',
          title: 'Imprimir',
          icon: '/favicon.ico'
        }
      ]
    });
  }

  // Notificação de estoque baixo
  async notifyLowStock(ingredients: string[]): Promise<void> {
    if (!this.settings.lowStock) return;

    const ingredientsText = ingredients.length > 2 
      ? `${ingredients.slice(0, 2).join(', ')} e mais ${ingredients.length - 2}`
      : ingredients.join(', ');

    await this.showNotification({
      title: '⚠️ Estoque Baixo',
      body: `Ingredientes com estoque baixo: ${ingredientsText}`,
      tag: 'low-stock',
      data: { type: 'lowStock', ingredients },
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'Ver Estoque',
          icon: '/favicon.ico'
        }
      ]
    });
  }

  // Notificação de venda concluída
  async notifySaleCompleted(total: number, paymentMethod: string): Promise<void> {
    if (!this.settings.salesUpdates) return;

    await this.showNotification({
      title: '💰 Venda Concluída',
      body: `R$ ${total.toFixed(2)} - ${paymentMethod}`,
      tag: 'sale-completed',
      data: { type: 'saleCompleted', total, paymentMethod }
    });
  }

  // Notificação de alerta do sistema
  async notifySystemAlert(title: string, message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    if (!this.settings.systemAlerts) return;

    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌'
    };

    await this.showNotification({
      title: `${icons[type]} ${title}`,
      body: message,
      tag: `system-${type}`,
      data: { type: 'systemAlert', alertType: type },
      requireInteraction: type === 'error'
    });
  }

  // Notificação de backup
  async notifyBackupCompleted(): Promise<void> {
    await this.showNotification({
      title: '💾 Backup Concluído',
      body: 'Seus dados foram salvos com sucesso',
      tag: 'backup-completed',
      data: { type: 'backupCompleted' }
    });
  }

  // Notificação de sincronização
  async notifySyncCompleted(operationsCount: number): Promise<void> {
    await this.showNotification({
      title: '🔄 Sincronização Concluída',
      body: `${operationsCount} operação(ões) sincronizada(s)`,
      tag: 'sync-completed',
      data: { type: 'syncCompleted', operationsCount }
    });
  }

  // Notificação de impressão
  async notifyPrintCompleted(jobId: string, type: 'receipt' | 'kitchen' | 'report'): Promise<void> {
    const types = {
      receipt: 'Recibo',
      kitchen: 'Pedido da Cozinha',
      report: 'Relatório'
    };

    await this.showNotification({
      title: '🖨️ Impressão Concluída',
      body: `${types[type]} impresso com sucesso`,
      tag: `print-${jobId}`,
      data: { type: 'printCompleted', jobId, printType: type }
    });
  }

  // Notificação de erro de impressão
  async notifyPrintError(jobId: string, error: string): Promise<void> {
    await this.showNotification({
      title: '❌ Erro na Impressão',
      body: `Job ${jobId}: ${error}`,
      tag: `print-error-${jobId}`,
      data: { type: 'printError', jobId, error },
      requireInteraction: true
    });
  }

  // Notificação de boas-vindas
  private showWelcomeNotification(): void {
    this.showNotification({
      title: `🎉 ${getAppName()}`,
      body: 'Notificações ativadas! Você receberá alertas importantes.',
      tag: 'welcome',
      data: { type: 'welcome' }
    });
  }

  // Limpar todas as notificações
  clearAllNotifications(): void {
    if ('serviceWorker' in navigator && 'getRegistrations' in navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.getNotifications().then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        });
      });
    }
  }

  // Obter estatísticas de notificações
  getStats() {
    return {
      supported: this.isSupported(),
      permission: this.permission,
      enabled: this.settings.enabled,
      settings: this.settings
    };
  }

  // Testar notificações
  async testNotification(): Promise<void> {
    await this.showNotification({
      title: '🧪 Teste de Notificação',
      body: 'Se você está vendo isso, as notificações estão funcionando!',
      tag: 'test',
      data: { type: 'test' }
    });
  }

  // Configurar notificações periódicas (para lembretes)
  setupPeriodicNotifications() {
    // Notificação de backup diário
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() === 0) {
        this.notifySystemAlert(
          'Backup Diário',
          'Lembre-se de fazer backup dos seus dados'
        );
      }
    }, 60000); // Verificar a cada minuto

    // Notificação de fechamento de turno
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 22 && now.getMinutes() === 0) {
        this.notifySystemAlert(
          'Fechamento de Turno',
          'Considere fechar o turno e gerar relatórios'
        );
      }
    }, 60000);
  }
}

// Instância singleton
export const notificationService = new NotificationService();



