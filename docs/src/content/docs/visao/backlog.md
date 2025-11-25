---
title: Backlog de Produto
description: Product Backlog completo do sistema FireForce - PPBM com objetivos específicos, histórias de usuário, priorização ICE e definição do MVP
---

## Backlog Geral

No contexto do PPBM (Programa Bombeiro Mirim), o Product Backlog representa uma lista dinâmica, viva e priorizada de todas as funcionalidades, melhorias e ajustes necessários para a evolução contínua do sistema. Essa lista é considerada dinâmica porque é constantemente atualizada conforme novas necessidades surgem a partir do uso do sistema, feedback dos stakeholders ou mudanças nas regras e processos internos do programa.

Cada user story foi elaborada para representar uma necessidade real dos usuários, traduzindo a visão dos interessados em ações práticas de desenvolvimento. Essas histórias descrevem o que o sistema deve fazer para entregar valor e como o usuário interage com ele.

---

## Objetivos Específicos do Projeto

| Código | Objetivo Específico | Descrição |
|--------|---------------------|-----------|
| **OE01** | Melhorar a eficiência e confiabilidade no controle de frequência | Reduzir o retrabalho e a dependência de registros manuais, garantindo precisão das informações de presença e maior agilidade no acompanhamento dos alunos. |
| **OE02** | Apoiar intervenções pedagógicas por meio do monitoramento comportamental | Disponibilizar dados consolidados de comportamento e assiduidade para auxiliar a equipe escolar na identificação antecipada de riscos e na tomada de decisões preventivas. |
| **OE03** | Fortalecer a segurança e organização da gestão acadêmica | Centralizar o controle de acesso e o cadastro de usuários, docentes e turmas para minimizar falhas operacionais e assegurar que cada perfil tenha permissões adequadas. |
| **OE04** | Ampliar a personalização do acompanhamento estudantil | Fornecer informações pedagógicas estruturadas e histórico individual para que docentes e responsáveis possam acompanhar o progresso e realizar intervenções mais assertivas. |
| **OE05** | Melhorar a comunicação institucional e o acesso a informações oficiais | Garantir que normas, comunicados e documentos da escola sejam disponibilizados de forma padronizada e acessível, reduzindo ruídos e falhas de comunicação com a comunidade escolar. |

---

## Histórias de Usuário

Para visualizar as User Stories completas com descrições detalhadas e critérios de aceite, consulte o documento [Histórias de Usuário](./userstories.md).

A priorização das histórias foi realizada utilizando a técnica **ICE** (Impact, Confidence, Ease), onde:

- **Impact (Impacto)**: Potencial do requisito em gerar valor para o negócio (1-10)
- **Confidence (Confiança)**: Grau de certeza da equipe sobre o impacto estimado (1-10)
- **Ease (Facilidade)**: Nível de simplicidade e velocidade de implementação (1-10)

**Fórmula**: ICE Score = Impacto × Confiança × Facilidade

