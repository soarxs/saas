import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { 
  Printer, 
  Settings, 
  Building, 
  MapPin, 
  Phone,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { getPrintConfig, savePrintConfig, type PrintConfig } from '../lib/printService'
import toast from 'react-hot-toast'

export function PrintConfig() {
  const [config, setConfig] = useState<PrintConfig>(getPrintConfig())
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      savePrintConfig(config)
      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      const defaultConfig: PrintConfig = {
        companyName: 'CIA DO LANCHE',
        address: 'Rua das Flores, 123 - Centro',
        phone: '(11) 99999-9999',
        autoPrint: true,
        copies: 1,
        defaultPrinter: 'thermal'
      }
      setConfig(defaultConfig)
      toast.success('Configurações restauradas')
    }
  }

  const handleTestPrint = () => {
    // Simular impressão de teste
    const testContent = `
      <div style="text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 10px;">
        ${config.companyName}
      </div>
      <div style="text-align: center; margin-bottom: 10px;">
        IMPRESSÃO DE TESTE
      </div>
      <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
      <div>Data: ${new Date().toLocaleDateString('pt-BR')}</div>
      <div>Hora: ${new Date().toLocaleTimeString('pt-BR')}</div>
      <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
      <div style="text-align: center; font-weight: bold;">
        TESTE REALIZADO COM SUCESSO!
      </div>
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Teste de Impressão</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 5mm;
                width: 70mm;
              }
            }
          </style>
        </head>
        <body>
          ${testContent}
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações de Impressão</h1>
          <p className="text-gray-600">Configure as opções de impressão térmica</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleTestPrint}
            variant="outline"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Teste de Impressão
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
          >
            Restaurar Padrão
          </Button>
        </div>
      </div>

      {/* Configurações da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Dados da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="companyName"
                  value={config.companyName}
                  onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  className="pl-10"
                  placeholder="CIA DO LANCHE"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="pl-10"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="pl-10"
                placeholder="Rua das Flores, 123 - Centro"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Impressão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-green-600" />
            Opções de Impressão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="copies">Número de Vias</Label>
              <Input
                id="copies"
                type="number"
                min="1"
                max="5"
                value={config.copies}
                onChange={(e) => setConfig({ ...config, copies: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultPrinter">Impressora Padrão</Label>
              <select
                id="defaultPrinter"
                value={config.defaultPrinter}
                onChange={(e) => setConfig({ ...config, defaultPrinter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="thermal">Impressora Térmica</option>
                <option value="web">Impressão Web</option>
                <option value="pdf">Gerar PDF</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Impressão Automática</div>
              <div className="text-sm text-gray-500">
                Imprimir automaticamente após finalizar vendas
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setConfig({ ...config, autoPrint: !config.autoPrint })}
              className="p-0"
            >
              {config.autoPrint ? (
                <ToggleRight className="h-6 w-6 text-green-600" />
              ) : (
                <ToggleLeft className="h-6 w-6 text-gray-400" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Preview da Impressão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="bg-white p-4 rounded border" style={{ width: '280px', fontFamily: 'Courier New, monospace', fontSize: '12px' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
                {config.companyName}
              </div>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                COZINHA
              </div>
              <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
              <div>Data: {new Date().toLocaleDateString('pt-BR')}</div>
              <div>Hora: {new Date().toLocaleTimeString('pt-BR')}</div>
              <div>Pedido: #12345</div>
              <div>Mesa: 5</div>
              <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
              <div style={{ fontWeight: 'bold' }}>ITENS:</div>
              <div>2x X-Burger</div>
              <div>1x Coca-Cola 350ml</div>
              <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
              <div style={{ textAlign: 'center', fontWeight: 'bold' }}>=== FIM COMANDA ===</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Preview em escala reduzida (80mm de largura)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  )
}
