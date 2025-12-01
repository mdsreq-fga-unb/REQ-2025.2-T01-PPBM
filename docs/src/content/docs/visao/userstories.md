---
title: User Stories
description: User Stories completas do sistema FireForce - PPBM com descrições detalhadas e critérios de aceite
---

Este documento apresenta todas as User Stories (US) do sistema FireForce - PPBM, organizadas por Objetivo Específico, com descrições completas e critérios de aceite detalhados.

Para uma visão consolidada e priorizada das histórias, consulte o [Backlog de Produto](./backlog.md).

---

## 📌 Objetivo Específico 1 – Melhorar a eficiência e confiabilidade no controle de frequência

### **US-001 – Gerenciar Aluno**

**Descrição:**

Como administrador ou gestor de unidade, quero cadastrar, editar e remover alunos com informações completas (nome, CPF, responsável, escola, cidade) para manter registro oficial atualizado e confiável.

**Critérios de Aceite:**

- Deve permitir cadastrar nome, data de nascimento, CPF, responsáveis, contatos, escola/unidade e cidade.
- Deve validar CPF, idade (7–14 anos), e campos obrigatórios.
- Deve impedir duplicidade de CPF.
- Deve permitir editar e atualizar dados mantendo histórico de alterações.
- Deve permitir excluir aluno apenas se não houver dependências críticas.
- Deve exibir confirmação antes de salvar ou excluir.

**Requisito:** RF-001 | **Score ICE:** 800 | **MoSCoW:** Must Have

---

### **US-002 – Gerenciar Responsáveis**

**Descrição:**

Como administrador, quero cadastrar, editar ou remover responsáveis vinculados a um aluno para garantir que apenas contatos válidos possam acessar informações da criança.

**Critérios de Aceite:**

- Deve permitir cadastrar múltiplos responsáveis por aluno.
- Deve validar contatos obrigatórios (telefone/e-mail).
- Deve impedir duplicidade de responsável.
- Deve manter histórico de alterações nos dados dos responsáveis.
- Deve impedir exclusão de responsável se for o único vinculado ao aluno.

**Requisito:** RF-002 | **Score ICE:** 720 | **MoSCoW:** Must Have

---

### **US-003 – Exportar Documentos de Comprovante**

**Descrição:**

Como docente ou gestor, quero exportar documentos de comprovante (laudos médicos ou identificação) em PDF ou imagem para download ou impressão, garantindo registro e auditoria de acessos.

**Critérios de Aceite:**

- Deve permitir exportar laudos, declarações, identificações neurodivergentes.
- Deve permitir download em PDF ou imagem (PNG/JPG).
- Deve registrar no log quem exportou, o quê e quando.
- Deve bloquear exportação caso o arquivo esteja corrompido ou ausente.

**Requisito:** RF-003 | **Score ICE:** 240 | **MoSCoW:** Must Have

---

### **US-004 – Gerenciar Lançamento de Presença**

**Descrição:**

Como gestor, quero gerenciar registros de presença, falta ou atraso, mantendo histórico de alterações, para garantir precisão e rastreabilidade.

**Critérios de Aceite:**

- Deve permitir lançar presença, falta e atraso por turma.
- Deve validar data e horário do lançamento.
- Deve manter histórico imutável de edições (antes/depois).
- Deve registrar autor e horário de cada alteração.
- Deve permitir correção apenas por usuários autorizados.

**Requisito:** RF-004 | **Score ICE:** 560 | **MoSCoW:** Must Have

---

### **US-005 – Consultar Aluno**

**Descrição:**

Como docente ou gestor, quero consultar o histórico de presenças e faltas de um aluno para monitorar frequência e identificar padrões.

**Critérios de Aceite:**

- Deve permitir consultar por nome, CPF, período e unidade.
- Deve exibir resultados ordenados cronologicamente.
- Deve permitir filtrar por tipo (presença, falta, justificada).
- Deve exibir resumo da taxa de presença.

**Requisito:** RF-005 | **Score ICE:** 900 | **MoSCoW:** Must Have

---

### **US-006 – Gerar Relatório Individual de Frequência**

**Descrição:**

Como gestor, quero gerar relatórios individuais de frequência detalhando presenças, faltas justificadas e não justificadas para análise de desempenho dos alunos.

**Critérios de Aceite:**

- Deve permitir seleção de período customizável.
- Deve calcular automaticamente percentuais de presença e faltas.
- Deve separar faltas justificadas e não justificadas.
- Deve permitir exportar em PDF e Excel.

