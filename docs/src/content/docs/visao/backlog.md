---
title: Backlog de Produto
---

## Backlog Geral

No contexto do PPBM (Programa Bombeiro Mirim), o Product Backlog representa uma lista dinâmica, viva e priorizada de todas as funcionalidades, melhorias e ajustes necessários para a evolução contínua do sistema. Essa lista é considerada dinâmica porque é constantemente atualizada conforme novas necessidades surgem a partir do uso do sistema, feedback dos stakeholders ou mudanças nas regras e processos internos do programa. Também é priorizada, pois o objetivo é garantir que as entregas iniciais ofereçam o maior valor possível aos usuários, especialmente docentes, gestores e responsáveis.

No nosso projeto, o Product Backlog é a principal fonte de trabalho da equipe e contém todas as histórias de usuário (user stories) que descrevem as funcionalidades do PPBM, desde o cadastro e controle de alunos, passando por registro de presença e justificativas, até relatórios oficiais e comunicações institucionais.

Cada user story foi elaborada para representar uma necessidade real dos usuários, traduzindo a visão dos interessados em ações práticas de desenvolvimento. Essas histórias descrevem o que o sistema deve fazer para entregar valor e como o usuário interage com ele. Além da descrição, cada história contém critérios de aceitação, que servem como base para validação e testes — garantindo que a entrega atenda às expectativas funcionais e de negócio.

---

### Features

Nome | Título | Descrição
--- | --- | ---
F01 | Gestão e Controle da Frequência | Através dessa funcionalidade, será possível gerenciar alunos, responsáveis, registros de presença e dados de frequência, garantindo integridade, rastreabilidade e confiabilidade das informações.
F02 | Monitoramento de Comportamento e Alertas | Através dessa funcionalidade, será possível registrar advertências, enviar notificações e monitorar padrões de comportamento e assiduidade dos alunos, apoiando a tomada de decisão.
F03 | Gestão de Usuários, Docentes e Turmas | Através dessa funcionalidade, será possível gerenciar usuários, docentes, turmas e sessões, garantindo autenticação segura, organização de turmas e controle de acesso.
F04 | Acompanhamento Individualizado do Aluno | Através dessa funcionalidade, será possível registrar planos pedagógicos, relatórios de responsáveis e gerar históricos individuais acessíveis a docentes e gestores, apoiando o acompanhamento personalizado do aluno.
F05 | Gestão de Conteúdos Institucionais | Através dessa funcionalidade, será possível cadastrar, organizar e disponibilizar conteúdos institucionais (regras, normas e comunicados), garantindo padronização e fácil acesso para toda a instituição.


---

### Histórias de Usuário

