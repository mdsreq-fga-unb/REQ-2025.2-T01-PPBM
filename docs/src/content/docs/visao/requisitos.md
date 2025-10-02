---
title: Requisitos
---

---

A equipe realizou o refinamento de requisitos funcionais e não funcionais de software com o objetivo de compreender melhor o escopo do sistema e fundamentar a elaboração do cronograma do projeto. Este refinamento permite uma visão mais clara das funcionalidades necessárias e auxilia no planejamento das atividades de desenvolvimento.

---

## Requisitos Funcionais (RF)

### Módulo: Cadastro & Dados do Aluno

**RF-001 – Gerenciar Aluno**

Permitir cadastro, edição, remoção e exclusão de nome, data de nascimento, CPF, responsável(éis), contatos, escola/unidade, cidade.
Critérios de aceite:

* campos obrigatórios validados;
* prevenção de duplicidade por CPF;
* validação de formato de CPF;
* idade entre 7 e 14 anos;
* confirmação de dados antes do salvamento;
* pelo menos um responsável obrigatório por Aluno.


* **Registrar ficha médica:** Registrar e manter observações médicas (asma, alergias, restrições, medicações e contatos de emergência). Critérios: alerta visual quando houver condição crítica cadastrada; campos obrigatórios para condições críticas; possibilidade de anexar documentos médicos; atualização de informações médicas com data/hora.

* **Diferenciar perfil neurodivergente:** Diferenciar cadastro para crianças neurodivergentes (campos de acompanhamento, adaptações e observações pedagógicas). Critérios: identificação clara do perfil neurodivergente importando o documento de comprovante; campos específicos para acompanhamento pedagógico; relatórios diferenciados para este perfil; alertas para educadores sobre adaptações necessárias.

* **Cadastrar informações complementares do aluno:** Permitir o registro de informações adicionais como nome de guerra, tipo sanguíneo, graduação (soldado até 9 anos; de 10 anos a cabo; a cada 11 anos, 3º sargento; sargento). Critérios: campos obrigatórios validados; regras automáticas de atribuição de graduação conforme idade; possibilidade de atualização e histórico de alterações.

**RF-002 – Gerenciar responsáveis**

Editar/remover responsáveis, com vínculo a uma Aluno e múltiplos contatos.
Critérios de aceite:

* validação de dados de contato;
* possibilidade de múltiplos responsáveis;
* histórico de alterações mantido.

**RF-003 – Exportar documentos de comprovante**

Permitir a exportação de documentos de comprovante importados (como laudos médicos, documentos de identificação neurodivergente, etc.) para download ou impressão.
Critérios de aceite:

* visualização clara dos documentos disponíveis para exportação;
* formatos de exportação: PDF original, PNG/JPG (para imagens);
* controle de acesso baseado no perfil do usuário;
* registro de auditoria para cada exportação realizada;
* marca d'água de confidencialidade nos documentos exportados.

---

### Módulo: Presença & Justificativas

**RF-007 – Registrar presença**

Lançar presença, falta e atraso por turma/sessão.
Critérios de aceite:

* seleção obrigatória de turma/sessão;
* validação de data/hora do lançamento;
* confirmação antes do salvamento.

**Subcaracterísticas:**

* **Justificar falta:** Permitir justificar faltas com motivo, anexo (opcional) e status (pendente/aprovada/recusada). Critérios: registrar autor, data/hora e trilha de auditoria; motivo obrigatório para justificativa; anexos limitados a formatos específicos (PDF, JPG, PNG); notificação automática para responsáveis.

* **Suportar anexos:** Permitir anexar comprovantes (PDF/JPG/PNG) em justificativas e comunicações. Critérios: validação de formato e tamanho; preview de imagens; compressão automática; armazenamento seguro de arquivos.

**RF-004 – Editar lançamento de presença**

Corrigir registros de presença/falta com histórico de alterações.
Critérios de aceite:

* histórico completo de alterações mantido;
* autorização necessária para alterações;
* notificação de alterações para responsáveis;
* confirmação de alteração.


---

### Módulo: Relatórios & Análises

**RF-005 – Consultar aluno**

Filtrar histórico de presenças/faltas por aluno, período e unidade.
Critérios de aceite:

* busca por nome ou CPF;
* filtros por período configurável;
* resultados ordenados cronologicamente;
* possibilidade de exportar resultados da consulta.

