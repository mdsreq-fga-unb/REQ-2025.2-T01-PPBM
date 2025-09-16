# Levantamento Parcial de Requisitos

A equipe realizou um levantamento parcial de requisitos funcionais de software com o objetivo de compreender melhor o escopo do sistema e fundamentar a elaboração do cronograma do projeto. Este levantamento inicial permite uma visão mais clara das funcionalidades necessárias e auxilia no planejamento das atividades de desenvolvimento.

## Requisitos Funcionais (RF)

### Módulo: Cadastro & Dados do Aluno

**RF-001 – Cadastrar criança**
Permitir cadastro com: nome, data de nascimento, CPF, responsável(éis), contatos, escola/unidade, cidade.
Critérios de aceite: campos obrigatórios validados; prevenção de duplicidade por CPF; validação de formato de CPF; idade entre 7 e 14 anos; confirmação de dados antes do salvamento.

**RF-002 – Gerenciar responsáveis**
Incluir/editar/remover responsáveis, com vínculo a uma criança e múltiplos contatos.
Critérios de aceite: pelo menos um responsável obrigatório por criança; validação de dados de contato; possibilidade de múltiplos responsáveis; histórico de alterações mantido.

**RF-003 – Ficha médica**
Registrar e manter observações médicas (asma, alergias, restrições, medicações e contatos de emergência).
Critérios de aceite: alerta visual quando houver condição crítica cadastrada; campos obrigatórios para condições críticas; possibilidade de anexar documentos médicos; atualização de informações médicas com data/hora.

**RF-004 – Perfil neurodivergente**
Diferenciar cadastro para crianças neurodivergentes (campos de acompanhamento, adaptações e observações pedagógicas).
Critérios de aceite: identificação clara do perfil neurodivergente; campos específicos para acompanhamento pedagógico; relatórios diferenciados para este perfil; alertas para educadores sobre adaptações necessárias.

**RF-005 – Histórico do aluno**
Exibir linha do tempo com presenças, faltas, justificativas, atendimentos e comunicações relacionadas.
Critérios de aceite: ordenação cronológica dos eventos; filtros por período e tipo de evento; visualização clara e intuitiva; possibilidade de exportar histórico.

### Módulo: Presença & Justificativas

**RF-006 – Registro de presença**
Lançar presença, falta e atraso por turma/sessão.
Critérios de aceite: seleção obrigatória de turma/sessão; validação de data/hora do lançamento; confirmação antes do salvamento; possibilidade de lançamento em lote para turma inteira.

**RF-007 – Justificar falta**
Permitir justificar faltas com motivo, anexo (opcional) e status (pendente/aprovada/recusada).
Critérios de aceite: registrar autor, data/hora e trilha de auditoria; motivo obrigatório para justificativa; anexos limitados a formatos específicos (PDF, JPG, PNG); notificação automática para responsáveis.

**RF-008 – Edição/retificação de lançamento**
Corrigir registros de presença/falta com histórico de alterações.
Critérios de aceite: histórico completo de alterações mantido; autorização necessária para alterações; notificação de alterações para responsáveis; possibilidade de reverter alterações.

**RF-009 – Consulta rápida por aluno**
Filtrar histórico de presenças/faltas por aluno, período e unidade.
Critérios de aceite: busca por nome ou CPF; filtros por período configurável; resultados ordenados cronologicamente; possibilidade de exportar resultados da consulta.

### Módulo: Relatórios & Análises

**RF-010 – Relatório individual de frequência**
Gerar relatório por aluno (período selecionável) com taxas de presença, faltas justificadas e não justificadas.
Critérios de aceite: seleção obrigatória de período; cálculo automático de percentuais; inclusão de gráficos visuais; possibilidade de impressão direta.

**RF-011 – Relatórios por turma/unidade**
Consolidar frequência por turma, unidade e cidade, com comparativos por período.
Critérios de aceite: agrupamento por turma/unidade; comparação entre períodos; indicadores de tendência; possibilidade de drill-down para detalhes.

