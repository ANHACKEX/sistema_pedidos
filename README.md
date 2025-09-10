# Gas Gestão+ 🚀

Sistema completo de gestão para empresas de gás desenvolvido com React + TypeScript + Vite.

## 📋 Funcionalidades

- ✅ **Dashboard** - Visão geral do negócio
- ✅ **Gestão de Estoque** - Controle de produtos e inventário
- ✅ **Gestão de Clientes** - Cadastro e histórico de clientes
- ✅ **Gestão de Vendas** - Controle completo de vendas
- ✅ **Gestão de Entregas** - Sistema de entregas e logística
- ✅ **Gestão Financeira** - Controle de receitas e despesas
- ✅ **Relatórios** - Análises e relatórios detalhados
- ✅ **Gestão de Usuários** - Controle de acesso e permissões
- ✅ **Configurações** - Personalização do sistema

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: Supabase (opcional)
- **PWA**: Service Worker

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <repository-url>
cd gas-gestao
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
```

5. **Acesse o sistema**
```
http://localhost:5173
```

## 🔐 Login Padrão

- **Email**: admin@gasgestao.com
- **Senha**: admin123

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── layout/         # Layout components
│   └── ui/             # UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Bibliotecas e configurações
├── pages/              # Páginas da aplicação
├── types/              # Definições de tipos TypeScript
└── utils/              # Funções utilitárias
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

## 🔧 Configuração do Supabase (Opcional)

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie a URL e a chave anônima
3. Configure no arquivo `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📱 PWA

O sistema funciona como Progressive Web App (PWA):
- Funciona offline
- Pode ser instalado no dispositivo
- Notificações push
- Cache inteligente

## 🎨 Personalização

### Temas
- Sistema configurado para modo claro
- Cores personalizáveis via Tailwind CSS

### Logo da Empresa
- Configure em Configurações > Dados da Empresa
- Suporte a PNG, JPG, GIF

## 📊 Funcionalidades Avançadas

### Relatórios
- Exportação para Excel/CSV
- Gráficos interativos
- Filtros avançados

### Notificações
- Estoque baixo
- Vendas realizadas
- Status de entregas

### Backup
- Exportação de dados
- Importação de backup
- Validação de integridade

## 🔒 Segurança

- Autenticação local
- Controle de permissões por função
- Validação de dados
- Sanitização de inputs

## 🐛 Solução de Problemas

### Página em branco
1. Verifique o console do navegador
2. Certifique-se que as dependências estão instaladas
3. Verifique se o arquivo `.env` está configurado

### Erro de Supabase
1. Configure as variáveis de ambiente
2. Ou use o sistema em modo local (padrão)

### Performance
1. Use `npm run build` para produção
2. Configure cache do navegador
3. Otimize imagens

## 📞 Suporte

Para suporte técnico:
- Verifique a documentação
- Consulte os logs do sistema
- Entre em contato com a equipe de desenvolvimento

## 📄 Licença

Este projeto está sob licença comercial. Todos os direitos reservados.

---

**Gas Gestão+** - Sistema de gestão empresarial desenvolvido pela Bolt 🚀