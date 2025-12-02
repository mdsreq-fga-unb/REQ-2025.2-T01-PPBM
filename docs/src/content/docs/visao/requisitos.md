---
title: Requisitos
---

---

A equipe realizou o refinamento de requisitos funcionais e não funcionais de software com o objetivo de compreender melhor o escopo do sistema e fundamentar a elaboração do cronograma do projeto. Este refinamento permite uma visão mais clara das funcionalidades necessárias e auxilia no planejamento das atividades de desenvolvimento.

---

## Requisitos Funcionais (RF)

### Objetivo Específico 1 – Melhorar a eficiência e confiabilidade no controle de frequência

**RF-001 – Gerenciar Aluno**  
Permitir cadastro, edição, remoção e exclusão de nome, data de nascimento, CPF, responsável(éis), contatos, escola/unidade, cidade.

**RF-002 – Gerenciar responsáveis**  
Editar/remover responsáveis, com vínculo a uma Aluno e múltiplos contatos.

**RF-003 – Exportar documentos de comprovante**  
Permitir a exportação de documentos de comprovante importados (como laudos médicos, documentos de identificação neurodivergente, etc.) para download ou impressão.

**RF-004 – Gerenciar lançamento de presença**  
Registros de presença/falta com histórico de alterações.

**RF-005 – Consultar aluno**  
Filtrar histórico de presenças/faltas por aluno, período e unidade.

**RF-006 – Gerar relatório individual de frequência**  
Gerar relatório por aluno (período selecionável) com taxas de presença, faltas justificadas e não justificadas.

**RF-007 – Exportar relatórios internos**  
Permitir exportação de relatórios gerados pela plataforma para uso interno da equipe em formatos PDF e Excel (CSV/XLSX).

**RF-008 – Exibir dashboards de frequência**
O sistema deve exibir indicadores visuais e gráficos que mostrem a taxa média de presença e alertas de recorrência, permitindo ao usuário filtrar esses dados por unidade, posto, turma ou período.​

**RF-009 – Exibir histórico do aluno**  
Exibir linha do tempo com presenças, faltas, justificativas, atendimentos, advertências e comunicações relacionadas.

**RF-010 – Exportar relatórios administrativos padronizados do CBMDF**
O sistema deve permitir a exportação dos seguintes relatórios em formato PDF/Excel, conforme padrões do CBMDF:​

● Relatório Mensal de Frequência por Unidade - Consolidação mensal de todas as marcações de ponto

● Relatório de Ausências e Justificativas - Lista de ausências com status de justificativas

● Relatório de Efetivo Presente - Snapshot diário do efetivo disponível

● Relatório de Ocorrências Disciplinares - Registro de faltas não justificadas e advertências

### Objetivo Específico 2 – Apoiar intervenções pedagógicas por meio do monitoramento comportamental

**RF-011 – Registrar advertência para os alunos**  
Campo para anotações de comportamentos negativos de alunos.

**RF-012 – Enviar notificações para os responsáveis**  
Bot de notificações de comunicados de faltas e advertências ou botão de redirecionamento de notificações (WhatsApp, e-mail, plataforma própria).

### Objetivo Específico 3 – Fortalecer a segurança e organização da gestão acadêmica

**RF-013 – Autenticar usuários e perfis**  
Acesso com autenticação e papéis: Administrador, Gestor de Unidade, Docente, Responsável.

**RF-014 – Cadastrar os docentes**  
Permitir cadastro com: nome, data de nascimento, CPF, escola/unidade, cidade.

**RF-015 – Cadastrar turmas e sessões**  
Cadastrar turmas, dias/horários e lotação.

**RF-016 – Consultar turma**  
Busca dentro da turma por nome de alunos, CPF, unidade, status de justificativa, taxa de presença e período.

### Objetivo Específico 4 – Ampliar a personalização do acompanhamento estudantil

**RF-017 – Registrar acompanhamento neurodivergente**  
Permitir o registro do acompanhamento pedagógico e o acompanhamento periódico com responsáveis.

**RF-018 – Registrar relatórios gerados na sessão de acompanhamento com os responsáveis**  
Permitir registro e importação de relatórios gerados na sessão de acompanhamento.

**RF-019 – Gerar histórico de acompanhamento acessível a docentes e gestores**  
Geração de histórico de relatórios de acompanhamento acessível a docentes e gestores e exportação de relatórios.

### Objetivo Específico 5 – Melhorar a comunicação institucional e o acesso a informações oficiais

