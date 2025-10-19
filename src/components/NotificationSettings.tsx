import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { notificationService, NotificationSettings } from '../services/notificationService';
import { 
  Bell, BellOff, Volume2, VolumeX, Vibrate, 
  Smartphone, TestTube, CheckCircle, XCircle, 
  AlertTriangle, Info, Settings
} from 'lucide-react';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>(notificationService.getSettings());
  const [stats, setStats] = useState(notificationService.getStats());
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    updateStats();
  }, []);

  const updateStats = () => {
    setStats(notificationService.getStats());
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
    
    // Se desabilitando notificações, solicitar permissão novamente
    if (key === 'enabled' && value) {
      notificationService.requestPermission().then(granted => {
        if (!granted) {
          toast.error('Permissão para notificações negada');
          setSettings(prev => ({ ...prev, enabled: false }));
        } else {
          toast.success('Notificações ativadas!');
        }
        updateStats();
      });
    }
  };

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      toast.success('Permissão concedida!');
      setSettings(prev => ({ ...prev, enabled: true }));
    } else {
      toast.error('Permissão negada');
    }
    updateStats();
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await notificationService.testNotification();
      toast.success('Notificação de teste enviada!');
    } catch (error) {
      toast.error('Erro ao enviar notificação de teste');
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearNotifications = () => {
    notificationService.clearAllNotifications();
    toast.success('Notificações limpas');
  };

  const getPermissionStatus = () => {
    switch (stats.permission) {
      case 'granted':
        return { icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: 'Concedida', color: 'text-green-600' };
      case 'denied':
        return { icon: <XCircle className="w-4 h-4 text-red-600" />, text: 'Negada', color: 'text-red-600' };
      default:
        return { icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />, text: 'Não solicitada', color: 'text-yellow-600' };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configurações de Notificações</h1>
          <p className="text-muted-foreground">Gerencie suas notificações e alertas</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTestNotification}
            disabled={isTesting || !stats.enabled}
            className="flex items-center gap-2"
          >
            {isTesting ? (
              <TestTube className="w-4 h-4 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
            Testar
          </Button>
          <Button
            variant="outline"
            onClick={handleClearNotifications}
            className="flex items-center gap-2"
          >
            <BellOff className="w-4 h-4" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Status das Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={permissionStatus.color}>
                {permissionStatus.icon}
              </div>
              <div>
                <div className="font-medium">Permissão</div>
                <div className={`text-sm ${permissionStatus.color}`}>
                  {permissionStatus.text}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={stats.enabled ? 'text-green-600' : 'text-red-600'}>
                {stats.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-medium">Status</div>
                <div className={`text-sm ${stats.enabled ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.enabled ? 'Ativadas' : 'Desativadas'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={stats.supported ? 'text-green-600' : 'text-red-600'}>
                {stats.supported ? <Smartphone className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-medium">Suporte</div>
                <div className={`text-sm ${stats.supported ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.supported ? 'Disponível' : 'Não disponível'}
                </div>
              </div>
            </div>
          </div>

          {!stats.supported && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Seu navegador não suporta notificações push. Use Chrome, Firefox ou Safari para melhor experiência.
              </AlertDescription>
            </Alert>
          )}

          {stats.supported && stats.permission !== 'granted' && (
            <div className="mt-4">
              <Button onClick={handleRequestPermission} className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Solicitar Permissão
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações Principais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ativar/Desativar Notificações */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled" className="text-base font-medium">
                Notificações Gerais
              </Label>
              <p className="text-sm text-muted-foreground">
                Ativar ou desativar todas as notificações
              </p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
              disabled={!stats.supported || stats.permission !== 'granted'}
            />
          </div>

          <Separator />

          {/* Som */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound" className="text-base font-medium flex items-center gap-2">
                {settings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Som
              </Label>
              <p className="text-sm text-muted-foreground">
                Reproduzir som nas notificações
              </p>
            </div>
            <Switch
              id="sound"
              checked={settings.sound}
              onCheckedChange={(checked) => handleSettingChange('sound', checked)}
              disabled={!settings.enabled}
            />
          </div>

          {/* Vibração */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vibration" className="text-base font-medium flex items-center gap-2">
                <Vibrate className="w-4 h-4" />
                Vibração
              </Label>
              <p className="text-sm text-muted-foreground">
                Vibrar dispositivo nas notificações (mobile)
              </p>
            </div>
            <Switch
              id="vibration"
              checked={settings.vibration}
              onCheckedChange={(checked) => handleSettingChange('vibration', checked)}
              disabled={!settings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Tipos de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Novos Pedidos */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newOrders" className="text-base font-medium flex items-center gap-2">
                🛒 Novos Pedidos
                <Badge variant="outline" className="text-xs">Alta Prioridade</Badge>
              </Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando novos pedidos forem feitos
              </p>
            </div>
            <Switch
              id="newOrders"
              checked={settings.newOrders}
              onCheckedChange={(checked) => handleSettingChange('newOrders', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <Separator />

          {/* Estoque Baixo */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="lowStock" className="text-base font-medium flex items-center gap-2">
                ⚠️ Estoque Baixo
                <Badge variant="outline" className="text-xs">Importante</Badge>
              </Label>
              <p className="text-sm text-muted-foreground">
                Alertar quando ingredientes estiverem com estoque baixo
              </p>
            </div>
            <Switch
              id="lowStock"
              checked={settings.lowStock}
              onCheckedChange={(checked) => handleSettingChange('lowStock', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <Separator />

          {/* Atualizações de Vendas */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="salesUpdates" className="text-base font-medium flex items-center gap-2">
                💰 Vendas Concluídas
              </Label>
              <p className="text-sm text-muted-foreground">
                Notificar quando vendas forem finalizadas
              </p>
            </div>
            <Switch
              id="salesUpdates"
              checked={settings.salesUpdates}
              onCheckedChange={(checked) => handleSettingChange('salesUpdates', checked)}
              disabled={!settings.enabled}
            />
          </div>

          <Separator />

          {/* Alertas do Sistema */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="systemAlerts" className="text-base font-medium flex items-center gap-2">
                <Info className="w-4 h-4" />
                Alertas do Sistema
              </Label>
              <p className="text-sm text-muted-foreground">
                Notificações sobre backup, sincronização e outros eventos do sistema
              </p>
            </div>
            <Switch
              id="systemAlerts"
              checked={settings.systemAlerts}
              onCheckedChange={(checked) => handleSettingChange('systemAlerts', checked)}
              disabled={!settings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              • <strong>Novos Pedidos:</strong> Notificações de alta prioridade que requerem interação
            </p>
            <p>
              • <strong>Estoque Baixo:</strong> Alertas importantes sobre ingredientes com estoque insuficiente
            </p>
            <p>
              • <strong>Vendas Concluídas:</strong> Confirmações de vendas finalizadas
            </p>
            <p>
              • <strong>Alertas do Sistema:</strong> Notificações sobre backup, sincronização e eventos do sistema
            </p>
            <p>
              • <strong>Som e Vibração:</strong> Funcionam apenas em dispositivos compatíveis
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;