**RF-006 – Gerar relatório individual de frequência**

Gerar relatório por aluno (período selecionável) com taxas de presença, faltas justificadas e não justificadas.
Critérios de aceite:

* seleção obrigatória de período;
* cálculo automático de percentuais;
* inclusão de gráficos visuais.

**RF-007 – Consolidar relatórios por turma/unidade**

Consolidar frequência por turma, unidade e cidade, com comparativos por período.
Critérios de aceite:

* agrupamento por turma/unidade;
* comparação entre períodos;
* possibilidade de drill-down para detalhes.

**RF-008 – Exportar relatórios internos**

O sistema deve permitir a exportação de relatórios gerados pela plataforma para uso interno da equipe em formatos PDF e Excel (CSV/XLSX).
Critérios de aceite:

* formatação adequada para cada formato (tabelas, gráficos, indicadores);
* preservação de dados e gráficos incluídos no relatório;
* geração de nome de arquivo automático com data/hora;
* validação de tamanho de arquivo para evitar exportações inválidas.

**RF-009 – Exibir dashboards de frequência**

Exibir indicadores e gráficos (taxa média de presença, alertas de recorrência).
Critérios de aceite:

* atualização em tempo real;
* gráficos interativos;
* alertas visuais para situações críticas;
* possibilidade de personalizar visualizações.

**RF-010 – Exibir histórico do aluno**

Exibir linha do tempo com presenças, faltas, justificativas, atendimentos, advertências e comunicações relacionadas.
Critérios de aceite:

* ordenação cronológica dos eventos;
* filtros por período e tipo de evento;
* visualização clara e intuitiva;
* possibilidade de exportar histórico.

**RF-011 – Exportar relatórios oficiais padronizados administrativos**

Permitir exportação de relatórios em modelos definidos pelo CBMDF (incluindo logotipo e identidade oficial) voltado para a parte administrativa.
Critérios de aceite:

* gerar relatórios com uma visão geral;
* conformidade com modelo fornecido pelo cliente;
* exportação em PDF fiel ao modelo;
* integração de dados do sistema com campos do relatório.

---

### Módulo: Comunicação

**RF-012 – Registrar advertência para os alunos**

Campo para anotações de comportamentos negativos de alunos.

**RF-013 – Enviar notificações para os responsavéis**

Bot de notificações de comunicados de faltas e advertências ou botão de redirecionamento de notificações (WhatsApp, e-mail, plataforma própria).
Critérios de aceite:

* configuração de preferências de notificação;
* templates personalizáveis;
* confirmação de entrega;
* possibilidade de cancelar notificações.
  Obs.: integração com Gmail e orçamento para SMS/push a definir.

---

### Módulo: Acesso & Perfis

**RF-014 – Autenticar usuários e perfis**

Acesso com autenticação e papéis: Administrador, Gestor de Unidade, Docente, Responsável.
Critérios de aceite:

* login seguro com validação;
* recuperação de senha;
* sessão com timeout configurável;
* primeiro acesso com alteração obrigatória de senha.


---

### Módulo: Operação & Processo

**RF-015 – Cadastrar os docentes**

* Permitir cadastro com: nome, data de nascimento, CPF, escola/unidade, cidade.
Critérios de aceite:

* campos obrigatórios validados;
* prevenção de duplicidade por CPF;
* validação de formato de CPF;
* confirmação de dados antes do salvamento;

**RF-016 – Cadastrar turmas e sessões**

Cadastrar turmas, dias/horários, lotação.
Critérios de aceite:

* vincular o docente na turma cadastrada.
* validação de conflitos de horários;
* controle de lotação máxima (30 alunos por turma);
* vinculação obrigatória de instrutor.

**RF-017 – Consultar turma**

Busca dentro da turma por nome de alunos, CPF, unidade, status de justificativa, taxa de presença e período.
Critérios de aceite:

* busca em tempo real;
* filtros combináveis;
* resultados ordenados por relevância;

---

### Módulo: Acompanhamento Neurodivergente

**RF-018 – Registrar plano de acompanhamento neurodivergente**

Permitir o registro de plano de acompanhamento pedagógica e acompanhamento periódico com responsáveis.
Critérios de aceite:

* cadastro de campos específicos para plano de acompanhamento;

