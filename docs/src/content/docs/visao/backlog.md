---
title: Backlog de Produto
description: Product Backlog completo do sistema FireForce - PPBM com features, histórias de usuário, priorização ICE e definição do MVP
---

## Backlog Geral

No contexto do PPBM (Programa Bombeiro Mirim), o Product Backlog representa uma lista dinâmica, viva e priorizada de todas as funcionalidades, melhorias e ajustes necessários para a evolução contínua do sistema. Essa lista é considerada dinâmica porque é constantemente atualizada conforme novas necessidades surgem a partir do uso do sistema, feedback dos stakeholders ou mudanças nas regras e processos internos do programa.

Cada user story foi elaborada para representar uma necessidade real dos usuários, traduzindo a visão dos interessados em ações práticas de desenvolvimento. Essas histórias descrevem o que o sistema deve fazer para entregar valor e como o usuário interage com ele.

---

## Features

| Nome | Título | Descrição |
|------|--------|-----------|
| **F01** | Gestão e Controle da Frequência | Através dessa funcionalidade, será possível gerenciar alunos, responsáveis, registros de presença e dados de frequência, garantindo integridade, rastreabilidade e confiabilidade das informações. |
| **F02** | Monitoramento de Comportamento e Alertas | Através dessa funcionalidade, será possível registrar advertências, enviar notificações e monitorar padrões de comportamento e assiduidade dos alunos, apoiando a tomada de decisão. |
| **F03** | Gestão de Usuários, Docentes e Turmas | Através dessa funcionalidade, será possível gerenciar usuários, docentes, turmas e sessões, garantindo autenticação segura, organização de turmas e controle de acesso. |
| **F04** | Acompanhamento Individualizado do Aluno | Através essa funcionalidade, será possível registrar planos pedagógicos, relatórios de responsáveis e gerar históricos individuais acessíveis a docentes e gestores, apoiando o acompanhamento personalizado do aluno. |
| **F05** | Gestão de Conteúdos Institucionais | Através dessa funcionalidade, será possível cadastrar, organizar e disponibilizar conteúdos institucionais (regras, normas e comunicados), garantindo padronização e fácil acesso para toda a instituição. |

---

## Histórias de Usuário Completas