| Código US | Feature | Requisito Funcional | Declaração |
|-----------|--------|-------------------|------------|
| US-001    | F01    | RF-001            | Como administrador ou gestor de unidade, quero cadastrar, editar e remover alunos com informações completas (nome, CPF, responsável, escola, cidade) para manter registro oficial atualizado e confiável. |
| US-002    | F01    | RF-002            | Como administrador, quero cadastrar, editar ou remover responsáveis vinculados a um aluno para garantir que apenas contatos válidos possam acessar informações da criança. |
| US-003    | F01    | RF-003            | Como docente ou gestor, quero exportar documentos de comprovante (laudos médicos ou identificação) em PDF ou imagem para download ou impressão, garantindo registro e auditoria de acessos. |
| US-004    | F01    | RF-004            | Como gestor, quero gerenciar registros de presença, falta ou atraso, mantendo histórico de alterações, para garantir precisão e rastreabilidade. |
| US-005    | F01    | RF-005            | Como docente ou gestor, quero consultar o histórico de presenças e faltas de um aluno para monitorar frequência e identificar padrões. |
| US-006    | F01    | RF-006            | Como gestor, quero gerar relatórios individuais de frequência detalhando presenças, faltas justificadas e não justificadas para análise de desempenho dos alunos. |
| US-007    | F01    | RF-007            | Como gestor, quero exportar relatórios internos em PDF ou Excel para uso da equipe, garantindo análise e controle das informações. |
| US-008    | F02    | RF-008            | Como gestor ou docente, quero visualizar dashboards de frequência com indicadores e gráficos de presença, faltas e alertas, para monitorar rapidamente o desempenho das turmas e identificar padrões de assiduidade. |
| US-009    | F01    | RF-009            | Como responsável ou docente, quero acessar a linha do tempo do aluno com presenças, faltas, justificativas e comunicados para acompanhamento completo da situação do aluno. |
| US-010    | F02    | RF-010            | Como gestor, quero exportar relatórios oficiais padronizados pelo CBMDF, garantindo conformidade legal e integridade dos dados. |
| US-011    | F03    | RF-011            | Como gestor, quero registrar advertências de comportamento dos alunos para acompanhamento disciplinar, mantendo histórico inalterável. |
| US-012    | F03    | RF-012            | Como docente, quero enviar notificações sobre faltas, justificativas ou advertências via WhatsApp, e-mail ou sistema para manter os responsáveis informados. |
| US-013    | F04    | RF-013            | Como usuário, quero acessar o sistema com autenticação e papéis (Administrador, Gestor, Docente ou Responsável) para executar apenas operações permitidas. |
| US-014    | F04    | RF-014            | Como administrador, quero cadastrar docentes com informações completas para permitir que eles lancem presença e registrem planos pedagógicos, respeitando permissões de acesso. |
| US-015    | F04    | RF-015            | Como gestor, quero cadastrar turmas, dias, horários e lotação de alunos para organizar sessões de forma adequada e respeitar limite de alunos por turma. |
| US-016    | F04    | RF-016            | Como gestor ou docente, quero consultar turmas com busca por nome de alunos, CPF, status de justificativa e taxa de presença para análises rápidas e decisões informadas. |
| US-017    | F05    | RF-017            | Como docente ou gestor, quero registrar planos pedagógicos individuais para alunos neurodivergentes, garantindo acompanhamento adequado e alerta de necessidades especiais. |
| US-018    | F05    | RF-018            | Como gestor ou docente, quero registrar e importar relatórios enviados pelos responsáveis para manter histórico completo de acompanhamento individual. |
| US-019    | F05    | RF-019            | Como gestor ou docente, quero gerar histórico consolidado de relatórios de acompanhamento, disponível para exportação e análise periódica. |
| US-020    | F05    | RF-020            | Como administrador, quero cadastrar regras, normas e comunicados oficiais para disponibilizar conteúdos institucionais de forma organizada e acessível. |



---

## Lista de requisitos não-funcionais

**US-RNF-001 – Navegação e Facilidade de Uso**  
Como usuário do sistema, quero que a interface seja simples e intuitiva, para que eu consiga realizar as ações principais (lançar presença, justificar falta, consultar aluno) em no máximo três cliques, garantindo agilidade e facilidade na operação diária.

**US-RNF-002 – Idioma e Terminologia Padronizada**  
Como usuário do sistema, quero que todo o sistema esteja em português (Brasil) e utilize a terminologia do PBM (“brigadinos” e “brigadinas”), para que haja consistência institucional e compreensão clara de todas as informações.

**US-RNF-003 – Disponibilidade do Sistema**  
Como gestor ou docente, quero que o sistema esteja disponível pelo menos 99,5% do tempo durante o MVP, para que as funcionalidades críticas possam operar continuamente sem interrupções.

**US-RNF-004 – Testes Automatizados**  
Como desenvolvedor, quero que haja cobertura mínima de 70% das funcionalidades críticas por testes automatizados, para que falhas e regressões sejam detectadas precocemente.

**US-RNF-005 – Observabilidade e Monitoramento**  
Como administrador, quero que o sistema disponha de métricas, logs estruturados e alertas automáticos, para que possamos monitorar falhas e desempenho em tempo real e agir rapidamente em incidentes.

