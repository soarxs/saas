# 🚀 Sistema PDV - SaaS

Sistema de Ponto de Venda moderno e responsivo, desenvolvido com React, TypeScript e Vite.

## ✨ Características

- 🎯 Interface moderna e intuitiva
- ⚡ Performance otimizada com code splitting
- 📱 Design responsivo
- ⌨️ Atalhos de teclado para produtividade
- 🛒 Gestão completa de vendas
- 🍽️ Sistema de mesas
- 📊 Relatórios avançados
- 🔄 Funcionamento offline
- 🎨 UI/UX profissional

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
# Faça upload da pasta dist/ para Vercel
```

### Netlify
```bash
npm run build
# Faça upload da pasta dist/ para Netlify
```

### GitHub Pages
```bash
npm run build
# Configure o GitHub Actions para deploy automático
```

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Lint e correção
npm run lint
npm run lint:fix
```

## 📋 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run build:prod` - Build otimizado para produção
- `npm run preview` - Preview do build
- `npm run lint` - Verificar código
- `npm run lint:fix` - Corrigir problemas de lint
- `npm run deploy` - Build + Preview

## 🎯 Performance

- ✅ Code splitting implementado
- ✅ Bundle otimizado (< 1MB)
- ✅ Cache de assets configurado
- ✅ Dependências atualizadas
- ✅ Vulnerabilidades corrigidas

## 🔧 Tecnologias

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Radix UI, Tailwind CSS, Framer Motion
- **Estado**: Zustand
- **Roteamento**: React Router
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React
- **Build**: Vite 7

## 📱 Atalhos de Teclado

### Vendas
- `F2` - Confirmar venda
- `Enter` - Confirmar/Próximo
- `Esc` - Cancelar
- `1-5` - Formas de pagamento
- `+` - Adicionar ao carrinho
- `-` - Remover do carrinho
- `F12` - Limpar carrinho

### Mesas
- `Ctrl+01` a `Ctrl+20` - Abrir mesas rapidamente

## 🌐 Acesso

Após o deploy, acesse:
- **Desenvolvimento**: http://localhost:8080
- **Produção**: URL do seu domínio

## 📄 Licença

Projeto privado - Todos os direitos reservados.