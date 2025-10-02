---
title: Cronograma e Entregas
description: Cronograma detalhado do projeto PPBM com marcos e entregas planejadas.
---

O cronograma abaixo apresenta a distribuição das atividades do projeto ao longo das sprints, com os objetivos principais, entregas esperadas e os momentos de validação com o cliente.

---

## Sprint 0 (31/08 – 14/09)

![Encerrada](https://img.shields.io/badge/Status-Encerrada-blue)

**Objetivo:** Preparação e alinhamento inicial
**Entregas:**
- Sprint Planning inicial: levantamento de dores/demandas e validação da necessidade do software
- Formação da equipe Scrum XP e definição de papéis
- Definição das tecnologias (SvelteKit, Express, Supabase, Astro.build, Docker)
- Setup do ambiente de desenvolvimento e GitPages
- Elicitação parcial dos requisitos para melhor identificação do escopo
- Organização inicial do Product Backlog com priorização baseada em módulos funcionais
- Setup inicial do quadro Kanban para acompanhamento das tarefas

**Validação:** Feedback sobre viabilidade e aprovação da proposta inicial  

---

## Sprint 1 (14/09 – 29/09)

![Encerrada](https://img.shields.io/badge/Status-Encerrada-blue)

**Objetivo:** Estruturação e primeira iteração
**Entregas:**
- Estudo das stacks definidas
- Mapeamento de módulos (contexto, restrições, features, dependências, fluxos)
- Protótipo inicial navegável
- Definição de DoR e DoD
- Identificação das primeiras User Stories
- Setup de Pair Programming e TDD
- Elicitação de Requisitos
- Organização e priorização do Product Backlog baseada em módulos funcionais
- Implementação do quadro Kanban para acompanhamento de tarefas por módulo
- Refinamento de requisitos funcionais e não funcionais
- Criação de User Stories detalhadas por módulo

**Validação:** Revisão dos módulos e validação do protótipo inicial  

---

## Sprint 2 (01/10 – 13/10)

![Em Progresso](https://img.shields.io/badge/Status-Em%20Progresso-green)

**Objetivo:** Primeira entrega funcional - Módulo de Cadastro e Acesso
**Entregas:**
- **Módulo: Acesso & Perfis (parte inicial)**
  - US-017 – Autenticação e perfis.
  - US-018 – Controle de permissões.
- **Módulo: Cadastro & Dados do Aluno**
  - US-001 – Cadastrar criança.
  - US-002 – Gerenciar responsáveis.
  - US-003 – Registrar ficha médica.
  - US-004 – Diferenciar perfil neurodivergente.
  - US-005 – Cadastrar informações complementares do aluno
  - US-006 – Exportar documentos de comprovante
- **Módulo: Operação & Processo (parte inicial)**
  - US-029 – Cadastrar turmas e sessões.
- **Organização e Atualização**
  - Refinamento de requistos e US de acordo com a Sprint review.
  - Atualizar o backlog do Kanban com refinamento dos requisitos e US.
  - Priorização de acordo utilizando a técnica MosCow.
  - Atulização o cronograma de acordo com a priorização do backlog.
  - Criar a sessão de evidências no pages.
  - Criar a sessão de atas de reunião no pages.
  - Subir e linkar as atas de reunião com as evidências.
  - Redesign do prototipo de acordo com o refinamento de requisitos e US.
  - Atulizar o documento de visão de acordo com as entregas da Unidade 02.
      - Requisitos de software e suas subcaracterísticas.
      - DoR e DoD.
      - Backlog do produto e suas subcaracterísticas.
      - MVP.

**Validação:** Demonstração de cadastro completo e validação do fluxo de autenticação.


---

## Sprint 3 (15/10 – 27/10)
**Objetivo:** Segunda entrega funcional - Módulo de Presença e Justificativas
**Entregas:**
- **Módulo: Presença & Justificativas**
  - Registro completo de presença, falta e atraso por turma/sessão
  - Sistema de justificativas com motivos e anexos obrigatórios
  - Política diferenciada para faltas justificadas vs não justificadas
  - Autonomia docente para aprovar/rejeitar justificativas
  - Controle de lotação por turma (30 alunos máximo)
  - Sistema de auditoria para alterações de presença
- **Módulo: Operação & Processo (parte 2)**
  - Sistema de auditoria para operações de presença e justificativas
  - Filtros básicos para consulta de presenças por período e turma
- Testes unitários com TDD para o módulo de presença
- Refinamento das User Stories relacionadas ao módulo
- Kanban atualizado com tarefas do módulo de presença

**Validação:** Demonstração completa do sistema de presença e justificativas  

---

## Sprint 4 (29/10 – 10/11)
**Objetivo:** Terceira entrega funcional - Módulos de Relatórios e Comunicação
**Entregas:**
- **Módulo: Relatórios & Análises**
  - Consultas avançadas por aluno, período e unidade
  - Relatórios individuais de frequência com gráficos visuais
  - Relatórios consolidados por turma/unidade com comparativos
  - Exportação em PDF e Excel (CSV/XLSX) com formatação adequada
  - Dashboards com indicadores em tempo real e alertas visuais
  - Histórico completo do aluno em linha do tempo
  - Relatórios oficiais padronizados com identidade do CBMDF
- **Módulo: Comunicação**
  - Sistema de notificações completo (WhatsApp, e-mail, plataforma)
  - Registro de advertências e comunicações oficiais
  - Templates personalizáveis para notificações
  - Área dedicada para conteúdos institucionais
- **Módulo: Operação & Processo (parte 3)**
  - Busca avançada e filtros combináveis para relatórios
  - Sistema de auditoria para operações de relatórios e comunicação
  - Filtros em tempo real para dashboards e consultas
- Testes unitários com TDD para módulos de relatórios e comunicação
- Refinamento das User Stories relacionadas aos módulos
- Kanban atualizado com tarefas dos módulos de relatórios e comunicação

**Validação:** Demonstração completa dos sistemas de relatórios e comunicação  

---

## Sprint 5 (12/11 – 24/11)
**Objetivo:** Quarta entrega funcional - Módulos Complementares e Integração
**Entregas:**
- **Módulo: Acompanhamento Neurodivergente**
  - Plano de acompanhamento pedagógico completo
  - Registro de relatórios orais/documentais dos responsáveis
  - Histórico acessível para docentes e gestores
- **Módulo: Gestão de Conteúdo**
  - Cadastro e exibição de conteúdos institucionais
  - Editor de texto com formatação e anexos
  - Controle de versões e categorização
- **Módulo: Operação & Processo (finalização)**
  - Integração completa de filtros e busca em todos os módulos
  - Sistema completo de auditoria para todas as operações sensíveis
  - Busca avançada integrada e filtros combináveis otimizados
  - Histórico de buscas recentes e filtros salvos
- **Módulo: Acesso & Perfis (finalização)**
  - Controle completo de permissões por papel
  - Recuperação de senha e configurações de segurança
  - Primeiro acesso com alteração obrigatória de senha
- Integração completa de todos os módulos
- Testes ponta a ponta (E2E) para validação da integração
- Ajustes a partir de feedbacks anteriores
- Refinamento final das User Stories
- Kanban final com todas as tarefas concluídas

**Validação:** Cliente valida o sistema integrado (MVP funcional completo)  

---

## Sprint 6 (26/11 – 01/12)
**Objetivo:** Entrega final do MVP  
**Entregas:**
- Correções finais e otimização  
- Testes de aceitação (UAT)  
- Entrega do MVP em produção  
- Planejamento de próximos incrementos  
- Documento consolidado; MVP em produção  
- Preparação e apresentação final  

**Validação:** Cliente valida e homologa o MVP

## Histórico de Versão

| Data       | Versão | Descrição                                   | Autor(es)       | Revisor(es) |
| ---------- | ------ | ------------------------------------------- | --------------- | ----------- |
| 15/09/2025 | 1.0    | Criação inicial do documento de cronograma. | Mariana Gonzaga | Todos       |
| 15/09/2025 | 1.1    | Ajuste de datas nas Sprints. | Philipe Morais | Todos       |
| 01/10/2025 | 1.2    | Reorganização do cronograma baseada na priorização de módulos funcionais (Cadastro e Acesso → Sprint 2, Presença → Sprint 3, Relatórios e Comunicação → Sprint 4, Módulos complementares → Sprint 5). Adição de atividades de organização de backlog e Kanban. | Todos | Vitor Marconi |