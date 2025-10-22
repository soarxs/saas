// Sistema de impressão térmica para PDV
// Suporte para impressora térmica 80mm e impressão web

export interface PrintConfig {
  companyName: string
  address: string
  phone: string
  autoPrint: boolean
  copies: number
  defaultPrinter: string
}

export interface KitchenOrder {
  id: string
  tableNumber?: number
  customerName?: string
  items: Array<{
    quantity: number
    productName: string
    notes?: string
    modifications?: string[]
  }>
  createdAt: string
  orderType: 'mesa' | 'balcao' | 'delivery'
}

export interface CustomerReceipt {
  id: string
  tableNumber?: number
  customerName?: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  deliveryFee?: number
  total: number
  paymentMethod: string
  createdAt: string
  orderType: 'mesa' | 'balcao' | 'delivery'
  deliveryAddress?: string
}

export interface ShiftReport {
  shiftId: string
  startTime: string
  endTime: string
  operator: string
  initialCashFund: number
  salesByMethod: Record<string, number>
  totalWithdrawals: number
  totalAdditions: number
  expectedCash: number
  realCash: number
  difference: number
  totalSales: number
}

// Configurações padrão
const defaultConfig: PrintConfig = {
  companyName: 'CIA DO LANCHE',
  address: 'Rua das Flores, 123 - Centro',
  phone: '(11) 99999-9999',
  autoPrint: true,
  copies: 1,
  defaultPrinter: 'thermal'
}

// Carregar configurações do localStorage
export const getPrintConfig = (): PrintConfig => {
  const stored = localStorage.getItem('printConfig')
  return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig
}

// Salvar configurações
export const savePrintConfig = (config: PrintConfig): void => {
  localStorage.setItem('printConfig', JSON.stringify(config))
}

// Comandos ESC/POS para impressora térmica
export const ESC_POS_COMMANDS = {
  INIT: '\x1B\x40', // Inicializar impressora
  CUT: '\x1D\x56\x00', // Cortar papel
  FEED: '\x0A', // Avançar linha
  CENTER: '\x1B\x61\x01', // Centralizar texto
  LEFT: '\x1B\x61\x00', // Alinhar à esquerda
  BOLD_ON: '\x1B\x45\x01', // Negrito ligado
  BOLD_OFF: '\x1B\x45\x00', // Negrito desligado
  LARGE_ON: '\x1D\x21\x11', // Texto grande
  LARGE_OFF: '\x1D\x21\x00', // Texto normal
  DOUBLE_HEIGHT: '\x1B\x21\x10', // Altura dupla
  NORMAL: '\x1B\x21\x00', // Texto normal
  UNDERLINE_ON: '\x1B\x2D\x01', // Sublinhado ligado
  UNDERLINE_OFF: '\x1B\x2D\x00', // Sublinhado desligado
}

// Gerar comando ESC/POS para comanda de cozinha
export const generateKitchenOrderESC = (order: KitchenOrder): string => {
  const config = getPrintConfig()
  let command = ''
  
  // Inicializar
  command += ESC_POS_COMMANDS.INIT
  
  // Cabeçalho
  command += ESC_POS_COMMANDS.CENTER
  command += ESC_POS_COMMANDS.BOLD_ON
  command += ESC_POS_COMMANDS.LARGE_ON
  command += `${config.companyName}\n`
  command += 'COZINHA\n'
  command += ESC_POS_COMMANDS.LARGE_OFF
  command += ESC_POS_COMMANDS.BOLD_OFF
  
  // Data/Hora
  command += ESC_POS_COMMANDS.LEFT
  command += `Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}\n`
  command += `Hora: ${new Date(order.createdAt).toLocaleTimeString('pt-BR')}\n`
  command += `Pedido: ${order.id}\n`
  
  // Tipo de pedido
  if (order.orderType === 'mesa') {
    command += `Mesa: ${order.tableNumber}\n`
  } else if (order.orderType === 'delivery') {
    command += `Delivery - ${order.customerName}\n`
  } else {
    command += 'Balcão\n'
  }
  
  command += '--------------------------------\n'
  
  // Itens
  command += ESC_POS_COMMANDS.BOLD_ON
  command += 'ITENS:\n'
  command += ESC_POS_COMMANDS.BOLD_OFF
  
  order.items.forEach(item => {
    command += `${item.quantity}x ${item.productName}\n`
    if (item.notes) {
      command += `   Obs: ${item.notes}\n`
    }
    if (item.modifications && item.modifications.length > 0) {
      item.modifications.forEach(mod => {
        command += `   ${mod}\n`
      })
    }
  })
  
  command += '--------------------------------\n'
  command += ESC_POS_COMMANDS.CENTER
  command += ESC_POS_COMMANDS.BOLD_ON
  command += '=== FIM COMANDA ===\n'
  command += ESC_POS_COMMANDS.BOLD_OFF
  
  // Avançar e cortar
  command += ESC_POS_COMMANDS.FEED
  command += ESC_POS_COMMANDS.FEED
  command += ESC_POS_COMMANDS.CUT
  
  return command
}

