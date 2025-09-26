---
title: Requisitos
---


A equipe realizou o refinamento de requisitos funcionais e não funcionais de software com o objetivo de compreender melhor o escopo do sistema e fundamentar a elaboração do cronograma do projeto. Este refinamento permite uma visão mais clara das funcionalidades necessárias e auxilia no planejamento das atividades de desenvolvimento.

---

## Requisitos Funcionais (RF)

### Módulo: Cadastro & Dados do Aluno

**RF-001 – Cadastrar criança**
Permitir cadastro com: nome, data de nascimento, CPF, responsável(éis), contatos, escola/unidade, cidade.
**Critérios de aceite:**

* campos obrigatórios validados;
* prevenção de duplicidade por CPF;
* validação de formato de CPF;
* idade entre 7 e 14 anos;
* confirmação de dados antes do salvamento;
* pelo menos um responsável obrigatório por criança.

**RF-002 – Gerenciar responsáveis**
Editar/remover responsáveis, com vínculo a uma criança e múltiplos contatos.
**Critérios de aceite:**

* validação de dados de contato;
* possibilidade de múltiplos responsáveis;
* histórico de alterações mantido.

**RF-003 – Ficha médica**
Registrar e manter observações médicas (asma, alergias, restrições, medicações e contatos de emergência).
**Critérios de aceite:**

* alerta visual quando houver condição crítica cadastrada;
* campos obrigatórios para condições críticas;
* possibilidade de anexar documentos médicos;
* atualização de informações médicas com data/hora.

**RF-004 – Perfil neurodivergente**
Diferenciar cadastro para crianças neurodivergentes (campos de acompanhamento, adaptações e observações pedagógicas).
**Critérios de aceite:**

* identificação clara do perfil neurodivergente importando o documento de comprovante;
* campos específicos para acompanhamento pedagógico;
* relatórios diferenciados para este perfil;
* alertas para educadores sobre adaptações necessárias.

---

### Módulo: Presença & Justificativas

**RF-005 – Registro de presença**
Lançar presença, falta e atraso por turma/sessão.
**Critérios de aceite:**

* seleção obrigatória de turma/sessão;
* validação de data/hora do lançamento;
* confirmação antes do salvamento.

**RF-006 – Justificar falta**
Permitir justificar faltas com motivo, anexo (opcional) e status (pendente/aprovada/recusada).
**Critérios de aceite:**

* registrar autor, data/hora e trilha de auditoria;
* motivo obrigatório para justificativa;
* anexos limitados a formatos específicos (PDF, JPG, PNG);
* notificação automática para responsáveis.

**RF-007 – Edição/retificação de lançamento**
Corrigir registros de presença/falta com histórico de alterações.
**Critérios de aceite:**

* histórico completo de alterações mantido;
* autorização necessária para alterações;
* notificação de alterações para responsáveis;
* confirmação de alteração.

**RF-024 – Suporte a anexos**
Permitir anexar comprovantes (PDF/JPG/PNG) em justificativas e comunicações.
**Critérios de aceite:**

* validação de formato e tamanho;
* preview de imagens;
* compressão automática;
* armazenamento seguro de arquivos.

---

### Módulo: Relatórios & Análises

**RF-008 – Consulta rápida por aluno**
Filtrar histórico de presenças/faltas por aluno, período e unidade.
**Critérios de aceite:**

* busca por nome ou CPF;
* filtros por período configurável;
* resultados ordenados cronologicamente;
* possibilidade de exportar resultados da consulta.

**RF-009 – Relatório individual de frequência**
Gerar relatório por aluno (período selecionável) com taxas de presença, faltas justificadas e não justificadas.
**Critérios de aceite:**

* seleção obrigatória de período;
* cálculo automático de percentuais;
* inclusão de gráficos visuais.

**RF-010 – Relatórios por turma/unidade**
Consolidar frequência por turma, unidade e cidade, com comparativos por período.
**Critérios de aceite:**

* agrupamento por turma/unidade;
* comparação entre períodos;
* possibilidade de drill-down para detalhes.

**RF-011 – Exportação**
Exportar relatórios em PDF e Excel (CSV/XLSX).
**Critérios de aceite:**

* formatação adequada para cada formato;
* preservação de dados e gráficos;
* nome de arquivo com data/hora;
* validação de tamanho de arquivo.

**RF-012 – Dashboards de frequência**
Exibir indicadores e gráficos (taxa média de presença, alertas de recorrência).
**Critérios de aceite:**

* atualização em tempo real;
* gráficos interativos;
* alertas visuais para situações críticas;
* possibilidade de personalizar visualizações.

**RF-013 – Histórico do aluno**
Exibir linha do tempo com presenças, faltas, justificativas, atendimentos, advertências e comunicações relacionadas.
**Critérios de aceite:**

* ordenação cronológica dos eventos;
* filtros por período e tipo de evento;
* visualização clara e intuitiva;
* possibilidade de exportar histórico.

---

### Módulo: Comunicação

**RF-016 – Advertência**
Campo para anotações de comportamentos negativos.

**RF-015 – Notificações**
Bot de notificações ou botão de redirecionamento de notificações (WhatsApp) sobre faltas, justificativas, advertência.
**Critérios de aceite:**

