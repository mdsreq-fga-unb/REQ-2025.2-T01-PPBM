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
- **Requisitos Não Funcionais (RNF)**
  - US-RNF-011 – Stack (TypeScript, Express, Astro, Supabase/PostgreSQL)
  - US-RNF-007 – Padrões de código
  - US-RNF-004 – Documentação técnica

**Validação:** Revisão dos módulos e validação do protótipo inicial  

---

## Sprint 2 (01/10 – 13/10)

![Encerrada](https://img.shields.io/badge/Status-Encerrada-blue)

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
- **Requisitos Não Funcionais (RNF)**
  - US-RNF-002 – Proteção de dados pessoais (LGPD)
  - US-RNF-003 – Criptografia
  - US-RNF-005 – Testabilidade
- **Regras de Negócio (RB)**
  - US-RB-003 – Alertas para condições médicas críticas
  - US-RB-004 – Privacidade de dados por tutela
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

![Encerrada](https://img.shields.io/badge/Status-Encerrada-blue)

**Objetivo:** Segunda entrega funcional - Módulo de Presença e Justificativas
**Entregas:**
- **Módulo: Presença & Justificativas**
  - US-007 – Registrar presença de aluno
  - US-008 – Justificar falta de aluno
  - US-009 – Editar lançamento de presença
  - US-010 – Anexar comprovantes
  - US-011 – Definir política de justificativa de faltas
  - US-012 – Conceder autonomia docente para justificativas
  - US-013 – Definir motivos e exigências para justificativas
  - US-014 – Limitar número de alunos por turma
- **Módulo: Operação & Processo (parte 2)**
  - US-029 – Cadastrar turmas e sessões
- **Módulo: Acesso & Perfis (parte 2)**
  - US-026 – Controlar permissões de acesso
- **Requisitos Não Funcionais (RNF)**
  - US-RNF-001 – Tempo de resposta (5 segundos)
  - US-RNF-010 – Contêineres Docker
- **Regras de Negócio (RB)**
  - US-RB-001 – Contabilização separada de faltas justificadas
  - US-RB-002 – Aprovação centralizada de justificativas

**Validação:** Demonstração completa do sistema de presença e justificativas  

---

## Sprint 4 (29/10 – 10/11)

![Encerrada](https://img.shields.io/badge/Status-Encerrada-blue)

**Objetivo:** Terceira entrega funcional - Módulos de Relatórios e Comunicação
**Entregas:**
- **Módulo: Relatórios & Análises**
  - US-015 – Consultar aluno
  - US-016 – Gerar relatório individual de frequência
  - US-020 – Exibir histórico do aluno
- **Módulo: Comunicação**
  - US-022 – Registrar advertência
- **Módulo: Operação & Processo (parte 3)**
  - US-028 – Registrar auditoria de operações
  - US-030 – Implementar filtros e busca avançada
- **Módulo: Acompanhamento Neurodivergente**
  - US-031 – Registrar plano de acompanhamento pedagógico
- **Módulo: Gestão de Conteúdo**
  - US-032 – Cadastrar conteúdos institucionais
  - US-033 – Exibir conteúdos institucionais para usuários
- **Requisitos Não Funcionais (RNF)**
  - US-RNF-006 – Disponibilidade (99,5%)
  - US-RNF-012 – Compatibilidade de navegação
  - US-RNF-013 – Exportação fiel
- **Regras de Negócio (RB)**
  - US-RB-005 – Registro de comunicação oficial
- Testes unitários com TDD para módulos de relatórios e comunicação

**Validação:** Demonstração completa dos sistemas de relatórios e comunicação  

---

## Sprint 5 (12/11 – 24/11)

![Encerrada](https://img.shields.io/badge/Status-Encerrada-blue)

**Objetivo:** Quarta entrega funcional - Módulos Complementares e Integração
**Entregas:**
- **Módulo: Relatórios & Análises (finalização)**
  - US-017 – Consolidar relatórios por turma/unidade
  - US-018 – Exportar relatórios
  - US-019 – Exibir dashboards de frequência
  - US-021 – Exportar relatórios oficiais padronizados
- **Módulo: Comunicação (finalização)**
  - US-023 – Enviar notificações
  - US-024 – Configurar preferências de notificação
- **Módulo: Acesso & Perfis (finalização)**
  - US-025 – Autenticar usuários e perfis
  - US-027 – Operar multiunidade
  - Controle completo de permissões por papel
  - Recuperação de senha e configurações de segurança
  - Primeiro acesso com alteração obrigatória de senha

- **Requisitos Não Funcionais (RNF)**
  - US-RNF-009 – Observabilidade
  - US-RNF-008 – CI/CD
- Integração completa de todos os módulos
- Testes ponta a ponta (E2E) para validação da integração
- Ajustes a partir de feedbacks anteriores
- Refinamento final das User Stories
- Kanban final com todas as tarefas concluídas

**Validação:** Cliente valida o sistema integrado (MVP funcional completo)  

---

## Sprint 6 (26/11 – 01/12)

![Em Progresso](https://img.shields.io/badge/Status-Em%20Progresso-green)

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
| 15/01/2025 | 1.3    | Adição de User Stories específicas nas Sprints 2, 3, 4 e 5. Distribuição lógica dos Requisitos Não Funcionais (RNF-001 a RNF-007, RNF-009 a RNF-012) e Regras de Negócio (RB-001 a RB-005) ao longo das sprints. Inclusão das User Stories faltantes na Sprint 5 para completar o cronograma. | Vitor Marconi | Todos |