// Gerar comando ESC/POS para conta do cliente
export const generateCustomerReceiptESC = (receipt: CustomerReceipt): string => {
  const config = getPrintConfig()
  let command = ''
  
  // Inicializar
  command += ESC_POS_COMMANDS.INIT
  
  // Cabeçalho
  command += ESC_POS_COMMANDS.CENTER
  command += ESC_POS_COMMANDS.BOLD_ON
  command += ESC_POS_COMMANDS.LARGE_ON
  command += `${config.companyName}\n`
  command += ESC_POS_COMMANDS.LARGE_OFF
  command += ESC_POS_COMMANDS.BOLD_OFF
  
  command += ESC_POS_COMMANDS.LEFT
  command += `${config.address}\n`
  command += `Tel: ${config.phone}\n`
  command += '--------------------------------\n'
  
  // Data/Hora
  command += `Data: ${new Date(receipt.createdAt).toLocaleDateString('pt-BR')}\n`
  command += `Hora: ${new Date(receipt.createdAt).toLocaleTimeString('pt-BR')}\n`
  
  // Tipo de pedido
  if (receipt.orderType === 'mesa') {
    command += `Mesa: ${receipt.tableNumber}\n`
  } else if (receipt.orderType === 'delivery') {
    command += `Delivery - ${receipt.customerName}\n`
    if (receipt.deliveryAddress) {
      command += `Endereço: ${receipt.deliveryAddress}\n`
    }
  } else {
    command += 'Balcão\n'
  }
  
  command += '--------------------------------\n'
  
  // Itens
  receipt.items.forEach(item => {
    const line = `${item.name} x${item.quantity}`
    const price = `R$ ${item.totalPrice.toFixed(2).replace('.', ',')}`
    const spaces = 32 - line.length - price.length
    command += `${line}${' '.repeat(Math.max(0, spaces))}${price}\n`
  })
  
  command += '--------------------------------\n'
  
  // Subtotal
  const subtotalLine = 'Subtotal:'
  const subtotalPrice = `R$ ${receipt.subtotal.toFixed(2).replace('.', ',')}`
  const subtotalSpaces = 32 - subtotalLine.length - subtotalPrice.length
  command += `${subtotalLine}${' '.repeat(Math.max(0, subtotalSpaces))}${subtotalPrice}\n`
  
  // Taxa de entrega
  if (receipt.deliveryFee && receipt.deliveryFee > 0) {
    const deliveryLine = 'Taxa de Entrega:'
    const deliveryPrice = `R$ ${receipt.deliveryFee.toFixed(2).replace('.', ',')}`
    const deliverySpaces = 32 - deliveryLine.length - deliveryPrice.length
    command += `${deliveryLine}${' '.repeat(Math.max(0, deliverySpaces))}${deliveryPrice}\n`
  }
  
  // Total
  command += ESC_POS_COMMANDS.BOLD_ON
  const totalLine = 'TOTAL:'
  const totalPrice = `R$ ${receipt.total.toFixed(2).replace('.', ',')}`
  const totalSpaces = 32 - totalLine.length - totalPrice.length
  command += `${totalLine}${' '.repeat(Math.max(0, totalSpaces))}${totalPrice}\n`
  command += ESC_POS_COMMANDS.BOLD_OFF
  
  command += '--------------------------------\n'
  command += `Forma de Pagamento: ${receipt.paymentMethod}\n`
  command += '--------------------------------\n'
  
  command += ESC_POS_COMMANDS.CENTER
  command += ESC_POS_COMMANDS.BOLD_ON
  command += 'OBRIGADO PELA PREFERÊNCIA!\n'
  command += ESC_POS_COMMANDS.BOLD_OFF
  
  // Avançar e cortar
  command += ESC_POS_COMMANDS.FEED
  command += ESC_POS_COMMANDS.FEED
  command += ESC_POS_COMMANDS.CUT
  
  return command
}

