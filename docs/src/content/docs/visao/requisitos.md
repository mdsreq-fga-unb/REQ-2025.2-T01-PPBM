---
title: Requisitos
---

---

A equipe realizou o refinamento de requisitos funcionais e não funcionais de software com o objetivo de compreender melhor o escopo do sistema e fundamentar a elaboração do cronograma do projeto. Este refinamento permite uma visão mais clara das funcionalidades necessárias e auxilia no planejamento das atividades de desenvolvimento.

---

## Requisitos Funcionais (RF)

### Módulo: Cadastro & Dados do Aluno

**RF-001 – Cadastrar criança**

Permitir cadastro com: nome, data de nascimento, CPF, responsável(éis), contatos, escola/unidade, cidade.
Critérios de aceite:

* campos obrigatórios validados;
* prevenção de duplicidade por CPF;
* validação de formato de CPF;
* idade entre 7 e 14 anos;
* confirmação de dados antes do salvamento;
* pelo menos um responsável obrigatório por criança.

**RF-002 – Gerenciar responsáveis**

Editar/remover responsáveis, com vínculo a uma criança e múltiplos contatos.
Critérios de aceite:

* validação de dados de contato;
* possibilidade de múltiplos responsáveis;
* histórico de alterações mantido.

**RF-003 – Registrar ficha médica**

Registrar e manter observações médicas (asma, alergias, restrições, medicações e contatos de emergência).
Critérios de aceite:

* alerta visual quando houver condição crítica cadastrada;
* campos obrigatórios para condições críticas;
* possibilidade de anexar documentos médicos;
* atualização de informações médicas com data/hora.

**RF-004 – Diferenciar perfil neurodivergente**

Diferenciar cadastro para crianças neurodivergentes (campos de acompanhamento, adaptações e observações pedagógicas).
Critérios de aceite:

* identificação clara do perfil neurodivergente importando o documento de comprovante;
* campos específicos para acompanhamento pedagógico;
* relatórios diferenciados para este perfil;
* alertas para educadores sobre adaptações necessárias.

**RF-005 – Cadastrar informações complementares do aluno**

Permitir o registro de informações adicionais como:

* nome de guerra;
* tipo sanguíneo;
* graduação (soldado até 9 anos; de 10 anos a cabo; a cada 11 anos, 3º sargento; sargento).
  Critérios de aceite:
* campos obrigatórios validados;
* regras automáticas de atribuição de graduação conforme idade;
* possibilidade de atualização e histórico de alterações.

---

### Módulo: Presença & Justificativas

**RF-006 – Registrar presença**

Lançar presença, falta e atraso por turma/sessão.
Critérios de aceite:

* seleção obrigatória de turma/sessão;
* validação de data/hora do lançamento;
* confirmação antes do salvamento.

**RF-007 – Justificar falta**

Permitir justificar faltas com motivo, anexo (opcional) e status (pendente/aprovada/recusada).
Critérios de aceite:

* registrar autor, data/hora e trilha de auditoria;
* motivo obrigatório para justificativa;
* anexos limitados a formatos específicos (PDF, JPG, PNG);
* notificação automática para responsáveis.

**RF-008 – Editar lançamento de presença**

Corrigir registros de presença/falta com histórico de alterações.
Critérios de aceite:

* histórico completo de alterações mantido;
* autorização necessária para alterações;
* notificação de alterações para responsáveis;
* confirmação de alteração.

**RF-009 – Suportar anexos**

Permitir anexar comprovantes (PDF/JPG/PNG) em justificativas e comunicações.
Critérios de aceite:

* validação de formato e tamanho;
* preview de imagens;
* compressão automática;
* armazenamento seguro de arquivos.

**RF-010 – Definir política de justificativa de faltas**

Permitir que faltas justificadas sejam registradas como "falta justificada", não anulando a ausência, mas impactando indicadores de forma diferenciada.
Critérios de aceite:

* exibir no histórico como "falta justificada";
* contabilizar separadamente das faltas comuns;
* manter rastreabilidade no relatório individual.

**RF-011 – Conceder autonomia docente para justificativas**

Permitir que o professor aprove ou rejeite justificativas de falta de forma autônoma.
Critérios de aceite:

* interface para docentes validarem justificativas;
* registro de decisão (aprovada/recusada) com data/hora;
* notificação ao responsável sobre a decisão.

**RF-012 – Definir motivos e documentos aceitos para justificativa**

Permitir parametrização dos motivos justificáveis (ex.: atestado médico, participação em atividades desportivas) e exigência de documentos obrigatórios.
Critérios de aceite:

* cadastro de lista de motivos aceitos;
* exigência de anexos em casos definidos (ex.: atestado médico);
* validação de anexos quanto a formato e obrigatoriedade.

**RF-013 – Limitar número de alunos por turma (pelotão)**

Permitir configuração de limite de 30 alunos por turma (pelotão).
Critérios de aceite:

* impedir cadastro acima do limite configurado;
* exibir alerta ao gestor quando turma atingir lotação máxima;
* permitir exceções apenas com autorização administrativa.

---

### Módulo: Relatórios & Análises

**RF-014 – Consultar aluno**

Filtrar histórico de presenças/faltas por aluno, período e unidade.
Critérios de aceite:

* busca por nome ou CPF;
* filtros por período configurável;
* resultados ordenados cronologicamente;
* possibilidade de exportar resultados da consulta.

**RF-015 – Gerar relatório individual de frequência**

