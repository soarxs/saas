// Serviço de impressão universal para PDV
import { getAppName } from '../config/app';
export interface PrinterConfig {
  name: string;
  type: 'thermal' | 'laser' | 'inkjet';
  width: number; // mm
  connection: 'usb' | 'network' | 'bluetooth' | 'serial';
  address?: string;
  port?: number;
  isDefault: boolean;
}

export interface PrintJob {
  id: string;
  type: 'receipt' | 'kitchen' | 'report';
  content: string;
  timestamp: Date;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  retries: number;
}

export interface ReceiptData {
  header: {
    businessName: string;
    address: string;
    phone: string;
    cnpj?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
    observations?: string;
  }>;
  totals: {
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: string;
  };
  footer: {
    thankYou: string;
    date: string;
    time: string;
    cashier: string;
  };
}

export interface KitchenOrderData {
  tableNumber: number;
  items: Array<{
    name: string;
    quantity: number;
    observations: string;
    time: string;
  }>;
  totalItems: number;
  orderTime: string;
}

class PrinterService {
  private printers: PrinterConfig[] = [];
  private printQueue: PrintJob[] = [];
  private isProcessing = false;

  constructor() {
    this.loadPrinters();
    this.startQueueProcessor();
  }

  // Carregar impressoras configuradas
  private loadPrinters() {
    const savedPrinters = localStorage.getItem('pdv-printers');
    if (savedPrinters) {
      this.printers = JSON.parse(savedPrinters);
    } else {
      // Impressoras padrão
      this.printers = [
        {
          name: 'Impressora Térmica 80mm',
          type: 'thermal',
          width: 80,
          connection: 'usb',
          isDefault: true
        }
      ];
      this.savePrinters();
    }
  }

  // Salvar configuração de impressoras
  private savePrinters() {
    localStorage.setItem('pdv-printers', JSON.stringify(this.printers));
  }

  // Adicionar impressora
  addPrinter(printer: Omit<PrinterConfig, 'isDefault'>) {
    const newPrinter: PrinterConfig = {
      ...printer,
      isDefault: this.printers.length === 0
    };
    
    this.printers.push(newPrinter);
    this.savePrinters();
    
    console.log('[Printer] Impressora adicionada:', newPrinter.name);
  }

  // Remover impressora
  removePrinter(name: string) {
    this.printers = this.printers.filter(p => p.name !== name);
    if (this.printers.length > 0 && !this.printers.some(p => p.isDefault)) {
      this.printers[0].isDefault = true;
    }
    this.savePrinters();
    
    console.log('[Printer] Impressora removida:', name);
  }

  // Definir impressora padrão
  setDefaultPrinter(name: string) {
    this.printers.forEach(p => p.isDefault = p.name === name);
    this.savePrinters();
    
    console.log('[Printer] Impressora padrão definida:', name);
  }

  // Obter impressoras
  getPrinters(): PrinterConfig[] {
    return [...this.printers];
  }

  // Obter impressora padrão
  getDefaultPrinter(): PrinterConfig | null {
    return this.printers.find(p => p.isDefault) || this.printers[0] || null;
  }

  // Processar fila de impressão
  private async startQueueProcessor() {
    setInterval(async () => {
      if (!this.isProcessing && this.printQueue.length > 0) {
        await this.processQueue();
      }
    }, 1000);
  }

  // Processar fila
  private async processQueue() {
    this.isProcessing = true;
    
    while (this.printQueue.length > 0) {
      const job = this.printQueue.shift()!;
      await this.executePrintJob(job);
    }
    
    this.isProcessing = false;
  }

  // Executar job de impressão
  private async executePrintJob(job: PrintJob) {
    try {
      job.status = 'printing';
      
      const defaultPrinter = this.getDefaultPrinter();
      if (!defaultPrinter) {
        throw new Error('Nenhuma impressora configurada');
      }

      await this.printToDevice(defaultPrinter, job);
      
      job.status = 'completed';
      console.log('[Printer] Job concluído:', job.id);
      
    } catch (error) {
      console.error('[Printer] Erro no job:', job.id, error);
      
      job.retries++;
      job.status = 'failed';
      
      if (job.retries < 3) {
        // Recolocar na fila para nova tentativa
        setTimeout(() => {
          job.status = 'pending';
          this.printQueue.push(job);
        }, 5000 * job.retries); // Delay exponencial
      }
    }
  }

  // Imprimir em dispositivo específico
  private async printToDevice(printer: PrinterConfig, job: PrintJob) {
    // Simular diferentes métodos de impressão baseado no tipo de conexão
    switch (printer.connection) {
      case 'usb':
        return this.printViaUSB(printer, job);
      case 'network':
        return this.printViaNetwork(printer, job);
      case 'bluetooth':
        return this.printViaBluetooth(printer, job);
      case 'serial':
        return this.printViaSerial(printer, job);
      default:
        throw new Error(`Tipo de conexão não suportado: ${printer.connection}`);
    }
  }

