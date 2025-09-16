---
title: Estratégias de Engenharia de Software
description: Estratégias e metodologias de engenharia de software aplicadas no projeto PPBM.
---

## Estratégias de Engenharia de Software

A partir das informações apresentadas nas seções anteriores, foram tomadas as decisões no que diz respeito às estratégias de engenharia de software a serem utilizadas no projeto.

### Estratégia Priorizada

* **Abordagem:** Ágil
* **Ciclo de Vida:** Iterativo e Incremental
* **Processo:** ScrumXP

### Quadro Comparativo

O quadro a seguir apresenta uma comparação entre o processo híbrido escolhido, ScrumXP, e o OpenUP (Open Unified Process), que também poderia ser aplicado ao projeto, de modo a fundamentar a decisão.

| Características                                     | ScrumXP                                                                                                                                                                                                          | OpenUP (Open Unified Process)                                                                                                                                                                |
| :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Abordagem Geral**                                 | Processo híbrido que combina o framework de gerenciamento de projetos do Scrum (sprints, papéis definidos) com as práticas de engenharia de software do XP (Extreme Programming).                                | Iterativo, incremental e guiado por uma arquitetura sólida. Possui uma estrutura de fases mais clara (Iniciação, Elaboração, Construção, Transição), sendo mais estruturado, mas ainda ágil. |
| **Qualidade Técnica e Práticas de Desenvolvimento** | A qualidade é um pilar central, assegurada pelas práticas do XP, como Test-Driven Development (TDD), Pair Programming, Integração Contínua e Refatoração constante, dentro do ciclo de cada sprint do Scrum.     | A qualidade é garantida pela definição clara da arquitetura desde o início e por validações incrementais. Possui menos ênfase em práticas técnicas específicas e prescritivas no processo.   |
| **Foco em Arquitetura**                             | A arquitetura é tratada de forma emergente e incremental. O design inicial é o mais simples possível e evolui ao longo do tempo conforme a necessidade, guiado pela refatoração e pelas entregas de cada sprint. | Possui um forte foco no desenvolvimento orientado a uma arquitetura robusta e bem definida desde as fases iniciais do projeto, visando a estabilidade a longo prazo.                         |
| **Flexibilidade de Requisitos**                     | Altíssima flexibilidade. O Scrum gerencia as mudanças através do Product Backlog e do planejamento de sprints, enquanto o XP permite a adaptação contínua durante o desenvolvimento.                             | Oferece flexibilidade, mas mudanças que impactam a arquitetura principal, definida nas fases iniciais, são mais complexas e custosas de implementar posteriormente.                          |
| **Colaboração com o Cliente**                       | Intensa e estruturada. O papel do Product Owner (Scrum) garante a visão do negócio, enquanto as práticas do XP (como o cliente presente) promovem feedback contínuo e validação direta das funcionalidades.      | Requer envolvimento contínuo do cliente, mas este tende a ser mais focado nas entregas e validações ao final das fases e iterações, sendo menos granular que no ScrumXP.                     |
| **Documentação**                                    | Minimiza a documentação formal, priorizando a entrega de software funcional, código limpo e testes automatizados. Os artefatos do Scrum (como o backlog) servem como documentação "viva".                        | Requer uma documentação mais formal para cada fase, com maior ênfase nos artefatos de requisitos e arquitetura, sendo menos leve que o ScrumXP nesse aspecto.                                |

### Justificativa

Com base nas características do projeto e nos desafios enfrentados pelo Programa Bombeiro Mirim (PBM), o processo híbrido **ScrumXP** foi definido como o mais adequado pelos seguintes motivos:

1.  **Estrutura de Gestão com Qualidade Técnica:** O ScrumXP une o melhor dos dois mundos: o Scrum oferece um framework de gerenciamento robusto com papéis claros (Product Owner), eventos (Sprints, Daily Scrum) e artefatos, trazendo organização e previsibilidade. O XP complementa isso com práticas de engenharia que garantem a alta qualidade técnica do código, crucial para substituir o sistema anterior, que era instável e com falhas.

2.  **Flexibilidade Controlada:** O projeto precisa se adaptar às necessidades dos usuários, como o acompanhamento de crianças neurodivergentes. O Scrum gerencia essa flexibilidade de forma organizada através do backlog e do planejamento de sprints, garantindo que a equipe foque nas prioridades. O XP oferece as ferramentas para implementar essas mudanças de forma ágil e segura dentro de cada ciclo.

3.  **Foco na Entrega de Valor e Feedback Rápido:** A combinação dos ciclos curtos (sprints do Scrum) com a prática de integração contínua (XP) permite que a equipe entregue valor de forma rápida e constante. As reuniões de revisão de sprint garantem que os stakeholders validem o progresso frequentemente, assegurando que o produto evolua na direção correta.

4.  **Ideal para Equipes Pequenas e Colaborativas:** O ScrumXP é altamente eficaz para equipes pequenas, pois promove comunicação intensa (Daily Scrums) e colaboração (Pair Programming). Isso maximiza a produtividade da equipe, alinha o conhecimento técnico e permite responder aos desafios do projeto de forma coesa e eficiente, o que é perfeito para o prazo curto do MVP.

## Histórico de Versão

| Data       | Versão | Descrição                                                                    | Autor(es)      | Revisor(es)    |
| ---------- | ------ | ---------------------------------------------------------------------------- | -------------- | -------------- |
| 15/09/2025 | 1.0    | Criação inicial do documento de estratégias.                                 | Julia Patricio | Todos          |
| 15/09/2025 | 1.1    | Atualização da estratégia de XP para ScrumXP e ajuste do quadro comparativo. | Julia Patricio | Vitor Trancoso |