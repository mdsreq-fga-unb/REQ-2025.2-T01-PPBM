# Admin Flow Documentation - Programa Bombeiro Mirim (PPBM)

Este documento detalha o fluxo do administrador no sistema PPBM, mapeando as funcionalidades disponíveis, user stories relacionadas e requisitos funcionais correspondentes.

---

## Visão Geral do Sistema

O sistema de gestão do Programa Bombeiro Mirim (PBM) centraliza e simplifica a gestão das crianças atendidas (chamadas de "Brigadinos" e "Brigadinas"), garantindo eficiência administrativa, segurança e qualidade no acompanhamento pedagógico e social.

### Perfis de Usuário
- **Administrador**: Acesso completo ao sistema
- **Gestor de Unidade**: Gestão da unidade específica
- **Docente**: Registro de presenças e acompanhamento pedagógico
- **Responsável**: Visualização de informações dos filhos

---

## Páginas/Seções do Admin

O painel administrativo é composto pelas seguintes seções:

| Seção | Arquivo | Descrição |
|-------|---------|-----------|
| Dashboard | `dashboard.astro` | Visão geral com KPIs e indicadores |
| Presenças | `presencas.astro` | Controle de presenças por turma |
| Cadastrar Alunos | `cadastrar-alunos.astro` | Cadastro de novos alunos |
| Gerenciar Alunos | `gerenciar-alunos.astro` | Edição, busca e remoção de alunos |
| Relatórios | `relatorios.astro` | Geração e exportação de relatórios |
| Usuários | `usuarios.astro` | Gestão de usuários do sistema |

---

## Funcionalidades Detalhadas

### 1. 🗓️ Controle de Presenças

**Descrição**: Permite registrar presença, falta ou atraso por turma e data.

**Elementos da Interface**:
- Seletor de turma (Turma A - Manhã, Turma B - Tarde, Turma C - Integral)
- Seletor de data
- Tabela com lista de crianças e status (Presente ✅, Falta ❌, Atraso ⏰)
- Campo de observações por aluno
- Resumo rápido (Total, Presentes, Atrasos, Faltas)

**User Stories Relacionadas**:

| Código | Declaração | Prioridade |
|--------|------------|------------|
| US-004 | Como gestor, quero gerenciar registros de presença, falta ou atraso, mantendo histórico de alterações, para garantir precisão e rastreabilidade. | Must Have |
| US-005 | Como docente ou gestor, quero consultar o histórico de presenças e faltas de um aluno para monitorar frequência e identificar padrões. | Must Have |

**Requisitos Funcionais**:

| Código | Requisito | ICE Score |
|--------|-----------|-----------|
| RF-004 | Gerenciar lançamento de presença - Registros de presença/falta com histórico de alterações | 560 |
| RF-005 | Consultar aluno - Filtrar histórico de presenças/faltas por aluno, período e unidade | 900 |

---

### 2. 👶 Cadastro de Crianças

**Descrição**: Formulário completo para cadastro de novas crianças no programa.

**Dados Básicos**:
- Nome completo
- CPF da criança (com validação)
- Data de nascimento (validação: 7-14 anos)
- Escola
- Turma
- ID interno (gerado automaticamente)

**Dados do Responsável Principal**:
- Nome completo
- Contato (telefone)
- Parentesco (Pai, Mãe, Avô, Avó, Tio, Tia, Responsável Legal)

**Informações Médicas**:
- Condição médica (Normal, Asma, Diabetes, Epilepsia, Cardiopatia, Outras)
- Alergias
- Observações médicas importantes
- Alerta visual para condições especiais

**Acompanhamento Especial**:
- Flag para necessidade de acompanhamento pedagógico especial
- Tipo de necessidade (TEA, TDAH, Dislexia, Deficiência Intelectual, Outros)
- Observações específicas

**User Stories Relacionadas**:

| Código | Declaração | Prioridade |
|--------|------------|------------|
| US-001 | Como administrador ou gestor de unidade, quero cadastrar, editar e remover alunos com informações completas (nome, CPF, responsável, escola, cidade) para manter registro oficial atualizado e confiável. | Must Have |
| US-002 | Como administrador, quero cadastrar, editar ou remover responsáveis vinculados a um aluno para garantir que apenas contatos válidos possam acessar informações da criança. | Must Have |
| US-017 | Como docente ou gestor, quero registrar planos pedagógicos individuais para alunos neurodivergentes, garantindo acompanhamento adequado e alerta de necessidades especiais. | Should Have |