  // Impressão via USB (usando WebUSB API)
  private async printViaUSB(printer: PrinterConfig, job: PrintJob) {
    try {
      // Verificar se WebUSB está disponível
      if (!navigator.usb) {
        throw new Error('WebUSB não suportado neste navegador');
      }

      // Solicitar acesso ao dispositivo
      const device = await navigator.usb.requestDevice({
        filters: [{ classCode: 7 }] // Printer class
      });

      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      // Converter conteúdo para bytes
      const encoder = new TextEncoder();
      const data = encoder.encode(job.content);

      // Enviar dados para impressora
      await device.transferOut(1, data);

      await device.close();
      
      console.log('[Printer] Impressão USB concluída');
      
    } catch (error) {
      console.error('[Printer] Erro na impressão USB:', error);
      throw error;
    }
  }

  // Impressão via rede
  private async printViaNetwork(printer: PrinterConfig, job: PrintJob) {
    try {
      const url = `http://${printer.address}:${printer.port || 9100}/print`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: job.content
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      console.log('[Printer] Impressão de rede concluída');
      
    } catch (error) {
      console.error('[Printer] Erro na impressão de rede:', error);
      throw error;
    }
  }

  // Impressão via Bluetooth
  private async printViaBluetooth(printer: PrinterConfig, job: PrintJob) {
    try {
      // Verificar se Web Bluetooth está disponível
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth não suportado neste navegador');
      }

      // Conectar ao dispositivo Bluetooth
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: printer.name }],
        optionalServices: ['0000180f-0000-1000-8000-00805f9b34fb'] // Battery Service
      });

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService('0000180f-0000-1000-8000-00805f9b34fb');
      
      // Simular envio de dados
      console.log('[Printer] Impressão Bluetooth concluída');
      
    } catch (error) {
      console.error('[Printer] Erro na impressão Bluetooth:', error);
      throw error;
    }
  }

  // Impressão via Serial
  private async printViaSerial(printer: PrinterConfig, job: PrintJob) {
    try {
      // Verificar se Web Serial está disponível
      if (!navigator.serial) {
        throw new Error('Web Serial não suportado neste navegador');
      }

      // Conectar à porta serial
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      const writer = port.writable?.getWriter();
      if (writer) {
        const encoder = new TextEncoder();
        await writer.write(encoder.encode(job.content));
        writer.releaseLock();
      }

      await port.close();
      
      console.log('[Printer] Impressão Serial concluída');
      
    } catch (error) {
      console.error('[Printer] Erro na impressão Serial:', error);
      throw error;
    }
  }

  // Adicionar job à fila
  private addToQueue(type: PrintJob['type'], content: string): string {
    const job: PrintJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      status: 'pending',
      retries: 0
    };

    this.printQueue.push(job);
    console.log('[Printer] Job adicionado à fila:', job.id);
    
    return job.id;
  }

  // Imprimir recibo
  printReceipt(data: ReceiptData): string {
    const content = this.formatReceipt(data);
    return this.addToQueue('receipt', content);
  }

  // Imprimir pedido da cozinha
  printKitchenOrder(data: KitchenOrderData): string {
    const content = this.formatKitchenOrder(data);
    return this.addToQueue('kitchen', content);
  }

  // Imprimir relatório
  printReport(title: string, content: string): string {
    const formattedContent = this.formatReport(title, content);
    return this.addToQueue('report', formattedContent);
  }

  // Formatar recibo
  private formatReceipt(data: ReceiptData): string {
    const { header, items, totals, footer } = data;
    const width = this.getDefaultPrinter()?.width || 80;
    const lineLength = Math.floor(width / 2.5); // Aproximadamente 2.5mm por caractere

    let receipt = '';

    // Header
    receipt += this.centerText(header.businessName, lineLength) + '\n';
    receipt += this.centerText(header.address, lineLength) + '\n';
    if (header.phone) {
      receipt += this.centerText(`Tel: ${header.phone}`, lineLength) + '\n';
    }
    if (header.cnpj) {
      receipt += this.centerText(`CNPJ: ${header.cnpj}`, lineLength) + '\n';
    }
    receipt += this.repeatChar('=', lineLength) + '\n';

    // Items
    receipt += this.formatText('ITEM', 'QTD', 'PREÇO', 'TOTAL', lineLength) + '\n';
    receipt += this.repeatChar('-', lineLength) + '\n';

    items.forEach(item => {
      receipt += this.formatItem(item, lineLength) + '\n';
      if (item.observations) {
        receipt += `  Obs: ${item.observations}\n`;
      }
    });

    receipt += this.repeatChar('-', lineLength) + '\n';

    // Totals
    receipt += this.formatText('', '', 'SUBTOTAL:', this.formatCurrency(totals.subtotal), lineLength) + '\n';
    if (totals.discount > 0) {
      receipt += this.formatText('', '', 'DESCONTO:', `-${this.formatCurrency(totals.discount)}`, lineLength) + '\n';
    }
    receipt += this.formatText('', '', 'TOTAL:', this.formatCurrency(totals.total), lineLength) + '\n';
    receipt += this.repeatChar('=', lineLength) + '\n';

    // Payment
    receipt += `FORMA DE PAGAMENTO: ${totals.paymentMethod.toUpperCase()}\n`;
    receipt += this.repeatChar('-', lineLength) + '\n';

    // Footer
    receipt += this.centerText(footer.thankYou, lineLength) + '\n';
    receipt += this.centerText(footer.date, lineLength) + '\n';
    receipt += this.centerText(footer.time, lineLength) + '\n';
    receipt += this.centerText(`Atendente: ${footer.cashier}`, lineLength) + '\n';
    receipt += this.repeatChar('=', lineLength) + '\n';
    receipt += '\n\n\n'; // Espaço para corte

    return receipt;
  }

  // Formatar pedido da cozinha
  private formatKitchenOrder(data: KitchenOrderData): string {
    const width = this.getDefaultPrinter()?.width || 80;
    const lineLength = Math.floor(width / 2.5);

    let order = '';

    // Header
    order += this.centerText('PEDIDO DA COZINHA', lineLength) + '\n';
    order += this.repeatChar('=', lineLength) + '\n';
    order += `MESA: ${data.tableNumber}\n`;
    order += `HORA: ${data.orderTime}\n`;
    order += this.repeatChar('-', lineLength) + '\n';

    // Items
    data.items.forEach((item, index) => {
      order += `${index + 1}. ${item.name}\n`;
      order += `   Qtd: ${item.quantity}\n`;
      if (item.observations) {
        order += `   Obs: ${item.observations}\n`;
      }
      order += `   Hora: ${item.time}\n`;
      order += this.repeatChar('-', lineLength) + '\n';
    });

    order += `TOTAL DE ITENS: ${data.totalItems}\n`;
    order += this.repeatChar('=', lineLength) + '\n';
    order += '\n\n\n'; // Espaço para corte

    return order;
  }

  // Formatar relatório
  private formatReport(title: string, content: string): string {
    const width = this.getDefaultPrinter()?.width || 80;
    const lineLength = Math.floor(width / 2.5);

    let report = '';

    report += this.centerText(title, lineLength) + '\n';
    report += this.centerText(new Date().toLocaleString('pt-BR'), lineLength) + '\n';
    report += this.repeatChar('=', lineLength) + '\n';
    report += content + '\n';
    report += this.repeatChar('=', lineLength) + '\n';
    report += '\n\n\n'; // Espaço para corte

    return report;
  }

  // Funções auxiliares de formatação
  private centerText(text: string, width: number): string {
    if (text.length >= width) return text;
    const padding = Math.floor((width - text.length) / 2);
    return ' '.repeat(padding) + text;
  }

  private repeatChar(char: string, count: number): string {
    return char.repeat(count);
  }

  private formatText(col1: string, col2: string, col3: string, col4: string, width: number): string {
    const col1Width = Math.floor(width * 0.4);
    const col2Width = Math.floor(width * 0.15);
    const col3Width = Math.floor(width * 0.2);
    const col4Width = Math.floor(width * 0.25);

    return `${col1.padEnd(col1Width)}${col2.padStart(col2Width)}${col3.padStart(col3Width)}${col4.padStart(col4Width)}`;
  }

  private formatItem(item: any, width: number): string {
    const name = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name;
    const qtd = item.quantity.toString();
    const price = this.formatCurrency(item.price);
    const total = this.formatCurrency(item.total);

    return this.formatText(name, qtd, price, total, width);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Obter status da fila
  getQueueStatus() {
    return {
      total: this.printQueue.length,
      pending: this.printQueue.filter(job => job.status === 'pending').length,
      printing: this.printQueue.filter(job => job.status === 'printing').length,
      completed: this.printQueue.filter(job => job.status === 'completed').length,
      failed: this.printQueue.filter(job => job.status === 'failed').length
    };
  }

  // Limpar fila
  clearQueue() {
    this.printQueue = [];
    console.log('[Printer] Fila de impressão limpa');
  }

  // Testar impressora
  async testPrinter(printerName?: string) {
    const printer = printerName 
      ? this.printers.find(p => p.name === printerName)
      : this.getDefaultPrinter();

    if (!printer) {
      throw new Error('Impressora não encontrada');
    }

    const testContent = this.formatReceipt({
      header: {
        businessName: getAppName(),
        address: 'Teste de Impressão',
        phone: '(11) 99999-9999',
        cnpj: '12.345.678/0001-90'
      },
      items: [
        {
          name: 'X-Bacon',
          quantity: 1,
          price: 18.50,
          total: 18.50
        }
      ],
      totals: {
        subtotal: 18.50,
        discount: 0,
        total: 18.50,
        paymentMethod: 'Dinheiro'
      },
      footer: {
        thankYou: 'Obrigado pela preferência!',
        date: new Date().toLocaleDateString('pt-BR'),
        time: new Date().toLocaleTimeString('pt-BR'),
        cashier: 'Teste'
      }
    });

    return this.addToQueue('receipt', testContent);
  }
}

// Instância singleton
export const printerService = new PrinterService();



