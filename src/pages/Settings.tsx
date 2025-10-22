import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { 
  Settings as SettingsIcon, 
  Save,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sun,
  CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'

export function Settings() {
  const [settings, setSettings] = useState({
    establishmentName: 'Lanchonete Demo',
    taxRate: 10,
    serviceCharge: 0,
    currency: 'BRL',
    theme: 'light',
    notifications: true,
    soundEnabled: true,
    printerEnabled: false,
    autoCloseTables: false,
    requireCustomerName: false
  })

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'dinheiro', name: 'Dinheiro', enabled: true },
    { id: 'cartao_debito', name: 'Cartão Débito', enabled: true },
    { id: 'cartao_credito', name: 'Cartão Crédito', enabled: true },
    { id: 'pix', name: 'PIX', enabled: true },
    { id: 'vale_alimentacao', name: 'Vale Alimentação', enabled: false },
    { id: 'cheque', name: 'Cheque', enabled: false },
    { id: 'cortesia', name: 'Cortesia', enabled: true }
  ])

  const handleSaveSettings = () => {
    // Salvar configurações no localStorage
    localStorage.setItem('settings', JSON.stringify(settings))
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods))
    toast.success('Configurações salvas com sucesso!')
  }

  const handleResetSettings = () => {
    if (confirm('Tem certeza que deseja resetar todas as configurações?')) {
      localStorage.removeItem('settings')
      localStorage.removeItem('paymentMethods')
      toast.success('Configurações resetadas!')
      window.location.reload()
    }
  }

  const handleExportData = () => {
    const data = {
      settings,
      paymentMethods,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `configuracoes-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Configurações exportadas!')
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.settings) setSettings(data.settings)
        if (data.paymentMethods) setPaymentMethods(data.paymentMethods)
        toast.success('Configurações importadas com sucesso!')
      } catch (error) {
        toast.error('Erro ao importar configurações')
      }
    }
    reader.readAsText(file)
  }

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Personalize o sistema conforme suas necessidades</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="establishmentName">Nome do Estabelecimento</Label>
              <Input
                id="establishmentName"
                value={settings.establishmentName}
                onChange={(e) => setSettings(prev => ({ ...prev, establishmentName: e.target.value }))}
                placeholder="Nome da sua lanchonete"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="BRL">Real (R$)</option>
                <option value="USD">Dólar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Taxa de Serviço (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceCharge">Taxa de Serviço Fixa (R$)</Label>
              <Input
                id="serviceCharge"
                type="number"
                min="0"
                step="0.01"
                value={settings.serviceCharge}
                onChange={(e) => setSettings(prev => ({ ...prev, serviceCharge: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formas de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Formas de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  method.enabled 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                onClick={() => togglePaymentMethod(method.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{method.name}</span>
                  <Badge variant={method.enabled ? 'success' : 'secondary'}>
                    {method.enabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Interface e Aparência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <select
                id="theme"
                value={settings.theme}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações</Label>
                <p className="text-sm text-gray-500">Receber notificações de pedidos</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Sons</Label>
                <p className="text-sm text-gray-500">Reproduzir sons de notificação</p>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Fechamento Automático</Label>
                <p className="text-sm text-gray-500">Fechar mesas automaticamente após pagamento</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoCloseTables}
                onChange={(e) => setSettings(prev => ({ ...prev, autoCloseTables: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Nome Obrigatório</Label>
                <p className="text-sm text-gray-500">Exigir nome do cliente ao abrir mesa</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireCustomerName}
                onChange={(e) => setSettings(prev => ({ ...prev, requireCustomerName: e.target.checked }))}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup e Restauração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Backup e Restauração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Importar Configurações</h4>
                <p className="text-sm text-gray-500">Carregue um arquivo de configurações</p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Limpar Dados</h4>
                <p className="text-sm text-gray-500">Remover todos os dados do sistema</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
                    localStorage.clear()
                    toast.success('Dados limpos com sucesso!')
                    window.location.reload()
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Dados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