**RF-012 – Exportação**
Exportar relatórios em PDF e Excel (CSV/XLSX).
Critérios de aceite: formatação adequada para cada formato; preservação de dados e gráficos; nome de arquivo com data/hora; validação de tamanho de arquivo.

**RF-013 – Dashboards de frequência**
Exibir indicadores e gráficos (taxa média de presença, top motivos de faltas, alertas de recorrência).
Critérios de aceite: atualização em tempo real; gráficos interativos; alertas visuais para situações críticas; possibilidade de personalizar visualizações.

### Módulo: Comunicação

**RF-014 – Canal formal de comunicação**
Espaço interno para mensagens entre equipe do PBM e responsáveis (sem uso de apps externos).
Critérios de aceite: mensagens por aluno/turma; confirmação de leitura; histórico de conversas mantido; possibilidade de anexar arquivos; notificação de novas mensagens.

**RF-015 – Notificações**
Enviar notificações (e-mail/push/SMS*) sobre faltas, justificativas, lembretes e avisos oficiais.
Critérios de aceite: configuração de preferências de notificação; templates personalizáveis; confirmação de entrega; possibilidade de cancelar notificações.
Obs.: *canal SMS/push depende de viabilidade/custo.

**RF-016 – Boletins e avisos**
Publicar comunicados gerais por unidade/turma com anexos.
Critérios de aceite: seleção de destinatários (unidade/turma); anexos em formatos específicos; confirmação de leitura; possibilidade de agendar publicação.

### Módulo: Acesso & Perfis

**RF-017 – Autenticação e perfis**
Acesso com autenticação e papéis: Administrador, Gestor de Unidade, Docente, Responsável.
Critérios de aceite: login seguro com validação; recuperação de senha; sessão com timeout configurável; primeiro acesso com alteração obrigatória de senha.

**RF-018 – Controle de permissões**
Restringir operações por papel (ex.: responsável não edita presenças; docente registra e justifica; gestor aprova justificativas).
Critérios de aceite: matriz de permissões clara; validação de acesso em cada operação; logs de tentativas de acesso negado; possibilidade de permissões temporárias.

**RF-019 – Multiunidade**
Operar dados segregados por 12 cidades/unidades, com visão consolidada para administradores.
Critérios de aceite: isolamento completo de dados por unidade; visão consolidada apenas para administradores; possibilidade de transferir alunos entre unidades; relatórios consolidados por região.

### Módulo: Operação & Processo

**RF-020 – Auditoria**
Registrar trilhas de auditoria (quem fez, o quê, quando, antes/depois) para operações sensíveis.
Critérios de aceite: registro automático de todas as operações críticas; dados imutáveis de auditoria; relatórios de auditoria exportáveis; retenção de logs por período configurável.

**RF-021 – Importação de dados**
Importar planilhas de alunos/turmas (CSV/XLSX) com validação e pré-visualização.
Critérios de aceite: validação de formato antes da importação; pré-visualização dos dados; tratamento de erros com relatório detalhado; possibilidade de cancelar importação.

**RF-022 – Catálogo de turmas e sessões**
Cadastrar turmas, dias/horários, lotação e instrutores.
Critérios de aceite: validação de conflitos de horários; controle de lotação máxima; vinculação obrigatória de instrutor; possibilidade de replicar turmas.

**RF-023 – Indicadores de engajamento**
Métricas de uso (lançamentos por período, taxa de resposta de responsáveis).
Critérios de aceite: cálculo automático de métricas; atualização em tempo real; comparação entre períodos; alertas para baixo engajamento.

**RF-024 – Suporte a anexos**
Permitir anexar comprovantes (PDF/JPG/PNG) em justificativas e comunicações.
Critérios de aceite: validação de formato e tamanho; preview de imagens; compressão automática; armazenamento seguro de arquivos.

**RF-025 – Filtros & busca**
Busca por nome, CPF, turma, unidade, status de justificativa e período.
Critérios de aceite: busca em tempo real; filtros combináveis; resultados ordenados por relevância; histórico de buscas recentes.
