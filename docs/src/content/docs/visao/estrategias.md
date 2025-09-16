---
title: Estratégias de Engenharia de Software
description: Estratégias e metodologias de engenharia de software aplicadas no projeto PPBM.
---

## 3. Estratégias de Engenharia de Software

A partir das informações apresentadas nas seções anteriores, foram tomadas as decisões no que diz respeito às estratégias de engenharia de software a serem utilizadas no projeto.

### 3.1 Estratégia Priorizada

* **Abordagem:** Ágil
* **Ciclo de Vida:** Iterativo e Incremental
* **Processo:** XP (Extreme Programming)

### 3.2 Quadro Comparativo

O quadro a seguir apresenta uma comparação entre o processo escolhido, XP (Extreme Programming), e o OpenUP (Open Unified Process), que também poderia ser aplicado ao projeto, de modo a fundamentar a decisão.

| Características | XP (Extreme Programming) | OpenUP (Open Unified Process) |
| :--- | :--- | :--- |
| **Abordagem Geral** | Iterativo e incremental, com forte ênfase em práticas técnicas de alta qualidade, feedback extremamente rápido e colaboração intensa para entregar valor de forma contínua. | Iterativo, incremental e guiado por uma arquitetura sólida. Possui uma estrutura de fases mais clara (Iniciação, Elaboração, Construção, Transição), sendo mais estruturado, mas ainda ágil. |
| **Qualidade Técnica e Práticas de Desenvolvimento** | A qualidade é o pilar central, assegurada por práticas de engenharia robustas como Test-Driven Development (TDD), Pair Programming, Integração Contínua e Refatoração constante. | A qualidade é garantida pela definição clara da arquitetura desde o início e por validações incrementais. Possui menos ênfase em práticas técnicas específicas no processo. |
| **Foco em Arquitetura** | A arquitetura é tratada de forma emergente e incremental. O design inicial é o mais simples possível e evolui ao longo do tempo conforme a necessidade, guiado pela refatoração. | Possui um forte foco no desenvolvimento orientado a uma arquitetura robusta e bem definida desde as fases iniciais do projeto, visando a estabilidade a longo prazo. |
| **Flexibilidade de Requisitos** | Altíssima flexibilidade para acomodar mudanças de requisitos em qualquer estágio. O planejamento é refeito a cada iteração curta, permitindo que o cliente ajuste as prioridades constantemente. | Oferece flexibilidade, mas mudanças que impactam a arquitetura principal, definida nas fases iniciais, são mais complexas e custosas de implementar posteriormente. |
| **Colaboração com o Cliente** | Exige envolvimento constante e direto do cliente (ou seu representante), que participa ativamente da definição de requisitos, testes de aceitação e priorização, garantindo alinhamento contínuo. | Requer envolvimento contínuo do cliente, mas este tende a ser mais focado nas entregas e validações ao final das fases e iterações, sendo menos granular que no XP. |
| **Documentação** | Minimiza a documentação formal, priorizando o código limpo, os testes automatizados e a comunicação direta. A documentação é criada apenas quando estritamente essencial. | Requer uma documentação mais formal para cada fase, com maior ênfase nos artefatos de requisitos e arquitetura, sendo menos leve que o XP nesse aspecto. |

### 3.3 Justificativa

Com base nas características do projeto e nos desafios enfrentados pelo Programa Bombeiro Mirim (PBM), o processo XP (Extreme Programming) foi definido como o mais adequado pelos seguintes motivos:

1.  **Foco na Qualidade Técnica e Confiabilidade:** O software atual utilizado pelo PBM apresenta diversas falhas e limitações. As práticas de engenharia do XP, como Desenvolvimento Orientado a Testes (TDD) e Integração Contínua, são fundamentais para construir um sistema robusto e com menos defeitos, garantindo que a nova solução seja confiável e não repita os problemas de instabilidade do sistema anterior.

2.  **Flexibilidade para um Ambiente com Requisitos em Evolução:** O projeto visa atender a necessidades específicas como o acompanhamento de crianças neurodivergentes, ficha médica e um portal de comunicação. O XP, com suas iterações curtas e planejamento contínuo, permite que a equipe se adapte rapidamente a novos requisitos e ao feedback dos gestores e professores, garantindo que o produto final realmente atenda às demandas práticas do dia a dia.

3.  **Eficiência para Equipe Pequena e Prazo Curto:** Considerando a limitação orçamentária e o prazo de 2 meses para o desenvolvimento do MVP, a abordagem do XP é ideal. Práticas como a programação em par (Pair Programming) e o design simples (Simple Design) aceleram o desenvolvimento e a disseminação de conhecimento na equipe. A redução da documentação formal libera tempo para que o time se concentre na entrega de software funcional.

4.  **Usabilidade e Colaboração com o Usuário:** O sistema será utilizado por um público com diferentes níveis de familiaridade digital. O XP incentiva a presença constante do cliente, o que permitirá validações frequentes da interface e do fluxo de uso com os próprios gestores do programa. Isso assegura a construção de uma plataforma verdadeiramente intuitiva e acessível, um dos desafios centrais do projeto.

## Histórico de Versão

| Data | Versão | Descrição | Autor(es) | Revisor(es) |
|------|--------|-----------|-----------|-------------|
| 15/09/2025 | 1.0 | Criação inicial do documento de estratégias. | Julia Patricio | Todos |