**Requisito:** RF-006 | **Score ICE:** 486 | **MoSCoW:** Must Have

---

### **US-007 – Exportar Relatórios Internos**

**Descrição:**

Como gestor, quero exportar relatórios internos em PDF ou Excel para uso da equipe, garantindo análise e controle das informações.

**Critérios de Aceite:**

- Deve permitir exportar todos os tipos de relatório da plataforma.
- Deve manter formatação padronizada.
- Deve nomear arquivos com data/hora.
- Deve validar tamanho máximo permitido.

**Requisito:** RF-007 | **Score ICE:** 224 | **MoSCoW:** Must Have

---

### **US-008 – Exibir Dashboards de Frequência**

**Descrição:**

Como gestor ou docente, quero visualizar dashboards de frequência com indicadores e gráficos de presença, faltas e alertas, para monitorar rapidamente o desempenho das turmas e identificar padrões de assiduidade.

**Critérios de Aceite:**

- Deve exibir gráficos de presença e faltas.
- Deve atualizar indicadores em tempo real.
- Deve permitir filtros (unidade, pelotão, turma, período).
- Deve gerar alertas para baixa frequência.

**Requisito:** RF-008 | **Score ICE:** 168 | **MoSCoW:** Must Have

---

### **US-009 – Exibir Histórico do Aluno**

**Descrição:**

Como responsável ou docente, quero acessar a linha do tempo do aluno com presenças, faltas, justificativas e comunicados para acompanhamento completo da situação do aluno.

**Critérios de Aceite:**

- Deve exibir presenças, faltas, justificativas, advertências e comunicados.
- Deve ordenar eventos por data.
- Deve permitir filtros por tipo de evento e período.
- Deve permitir exportação do histórico.

**Requisito:** RF-009 | **Score ICE:** 567 | **MoSCoW:** Must Have

---

### **US-010 – Exportar Relatórios Administrativos CBMDF**

**Descrição:**

Como gestor, quero exportar relatórios oficiais padronizados pelo CBMDF, garantindo conformidade legal e integridade dos dados.

**Critérios de Aceite:**

- Deve gerar os relatórios:
  - Mensal de Frequência por Unidade
  - Ausências e Justificativas
  - Efetivo Presente (snapshot diário)
  - Ocorrências Disciplinares
- Deve seguir layout oficial de modelos fornecidos.
- Deve exportar em PDF e Excel.

**Requisito:** RF-010 | **Score ICE:** 216 | **MoSCoW:** Must Have

---

## 📌 Objetivo Específico 2 – Apoiar intervenções pedagógicas por meio do monitoramento comportamental

### **US-011 – Registrar Advertência**

**Descrição:**

Como gestor, quero registrar advertências de comportamento dos alunos para acompanhamento disciplinar, mantendo histórico inalterável.

**Critérios de Aceite:**

- Deve permitir registrar comportamento negativo com descrição e data.
- Deve vincular aluno e autor da advertência.
- Deve manter histórico imutável.
- Deve exibir advertências no histórico do aluno.

**Requisito:** RF-011 | **Score ICE:** 504 | **MoSCoW:** Must Have

---

### **US-012 – Enviar Notificações**

**Descrição:**

Como docente, quero enviar notificações sobre faltas, justificativas ou advertências via WhatsApp, e-mail ou sistema para manter os responsáveis informados.

**Critérios de Aceite:**

- Deve permitir enviar notificações sobre faltas, justificativas e advertências.
- Deve permitir configurar o canal (WhatsApp/e-mail/sistema).
- Deve registrar envio, status e leitura (quando possível).**
- Deve oferecer templates configuráveis.

**Requisito:** RF-012 | **Score ICE:** 288 | **MoSCoW:** Should Have

---

## 📌 Objetivo Específico 3 – Fortalecer a segurança e organização da gestão acadêmica

### **US-013 – Autenticar Usuários e Perfis**

**Descrição:**

Como usuário, quero acessar o sistema com autenticação e papéis (Administrador, Gestor, Docente ou Responsável) para executar apenas operações permitidas.

**Critérios de Aceite:**

- Deve validar e-mail/CPF e senha.
- Deve aplicar timeout de sessão.
- Deve obrigar troca de senha no primeiro acesso.
- Deve aplicar permissões baseadas em papéis.

**Requisito:** RF-013 | **Score ICE:** 900 | **MoSCoW:** Must Have

---