| ID | Descrição | Objetivo Específico | Requisito | Score ICE | MoSCoW |
|----|-----------|---------------------|-----------|-----------|--------|
| **US-001** | Como administrador ou gestor de unidade, quero cadastrar, editar e remover alunos com informações completas (nome, CPF, responsável, escola, cidade) para manter registro oficial atualizado e confiável. | OE01 - Centralizar e automatizar o controle de frequência | RF-001 | 800 | Must Have |
| **US-002** | Como administrador, quero cadastrar, editar ou remover responsáveis vinculados a um aluno para garantir que apenas contatos válidos possam acessar informações da criança. | OE01 - Centralizar e automatizar o controle de frequência | RF-002 | 720 | Must Have |
| **US-003** | Como docente ou gestor, quero exportar documentos de comprovante (laudos médicos ou identificação) em PDF ou imagem para download ou impressão, garantindo registro e auditoria de acessos. | OE01 - Centralizar e automatizar o controle de frequência | RF-003 | 240 | Must Have |
| **US-004** | Como gestor, quero gerenciar registros de presença, falta ou atraso, mantendo histórico de alterações, para garantir precisão e rastreabilidade. | OE01 - Centralizar e automatizar o controle de frequência | RF-004 | 560 | Must Have |
| **US-005** | Como docente ou gestor, quero consultar o histórico de presenças e faltas de um aluno para monitorar frequência e identificar padrões. | OE02 - Melhorar análise de dados | RF-005 | 900 | Must Have |
| **US-006** | Como gestor, quero gerar relatórios individuais de frequência detalhando presenças, faltas justificadas e não justificadas para análise de desempenho dos alunos. | OE02 - Melhorar análise de dados | RF-006 | 486 | Must Have |
| **US-007** | Como gestor, quero exportar relatórios internos em PDF ou Excel para uso da equipe, garantindo análise e controle das informações. | OE02 - Melhorar análise de dados | RF-007 | 224 | Must Have |
| **US-008** | Como gestor ou docente, quero visualizar dashboards de frequência com indicadores e gráficos de presença, faltas e alertas, para monitorar rapidamente o desempenho das turmas e identificar padrões de assiduidade. | OE02 - Melhorar análise de dados | RF-008 | 168 | Must Have |
| **US-009** | Como responsável ou docente, quero acessar a linha do tempo do aluno com presenças, faltas, justificativas e comunicados para acompanhamento completo da situação do aluno. | OE02 - Melhorar análise de dados | RF-009 | 567 | Must Have |
| **US-010** | Como gestor, quero exportar relatórios oficiais padronizados pelo CBMDF, garantindo conformidade legal e integridade dos dados. | OE02 - Melhorar análise de dados | RF-010 | 216 | Must Have |
| **US-011** | Como gestor, quero registrar advertências de comportamento dos alunos para acompanhamento disciplinar, mantendo histórico inalterável. | OE03 - Facilitar comunicação | RF-011 | 504 | Must Have |
| **US-012** | Como docente, quero enviar notificações sobre faltas, justificativas ou advertências via WhatsApp, e-mail ou sistema para manter os responsáveis informados. | OE03 - Facilitar comunicação | RF-012 | 288 | Should Have |
| **US-013** | Como usuário, quero acessar o sistema com autenticação e papéis (Administrador, Gestor, Docente ou Responsável) para executar apenas operações permitidas. | OE05 - Garantir acessibilidade e usabilidade | RF-013 | 900 | Must Have |
| **US-014** | Como administrador, quero cadastrar docentes com informações completas para permitir que eles lancem presença e registrem planos pedagógicos, respeitando permissões de acesso. | OE01 - Centralizar e automatizar o controle de frequência | RF-014 | 810 | Must Have |
| **US-015** | Como gestor, quero cadastrar turmas, dias, horários e lotação de alunos para organizar sessões de forma adequada e respeitar limite de alunos por turma. | OE01 - Centralizar e automatizar o controle de frequência | RF-015 | 900 | Must Have |
| **US-016** | Como gestor ou docente, quero consultar turmas com busca por nome de alunos, CPF, status de justificativa e taxa de presença para análises rápidas e decisões informadas. | OE02 - Melhorar análise de dados | RF-016 | 720 | Must Have |
| **US-017** | Como docente ou gestor, quero registrar planos pedagógicos individuais para alunos neurodivergentes, garantindo acompanhamento adequado e alerta de necessidades especiais. | OE04 - Aprimorar acompanhamento individualizado | RF-017 | 630 | Should Have |
| **US-018** | Como gestor ou docente, quero registrar e importar relatórios enviados pelos responsáveis para manter histórico completo de acompanhamento individual. | OE04 - Aprimorar acompanhamento individualizado | RF-018 | 432 | Should Have |
| **US-019** | Como gestor ou docente, quero gerar histórico consolidado de relatórios de acompanhamento, disponível para exportação e análise periódica. | OE04 - Aprimorar acompanhamento individualizado | RF-019 | 432 | Should Have |
| **US-020** | Como administrador, quero cadastrar regras, normas e comunicados oficiais para disponibilizar conteúdos institucionais de forma organizada e acessível. | OE03 - Facilitar comunicação | RF-020 | 252 | Could Have |

---

## Priorização ICE

A priorização foi realizada utilizando a técnica **ICE** (Impact, Confidence, Ease), onde:

- **Impact (Impacto)**: Potencial do requisito em gerar valor para o negócio (1-10)
- **Confidence (Confiança)**: Grau de certeza da equipe sobre o impacto estimado (1-10)
- **Ease (Facilidade)**: Nível de simplicidade e velocidade de implementação (1-10)