**Requisitos Funcionais**:

| Código | Requisito | ICE Score |
|--------|-----------|-----------|
| RF-001 | Gerenciar Aluno - Cadastro, edição, remoção com nome, data nascimento, CPF, responsável, escola, cidade | 800 |
| RF-002 | Gerenciar responsáveis - Editar/remover responsáveis, com vínculo a um Aluno e múltiplos contatos | 720 |
| RF-017 | Registrar plano de acompanhamento neurodivergente | 630 |

---

### 3. 👥 Gerenciar Alunos

**Descrição**: Busca, visualização, edição e remoção de alunos cadastrados.

**Filtros Disponíveis**:
- Busca por nome, CPF ou responsável
- Filtro por turma
- Filtro por status especial (Alerta médico, Acompanhamento pedagógico, Sem alertas)

**Informações Exibidas na Lista**:
- Nome do aluno
- CPF
- Turma
- Responsável
- Contato
- Status (indicadores visuais de condições especiais)
- Ações (Editar, Remover)

**User Stories Relacionadas**:

| Código | Declaração | Prioridade |
|--------|------------|------------|
| US-001 | Como administrador ou gestor de unidade, quero cadastrar, editar e remover alunos... | Must Have |
| US-016 | Como gestor ou docente, quero consultar turmas com busca por nome de alunos, CPF, status de justificativa e taxa de presença para análises rápidas e decisões informadas. | Must Have |

**Requisitos Funcionais**:

| Código | Requisito | ICE Score |
|--------|-----------|-----------|
| RF-001 | Gerenciar Aluno | 800 |
| RF-016 | Consultar turma - Busca por nome, CPF, unidade, status de justificativa, taxa de presença | 720 |

---

### 4. 💬 Central de Comunicação

**Descrição**: Sistema de comunicação com equipe e responsáveis.

**Abas Disponíveis**:

#### 4.1 Equipe Interna
- Lista de conversas
- Chat em tempo real
- Envio de mensagens

#### 4.2 Responsáveis
- Envio de mensagens para destinatários específicos:
  - Todos os responsáveis
  - Responsáveis por turma
  - Responsável individual
- Campos: Assunto, Mensagem, Flag de urgência
- Histórico de mensagens enviadas

#### 4.3 Avisos Gerais
- Criação de avisos com tipos:
  - Informativo
  - Importante
  - Urgente
  - Evento
- Campos: Título, Conteúdo, Data de validade
- Lista de avisos ativos

**User Stories Relacionadas**:

| Código | Declaração | Prioridade |
|--------|------------|------------|
| US-012 | Como docente, quero enviar notificações sobre faltas, justificativas ou advertências via WhatsApp, e-mail ou sistema para manter os responsáveis informados. | Should Have |
| US-020 | Como administrador, quero cadastrar regras, normas e comunicados oficiais para disponibilizar conteúdos institucionais de forma organizada e acessível. | Could Have |

**Requisitos Funcionais**:

| Código | Requisito | ICE Score |
|--------|-----------|-----------|
| RF-012 | Enviar notificações para os responsáveis | 288 |
| RF-020 | Cadastrar conteúdos institucionais | 252 |

---

### 5. 📊 Relatórios

**Descrição**: Geração e exportação de relatórios diversos.

**Tipos de Relatórios**:
- Presenças por período
- Relatório individual
- Resumo por turma
- Condições médicas

**Filtros**:
- Data inicial e final
- Turma específica ou todas

**Formatos de Exportação**:
- PDF
- Excel (CSV/XLSX)

**User Stories Relacionadas**:

| Código | Declaração | Prioridade |
|--------|------------|------------|
| US-003 | Como docente ou gestor, quero exportar documentos de comprovante em PDF ou imagem para download ou impressão | Must Have |
| US-006 | Como gestor, quero gerar relatórios individuais de frequência detalhando presenças, faltas justificadas e não justificadas | Must Have |
| US-007 | Como gestor, quero exportar relatórios internos em PDF ou Excel para uso da equipe | Must Have |
| US-010 | Como gestor, quero exportar relatórios oficiais padronizados pelo CBMDF | Must Have |
| US-019 | Como gestor ou docente, quero gerar histórico consolidado de relatórios de acompanhamento | Should Have |

