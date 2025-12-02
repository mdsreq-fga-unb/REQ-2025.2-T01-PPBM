# Plano de Implementação - Painel do Docente

Este documento descreve o plano de implementação completo para o painel do docente do sistema PPBM (Programa Bombeiro Mirim), baseado na análise do protótipo (`prototipodocente.html`), requisitos funcionais, backlog do produto e código existente.

---

## 📋 Resumo Executivo

### Status Atual

O painel do docente possui **8 páginas** implementadas com componentes Svelte funcionais:

| Página               | Componente                  | Status             |
| -------------------- | --------------------------- | ------------------ |
| `dashboard.astro`    | `DashboardDocente.svelte`   | ✅ Completo         |
| `controle.astro`     | `ControlePresencas.svelte`  | ✅ Completo         |
| `alunos.astro`       | `ConsultaAlunos.svelte`     | ✅ Completo         |
| `turmas.astro`       | `TurmasList.svelte`         | ✅ Completo         |
| `advertencias.astro` | `AdvertenciaForm.svelte`    | ✅ Completo         |
| `comunicacao.astro`  | `ComunicacaoPanel.svelte`   | ✅ Completo         |
| `relatorios.astro`   | `RelatorioGenerator.svelte` | ✅ Completo         |
| `conteudos.astro`    | -                           | 🟡 Estrutura básica |

### O que falta implementar

- `ConteudosList.svelte` - CRUD de conteúdos institucionais (RF-020, Could Have)
- Melhorias opcionais:
  - `AlunoTimeline.svelte` - Linha do tempo detalhada do aluno
  - `ProximasAulas.svelte` - Lista de aulas agendadas
  - Exportação PDF nativa com jsPDF (atualmente usa print do navegador)

---

## 📊 Mapeamento Requisitos x Funcionalidades

### Requisitos Funcionais Aplicáveis ao Docente

| RF     | Descrição                                  | Página               | Prioridade  | Status      |
| ------ | ------------------------------------------ | -------------------- | ----------- | ----------- |
| RF-004 | Gerenciar lançamento de presença           | `controle.astro`     | Must Have   | ✅ Completo  |
| RF-005 | Consultar histórico de presenças/faltas    | `alunos.astro`       | Must Have   | ✅ Completo  |
| RF-006 | Gerar relatório individual de frequência   | `relatorios.astro`   | Must Have   | ✅ Completo  |
| RF-007 | Exportar relatórios internos (PDF/Excel)   | `relatorios.astro`   | Must Have   | ✅ Completo  |
| RF-008 | Exibir dashboards de frequência            | `dashboard.astro`    | Must Have   | ✅ Completo  |
| RF-009 | Exibir histórico do aluno (linha do tempo) | `alunos.astro`       | Must Have   | 🟡 Parcial   |
| RF-011 | Registrar advertências de alunos           | `advertencias.astro` | Must Have   | ✅ Completo  |
| RF-012 | Enviar notificações (WhatsApp/email)       | `comunicacao.astro`  | Should Have | ✅ Completo  |
| RF-016 | Consultar turma (busca por alunos, CPF)    | `turmas.astro`       | Must Have   | ✅ Completo  |
| RF-017 | Registrar plano neurodivergente            | `alunos.astro`       | Should Have | 🟡 Exibição  |
| RF-019 | Geração de histórico de relatórios         | `relatorios.astro`   | Should Have | ✅ Completo  |
| RF-020 | Cadastrar conteúdos institucionais         | `conteudos.astro`    | Could Have  | 🔴 Não impl. |

---

## 🏗️ Arquitetura Implementada

### Componentes Svelte Criados

```
/components/docente/
├── DashboardDocente.svelte     ✅ Dashboard com métricas, ações rápidas, notificações
├── ControlePresencas.svelte    ✅ Lançamento de presenças com justificativas
├── ConsultaAlunos.svelte       ✅ Busca de alunos com estatísticas
├── TurmasList.svelte           ✅ Lista de turmas com busca e modal de alunos
├── AdvertenciaForm.svelte      ✅ Registro de advertências com histórico
├── ComunicacaoPanel.svelte     ✅ Envio de mensagens (WhatsApp, email)
├── RelatorioGenerator.svelte   ✅ Relatórios com exportação CSV e impressão
├── ConteudosList.svelte        🔴 Não implementado
└── ConteudoForm.svelte         🔴 Não implementado
```

### Navegação do Sidebar

