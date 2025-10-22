# Sistema de Automação Comercial

Um sistema web moderno e responsivo para gerenciamento de lanchonetes, bares e restaurantes. Desenvolvido com React, TypeScript e TailwindCSS.

## 🚀 Funcionalidades

### Dashboard Principal
- **Grade de Mesas**: Visualização em tempo real do status das mesas (Livre, Ocupada, Aguardando, Pronto)
- **Estatísticas**: Total de mesas, pedidos pendentes, receita total e pedidos do dia
- **Filtros**: Busca por número da mesa ou cliente, filtro por status
- **Ações Rápidas**: Abrir mesa, fazer pedidos, processar pagamentos

### Sistema de Pedidos
- **Abertura de Mesa**: Registro de cliente e quantidade de pessoas
- **Lançamento de Produtos**: Interface tipo PDV com busca por nome, código ou categoria
- **Gestão de Pedidos**: Controle de status (Pendente, Preparando, Pronto, Entregue)
- **Cálculo Automático**: Subtotal e total atualizados em tempo real

### Sistema de Pagamentos
- **Múltiplas Formas**: Dinheiro, Cartão (Débito/Crédito), PIX, Vale Alimentação, Cheque, Cortesia
- **Cálculo de Troco**: Automático para pagamentos em dinheiro
- **Comprovante**: Geração automática após pagamento
- **Fechamento de Mesa**: Automático após pagamento confirmado

### Painel Administrativo
- **Gestão de Produtos**: CRUD completo com categorias, preços e estoque
- **Estatísticas**: Receita total, total de pedidos, mesas ativas
- **Controle de Usuários**: Interface para gestão de usuários (em desenvolvimento)

### Relatórios
- **Vendas por Categoria**: Gráfico de pizza com distribuição de vendas
- **Formas de Pagamento**: Gráfico de barras com métodos utilizados
- **Vendas por Hora**: Gráfico de linha com performance horária
- **Produtos Mais Vendidos**: Ranking dos produtos com maior saída
- **Exportação**: Funcionalidade para exportar relatórios

### Configurações
- **Estabelecimento**: Nome, moeda, taxas de serviço
- **Formas de Pagamento**: Ativação/desativação de métodos
- **Interface**: Tema claro/escuro, notificações, sons
- **Backup**: Importação/exportação de configurações

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Animações**: Framer Motion
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Armazenamento**: localStorage (protótipo)
- **Build**: Vite

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sistema-automacao-comercial
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npm run dev
```

4. **Acesse no navegador**
```
http://localhost:3000
```

## 🎯 Como Usar

### 1. Dashboard
- Visualize todas as mesas em uma grade colorida
- Clique em uma mesa livre para abri-la
- Clique em uma mesa ocupada para gerenciar pedidos

### 2. Abrir Mesa
- Digite o nome do cliente (opcional)
- Informe a quantidade de pessoas
- Confirme a abertura

### 3. Fazer Pedidos
- Use a busca para encontrar produtos
- Filtre por categoria
- Clique no botão "+" para adicionar produtos
- Acompanhe o status dos pedidos
- Atualize o status conforme o preparo

### 4. Processar Pagamento
- Selecione a forma de pagamento
- Informe o valor recebido
- Confirme o pagamento
- A mesa será fechada automaticamente

### 5. Relatórios
- Visualize estatísticas em tempo real
- Analise vendas por categoria e forma de pagamento
- Exporte dados quando necessário

## 🎨 Design e UX

- **Interface Limpa**: Design inspirado em sistemas modernos como Notion e Linear
- **Cores Intuitivas**: Verde (livre), Vermelho (ocupada), Amarelo (aguardando), Azul (pronto)
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Animações Suaves**: Transições e feedbacks visuais para melhor experiência
- **Atalhos de Teclado**: Suporte a teclas de atalho para operações rápidas

## 📱 Responsividade

O sistema foi desenvolvido com foco em responsividade:
- **Desktop**: Layout completo com sidebar e grade de mesas
- **Tablet**: Interface adaptada para telas médias
- **Mobile**: Layout otimizado para smartphones com navegação simplificada

## 🔧 Configurações

### Personalização
- Nome do estabelecimento
- Moeda (Real, Dólar, Euro)
- Taxa de serviço (percentual ou valor fixo)
- Formas de pagamento ativas

### Interface
- Tema claro/escuro
- Notificações habilitadas/desabilitadas
- Sons de notificação
- Fechamento automático de mesas

## 📊 Dados Mockados

O sistema inclui dados de exemplo para demonstração:
- **20 mesas** numeradas de 1 a 20
- **6 produtos** em diferentes categorias (Bebidas, Lanches, Acompanhamentos, Sobremesas)
- **Preços realistas** para produtos comuns de lanchonete

## 🚀 Próximas Funcionalidades

- [ ] Sistema de autenticação completo
- [ ] Integração com banco de dados real
- [ ] Impressão de comandas e comprovantes
- [ ] Sistema de turnos e caixa
- [ ] Relatórios avançados com filtros de data
- [ ] Gestão de estoque com alertas
- [ ] Sistema de promoções e descontos
- [ ] Integração com sistemas de pagamento
- [ ] App mobile nativo
- [ ] Backup automático na nuvem

## 🤝 Contribuição

Este é um projeto de demonstração. Para contribuições:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para dúvidas ou sugestões, abra uma issue no repositório ou entre em contato através dos canais disponíveis.

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de estabelecimentos comerciais**