**US-RNF-006 – Tempo de Resposta de Operações Críticas**  
Como usuário do sistema, quero que consultas e operações sensíveis tenham tempo de resposta inferior a 5 segundos, garantindo eficiência e experiência satisfatória.

**US-RNF-007 – Tempo de Carregamento e Exportação**  
Como usuário, quero que 95% das páginas carreguem em menos de 2 segundos e que relatórios com até 5 mil registros sejam exportados em até 10 segundos, para manter produtividade e fluidez no trabalho.

**US-RNF-008 – Suporte a Carga Concorrente**  
Como administrador, quero que o sistema suporte simultaneamente pelo menos 150 usuários durante picos de registro de presença nas 12 unidades, garantindo estabilidade e escalabilidade.

**US-RNF-009 – Proteção de Dados Pessoais (LGPD)**  
Como responsável pelo sistema, quero que todos os dados pessoais e sensíveis estejam protegidos conforme a LGPD, incluindo registro de consentimento, armazenamento seguro e exclusão sob solicitação.

**US-RNF-010 – Criptografia de Comunicação**  
Como usuário, quero que todas as comunicações e transferências de dados sejam criptografadas usando HTTPS/TLS 1.2 ou superior, para evitar interceptações e vazamentos de informações.

**US-RNF-011 – Documentação Técnica Atualizada**  
Como desenvolvedor, quero que a documentação técnica do sistema (APIs, banco de dados e arquitetura) esteja sempre atualizada e acessível, sendo revisada a cada release, para garantir manutenção eficiente.

**US-RNF-012 – Padrões de Código e Qualidade**  
Como equipe de desenvolvimento, quero que o código siga padrões TypeScript com lint/prettier, aplique TDD e garanta cobertura mínima de 70% no MVP, assegurando qualidade e consistência do software.

**US-RNF-013 – Pipeline de Integração Contínua (CI/CD)**  
Como desenvolvedor, quero que o sistema possua pipeline automatizado de CI/CD para build, testes, análise estática e deploy, garantindo confiabilidade na entrega e manutenção contínua.

**US-RNF-014 – Execução em Contêineres**  
Como administrador, quero que front-end, back-end e banco de dados sejam empacotados em contêineres Docker, para replicação consistente dos ambientes em desenvolvimento, homologação e produção.

**US-RNF-015 – Stack Tecnológica Padronizada**  
Como arquiteto do sistema, quero que o back-end utilize TypeScript + Express, front-end em Astro e banco de dados Supabase/PostgreSQL, para padronização e compatibilidade entre módulos.

**US-RNF-016 – Compatibilidade de Navegação**  
Como usuário, quero que o sistema seja compatível com Chrome, Edge, Firefox (versões atuais) e Safari (versão atual -1), garantindo acesso consistente e sem problemas de compatibilidade.



---

## Priorização do Backlog

Nesse processo, cada item do backlog é avaliado com base em três critérios, representados pelo acrônimo **ICE: Impact** (Impacto), **Confidence** (Confiança) e **Ease** (Facilidade). Após essa avaliação, a pontuação final é obtida por meio da multiplicação dos três valores:

**ICE Score** = Impacto × Confiança × Facilidade

Com isso, o item que alcançar o maior ICE Score deve ser considerado como o **mais prioritário** para implementação, já que ele indica a melhor combinação entre valor gerado, viabilidade e nível de certeza.

A seguir, detalham-se os três critérios utilizados:

Impacto: refere-se ao potencial do requisito em gerar valor para o negócio.

Confiança: expressa o grau de certeza da equipe em relação à ocorrência do impacto estimado.

Facilidade: avalia o nível de simplicidade, velocidade e baixo custo envolvidos na implementação do requisito.

Portanto, a tabela a seguir apresenta os requisitos devidamente priorizados:



| ID      | Requisito                                        | Impacto | Confiança | Facilidade | SCORE | Quadrante |
|---------|--------------------------------------------------|---------|-----------|------------|-------|-----------|
| RF-001  | Gerenciar Aluno                                  | 10      | 10        | 8          | 800   | 1         |
| RF-002  | Gerenciar responsáveis                           | 9       | 10        | 8          | 720   | 1         |
| RF-003  | Exportar documentos de comprovante               | 6       | 8         | 5          | 240   | 1         |
| RF-004  | Gerenciar lançamento de presença                | 8       | 10        | 7          | 560   | 1         |
| RF-005  | Consultar aluno                                  | 10      | 10        | 9          | 900   | 1         |
| RF-006  | Gerar relatório individual de frequência        | 9       | 9         | 6          | 486   | 1         |
| RF-007  | Exportar relatórios internos                     | 7       | 8         | 4          | 224   | 1         |
| RF-008  | Exibir dashboards de frequência                  | 8       | 7         | 3          | 168   | 1         |
| RF-009  | Exibir histórico do aluno                        | 9       | 9         | 7          | 567   | 1         |
| RF-010  | Exportar relatórios oficiais padronizados       | 9       | 8         | 3          | 216   | 3         |
| RF-011  | Registrar advertência para os alunos             | 7       | 9         | 8          | 504   | 1         |
| RF-012  | Enviar notificações para os responsáveis         | 9       | 8         | 4          | 288   | 2         |
| RF-013  | Autenticar usuários e perfis                     | 10      | 10        | 9          | 900   | 2         |
| RF-014  | Cadastrar os docentes                             | 9       | 10        | 9          | 810   | 1         |
| RF-015  | Cadastrar turmas e sessões                        | 10      | 10        | 9          | 900   | 1         |
| RF-016  | Consultar turma                                   | 9       | 10        | 8          | 720   | 1         |
| RF-017  | Registrar plano de acompanhamento neurodivergente| 10      | 9         | 7          | 630   | 2         |
| RF-018  | Registro de relatórios dos responsáveis          | 8       | 9         | 6          | 432   | 2         |
| RF-019  | Geração de histórico acessível a docentes        | 8       | 9         | 6          | 432   | 2         |
| RF-020  | Cadastrar conteúdos institucionais               | 4       | 7         | 9          | 252   | 3         |

Dessa forma, a combinação desses dois critérios permite visualizar com clareza quais funcionalidades devem ser priorizadas. A seguir, estão descritos os quatro quadrantes da matriz através de sua relação com o MVP:

- **Quadrante 1 — Baixo esforço e alto impacto:** deve compor o MVP. Alto impacto é considerado Must Have ou Should Have no Moscow pela equipe. Baixo esforço é a partir do 500 no ICE pela equipe.
- **Quadrante 2 — Alto esforço e alto impacto:** pode compor parcialmente o MVP, caso seja essencial. Alto impacto é considerado Must Have ou Should Have no Moscow pela equipe. Alto esforço é abaixo do 500 no ICE pela equipe.
- **Quadrante 3 — Baixo esforço e baixo impacto:** pode compor o MVP, se houver margem de tempo ou recursos disponíveis. Baixo impacto é considerado Could Have ou Won’t Have no Moscow pela equipe. Baixo esforço é a partir do 500 no ICE pela equipe.
- **Quadrante 4 — Alto esforço e baixo impacto:** não deve compor o MVP, pois apresenta baixo retorno em relação ao investimento. Baixo impacto é considerado Could Have ou Won’t Have no Moscow pela equipe. Alto esforço é abaixo do 500 no ICE pela equipe.

---

## MVP

Nesta seção, foi realizada a priorização dos itens do backlog utilizando a técnica MoSCoW, que classifica as
funcionalidades em quatro categorias principais:

**• Must have:** Funcionalidades essenciais para o funcionamento do produto, que devem ser entregues
obrigatoriamente.

**• Should have:** Funcionalidades importantes, mas que podem ser entregues após as essenciais.

**• Could have:** Funcionalidades desejáveis, que agregam valor, mas não são prioritárias no escopo inicial.