// Gerar comando ESC/POS para fechamento de caixa
export const generateShiftReportESC = (report: ShiftReport): string => {
  const config = getPrintConfig()
  let command = ''
  
  // Inicializar
  command += ESC_POS_COMMANDS.INIT
  
  // Cabeçalho
  command += ESC_POS_COMMANDS.CENTER
  command += ESC_POS_COMMANDS.BOLD_ON
  command += ESC_POS_COMMANDS.LARGE_ON
  command += 'RELATÓRIO DE FECHAMENTO\n'
  command += ESC_POS_COMMANDS.LARGE_OFF
  command += ESC_POS_COMMANDS.BOLD_OFF
  
  command += ESC_POS_COMMANDS.LEFT
  command += `${config.companyName}\n`
  command += '--------------------------------\n'
  
  // Informações do turno
  command += `Data: ${new Date(report.startTime).toLocaleDateString('pt-BR')}\n`
  command += `Abertura: ${new Date(report.startTime).toLocaleTimeString('pt-BR')}\n`
  command += `Fechamento: ${new Date(report.endTime).toLocaleTimeString('pt-BR')}\n`
  command += `Operador: ${report.operator}\n`
  command += '--------------------------------\n'
  
  // Fundo inicial
  const fundoLine = 'Fundo Inicial:'
  const fundoPrice = `R$ ${report.initialCashFund.toFixed(2).replace('.', ',')}`
  const fundoSpaces = 32 - fundoLine.length - fundoPrice.length
  command += `${fundoLine}${' '.repeat(Math.max(0, fundoSpaces))}${fundoPrice}\n`
  
  command += '--------------------------------\n'
  command += ESC_POS_COMMANDS.BOLD_ON
  command += 'VENDAS POR FORMA DE PAGAMENTO:\n'
  command += ESC_POS_COMMANDS.BOLD_OFF
  
  // Vendas por método
  Object.entries(report.salesByMethod).forEach(([method, amount]) => {
    const methodLine = `${method}:`
    const methodPrice = `R$ ${amount.toFixed(2).replace('.', ',')}`
    const methodSpaces = 32 - methodLine.length - methodPrice.length
    command += `${methodLine}${' '.repeat(Math.max(0, methodSpaces))}${methodPrice}\n`
  })
  
  command += '--------------------------------\n'
  
  // Sangrias e reforços
  const sangriasLine = 'Total Sangrias:'
  const sangriasPrice = `R$ ${report.totalWithdrawals.toFixed(2).replace('.', ',')}`
  const sangriasSpaces = 32 - sangriasLine.length - sangriasPrice.length
  command += `${sangriasLine}${' '.repeat(Math.max(0, sangriasSpaces))}${sangriasPrice}\n`
  
  const reforcosLine = 'Total Reforços:'
  const reforcosPrice = `R$ ${report.totalAdditions.toFixed(2).replace('.', ',')}`
  const reforcosSpaces = 32 - reforcosLine.length - reforcosPrice.length
  command += `${reforcosLine}${' '.repeat(Math.max(0, reforcosSpaces))}${reforcosPrice}\n`
  
  command += '--------------------------------\n'
  
  // Saldo esperado
  const esperadoLine = 'Saldo Esperado:'
  const esperadoPrice = `R$ ${report.expectedCash.toFixed(2).replace('.', ',')}`
  const esperadoSpaces = 32 - esperadoLine.length - esperadoPrice.length
  command += `${esperadoLine}${' '.repeat(Math.max(0, esperadoSpaces))}${esperadoPrice}\n`
  
  // Dinheiro real
  const realLine = 'Dinheiro Real:'
  const realPrice = `R$ ${report.realCash.toFixed(2).replace('.', ',')}`
  const realSpaces = 32 - realLine.length - realPrice.length
  command += `${realLine}${' '.repeat(Math.max(0, realSpaces))}${realPrice}\n`
  
  // Diferença
  const diffLine = 'Diferença:'
  const diffPrice = `R$ ${report.difference.toFixed(2).replace('.', ',')}`
  const diffSpaces = 32 - diffLine.length - diffPrice.length
  command += `${diffLine}${' '.repeat(Math.max(0, diffSpaces))}${diffPrice}\n`
  
  command += '--------------------------------\n'
  
  // Total de vendas
  command += ESC_POS_COMMANDS.BOLD_ON
  const totalLine = 'TOTAL VENDAS:'
  const totalPrice = `R$ ${report.totalSales.toFixed(2).replace('.', ',')}`
  const totalSpaces = 32 - totalLine.length - totalPrice.length
  command += `${totalLine}${' '.repeat(Math.max(0, totalSpaces))}${totalPrice}\n`
  command += ESC_POS_COMMANDS.BOLD_OFF
  
  // Avançar e cortar
  command += ESC_POS_COMMANDS.FEED
  command += ESC_POS_COMMANDS.FEED
  command += ESC_POS_COMMANDS.CUT
  
  return command
}