| ID | Descrição | Objetivo Específico | Requisito | Score ICE | MoSCoW |
|----|-----------|---------------------|-----------|-----------|--------|
| **US-001** | Como administrador ou gestor de unidade, quero cadastrar, editar e remover alunos com informações completas (nome, CPF, responsável, escola, cidade) para manter registro oficial atualizado e confiável. | OE01 | RF-001 | 800 | Must Have |
| **US-002** | Como administrador, quero cadastrar, editar ou remover responsáveis vinculados a um aluno para garantir que apenas contatos válidos possam acessar informações da criança. | OE01 | RF-002 | 720 | Must Have |
| **US-003** | Como docente ou gestor, quero exportar documentos de comprovante (laudos médicos ou identificação) em PDF ou imagem para download ou impressão, garantindo registro e auditoria de acessos. | OE01 | RF-003 | 240 | Must Have |
| **US-004** | Como gestor, quero gerenciar registros de presença, falta ou atraso, mantendo histórico de alterações, para garantir precisão e rastreabilidade. | OE01 | RF-004 | 560 | Must Have |
| **US-005** | Como docente ou gestor, quero consultar o histórico de presenças e faltas de um aluno para monitorar frequência e identificar padrões. | OE01 | RF-005 | 900 | Must Have |
| **US-006** | Como gestor, quero gerar relatórios individuais de frequência detalhando presenças, faltas justificadas e não justificadas para análise de desempenho dos alunos. | OE01 | RF-006 | 486 | Must Have |
| **US-007** | Como gestor, quero exportar relatórios internos em PDF ou Excel para uso da equipe, garantindo análise e controle das informações. | OE01 | RF-007 | 224 | Must Have |
| **US-008** | Como gestor ou docente, quero visualizar dashboards de frequência com indicadores e gráficos de presença, faltas e alertas, para monitorar rapidamente o desempenho das turmas e identificar padrões de assiduidade. | OE01 | RF-008 | 168 | Must Have |
| **US-009** | Como responsável ou docente, quero acessar a linha do tempo do aluno com presenças, faltas, justificativas e comunicados para acompanhamento completo da situação do aluno. | OE01 | RF-009 | 567 | Must Have |
| **US-010** | Como gestor, quero exportar relatórios oficiais padronizados pelo CBMDF, garantindo conformidade legal e integridade dos dados. | OE01 | RF-010 | 216 | Must Have |
| **US-011** | Como gestor, quero registrar advertências de comportamento dos alunos para acompanhamento disciplinar, mantendo histórico inalterável. | OE02 | RF-011 | 504 | Must Have |
| **US-012** | Como docente, quero enviar notificações sobre faltas, justificativas ou advertências via WhatsApp, e-mail ou sistema para manter os responsáveis informados. | OE02 | RF-012 | 288 | Should Have |
| **US-013** | Como usuário, quero acessar o sistema com autenticação e papéis (Administrador, Gestor, Docente ou Responsável) para executar apenas operações permitidas. | OE03 | RF-013 | 900 | Must Have |
| **US-014** | Como administrador, quero cadastrar docentes com informações completas para permitir que eles lancem presença e registrem planos pedagógicos, respeitando permissões de acesso. | OE03 | RF-014 | 810 | Must Have |
| **US-015** | Como gestor, quero cadastrar turmas, dias, horários e lotação de alunos para organizar sessões de forma adequada e respeitar limite de alunos por turma. | OE03 | RF-015 | 900 | Must Have |
| **US-016** | Como gestor ou docente, quero consultar turmas com busca por nome de alunos, CPF, status de justificativa e taxa de presença para análises rápidas e decisões informadas. | OE03 | RF-016 | 720 | Must Have |
| **US-017** | Como docente ou gestor, quero registrar planos pedagógicos individuais para alunos neurodivergentes, garantindo acompanhamento adequado e alerta de necessidades especiais. | OE04 | RF-017 | 630 | Should Have |
| **US-018** | Como gestor ou docente, quero registrar e importar relatórios enviados pelos responsáveis para manter histórico completo de acompanhamento individual. | OE04 | RF-018 | 432 | Should Have |
| **US-019** | Como gestor ou docente, quero gerar histórico consolidado de relatórios de acompanhamento, disponível para exportação e análise periódica. | OE04 | RF-019 | 432 | Should Have |
| **US-020** | Como administrador, quero cadastrar regras, normas e comunicados oficiais para disponibilizar conteúdos institucionais de forma organizada e acessível. | OE05 | RF-020 | 252 | Could Have |

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

## Histórico de Versão

| Data | Versão | Descrição | Autor(es) | Revisor(es) |
|------|--------|-----------|-----------|-------------|
| 01/10/2025 | 1.0 | Criação inicial do documento de backlog | Lucas Branco | Todos |
| 06/10/2025 | 1.1 | Atualização do documento de backlog | Lucas Branco | Vitor Marconi |
| 21/10/2025 | 2.0 | Reestruturação completa com ICE, MoSCoW e objetivos específicos | Equipe FireForce | Julia Patricio |
| 21/10/2025 | 2.1 | Padronização da nomenclatura dos OEs e substituição de Features por Objetivos Específicos com descrições completas | Equipe FireForce | Vitor Marconi |
| 21/10/2025 | 2.2 | Separação das User Stories em página dedicada e simplificação do backlog | Equipe FireForce | Vitor Marconi |