**• Won't have:** Funcionalidades que não serão incluídas no momento, podendo ser consideradas para
versões futuras.

O objetivo da priorização foi garantir que o desenvolvimento foque nas funcionalidades mais críticas, alinhando
o produto às necessidades de negócio e aos recursos disponíveis. A tabela detalha a classificação de cada item do
backlog, promovendo clareza e organização para as próximas etapas do projeto.
A partir disso, foi definido o MVP do produto com todos os itens de prioridade “Must have” e “Should have”.
Essa priorização e definição foi realizada em conjunto com a FireForce.

| Prioridade      | Código  | Descrição                                           | MVP |
|-----------------|---------|-----------------------------------------------------|-----|
| **Must Have**   | US-001  | Gerenciar aluno                                     | X   |
|                 | US-002  | Gerenciar responsáveis                              | X   |
|                 | US-003  | Exportar documentos de comprovante                  | X   |
|                 | US-004  | Gerenciamento de presença                           | X   |
|                 | US-005  | Consultar aluno                                     | X   |
|                 | US-006  | Gerar relatório individual de frequência            | X   |
|                 | US-007  | Exportar relatórios internos                        | X   |
|                 | US-008  | Consolidar relatórios por turma/unidade             | X   |
|                 | US-009  | Exibir histórico do aluno                           | X   |
|                 | US-010  | Exportar relatórios oficiais padronizados           |     |
|                 | US-011  | Registrar advertências                              | X   |
|                 | US-013  | Autenticar usuários e perfis                        |     |
|                 | US-014  | Cadastrar docentes                                  | X   |
|                 | US-015  | Cadastrar turmas e sessões                          | X   |
|                 | US-016  | Consultar turma                                     | X   |
|                 |         |                                                     |     |
| **Should Have** | US-012  | Enviar notificações                                 |     |
|                 | US-017  | Registrar plano de acompanhamento neurodivergente   |     |
|                 | US-018  | Importar relatórios de alunos                       |     |
|                 | US-019  | Gerar histórico consolidado de relatórios           | X   |
| **Could Have**  | US-020  | Cadastrar conteúdos institucionais                  | X   |
| **Won’t Have**  | -       | Nenhum requisito explicitamente fora do escopo      |     |


| Prioridade      | Código       | Descrição                                  | MVP |
|-----------------|--------------|--------------------------------------------|-----|
| **Must Have**   | RNF-001      | Intuitividade                              | X   |
|                 | RNF-002      | Idioma & Terminologia                      | X   |
|                 | RNF-005      | Tempo de resposta consultas críticas       | X   |
|                 | RNF-006      | Tempo de resposta páginas e exportações    | X   |
|                 | RNF-007      | Carga                                      | X   |
|                 | RNF-011      | Proteção de dados pessoais                 | X   |
|                 | RNF-012      | Criptografia                               | X   |
|                 | RNF-013      | Armazenamento de dados                     | X   |
|                 | RNF-014      | Testabilidade                              | X   |
|                 | RNF-015      | Padrões de código                          | X   |
|                 | RNF-016      | CI/CD                                      |     |
|                 | RNF-017      | Observabilidade                            |     |
| **Should Have** | US-RNF-003   | Navegabilidade de Conteúdos Institucionais | X   |
|                 | US-RNF-004   | Disponibilidade                            | X   |
|                 | US-RNF-008   | Contêineres                                | X   |
|                 | US-RNF-009   | Stack                                      |     |
|                 | US-RNF-010   | Compatibilidade de navegação               | X   |
| **Could Have**  | -            | -                                          |     |
| **Won’t Have**  | -            | Nenhum requisito fora do escopo            |     |

## Histórico de Versão

| Data | Versão | Descrição | Autor(es) | Revisor(es) |
|------|--------|-----------|-----------|-------------|
| 01/10/2025 | 1.0 | Criação inicial do documento de backlog. | Lucas Branco | Todos |
| 06/10/2025 | 1.1 | Update do documento de backlog. | Lucas Branco | Vitor Marconi |