**Requisitos Funcionais**:

| Código | Requisito | ICE Score |
|--------|-----------|-----------|
| RF-003 | Exportar documentos de comprovante | 240 |
| RF-006 | Gerar relatório individual de frequência | 486 |
| RF-007 | Exportar relatórios internos em PDF/Excel | 224 |
| RF-010 | Exportar relatórios oficiais padronizados | 216 |
| RF-019 | Geração de histórico acessível a docentes e gestores | 432 |

---

### 6. 📈 Dashboard

**Descrição**: Visão consolidada com indicadores e gráficos.

**KPIs Exibidos**:
- Total de Alunos
- Taxa de Presença (%)
- Alertas Médicos
- Acompanhamento Especial

**Seções**:
- Resumo por Turma
- Últimas Atividades

**User Stories Relacionadas**:

| Código | Declaração | Prioridade |
|--------|------------|------------|
| US-008 | Como gestor ou docente, quero visualizar dashboards de frequência com indicadores e gráficos de presença, faltas e alertas, para monitorar rapidamente o desempenho das turmas | Must Have |
| US-009 | Como responsável ou docente, quero acessar a linha do tempo do aluno com presenças, faltas, justificativas e comunicados | Must Have |

**Requisitos Funcionais**:

| Código | Requisito | ICE Score |
|--------|-----------|-----------|
| RF-008 | Exibir dashboards de frequência | 168 |
| RF-009 | Exibir histórico do aluno | 567 |

---

### 7. 👤 Gestão de Usuários e Docentes

**Descrição**: Cadastro e gerenciamento de docentes e usuários do sistema.

**User Stories Relacionadas**:

| Código | Declaração | Prioridade |
|--------|------------|------------|
| US-013 | Como usuário, quero acessar o sistema com autenticação e papéis para executar apenas operações permitidas | Must Have |
| US-014 | Como administrador, quero cadastrar docentes com informações completas | Must Have |
| US-015 | Como gestor, quero cadastrar turmas, dias, horários e lotação de alunos | Must Have |

**Requisitos Funcionais**:

| Código | Requisito | ICE Score |
|--------|-----------|-----------|
| RF-013 | Autenticar usuários e perfis | 900 |
| RF-014 | Cadastrar os docentes | 810 |
| RF-015 | Cadastrar turmas e sessões | 900 |

---

### 8. ⚠️ Registrar Advertências

**Descrição**: Registro de advertências de comportamento dos alunos.

**User Stories Relacionadas**:

| Código | Declaração | Prioridade |
|--------|------------|------------|
| US-011 | Como gestor, quero registrar advertências de comportamento dos alunos para acompanhamento disciplinar, mantendo histórico inalterável | Must Have |

**Requisitos Funcionais**:

| Código | Requisito | ICE Score |
|--------|-----------|-----------|
| RF-011 | Registrar advertência para os alunos | 504 |

---

## Features do Sistema

| Código | Título | Descrição |
|--------|--------|-----------|
| F01 | Gestão e Controle da Frequência | Gerenciar alunos, responsáveis, registros de presença e dados de frequência |
| F02 | Monitoramento de Comportamento e Alertas | Registrar advertências, enviar notificações e monitorar padrões |
| F03 | Gestão de Usuários, Docentes e Turmas | Gerenciar usuários, docentes, turmas e sessões com autenticação segura |
| F04 | Acompanhamento Individualizado do Aluno | Registrar planos pedagógicos e relatórios, gerar históricos individuais |
| F05 | Gestão de Conteúdos Institucionais | Cadastrar e disponibilizar conteúdos institucionais |

---

## Requisitos Não-Funcionais Relevantes para Admin