Gerar relatório por aluno (período selecionável) com taxas de presença, faltas justificadas e não justificadas.
Critérios de aceite:

* seleção obrigatória de período;
* cálculo automático de percentuais;
* inclusão de gráficos visuais.

**RF-016 – Consolidar relatórios por turma/unidade**

Consolidar frequência por turma, unidade e cidade, com comparativos por período.
Critérios de aceite:

* agrupamento por turma/unidade;
* comparação entre períodos;
* possibilidade de drill-down para detalhes.

**RF-017 – Exportar relatórios**

Exportar relatórios em PDF e Excel (CSV/XLSX).
Critérios de aceite:

* formatação adequada para cada formato;
* preservação de dados e gráficos;
* nome de arquivo com data/hora;
* validação de tamanho de arquivo.

**RF-018 – Exibir dashboards de frequência**

Exibir indicadores e gráficos (taxa média de presença, alertas de recorrência).
Critérios de aceite:

* atualização em tempo real;
* gráficos interativos;
* alertas visuais para situações críticas;
* possibilidade de personalizar visualizações.

**RF-019 – Exibir histórico do aluno**

Exibir linha do tempo com presenças, faltas, justificativas, atendimentos, advertências e comunicações relacionadas.
Critérios de aceite:

* ordenação cronológica dos eventos;
* filtros por período e tipo de evento;
* visualização clara e intuitiva;
* possibilidade de exportar histórico.

**RF-020 – Exportar relatórios oficiais padronizados**

Permitir exportação de relatórios em modelos definidos pelo CBMDF (incluindo logotipo e identidade oficial).
Critérios de aceite:

* conformidade com modelo fornecido pelo cliente;
* exportação em PDF fiel ao modelo;
* integração de dados do sistema com campos do relatório.

---

### Módulo: Comunicação

**RF-021 – Registrar advertência**

Campo para anotações de comportamentos negativos.

**RF-022 – Enviar notificações**

Bot de notificações ou botão de redirecionamento de notificações (WhatsApp, e-mail, plataforma própria).
Critérios de aceite:

* configuração de preferências de notificação;
* templates personalizáveis;
* confirmação de entrega;
* possibilidade de cancelar notificações.
  Obs.: integração com Gmail e orçamento para SMS/push a definir.

---

### Módulo: Acesso & Perfis

**RF-023 – Autenticar usuários e perfis**

Acesso com autenticação e papéis: Administrador, Gestor de Unidade, Docente, Responsável.
Critérios de aceite:

* login seguro com validação;
* recuperação de senha;
* sessão com timeout configurável;
* primeiro acesso com alteração obrigatória de senha.

**RF-024 – Controlar permissões de acesso**

Restringir operações por papel (ex.: responsável não edita presenças; docente registra e justifica; gestor aprova justificativas).
Critérios de aceite:

* matriz de permissões clara;
* validação de acesso em cada operação;
* logs de tentativas de acesso negado.

**RF-025 – Operar multiunidade**

Operar dados segregados por 12 cidades/unidades, com visão consolidada para administradores.
Critérios de aceite:

* isolamento completo de dados por unidade;
* visão consolidada apenas para administradores;
* possibilidade de transferir alunos entre unidades;
* relatórios consolidados por região.

---

### Módulo: Operação & Processo

**RF-026 – Registrar auditoria**

Registrar trilhas de auditoria (quem fez, o quê, quando, antes/depois) para operações sensíveis.
Critérios de aceite:

* registro automático de todas as operações críticas;
* dados imutáveis de auditoria;
* relatórios de auditoria exportáveis;
* retenção de logs por período configurável.

**RF-027 – Cadastrar turmas e sessões**

Cadastrar turmas, dias/horários, lotação e instrutores.
Critérios de aceite:

* validação de conflitos de horários;
* controle de lotação máxima (30 alunos por turma);
* vinculação obrigatória de instrutor.

**RF-028 – Implementar filtros e busca**

Busca por nome, CPF, turma, unidade, status de justificativa e período.
Critérios de aceite:

* busca em tempo real;
* filtros combináveis;
* resultados ordenados por relevância;
* histórico de buscas recentes.

---

### Módulo: Acompanhamento Neurodivergente

**RF-029 – Registrar plano de acompanhamento neurodivergente**

Permitir o registro de plano de intervenção pedagógica e acompanhamento periódico com responsáveis.
Critérios de aceite:

* cadastro de campos específicos para plano de intervenção;
* periodicidade mínima de acompanhamento a cada 2 meses;
* registro de relatórios orais/documentais dos responsáveis;
* geração de histórico acessível a docentes e gestores.

---

### Módulo: Gestão de Conteúdo

**RF-030 – Cadastrar conteúdos institucionais**

Permitir o cadastro de conteúdos textuais e documentais, como:

* regras de vestimenta;
* normas disciplinares;
* legislação aplicável;
* comunicados oficiais.
  Critérios de aceite:
* editor de texto com formatação básica;
* suporte a anexos (PDF, DOCX, imagens);
* categorização dos conteúdos;
* controle de versões.

**RF-031 – Exibir conteúdos institucionais para usuários**

Disponibilizar os conteúdos cadastrados em área dedicada do sistema.
Critérios de aceite:

* acesso restrito por perfil (apenas gestores podem editar, todos podem visualizar);
* visualização clara em desktop e mobile;
* busca por título, categoria ou palavra-chave.

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


