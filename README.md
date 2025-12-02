# 🔥 FireForce - PPBM

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

> Sistema de gestão de presença e acompanhamento para o Programa Bombeiro Mirim (PBM) do Corpo de Bombeiros Militar do Distrito Federal
---
### Link do software (https://ppbm.no-fluxo.com/login)
---
## 📋 Sobre o Projeto

O **FireForce - PPBM** é uma solução web desenvolvida para modernizar e centralizar a gestão do Programa Bombeiro Mirim (PBM), uma iniciativa social gratuita do CBMDF que atende crianças e adolescentes de 7 a 14 anos em 12 cidades do Distrito Federal.

### 🎯 Objetivos

- **Centralizar e Automatizar** o controle de frequência dos brigadinos
- **Melhorar a Análise de Dados** com relatórios e dashboards para gestores
- **Facilitar a Comunicação** entre equipe e responsáveis
- **Aprimorar o Acompanhamento** individualizado, especialmente para crianças neurodivergentes
- **Garantir Acessibilidade** e alta usabilidade para diferentes perfis de usuário

## 🚀 Tecnologias Utilizadas

### Frontend
- **[Astro](https://astro.build/)** - Framework web moderno focado em performance
- **TypeScript** - Tipagem estática para maior segurança no código
- **Starlight** - Sistema de documentação baseado em Astro

### Backend
- **Node.js + Express** - Servidor web robusto e escalável
- **TypeScript** - Desenvolvimento type-safe
- **RESTful API** - Arquitetura de comunicação padronizada

### Banco de Dados
- **[Supabase](https://supabase.com/)** - Plataforma backend-as-a-service
- **PostgreSQL** - Banco de dados relacional robusto
- **Row Level Security (RLS)** - Segurança a nível de linha

### DevOps & Infraestrutura
- **Docker** - Containerização para padronização de ambientes
- **Git** - Controle de versão distribuído
- **GitHub Actions** - CI/CD automatizado

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Astro)       │◄──►│   (Express)     │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • Interface     │    │ • API REST      │    │ • PostgreSQL    │
│ • Componentes   │    │ • Autenticação  │    │ • RLS Security  │
│ • Responsivo    │    │ • Validações    │    │ • Real-time     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 Módulos Funcionais

### 🔐 Acesso & Perfis
- Autenticação segura de usuários
- Controle de permissões por papel
- Operação multiunidade

### 👥 Cadastro & Dados do Aluno
- Cadastro completo de crianças
- Gestão de responsáveis
- Ficha médica e informações complementares
- Perfis neurodivergentes

### ✅ Presença & Justificativas
- Registro de presença, falta e atraso
- Sistema de justificativas com anexos
- Política diferenciada para faltas
- Autonomia docente para aprovação

### 📊 Relatórios & Análises
- Consultas avançadas por aluno/período
- Relatórios individuais e consolidados
- Dashboards com indicadores em tempo real
- Exportação em PDF e Excel

### 💬 Comunicação
- Sistema de notificações (WhatsApp, e-mail)
- Registro de advertências
- Templates personalizáveis

### 🧠 Acompanhamento Neurodivergente
- Planos de acompanhamento pedagógico
- Registro de relatórios dos responsáveis
- Histórico acessível para docentes

### 📝 Gestão de Conteúdo
- Cadastro de conteúdos institucionais
- Editor de texto com formatação
- Controle de versões

### ⚙️ Operação & Processo
- Sistema de auditoria completo
- Filtros e busca avançada
- Cadastro de turmas e sessões

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- Docker e Docker Compose
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/REQ-2025.2-T01-PPBM.git
cd REQ-2025.2-T01-PPBM
```

### 2. Instale as dependências
```bash
# Frontend (Documentação)
cd docs
npm install

# Backend (quando disponível)
cd ../backend
npm install
```

### 3. Configure as variáveis de ambiente
```bash
# Crie um arquivo .env na raiz do projeto
cp .env.example .env
# Edite as variáveis conforme necessário
```

### 4. Execute com Docker
```bash
# Suba todos os serviços
docker-compose up -d

# Ou execute individualmente
docker-compose up frontend
docker-compose up backend
docker-compose up database
```

### 5. Desenvolvimento local
```bash
# Frontend (Documentação)
cd docs
npm run dev

# Backend (quando disponível)
cd ../backend
npm run dev
```

### 6. Testes automatizados do Backend
```bash
cd backend
npm install          # necessário apenas na primeira vez
npm run test         # executa todos os testes
npm run test:watch   # reexecuta os testes ao salvar os arquivos
```

## 📚 Documentação

A documentação completa do projeto está disponível em:
- **Desenvolvimento**: `http://localhost:4321` (modo dev)
- **Produção**: [Link para documentação online]

### Estrutura da Documentação
```
docs/src/content/docs/
├── visao/           # Visão geral do projeto
├── requisitos/      # Especificação de requisitos
├── user-stories/    # Histórias de usuário
├── cronograma/      # Planejamento e entregas
├── evidencias/      # Evidências de desenvolvimento
└── atas/           # Atas de reuniões
```

## 👥 Equipe de Desenvolvimento

<div align="center">
  <img src="docs/src/content/docs/home/equipe.md" alt="Equipe FireForce" width="600" style="border-radius: 10px; margin: 20px 0;">
</div>

| Nome | Matrícula | Função | GitHub |
|------|-----------|--------|--------|
| **Vitor Marconi** | 222006202 | Gerente de Projeto \| Front-end | [@vitor-trancoso](https://github.com/vitor-trancoso) |
| **Julia Patricio** | 231027140 | Analista de Requisitos \| Back-end | [@juliapat18](https://github.com/juliapat18) |
| **Lucas Branco** | 222006946 | Desenvolvedor Back-end | [@lucasbbranco](https://github.com/lucasbbranco) |
| **Lucas Oliveira** | 202017684 | Desenvolvedor Front-end | [@LORliveira](https://github.com/LORliveira) |
| **Mariana Ribeiro** | 231026993 | Analista de QA \| Back-end | [@marianagonzaga0](https://github.com/marianagonzaga0) |
| **Philipe Morais** | 211062830 | UX/UI \| Full-stack | [@phmoraiis](https://github.com/phmoraiis) |

## 📅 Cronograma do Projeto

### Sprint 0 (31/08 – 14/09) ✅
- Preparação e alinhamento inicial
- Setup do ambiente de desenvolvimento

### Sprint 1 (14/09 – 29/09) ✅
- Estruturação e primeira iteração
- Protótipo inicial navegável

### Sprint 2 (01/10 – 13/10) 🔄
- Módulo de Cadastro e Acesso
- Primeira entrega funcional

### Sprint 3 (15/10 – 27/10) 📋
- Módulo de Presença e Justificativas
- Segunda entrega funcional

### Sprint 4 (29/10 – 10/11) 📋
- Módulos de Relatórios e Comunicação
- Terceira entrega funcional

### Sprint 5 (12/11 – 24/11) 📋
- Módulos Complementares e Integração
- Quarta entrega funcional

### Sprint 6 (26/11 – 01/12) 📋
- Entrega final do MVP
- Homologação e produção

## 🧪 Testes

```bash
# Executar testes unitários
npm run test

# Executar testes de integração
npm run test:integration

# Executar testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:coverage
```

## 🚀 Deploy

### Desenvolvimento
```bash
# Build da aplicação
npm run build

# Preview local
npm run preview
```

### Produção
```bash
# Deploy automatizado via GitHub Actions
git push origin main
```

## 📊 Métricas e Monitoramento

- **Disponibilidade**: 99,5% de uptime
- **Tempo de Resposta**: < 5 segundos para operações críticas
- **Cobertura de Testes**: > 80%
- **Performance**: Lighthouse Score > 90

## 🔒 Segurança

- **LGPD**: Conformidade com a Lei Geral de Proteção de Dados
- **Criptografia**: Dados transmitidos de forma segura
- **Autenticação**: Sistema robusto de login e permissões
- **Auditoria**: Trilha completa de operações sensíveis

## 🤝 Contribuição

Este é um projeto acadêmico desenvolvido para o Corpo de Bombeiros Militar do Distrito Federal. Para contribuições, entre em contato com a equipe de desenvolvimento.

## 📞 Contato

- **Projeto**: FireForce - PPBM
- **Instituição**: Universidade de Brasília (UnB)
- **Disciplina**: Requisitos de Software (2025.2)
- **Professor**: Dr. George Marsicano
- **Cliente**: Corpo de Bombeiros Militar do Distrito Federal (CBMDF)

## 🙏 Agradecimentos

- Corpo de Bombeiros Militar do Distrito Federal (CBMDF)
- Universidade de Brasília (UnB)
- Dr. George Marsicano - Professor Orientador
- Equipe de desenvolvimento FireForce

---

<div align="center">
  <p>Desenvolvido com ❤️ pela equipe FireForce</p>
  <p>Programa Bombeiro Mirim - CBMDF | 2025</p>
</div>