**Fórmula**: ICE Score = Impacto × Confiança × Facilidade

### Ranking de Priorização

| Posição | ID | Requisito | Impact | Confidence | Ease | **Score** | Quadrante |
|---------|----|-----------|----|----|----|-------|-----------|
| 1º | RF-005 | Consultar aluno | 10 | 10 | 9 | **900** | Q1 |
| 1º | RF-013 | Autenticar usuários e perfis | 10 | 10 | 9 | **900** | Q1 |
| 1º | RF-015 | Cadastrar turmas e sessões | 10 | 10 | 9 | **900** | Q1 |
| 4º | RF-014 | Cadastrar os docentes | 9 | 10 | 9 | **810** | Q1 |
| 5º | RF-001 | Gerenciar Aluno | 10 | 10 | 8 | **800** | Q1 |
| 6º | RF-002 | Gerenciar responsáveis | 9 | 10 | 8 | **720** | Q1 |
| 6º | RF-016 | Consultar turma | 9 | 10 | 8 | **720** | Q1 |
| 8º | RF-017 | Registrar plano neurodivergente | 10 | 9 | 7 | **630** | Q2 |
| 9º | RF-009 | Exibir histórico do aluno | 9 | 9 | 7 | **567** | Q1 |
| 10º | RF-004 | Gerenciar lançamento de presença | 8 | 10 | 7 | **560** | Q1 |
| 11º | RF-011 | Registrar advertência | 7 | 9 | 8 | **504** | Q1 |
| 12º | RF-006 | Gerar relatório individual | 9 | 9 | 6 | **486** | Q1 |
| 13º | RF-018 | Registro de relatórios dos responsáveis | 8 | 9 | 6 | **432** | Q2 |
| 13º | RF-019 | Geração de histórico docentes | 8 | 9 | 6 | **432** | Q2 |
| 15º | RF-012 | Enviar notificações | 9 | 8 | 4 | **288** | Q2 |
| 16º | RF-020 | Cadastrar conteúdos institucionais | 4 | 7 | 9 | **252** | Q3 |
| 17º | RF-003 | Exportar documentos | 6 | 8 | 5 | **240** | Q1 |
| 18º | RF-007 | Exportar relatórios internos | 7 | 8 | 4 | **224** | Q1 |
| 19º | RF-010 | Exportar relatórios oficiais | 9 | 8 | 3 | **216** | Q3 |
| 20º | RF-008 | Exibir dashboards | 8 | 7 | 3 | **168** | Q1 |

### Interpretação dos Quadrantes

- **Quadrante 1 (Q1)**: Baixo esforço + Alto impacto = **Prioridade Máxima para MVP**
- **Quadrante 2 (Q2)**: Alto esforço + Alto impacto = **Considerar para MVP se essencial**
- **Quadrante 3 (Q3)**: Baixo esforço + Baixo impacto = **Apenas se houver tempo/recursos**
- **Quadrante 4 (Q4)**: Alto esforço + Baixo impacto = **Não incluir no MVP**

---

## Definição do MVP

Utilizando a técnica **MoSCoW** em conjunto com a análise ICE, definimos:

### Requisitos Funcionais no MVP