**RF-020 – Cadastrar conteúdos institucionais**  
Permitir o cadastro de conteúdos textuais e documentais, como regras de vestimenta, normas disciplinares, legislação aplicável e comunicados oficiais.

---

## Requisitos Não Funcionais (RNF)

### Usability (Usabilidade)

**RNF-001 – Intuitividade**
A interface deve ser simples e intuitiva, permitindo realizar ações frequentes (lançar presença, justificar falta) em até 5 interações por tela.

**RNF-002 – Idioma & Terminologia**  
O sistema deve estar em Português (Brasil) com terminologia adequada ao PBM (brigadinos/brigadinas).

**RNF-003 – Navegabilidade de Conteúdos Institucionais**  
Os conteúdos institucionais devem estar disponíveis em área dedicada, com navegação intuitiva, filtros por título, categoria ou palavra-chave e acesso restrito por perfil.

### Reliability (Confiabilidade)

**RNF-004 – Disponibilidade**  
O sistema deve atingir 99,5% de disponibilidade mensal, o que representa até 3,6 horas de indisponibilidade ao mês. Implementar monitoramento, alertas automáticos e backups diários. Logs de disponibilidade acessíveis para auditoria.

### Performance (Desempenho & Escalabilidade)

**RNF-005 – Tempo de resposta consultas críticas**  
Consultas críticas (busca de conteúdos, login, página inicial e relatórios simples) devem responder em até 5 segundos, para até 100 usuários simultâneos e conexão mínima de 5 Mbps, com uso de CPU <70%

**RNF-006 – Tempo de resposta páginas e exportações**  
95% das páginas devem carregar em menos de 2 segundos; exportações de até 5k registros devem completar em até 10 segundos.

**RNF-007 – Carga**  
Suportar uso concorrente das 12 unidades, com pelo menos 150 usuários simultâneos no pico do registro de presença.

### Portability (Portabilidade & Tecnologia)

**RNF-008 – Contêineres**  
Empacotamento em Docker para front, back e banco.

**RNF-009 – Stack**  
Back-end TypeScript + Express; Front-end Astro; Banco Supabase/PostgreSQL.

**RNF-010 – Compatibilidade de navegação**  
Suporte a Chrome/Edge/Firefox atuais e Safari atual -1 versão.

### Security (Segurança & Privacidade)

**RNF-011 – Proteção de dados pessoais**  
O sistema deve atender à LGPD, garantindo consentimento para coleta de dados sensíveis e direito de exclusão mediante solicitação.

**RNF-012 – Criptografia**  
Todos os dados transmitidos e armazenados devem utilizar criptografia (HTTPS/TLS 1.2+ e hash para senhas).

**RNF-013 – Armazenamento de dados**  
O sistema deve ser capaz de armazenar informações de usuários, registros de ponto e outros dados relacionados por pelo menos 2 anos.

### Maintainability (Manutenibilidade & Evolutividade)

**RNF-014 – Testabilidade**  
O sistema deve permitir criação de testes automatizados cobrindo no mínimo 70% das funcionalidades críticas.

**RNF-015 – Padrões de código**  
Seguir padrões de código (TypeScript, lint/prettier, TDD) com cobertura mínima de 70% no MVP.

**RNF-016 – CI/CD**  
Pipeline automatizado para build, testes, análise estática e deploy.

**RNF-017 – Observabilidade**  
Implementar métricas de tempo de resposta, taxa de erro, uso de CPU e memória, requisições por minuto e disponibilidade; logs estruturados em JSON contendo os dados essenciais para o rastreamento do evento; alertas automáticos configurados para disponibilidade abaixo de 99%, tempo de resposta acima de 8 segundos, taxa de erro maior que 5% e uso de recursos acima de 85%.

## Histórico de Versão

| Data | Versão | Descrição | Autor(es) | Revisor(es) |
|------|--------|-----------|-----------|-------------|
| 15/09/2025 | 1.0 | Criação inicial do documento de requisito. | Philipe Morais | Todos |
| 06/10/2025 | 1.1 | Update do documento de requisito. | Lucas Branco e Vitor Marconi | Todos |
| 10/11/2025 | 1.2 | Update do documento de requisito. | Philipe Morais | Willian Silva (Monitor) |
| 14/11/2025 | 1.3 | Update do documento de requisito. | Philipe Morais | Willian Silva (Monitor) |
| 30/11/2025 | 1.4 | Update do documento de requisito. | Lucas Branco | Todos |