```typescript
const navItems = [
    { href: "/docente/dashboard", icon: "📊", label: "Dashboard" },
    { href: "/docente/controle", icon: "📅", label: "Controle de Presenças" },
    { href: "/docente/alunos", icon: "🔍", label: "Consultar Alunos" },
    { href: "/docente/turmas", icon: "👥", label: "Turmas" },
    { href: "/docente/advertencias", icon: "⚠️", label: "Advertências" },
    { href: "/docente/conteudos", icon: "📚", label: "Conteúdos Institucionais" },
    { href: "/docente/comunicacao", icon: "💬", label: "Comunicação" },
    { href: "/docente/relatorios", icon: "📝", label: "Relatórios" },
];
```

### Endpoints Backend Utilizados

#### Implementados e funcionando:
- `GET /turmas/listar` - Lista turmas com paginação
- `GET /turmas/:id/alunos` - Alunos de uma turma
- `GET /alunos/listar` - Lista todos os alunos
- `GET /alunos/estatisticas/:id` - Estatísticas de frequência do aluno
- `GET /presencas/listar` - Lista presenças com filtros
- `POST /presencas/criar` - Criar presença
- `PUT /presencas/atualizar/:id` - Atualizar presença
- `GET /advertencias/listar` - Lista advertências
- `GET /advertencias/por-aluno/:id` - Advertências por aluno
- `POST /advertencias/criar` - Criar advertência
- `GET /notificacoes/listar` - Lista notificações
- `POST /notificacoes/criar` - Criar notificação

---

## 📑 Detalhamento por Página

### 1. Dashboard (`dashboard.astro`) ✅

**Componente:** `DashboardDocente.svelte`

**Funcionalidades implementadas:**
- Cards de métricas: Turmas Ativas, Alunos Matriculados, Taxa de Presença, Advertências
- Lista de turmas recentes com contagem de alunos
- Ações rápidas: Registrar Presenças, Nova Advertência, Enviar Mensagem, Gerar Relatório
- Notificações recentes com status de entrega
- Botão de atualização do dashboard

**Requisitos atendidos:** RF-008

---

### 2. Controle de Presenças (`controle.astro`) ✅

**Componente:** `ControlePresencas.svelte`

**Funcionalidades implementadas:**
- Seleção de turma e data
- Cards de estatísticas: Total, Presentes, Atrasos, Faltas
- Tabela de alunos com select de status (Presente/Atraso/Falta)
- Cores diferenciadas por status
- Botão de justificativa para faltas (abre JustificativaDialog)
- Badge de neurodivergente
- Salvamento em lote de presenças

**Requisitos atendidos:** RF-004, RF-005

---

### 3. Consultar Alunos (`alunos.astro`) ✅

**Componente:** `ConsultaAlunos.svelte`

**Funcionalidades implementadas:**
- Busca por nome ou CPF
- Filtro por turma
- DataTable com paginação
- Carregamento lazy de estatísticas por aluno
- Exibição de taxa de presença

**Requisitos atendidos:** RF-005, RF-009 (parcial), RF-016

---

### 4. Turmas (`turmas.astro`) ✅

**Componente:** `TurmasList.svelte`

**Funcionalidades implementadas:**
- Grid de cards de turmas
- Busca por nome e unidade
- Barra de ocupação visual (verde/amarelo/vermelho)
- Modal de detalhes com lista de alunos
- Paginação

**Requisitos atendidos:** RF-016

---

### 5. Advertências (`advertencias.astro`) ✅

**Componente:** `AdvertenciaForm.svelte`

**Funcionalidades implementadas:**
- Seleção de aluno
- Campo de descrição da advertência
- Confirmação antes de salvar (ConfirmDialog)
- Histórico de advertências do aluno selecionado
- Advertências são imutáveis (não podem ser editadas/excluídas)

**Requisitos atendidos:** RF-011

---

### 6. Comunicação (`comunicacao.astro`) ✅

**Componente:** `ComunicacaoPanel.svelte`

**Funcionalidades implementadas:**
- Tabs: Mensagens / Nova Mensagem
- Lista de notificações com filtros
- Formulário para nova mensagem
- Geração de link WhatsApp
- Placeholder para envio de email
- Exclusão de notificações

**Requisitos atendidos:** RF-012

---

### 7. Relatórios (`relatorios.astro`) ✅

**Componente:** `RelatorioGenerator.svelte`

**Funcionalidades implementadas:**
- Tipos: Individual, Por Turma, Geral
- Filtros: Turma, Aluno, Período (data início/fim)
- Preview do relatório com estatísticas
- Resumo geral para múltiplos alunos
- Exportação CSV (compatível com Excel)
- Impressão/PDF via navegador