| Prioridade MoSCoW | ID | Descrição | ICE Score | No MVP? |
|-------------------|----|-----------|-----------|----|
| **Must Have** | US-001 | Gerenciar aluno | 800 | ✅ |
| **Must Have** | US-002 | Gerenciar responsáveis | 720 | ✅ |
| **Must Have** | US-003 | Exportar documentos de comprovante | 240 | ✅ |
| **Must Have** | US-004 | Gerenciamento de presença | 560 | ✅ |
| **Must Have** | US-005 | Consultar aluno | 900 | ✅ |
| **Must Have** | US-006 | Gerar relatório individual de frequência | 486 | ✅ |
| **Must Have** | US-007 | Exportar relatórios internos | 224 | ✅ |
| **Must Have** | US-008 | Consolidar relatórios por turma/unidade | 168 | ✅ |
| **Must Have** | US-009 | Exibir histórico do aluno | 567 | ✅ |
| **Must Have** | US-010 | Exportar relatórios oficiais padronizados | 216 | ❌ |
| **Must Have** | US-011 | Registrar advertências | 504 | ✅ |
| **Must Have** | US-013 | Autenticar usuários e perfis | 900 | ❌ |
| **Must Have** | US-014 | Cadastrar docentes | 810 | ✅ |
| **Must Have** | US-015 | Cadastrar turmas e sessões | 900 | ✅ |
| **Must Have** | US-016 | Consultar turma | 720 | ✅ |
| **Should Have** | US-012 | Enviar notificações | 288 | ❌ |
| **Should Have** | US-017 | Registrar plano neurodivergente | 630 | ❌ |
| **Should Have** | US-018 | Importar relatórios de alunos | 432 | ❌ |
| **Should Have** | US-019 | Gerar histórico consolidado | 432 | ✅ |
| **Could Have** | US-020 | Cadastrar conteúdos institucionais | 252 | ✅ |

**Total no MVP**: 14 de 20 requisitos funcionais (70%)

### Requisitos Não-Funcionais no MVP

| Prioridade MoSCoW | ID | Descrição | No MVP? |
|-------------------|----|-----------|----|
| **Must Have** | RNF-001 | Intuitividade (máx. 3 cliques) | ✅ |
| **Must Have** | RNF-002 | Idioma PT-BR e terminologia PBM | ✅ |
| **Must Have** | RNF-005 | Tempo resposta < 5s | ✅ |
| **Must Have** | RNF-006 | Carregamento < 2s | ✅ |
| **Must Have** | RNF-007 | Suporte 150 usuários simultâneos | ✅ |
| **Must Have** | RNF-011 | Proteção LGPD | ✅ |
| **Must Have** | RNF-012 | Criptografia TLS 1.2+ | ✅ |
| **Must Have** | RNF-013 | Armazenamento seguro | ✅ |
| **Must Have** | RNF-014 | Cobertura testes 70% | ✅ |
| **Must Have** | RNF-015 | Padrões TypeScript | ✅ |
| **Must Have** | RNF-016 | Pipeline CI/CD | ❌ |
| **Must Have** | RNF-017 | Observabilidade | ❌ |
| **Should Have** | US-RNF-003 | Navegabilidade conteúdos | ✅ |
| **Should Have** | US-RNF-004 | Disponibilidade 99,5% | ✅ |
| **Should Have** | US-RNF-008 | Contêineres Docker | ✅ |
| **Should Have** | US-RNF-009 | Stack padronizada | ❌ |
| **Should Have** | US-RNF-010 | Compatibilidade navegadores | ✅ |

**Total no MVP**: 13 de 17 requisitos não-funcionais (76,5%)

---

## Objetivos Específicos do Projeto

| Código | Objetivo Específico |
|--------|---------------------|
| **OE01** | Centralizar e automatizar o controle de frequência dos brigadinos |
| **OE02** | Melhorar a análise de dados com relatórios e dashboards para gestores |
| **OE03** | Facilitar a comunicação entre equipe e responsáveis |
| **OE04** | Aprimorar o acompanhamento individualizado, especialmente para neurodivergentes |
| **OE05** | Garantir acessibilidade e alta usabilidade para diferentes perfis de usuário |

---

## Histórico de Versão

| Data | Versão | Descrição | Autor(es) | Revisor(es) |
|------|--------|-----------|-----------|-------------|
| 01/10/2025 | 1.0 | Criação inicial do documento de backlog | Lucas Branco | Todos |
| 06/10/2025 | 1.1 | Atualização do documento de backlog | Lucas Branco | Vitor Marconi |
| 21/10/2025 | 2.0 | Reestruturação completa com ICE, MoSCoW e objetivos específicos | Equipe FireForce | Julia Patricio |