// Função para imprimir via web (window.print)
export const printWeb = (content: string, title: string = 'Impressão'): void => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
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
          .header {
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .large {
            font-size: 16px;
          }
          .bold {
            font-weight: bold;
          }
          .center {
            text-align: center;
          }
          .separator {
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .total {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 10px;
          }
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}

// Função principal para imprimir
export const printDocument = async (
  type: 'kitchen' | 'receipt' | 'shift',
  data: KitchenOrder | CustomerReceipt | ShiftReport
): Promise<void> => {
  const config = getPrintConfig()
  
  if (!config.autoPrint) {
    console.log('Impressão automática desabilitada')
    return
  }
  
  try {
    let escCommand = ''
    let webContent = ''
    let title = ''
    
    switch (type) {
      case 'kitchen':
        escCommand = generateKitchenOrderESC(data as KitchenOrder)
        webContent = generateKitchenOrderWeb(data as KitchenOrder)
        title = 'Comanda de Cozinha'
        break
      case 'receipt':
        escCommand = generateCustomerReceiptESC(data as CustomerReceipt)
        webContent = generateCustomerReceiptWeb(data as CustomerReceipt)
        title = 'Conta do Cliente'
        break
      case 'shift':
        escCommand = generateShiftReportESC(data as ShiftReport)
        webContent = generateShiftReportWeb(data as ShiftReport)
        title = 'Fechamento de Caixa'
        break
    }
    
    // Imprimir via web
    printWeb(webContent, title)
    
    // Log do comando ESC/POS para debug
    console.log('Comando ESC/POS:', escCommand)
    
  } catch (error) {
    console.error('Erro ao imprimir:', error)
  }
}

// Funções para gerar conteúdo web (HTML)
export const generateKitchenOrderWeb = (order: KitchenOrder): string => {
  const config = getPrintConfig()
  
  return `
    <div class="header large">${config.companyName}</div>
    <div class="header">COZINHA</div>
    <div class="separator"></div>
    <div>Data: ${new Date(order.createdAt).toLocaleDateString('pt-BR')}</div>
    <div>Hora: ${new Date(order.createdAt).toLocaleTimeString('pt-BR')}</div>
    <div>Pedido: ${order.id}</div>
    ${order.orderType === 'mesa' ? `<div>Mesa: ${order.tableNumber}</div>` : ''}
    ${order.orderType === 'delivery' ? `<div>Delivery - ${order.customerName}</div>` : ''}
    ${order.orderType === 'balcao' ? '<div>Balcão</div>' : ''}
    <div class="separator"></div>
    <div class="bold">ITENS:</div>
    ${order.items.map(item => `
      <div>${item.quantity}x ${item.productName}</div>
      ${item.notes ? `<div style="margin-left: 10px;">Obs: ${item.notes}</div>` : ''}
      ${item.modifications ? item.modifications.map(mod => `<div style="margin-left: 10px;">${mod}</div>`).join('') : ''}
    `).join('')}
    <div class="separator"></div>
    <div class="center bold">=== FIM COMANDA ===</div>
  `
}

export const generateCustomerReceiptWeb = (receipt: CustomerReceipt): string => {
  const config = getPrintConfig()
  
  return `
    <div class="header large">${config.companyName}</div>
    <div class="center">${config.address}</div>
    <div class="center">Tel: ${config.phone}</div>
    <div class="separator"></div>
    <div>Data: ${new Date(receipt.createdAt).toLocaleDateString('pt-BR')}</div>
    <div>Hora: ${new Date(receipt.createdAt).toLocaleTimeString('pt-BR')}</div>
    ${receipt.orderType === 'mesa' ? `<div>Mesa: ${receipt.tableNumber}</div>` : ''}
    ${receipt.orderType === 'delivery' ? `<div>Delivery - ${receipt.customerName}</div>` : ''}
    ${receipt.orderType === 'balcao' ? '<div>Balcão</div>' : ''}
    ${receipt.deliveryAddress ? `<div>Endereço: ${receipt.deliveryAddress}</div>` : ''}
    <div class="separator"></div>
    ${receipt.items.map(item => `
      <div class="item">
        <span>${item.name} x${item.quantity}</span>
        <span>R$ ${item.totalPrice.toFixed(2).replace('.', ',')}</span>
      </div>
    `).join('')}
    <div class="separator"></div>
    <div class="item">
      <span>Subtotal:</span>
      <span>R$ ${receipt.subtotal.toFixed(2).replace('.', ',')}</span>
    </div>
    ${receipt.deliveryFee && receipt.deliveryFee > 0 ? `
      <div class="item">
        <span>Taxa de Entrega:</span>
        <span>R$ ${receipt.deliveryFee.toFixed(2).replace('.', ',')}</span>
      </div>
    ` : ''}
    <div class="item total">
      <span>TOTAL:</span>
      <span>R$ ${receipt.total.toFixed(2).replace('.', ',')}</span>
    </div>
    <div class="separator"></div>
    <div>Forma de Pagamento: ${receipt.paymentMethod}</div>
    <div class="separator"></div>
    <div class="center bold">OBRIGADO PELA PREFERÊNCIA!</div>
  `
}

export const generateShiftReportWeb = (report: ShiftReport): string => {
  const config = getPrintConfig()
  
  return `
    <div class="header large">RELATÓRIO DE FECHAMENTO</div>
    <div class="center">${config.companyName}</div>
    <div class="separator"></div>
    <div>Data: ${new Date(report.startTime).toLocaleDateString('pt-BR')}</div>
    <div>Abertura: ${new Date(report.startTime).toLocaleTimeString('pt-BR')}</div>
    <div>Fechamento: ${new Date(report.endTime).toLocaleTimeString('pt-BR')}</div>
    <div>Operador: ${report.operator}</div>
    <div class="separator"></div>
    <div class="item">
      <span>Fundo Inicial:</span>
      <span>R$ ${report.initialCashFund.toFixed(2).replace('.', ',')}</span>
    </div>
    <div class="separator"></div>
    <div class="bold">VENDAS POR FORMA DE PAGAMENTO:</div>
    ${Object.entries(report.salesByMethod).map(([method, amount]) => `
      <div class="item">
        <span>${method}:</span>
        <span>R$ ${amount.toFixed(2).replace('.', ',')}</span>
      </div>
    `).join('')}
    <div class="separator"></div>
    <div class="item">
      <span>Total Sangrias:</span>
      <span>R$ ${report.totalWithdrawals.toFixed(2).replace('.', ',')}</span>
    </div>
    <div class="item">
      <span>Total Reforços:</span>
      <span>R$ ${report.totalAdditions.toFixed(2).replace('.', ',')}</span>
    </div>
    <div class="separator"></div>
    <div class="item">
      <span>Saldo Esperado:</span>
      <span>R$ ${report.expectedCash.toFixed(2).replace('.', ',')}</span>
    </div>
    <div class="item">
      <span>Dinheiro Real:</span>
      <span>R$ ${report.realCash.toFixed(2).replace('.', ',')}</span>
    </div>
    <div class="item">
      <span>Diferença:</span>
      <span>R$ ${report.difference.toFixed(2).replace('.', ',')}</span>
    </div>
    <div class="separator"></div>
    <div class="item total">
      <span>TOTAL VENDAS:</span>
      <span>R$ ${report.totalSales.toFixed(2).replace('.', ',')}</span>
    </div>
  `
}