### **US-014 – Cadastrar Docentes**

**Descrição:**

Como administrador, quero cadastrar docentes com informações completas para permitir que eles lancem presença e registrem planos pedagógicos, respeitando permissões de acesso.

**Critérios de Aceite:**

- Deve permitir cadastrar nome, CPF, unidade e cidade.
- Deve validar CPF e dados obrigatórios.
- Deve impedir duplicidade.
- Deve permitir edição e histórico de alterações.

**Requisito:** RF-014 | **Score ICE:** 810 | **MoSCoW:** Must Have

---

### **US-015 – Cadastrar Turmas e Sessões**

**Descrição:**

Como gestor, quero cadastrar turmas, dias, horários e lotação de alunos para organizar sessões de forma adequada e respeitar limite de alunos por turma.

**Critérios de Aceite:**

- Deve permitir cadastrar horários, dias e unidades.
- Deve validar limite de lotação (máx. 30 alunos).
- Deve validar conflitos de horário.
- Deve permitir vincular docente responsável.

**Requisito:** RF-015 | **Score ICE:** 900 | **MoSCoW:** Must Have

---

### **US-016 – Consultar Turmas**

**Descrição:**

Como gestor ou docente, quero consultar turmas com busca por nome de alunos, CPF, status de justificativa e taxa de presença para análises rápidas e decisões informadas.

**Critérios de Aceite:**

- Deve permitir buscar por nome, CPF, presença, justificativa, unidade.
- Deve exibir taxa de presença na turma.
- Deve ordenar resultados por relevância.
- Deve mostrar situação das justificativas por aluno.

**Requisito:** RF-016 | **Score ICE:** 720 | **MoSCoW:** Must Have

---

## 📌 Objetivo Específico 4 – Ampliar a personalização do acompanhamento estudantil

### **US-017 – Registrar Acompanhamento Neurodivergente**

**Descrição:**

Como docente ou gestor, quero registrar planos pedagógicos individuais para alunos neurodivergentes, garantindo acompanhamento adequado e alerta de necessidades especiais.

**Critérios de Aceite:**

- Deve permitir cadastrar plano de intervenção.
- Deve permitir registrar periodicidade (ex.: a cada 2 meses).
- Deve permitir registrar acompanhamento oral com familiares.
- Deve permitir anexar documentos.

**Requisito:** RF-017 | **Score ICE:** 630 | **MoSCoW:** Should Have

---

### **US-018 – Registrar Relatórios de Acompanhamento**

**Descrição:**

Como gestor ou docente, quero registrar e importar relatórios enviados pelos responsáveis para manter histórico completo de acompanhamento individual.

**Critérios de Aceite:**

- Deve permitir anexar relatórios de acompanhamento.
- Deve armazenar data/hora e autor do envio.
- Deve permitir comentários adicionais.
- Deve registrar histórico completo.

**Requisito:** RF-018 | **Score ICE:** 432 | **MoSCoW:** Should Have

---

### **US-019 – Gerar Histórico de Acompanhamento**

**Descrição:**

Como gestor ou docente, quero gerar histórico consolidado de relatórios de acompanhamento, disponível para exportação e análise periódica.

**Critérios de Aceite:**

- Deve consolidar todos os relatórios vinculados ao aluno.
- Deve ordenar por data.
- Deve permitir filtros (tipo, período).
- Deve permitir exportação em PDF/Excel.

**Requisito:** RF-019 | **Score ICE:** 432 | **MoSCoW:** Should Have

---

## 📌 Objetivo Específico 5 – Melhorar a comunicação institucional e o acesso a informações oficiais

### **US-020 – Cadastrar Conteúdos Institucionais**

**Descrição:**

Como administrador, quero cadastrar regras, normas e comunicados oficiais para disponibilizar conteúdos institucionais de forma organizada e acessível.

**Critérios de Aceite:**

- Deve permitir cadastrar textos, PDFs e links.
- Deve permitir classificar por categoria (uniforme, disciplina, legislação etc.).
- Deve permitir edição e atualização.
- Deve permitir disponibilização diferenciada por perfil de acesso.

**Requisito:** RF-020 | **Score ICE:** 252 | **MoSCoW:** Could Have

---

## Histórico de Versão

| Data | Versão | Descrição | Autor(es) | Revisor(es) |
|------|--------|-----------|-----------|-------------|
| 21/10/2025 | 1.0 | Criação inicial do documento de User Stories | Equipe FireForce | Vitor Marconi |