---

**RF-019 – Registro de relatórios dos responsáveis**

* periodicidade mínima de acompanhamento a cada 2 meses;
* importar relatórios gerados na sessão de acompanhamento;

**RF-020 – Geração de histórico acessível a docentes e gestores**

* geração de histórico de relatórios de acompanhamento acessível a docentes e gestores;
* exportação de relatórios de acompanhamento;

### Módulo: Gestão de Conteúdo

**RF-021 – Cadastrar conteúdos institucionais**

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


---

## Requisitos Não Funcionais (RNF)

### Módulo: Desempenho & Escalabilidade

**RNF-001 – Tempo de resposta**

O sistema deve responder a consultas e operações críticas em até 5 segundos em condições normais de uso.
**Critérios de aceite:**

* medições automatizadas em consultas de presença e histórico;
* máximo de 5% das operações acima de 2s;
* relatórios gerados em até 10s.

**RNF-002 – Tempo de resposta**

95% das páginas < 2s; exportações até 10s para 5k registros.

**RNF-003 – Carga**

Suportar uso concorrente das 12 unidades (≥150 usuários simultâneos no pico do registro de presença).

---

### Módulo: Segurança & Privacidade

**RNF-004 – Proteção de dados pessoais**

O sistema deve atender à LGPD, garantindo consentimento para coleta de dados sensíveis e direito de exclusão mediante solicitação.
**Critérios de aceite:**

* registro de consentimento armazenado;
* logs de exclusão segura;
* relatórios de conformidade disponíveis.

**RNF-005 – Criptografia**

Todos os dados devem ser transmitidos via HTTPS/TLS 1.2 ou superior.
**Critérios de aceite:**

* inspeção de rede sem tráfego em texto puro;
* auditoria de banco confirmando uso de criptografia.

---

### Módulo: Manutenibilidade & Evolutividade

**RNF-006 – Documentação técnica**

O sistema deve manter documentação atualizada de APIs, banco de dados e arquitetura.
**Critérios de aceite:**

* repositório de documentação acessível à equipe;
* atualização obrigatória a cada release.

**RNF-007 – Testabilidade**

O sistema deve permitir criação de testes automatizados cobrindo no mínimo 70% das funcionalidades críticas.
**Critérios de aceite:**

* pipeline de integração contínua com relatórios de cobertura;
* falha no build caso a cobertura fique abaixo do limite.

**RNF-008 – Padrões de código**

TypeScript com lint/prettier, testes unitários (TDD) e cobertura-alvo ≥70% no MVP.

**RNF-009 – CI/CD**

Pipeline automatizado (build, testes, análise estática, deploy).

**RNF-010 – Observabilidade**

Monitoramento com métricas, logs estruturados e alertas.

---

### Módulo: Qualidade & Usabilidade

**RNF-011 – Usabilidade**

Interface simples, navegação com voltar/avançar consistente e fluxos de 1–3 cliques para ações frequentes (lançar presença, justificar falta).

**RNF-012 – Idioma & Terminologia**

Português (Brasil) com terminologia do PBM (brigadinos/brigadinas).

**RNF-013 – Navegabilidade de Conteúdos Institucionais**

Disponibilizar os conteúdos cadastrados em área dedicada do sistema com navegação intuitiva.
**Critérios de aceite:**

* acesso restrito por perfil (apenas gestores podem editar, todos podem visualizar);
* visualização clara em desktop e mobile;
* busca por título, categoria ou palavra-chave;
* navegação intuitiva entre diferentes categorias de conteúdo.

---

### Módulo: Confiabilidade & Disponibilidade

**RNF-014 – Disponibilidade**

Alvo de 99,5% mensal para o MVP.

---

### Módulo: Portabilidade & Tecnologia

**RNF-015 – Contêineres**

Empacotado em Docker para front, back e banco.

**RNF-016 – Stack**

Back-end TypeScript + Express; Front-end Astro; Banco Supabase/PostgreSQL.

**RNF-017 – Compatibilidade de navegação**

Suporte a Chrome/Edge/Firefox atuais e Safari atual -1 versão.

---

### Módulo: Dados & Relatórios

**RNF-018 – Exportação fiel**

PDFs com identidade visual do PBM; CSV/XLSX com separador padrão e codificação UTF-8.