**Requisitos atendidos:** RF-006, RF-007, RF-019

---

### 8. Conteúdos Institucionais (`conteudos.astro`) 🟡

**Status:** Estrutura básica - falta componente Svelte

**Pendente:**
- Criar `ConteudosList.svelte`
- CRUD de conteúdos
- Verificar/criar endpoints backend

**Prioridade:** Could Have (RF-020)

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Existentes e Utilizadas:

```sql
-- Advertências (já existe)
public.advertencias (
  id_advertencia,
  id_aluno,
  id_docente,
  descricao_advertencia,
  created_at
)

-- Presenças (já existe)
public.presencas (
  id_presenca,
  id_aluno,
  id_turma,
  status_presenca,
  data_time_presenca,
  id_justificativa
)

-- Justificativas (já existe)
public.justificativa (
  id_justificativa,
  id_aluno,
  descricao_justificativa,
  aprovado_por_docente_justificativa
)

-- Notificações (já existe)
public.notificacoes (
  id_notificacoes,
  id_responsavel,
  id_aluno,
  tipo_notifi,
  mensagem_notifi,
  entregue_notif
)

-- Conteúdos Institucionais (verificar se existe)
public.conteudos_institucionais
```

---

## ✅ Checklist de Implementação

### Infraestrutura
- [x] Tabelas no Supabase (advertencias, presencas, justificativa, notificacoes)
- [x] Endpoints backend funcionais
- [x] Helper `apiFetch` para autenticação

### Dashboard
- [x] Criar `DashboardDocente.svelte`
- [x] Métricas em tempo real
- [x] Ações rápidas
- [x] Notificações recentes

### Controle de Presenças
- [x] Criar `ControlePresencas.svelte`
- [x] Integração com `apiFetch`
- [x] Suporte a justificativas
- [x] Validações e feedback

### Consulta de Alunos
- [x] Criar página `alunos.astro`
- [x] Integrar `ConsultaAlunos.svelte`
- [x] Busca e filtros
- [x] Estatísticas por aluno

### Turmas
- [x] Criar `TurmasList.svelte`
- [x] Busca por nome/unidade
- [x] Modal de alunos
- [x] Paginação

### Advertências
- [x] Criar página `advertencias.astro`
- [x] Criar `AdvertenciaForm.svelte`
- [x] Histórico por aluno
- [x] Confirmação de registro

### Comunicação
- [x] Criar página `comunicacao.astro`
- [x] Criar `ComunicacaoPanel.svelte`
- [x] Envio via WhatsApp
- [x] Lista de notificações

### Relatórios
- [x] Criar `RelatorioGenerator.svelte`
- [x] Tipos: Individual/Turma/Geral
- [x] Exportação CSV
- [x] Impressão/PDF

### Conteúdos (Pendente)
- [ ] Criar `ConteudosList.svelte`
- [ ] Criar `ConteudoForm.svelte`
- [ ] Verificar endpoints CRUD

---

## 📝 Notas Técnicas

### Padrão de Componente Svelte (Atualizado)

Todos os componentes seguem o padrão com `apiFetch`:

```typescript
import { apiFetch } from "../../lib/api";

async function loadData() {
  try {
    loading = true;
    const response = await apiFetch<{ data: DataType[] }>("/endpoint");
    
    if (!response.success) {
      throw new Error(response.error || "Erro ao carregar");
    }
    
    data = response.data?.data || [];
  } catch (err) {
    console.error("Erro:", err);
    displayToast("Erro ao carregar dados", "error");
  } finally {
    loading = false;
  }
}
```

### Componentes UI Reutilizados

- `Toast.svelte` - Notificações
- `ConfirmDialog.svelte` - Confirmações
- `FormSelect.svelte` - Selects padronizados
- `DataTable.svelte` - Tabelas com paginação
- `JustificativaDialog.svelte` - Modal de justificativas

---

## 📚 Referências

- **Protótipo**: `/docs/prototipo/prototipodocente.html`
- **Requisitos**: `/docs/src/content/docs/visao/requisitos.md`
- **Backlog**: `/docs/src/content/docs/visao/backlog.md`
- **Componentes UI**: `/app/apps/frontend/src/components/ui/`
- **Componentes Docente**: `/app/apps/frontend/src/components/docente/`
- **Backend Controllers**: `/app/apps/backend/src/controllers/`
- **API Helper**: `/app/apps/frontend/src/lib/api.ts`

---

*Documento criado em: Novembro 2024*
*Última atualização: 2 de Dezembro de 2024*