| Código | Requisito | Descrição |
|--------|-----------|-----------|
| RNF-001 | Intuitividade | Interface simples, ações principais em até 5 interações por tela |
| RNF-002 | Idioma & Terminologia | Português (Brasil) com terminologia PBM (brigadinos/brigadinas) |
| RNF-005 | Tempo de resposta | Consultas críticas em até 5 segundos |
| RNF-006 | Tempo de carregamento | 95% das páginas em menos de 2 segundos |
| RNF-011 | Proteção de dados | Conformidade com LGPD |
| RNF-012 | Criptografia | HTTPS/TLS 1.2+ para transmissão de dados |

---

## MVP - Funcionalidades do Admin

### Incluídas no MVP (Must Have + marcadas com X):

1. ✅ US-001 - Gerenciar aluno
2. ✅ US-002 - Gerenciar responsáveis
3. ✅ US-003 - Exportar documentos de comprovante
4. ✅ US-004 - Gerenciamento de presença
5. ✅ US-005 - Consultar aluno
6. ✅ US-006 - Gerar relatório individual de frequência
7. ✅ US-007 - Exportar relatórios internos
8. ✅ US-008 - Consolidar relatórios por turma/unidade
9. ✅ US-009 - Exibir histórico do aluno
10. ✅ US-011 - Registrar advertências
11. ✅ US-014 - Cadastrar docentes
12. ✅ US-015 - Cadastrar turmas e sessões
13. ✅ US-016 - Consultar turma
14. ✅ US-019 - Gerar histórico consolidado de relatórios
15. ✅ US-020 - Cadastrar conteúdos institucionais

### Should Have (Parcialmente no MVP):
- US-012 - Enviar notificações
- US-017 - Registrar plano de acompanhamento neurodivergente
- US-018 - Importar relatórios de alunos

---

## Fluxo de Navegação do Admin

```
Login
  │
  ├── Dashboard (Visão Geral)
  │     ├── KPIs
  │     ├── Resumo por Turma
  │     └── Últimas Atividades
  │
  ├── Presenças
  │     ├── Selecionar Turma
  │     ├── Selecionar Data
  │     ├── Registrar Status (Presente/Falta/Atraso)
  │     └── Salvar Presenças
  │
  ├── Cadastrar Alunos
  │     ├── Dados Básicos
  │     ├── Responsável Principal
  │     ├── Informações Médicas
  │     └── Acompanhamento Especial
  │
  ├── Gerenciar Alunos
  │     ├── Buscar/Filtrar
  │     ├── Editar
  │     ├── Remover
  │     └── Exportar Lista
  │
  ├── Comunicação
  │     ├── Equipe Interna (Chat)
  │     ├── Mensagens para Responsáveis
  │     └── Avisos Gerais
  │
  ├── Relatórios
  │     ├── Selecionar Tipo
  │     ├── Definir Período
  │     ├── Gerar Relatório
  │     └── Exportar (PDF/Excel)
  │
  └── Usuários
        ├── Cadastrar Docentes
        ├── Gerenciar Turmas
        └── Gerenciar Permissões
```

---

## Priorização ICE - Top 10 Funcionalidades Admin

| Posição | RF | Descrição | ICE Score |
|---------|-----|-----------|-----------|
| 1 | RF-005 | Consultar aluno | 900 |
| 2 | RF-013 | Autenticar usuários e perfis | 900 |
| 3 | RF-015 | Cadastrar turmas e sessões | 900 |
| 4 | RF-014 | Cadastrar os docentes | 810 |
| 5 | RF-001 | Gerenciar Aluno | 800 |
| 6 | RF-002 | Gerenciar responsáveis | 720 |
| 7 | RF-016 | Consultar turma | 720 |
| 8 | RF-017 | Registrar plano acompanhamento | 630 |
| 9 | RF-009 | Exibir histórico do aluno | 567 |
| 10 | RF-004 | Gerenciar lançamento de presença | 560 |

---

## Considerações Técnicas

### Stack Tecnológica
- **Backend**: TypeScript + Express
- **Frontend**: Astro + Svelte
- **Banco de Dados**: Supabase (PostgreSQL)
- **Containerização**: Docker

### Validações Implementadas no Protótipo
- Validação de CPF (algoritmo completo)
- Validação de idade (7-14 anos)
- Validação de formato de contato telefônico
- Alertas visuais para condições médicas especiais

---

*Documento gerado com base na documentação do projeto PPBM (Programa Bombeiro Mirim) - Versão 8.1*
