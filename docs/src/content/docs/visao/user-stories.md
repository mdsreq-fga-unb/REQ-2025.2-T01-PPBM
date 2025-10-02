---
title: User Stories (US)
---

Este documento apresenta as User Stories (Histórias de Usuário) do sistema FireForce - PPBM, organizadas por módulos funcionais. As User Stories descrevem os requisitos do sistema na perspectiva do usuário, facilitando o entendimento das necessidades e expectativas de cada tipo de usuário.

---

## Módulo: Cadastro & Dados do Aluno

**US-001 – Cadastrar criança**

Como administrador ou gestor de unidade, quero cadastrar crianças com dados pessoais e escolares para manter o registro oficial dos alunos no sistema.

**US-002 – Gerenciar responsáveis**

Como administrador, quero adicionar, editar ou remover responsáveis vinculados a uma criança para garantir que as informações de contato estejam corretas.

**US-003 – Registrar ficha médica**

Como docente ou gestor, quero registrar informações médicas relevantes para que situações críticas sejam identificadas e comunicadas rapidamente.

**US-004 – Cadastrar perfil neurodivergente**

Como gestor ou docente, quero cadastrar perfis neurodivergentes com campos específicos para adaptações pedagógicas, garantindo um acompanhamento adequado.

**US-005 – Cadastrar informações complementares do aluno**

Como gestor ou docente, quero registrar dados complementares (nome de guerra, tipo sanguíneo, graduação) para manter um perfil mais completo dos alunos.

**US-006 – Exportar documentos de comprovante**

Como gestor ou docente, quero exportar documentos de comprovante (laudos médicos, documentos de identificação neurodivergente) para download ou impressão, para manter registros físicos quando necessário.

---

## Módulo: Presença & Justificativas

**US-007 – Registrar presença de aluno**

Como docente, quero registrar presença, falta ou atraso dos alunos para manter o controle da frequência escolar.

**US-008 – Justificar falta de aluno**

Como responsável, quero justificar a ausência de meu filho(a) anexando documentos, para que a escola registre corretamente o motivo da falta.

**US-009 – Editar lançamento de presença**

Como gestor, quero corrigir lançamentos de presença com histórico de alterações para manter a integridade dos dados.

**US-010 – Anexar comprovantes**

Como responsável ou docente, quero anexar documentos em justificativas e comunicações para validar informações e registrar evidências.

**US-011 – Definir política de justificativa de faltas**

Como gestor, quero configurar como faltas justificadas impactam os relatórios para manter coerência nas análises.

**US-012 – Conceder autonomia docente para justificativas**

Como docente, quero aprovar ou rejeitar justificativas de faltas para atuar diretamente no processo.

**US-013 – Definir motivos e exigências para justificativas**

Como administrador, quero configurar motivos válidos de ausência e exigência de documentos comprobatórios para padronizar o processo de justificativa.

**US-014 – Limitar número de alunos por turma**

Como gestor, quero limitar a 30 alunos por turma para garantir acompanhamento pedagógico adequado.

---

## Módulo: Relatórios & Análises

**US-015 – Consultar aluno**

Como gestor ou docente, quero consultar rapidamente o histórico de frequência de um aluno para acompanhar seu desempenho escolar.

**US-016 – Gerar relatório individual de frequência**

Como responsável ou gestor, quero gerar relatórios individuais de frequência para acompanhar taxas de presença e faltas justificadas.

**US-017 – Consolidar relatórios por turma/unidade**

Como gestor, quero consolidar relatórios de frequência por turma ou unidade para analisar tendências coletivas.

**US-018 – Exportar relatórios**

Como gestor, quero exportar relatórios em PDF ou Excel para compartilhar e arquivar os dados da frequência.

**US-019 – Exibir dashboards de frequência**

Como administrador, quero visualizar dashboards com indicadores e alertas para monitorar a frequência em tempo real.

**US-020 – Exibir histórico do aluno**

Como responsável ou gestor, quero acessar a linha do tempo de eventos de um aluno para acompanhar seu histórico completo.

**US-021 – Exportar relatórios oficiais padronizados**

Como gestor, quero exportar relatórios em modelos exigidos pelo CBMDF para garantir conformidade institucional.

---

## Módulo: Comunicação

**US-022 – Registrar advertência**

Como docente ou gestor, quero registrar advertências de comportamento para acompanhar a disciplina dos alunos.

**US-023 – Enviar notificações**

Como responsável, quero receber notificações de faltas, justificativas e advertências para estar atualizado sobre a situação escolar do meu filho(a).

