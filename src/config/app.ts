// Configurações da aplicação
export const appConfig = {
  name: 'Sistema PDV',
  version: '1.0.0',
  description: 'Sistema de automação comercial para lanchonetes, bares e restaurantes',
  
  // Configurações do estabelecimento
  establishment: {
    name: 'Lanchonete Demo',
    currency: 'BRL',
    taxRate: 10,
    serviceCharge: 0
  },
  
  // Configurações de desenvolvimento
  dev: {
    mockData: true,
    debugMode: true
  },
  
  // Configurações de interface
  ui: {
    theme: 'light',
    animations: true,
    sounds: true,
    notifications: true
  },
  
  // Configurações de mesas
  tables: {
    maxTables: 200,
    defaultStatus: 'livre'
  },
  
  // Configurações de produtos
  products: {
    maxStock: 999,
    minPrice: 0.01,
    maxPrice: 9999.99
  }
}

// Atalhos de teclado
export const keyboardShortcuts = {
  'F1': 'Ajuda',
  'F2': 'Adicionar Produto',
  'F3': 'Cancelar Item',
  'F4': 'Encerrar Mesa',
  'F5': 'Atualizar',
  'F9': 'Relatórios',
  'F10': 'Configurações',
  'Ctrl+K': 'Busca Global',
  'Ctrl+N': 'Nova Mesa',
  'Ctrl+P': 'Imprimir',
  'Escape': 'Fechar Modal'
}

// Status das mesas
export const tableStatus = {
  livre: {
    label: 'Livre',
    color: 'green',
    icon: '✓'
  },
  ocupada: {
    label: 'Ocupada',
    color: 'red',
    icon: '👥'
  },
  aguardando: {
    label: 'Aguardando',
    color: 'yellow',
    icon: '⏳'
  },
  pronto: {
    label: 'Pronto',
    color: 'blue',
    icon: '🔔'
  }
}

// Status dos pedidos
export const orderStatus = {
  pendente: {
    label: 'Pendente',
    color: 'yellow',
    icon: '⏳'
  },
  preparando: {
    label: 'Preparando',
    color: 'blue',
    icon: '👨‍🍳'
  },
  pronto: {
    label: 'Pronto',
    color: 'green',
    icon: '✅'
  },
  entregue: {
    label: 'Entregue',
    color: 'gray',
    icon: '📦'
  }
}

// Formas de pagamento
export const paymentMethods = {
  dinheiro: {
    label: 'Dinheiro',
    icon: '💵',
    color: 'green'
  },
  cartao_debito: {
    label: 'Cartão Débito',
    icon: '💳',
    color: 'blue'
  },
  cartao_credito: {
    label: 'Cartão Crédito',
    icon: '💳',
    color: 'blue'
  },
  pix: {
    label: 'PIX',
    icon: '📱',
    color: 'purple'
  },
  vale_alimentacao: {
    label: 'Vale Alimentação',
    icon: '🎫',
    color: 'orange'
  },
  cheque: {
    label: 'Cheque',
    icon: '📄',
    color: 'gray'
  },
  cortesia: {
    label: 'Cortesia',
    icon: '🎁',
    color: 'red'
  }
}
