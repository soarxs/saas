import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { printerService, PrinterConfig } from '../services/printerService';
import { 
  Printer, Plus, Edit, Trash2, TestTube, Settings, 
  Wifi, Bluetooth, Usb, Network, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, Play, Pause
} from 'lucide-react';
import { toast } from 'sonner';

const PrinterManager = () => {
  const [printers, setPrinters] = useState<PrinterConfig[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterConfig | null>(null);
  const [queueStatus, setQueueStatus] = useState(printerService.getQueueStatus());
  const [isTesting, setIsTesting] = useState<string | null>(null);

  // Formulário para nova impressora
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    type: 'thermal' as 'thermal' | 'laser' | 'inkjet',
    width: 80,
    connection: 'usb' as 'usb' | 'network' | 'bluetooth' | 'serial',
    address: '',
    port: 9100
  });

  // Carregar impressoras
  useEffect(() => {
    loadPrinters();
    updateQueueStatus();
    
    // Atualizar status da fila a cada 2 segundos
    const interval = setInterval(updateQueueStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadPrinters = () => {
    setPrinters(printerService.getPrinters());
  };

  const updateQueueStatus = () => {
    setQueueStatus(printerService.getQueueStatus());
  };

  const handleAddPrinter = () => {
    if (!newPrinter.name) {
      toast.error('Nome da impressora é obrigatório');
      return;
    }

    if (newPrinter.connection === 'network' && !newPrinter.address) {
      toast.error('Endereço IP é obrigatório para impressoras de rede');
      return;
    }

    printerService.addPrinter(newPrinter);
    loadPrinters();
    
    setNewPrinter({
      name: '',
      type: 'thermal',
      width: 80,
      connection: 'usb',
      address: '',
      port: 9100
    });
    setIsAddDialogOpen(false);
    
    toast.success('Impressora adicionada com sucesso!');
  };

  const handleRemovePrinter = (name: string) => {
    if (window.confirm(`Tem certeza que deseja remover a impressora "${name}"?`)) {
      printerService.removePrinter(name);
      loadPrinters();
      toast.success('Impressora removida com sucesso!');
    }
  };

  const handleSetDefault = (name: string) => {
    printerService.setDefaultPrinter(name);
    loadPrinters();
    toast.success(`Impressora "${name}" definida como padrão`);
  };

  const handleTestPrinter = async (printerName: string) => {
    setIsTesting(printerName);
    try {
      const jobId = await printerService.testPrinter(printerName);
      toast.success('Teste de impressão iniciado!');
      console.log('Job ID:', jobId);
    } catch (error) {
      toast.error(`Erro no teste: ${error}`);
    } finally {
      setIsTesting(null);
    }
  };

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'usb': return <Usb className="w-4 h-4" />;
      case 'network': return <Network className="w-4 h-4" />;
      case 'bluetooth': return <Bluetooth className="w-4 h-4" />;
      case 'serial': return <Settings className="w-4 h-4" />;
      default: return <Printer className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'thermal': return 'bg-blue-100 text-blue-800';
      case 'laser': return 'bg-green-100 text-green-800';
      case 'inkjet': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionColor = (connection: string) => {
    switch (connection) {
      case 'usb': return 'text-blue-600';
      case 'network': return 'text-green-600';
      case 'bluetooth': return 'text-purple-600';
      case 'serial': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Impressoras</h1>
          <p className="text-muted-foreground">Configure e gerencie suas impressoras</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Impressora
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Impressora</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="printerName">Nome da Impressora</Label>
                <Input
                  id="printerName"
                  value={newPrinter.name}
                  onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                  placeholder="Ex: Impressora Térmica 80mm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="printerType">Tipo</Label>
                  <Select value={newPrinter.type} onValueChange={(value: any) => setNewPrinter({ ...newPrinter, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thermal">Térmica</SelectItem>
                      <SelectItem value="laser">Laser</SelectItem>
                      <SelectItem value="inkjet">Jato de Tinta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="printerWidth">Largura (mm)</Label>
                  <Input
                    id="printerWidth"
                    type="number"
                    value={newPrinter.width}
                    onChange={(e) => setNewPrinter({ ...newPrinter, width: parseInt(e.target.value) || 80 })}
                    placeholder="80"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="printerConnection">Tipo de Conexão</Label>
                <Select value={newPrinter.connection} onValueChange={(value: any) => setNewPrinter({ ...newPrinter, connection: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usb">USB</SelectItem>
                    <SelectItem value="network">Rede (IP)</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth</SelectItem>
                    <SelectItem value="serial">Serial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newPrinter.connection === 'network' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="printerAddress">Endereço IP</Label>
                    <Input
                      id="printerAddress"
                      value={newPrinter.address}
                      onChange={(e) => setNewPrinter({ ...newPrinter, address: e.target.value })}
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="printerPort">Porta</Label>
                    <Input
                      id="printerPort"
                      type="number"
                      value={newPrinter.port}
                      onChange={(e) => setNewPrinter({ ...newPrinter, port: parseInt(e.target.value) || 9100 })}
                      placeholder="9100"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddPrinter} className="flex-1">
                  Adicionar
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status da Fila */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{queueStatus.total}</p>
              </div>
              <Printer className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{queueStatus.pending}</p>
              </div>
              <Pause className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Imprimindo</p>
                <p className="text-2xl font-bold text-orange-600">{queueStatus.printing}</p>
              </div>
              <Play className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{queueStatus.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Falharam</p>
                <p className="text-2xl font-bold text-red-600">{queueStatus.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Avisos */}
      {printers.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Nenhuma impressora configurada. Adicione uma impressora para começar a imprimir.
          </AlertDescription>
        </Alert>
      )}

      {queueStatus.failed > 0 && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {queueStatus.failed} job(s) de impressão falharam. Verifique as impressoras e tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Impressoras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Impressoras Configuradas ({printers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {printers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Printer className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma impressora configurada</p>
              <p className="text-sm">Adicione uma impressora para começar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Conexão</TableHead>
                    <TableHead>Largura</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {printers.map((printer) => (
                    <TableRow key={printer.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium">{printer.name}</div>
                            {printer.isDefault && (
                              <Badge variant="outline" className="text-xs">
                                Padrão
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(printer.type)}>
                          {printer.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={getConnectionColor(printer.connection)}>
                            {getConnectionIcon(printer.connection)}
                          </div>
                          <span className="capitalize">{printer.connection}</span>
                          {printer.address && (
                            <span className="text-sm text-gray-500">({printer.address})</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{printer.width}mm</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Ativa</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {!printer.isDefault && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetDefault(printer.name)}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestPrinter(printer.name)}
                            disabled={isTesting === printer.name}
                          >
                            {isTesting === printer.name ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <TestTube className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPrinter(printer)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemovePrinter(printer.name)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre tipos de conexão */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Conexão Suportados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Usb className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-medium">USB</h4>
                <p className="text-sm text-gray-600">
                  Conecta diretamente via cabo USB. Requer navegador com suporte a WebUSB.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Network className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium">Rede (IP)</h4>
                <p className="text-sm text-gray-600">
                  Conecta via rede local usando endereço IP. Ideal para impressoras compartilhadas.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Bluetooth className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h4 className="font-medium">Bluetooth</h4>
                <p className="text-sm text-gray-600">
                  Conecta via Bluetooth. Requer navegador com suporte a Web Bluetooth.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <h4 className="font-medium">Serial</h4>
                <p className="text-sm text-gray-600">
                  Conecta via porta serial. Requer navegador com suporte a Web Serial.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrinterManager;