* configuração de preferências de notificação;
* templates personalizáveis;
* confirmação de entrega;
* possibilidade de cancelar notificações.
  **Obs.:** bot WhatsApp depende de viabilidade/custo.

---

### Módulo: Acesso & Perfis

**RF-017 – Autenticação e perfis**
Acesso com autenticação e papéis: Administrador, Gestor de Unidade, Docente, Responsável.
**Critérios de aceite:**

* login seguro com validação;
* recuperação de senha;
* sessão com timeout configurável;
* primeiro acesso com alteração obrigatória de senha.

**RF-018 – Controle de permissões**
Restringir operações por papel (ex.: responsável não edita presenças; docente registra e justifica; gestor aprova justificativas).
**Critérios de aceite:**

* matriz de permissões clara;
* validação de acesso em cada operação;
* logs de tentativas de acesso negado.

**RF-019 – Multiunidade**
Operar dados segregados por 12 cidades/unidades, com visão consolidada para administradores.
**Critérios de aceite:**

* isolamento completo de dados por unidade;
* visão consolidada apenas para administradores;
* possibilidade de transferir alunos entre unidades;
* relatórios consolidados por região.

---

### Módulo: Operação & Processo

**RF-020 – Auditoria**
Registrar trilhas de auditoria (quem fez, o quê, quando, antes/depois) para operações sensíveis.
**Critérios de aceite:**

* registro automático de todas as operações críticas;
* dados imutáveis de auditoria;
* relatórios de auditoria exportáveis;
* retenção de logs por período configurável.

**RF-022 – Catálogo de turmas e sessões**
Cadastrar turmas, dias/horários, lotação e instrutores.
**Critérios de aceite:**

* validação de conflitos de horários;
* controle de lotação máxima;
* vinculação obrigatória de instrutor.

**RF-025 – Filtros & busca**
Busca por nome, CPF, turma, unidade, status de justificativa e período.
**Critérios de aceite:**

* busca em tempo real;
* filtros combináveis;
* resultados ordenados por relevância;
* histórico de buscas recentes.

---

## Requisitos Não Funcionais (RNF)

### Módulo: Desempenho & Escalabilidade

**RNF-001 – Tempo de resposta**
O sistema deve responder a consultas e operações críticas em até 5 segundos em condições normais de uso.
**Critérios de aceite:**

* medições automatizadas em consultas de presença e histórico;
* máximo de 5% das operações acima de 2s;
* relatórios gerados em até 10s.

**RNF-004 – Tempo de resposta**
95% das páginas < 2s; exportações até 10s para 5k registros.

**RNF-005 – Carga**
Suportar uso concorrente das 12 unidades (≥150 usuários simultâneos no pico do registro de presença).

---

### Módulo: Segurança & Privacidade

**RNF-002 – Proteção de dados pessoais**
O sistema deve atender à LGPD, garantindo consentimento para coleta de dados sensíveis e direito de exclusão mediante solicitação.
**Critérios de aceite:**

* registro de consentimento armazenado;
* logs de exclusão segura;
* relatórios de conformidade disponíveis.

**RNF-003 – Criptografia**
Todos os dados devem ser transmitidos via HTTPS/TLS 1.2 ou superior.
**Critérios de aceite:**

* inspeção de rede sem tráfego em texto puro;
* auditoria de banco confirmando uso de criptografia.

---

### Módulo: Manutenibilidade & Evolutividade

**RNF-004 – Documentação técnica**
O sistema deve manter documentação atualizada de APIs, banco de dados e arquitetura.
**Critérios de aceite:**

* repositório de documentação acessível à equipe;
* atualização obrigatória a cada release.

**RNF-005 – Testabilidade**
O sistema deve permitir criação de testes automatizados cobrindo no mínimo 70% das funcionalidades críticas.
**Critérios de aceite:**

* pipeline de integração contínua com relatórios de cobertura;
* falha no build caso a cobertura fique abaixo do limite.

**RNF-014 – Padrões de código**
TypeScript com lint/prettier, testes unitários (TDD) e cobertura-alvo ≥70% no MVP.

**RNF-015 – CI/CD**
Pipeline automatizado (build, testes, análise estática, deploy).

**RNF-016 – Observabilidade**
Monitoramento com métricas, logs estruturados e alertas.

---

### Módulo: Qualidade & Usabilidade

**RNF-001 – Usabilidade**
Interface simples, navegação com voltar/avançar consistente e fluxos de 1–3 cliques para ações frequentes (lançar presença, justificar falta).

**RNF-003 – Idioma & Terminologia**
Português (Brasil) com terminologia do PBM (brigadinos/brigadinas).

---

### Módulo: Confiabilidade & Disponibilidade

**RNF-011 – Disponibilidade**
Alvo de 99,5% mensal para o MVP.

---

### Módulo: Portabilidade & Tecnologia

**RNF-017 – Contêineres**
Empacotado em Docker para front, back e banco.

**RNF-018 – Stack**
Back-end TypeScript + Express; Front-end Astro; Banco Supabase/PostgreSQL.

**RNF-019 – Compatibilidade de navegação**
Suporte a Chrome/Edge/Firefox atuais e Safari atual -1 versão.

---

### Módulo: Dados & Relatórios

**RNF-020 – Exportação fiel**
PDFs com identidade visual do PBM; CSV/XLSX com separador padrão e codificação UTF-8.