**US-024 – Configurar preferências de notificação**

Como usuário, quero configurar os canais e preferências de notificação para receber mensagens da escola de forma adequada.

---

## Módulo: Acesso & Perfis

**US-025 – Autenticar usuários e perfis**

Como usuário do sistema, quero acessar com login e senha de acordo com meu perfil para realizar somente as operações que me são permitidas.

**US-026 – Controlar permissões de acesso**

Como administrador, quero definir permissões de acordo com cada papel para garantir segurança e acesso adequado às funcionalidades.

**US-027 – Operar multiunidade**

Como administrador, quero gerenciar múltiplas unidades de ensino com dados segregados e visão consolidada para manter a organização do sistema.

---

## Módulo: Operação & Processo

**US-028 – Registrar auditoria de operações**

Como administrador, quero registrar trilhas de auditoria para rastrear quem fez cada alteração no sistema.

**US-029 – Cadastrar turmas e sessões**

Como gestor, quero cadastrar turmas, horários e instrutores para organizar a oferta de aulas.

**US-030 – Implementar filtros e busca avançada**

Como usuário do sistema, quero aplicar filtros e buscas avançadas para encontrar rapidamente informações relevantes.

---

## Módulo: Acompanhamento Neurodivergente

**US-031 – Registrar plano de acompanhamento pedagógico**

Como gestor ou docente, quero registrar e revisar periodicamente planos de intervenção pedagógica para alunos neurodivergentes, garantindo apoio contínuo.

---

## Módulo: Gestão de Conteúdo

**US-032 – Cadastrar conteúdos institucionais**

Como gestor, quero cadastrar documentos e textos institucionais (normas, regras, comunicados) para manter os usuários informados.

**US-033 – Exibir conteúdos institucionais para usuários**

Como responsável, quero acessar conteúdos institucionais publicados para me manter atualizado sobre as regras e normas do PBM.

---

## Requisitos Não Funcionais (RNF)

**US-RNF-001 – Tempo de resposta**

Como usuário, quero que as operações críticas respondam em até 5 segundos para garantir fluidez no uso do sistema.

**US-RNF-002 – Proteção de dados pessoais**

Como responsável, quero que meus dados e os de meus filhos estejam protegidos pela LGPD para garantir privacidade e segurança.

**US-RNF-003 – Criptografia**

Como administrador, quero que os dados sejam transmitidos de forma criptografada para evitar acessos indevidos.

**US-RNF-004 – Documentação técnica**

Como desenvolvedor, quero acessar documentação técnica atualizada para manter a consistência e evolução do sistema.

**US-RNF-005 – Testabilidade**

Como desenvolvedor, quero implementar testes automatizados para garantir qualidade e segurança nas entregas.

**US-RNF-011 – Disponibilidade**

Como usuário, quero que o sistema esteja disponível 99,5% do tempo para não prejudicar meu trabalho.

**US-RNF-014 – Padrões de código**

Como desenvolvedor, quero seguir padrões de código para manter legibilidade e qualidade no projeto.

**US-RNF-015 – CI/CD**

Como desenvolvedor, quero um pipeline automatizado para integrar e entregar código continuamente com qualidade.

**US-RNF-016 – Observabilidade**

Como administrador, quero monitorar métricas e logs para identificar problemas em tempo real.

**US-RNF-017 – Contêineres**

Como desenvolvedor, quero usar contêineres Docker para facilitar o deploy e a portabilidade.

**US-RNF-018 – Stack**

Como desenvolvedor, quero utilizar TypeScript, Express, Astro e Supabase/PostgreSQL para manter consistência tecnológica.

**US-RNF-019 – Compatibilidade de navegação**

Como usuário, quero acessar o sistema nos principais navegadores para não ter restrições de uso.

**US-RNF-020 – Exportação fiel**

Como gestor, quero que os relatórios exportados mantenham identidade visual e padronização para uso oficial.

---

## Regras de Negócio (RB)

**US-RB-001**

Como gestor, quero que faltas justificadas sejam contabilizadas separadamente para análise mais precisa da frequência.

**US-RB-002**

Como gestor de unidade, quero ser o único a aprovar/recusar justificativas para centralizar decisões.

**US-RB-003**

Como docente, quero ver alertas em chamadas quando houver alunos com condições médicas críticas para agir preventivamente.

**US-RB-004**

Como responsável, quero visualizar apenas dados das crianças sob minha tutela para respeitar a privacidade.

**US-RB-005**

Como gestor, quero que a comunicação oficial permaneça registrada no sistema para manter histórico institucional.

---