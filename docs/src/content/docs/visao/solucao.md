---
title: Solução Proposta
description: Descrição detalhada da solução proposta para o projeto PPBM.
---

## Objetivos do Produto

O sistema tem como objetivo *centralizar e simplificar a gestão das crianças atendidas*, garantindo eficiência administrativa, segurança e qualidade no acompanhamento pedagógico e social.

## Características da Solução

•⁠  ⁠Cadastro completo da criança (nome, data de nascimento, CPF, responsável, contato, escola).  
•⁠  ⁠Registro de presença com destaque para faltas justificadas.  
•⁠  ⁠Consulta rápida de histórico de faltas por aluno.  
•⁠  ⁠Emissão de relatórios e exportação em Excel/PDF.  
•⁠  ⁠Ficha médica com observações (asma, alergias, etc.).  
•⁠  ⁠Cadastro diferenciado para crianças neurodivergentes, com acompanhamento de desenvolvimento.  
•⁠  ⁠Área de comunicação entre equipe e responsáveis.  
•⁠  ⁠Ferramenta de análise gráfica de frequência e faltas.  

## Tecnologias a serem utilizadas

  - **⁠Back-end – TypeScript + Express**: TypeScript traz segurança ao código com tipagem estática. O Express organiza rotas e APIs REST, permitindo integração ágil com banco de dados e outras camadas do sistema.

  - **⁠Front-end – Astro**: Voltado para desempenho no front-end. Permite misturar diferentes frameworks e carrega apenas o código essencial em cada página, garantindo navegação rápida e leve.

  - **Banco de Dados** – Supabase: Baseado em PostgreSQL, oferece recursos prontos como autenticação, API automática e dados em tempo real. Ajuda a manter a segurança (RLS) e a escalabilidade do sistema.  

  - **Docker**: Padroniza o ambiente de execução. Permite rodar front, back e banco em containers isolados, facilitando implantação, testes e escalabilidade.  

## Pesquisa de Mercado e Análise Competitiva

  - **Brightwheel**: Preço sob consulta; completo (presença, comunicação, faturamento), mas caro para pequenas creches e sem foco em módulos clínicos/neurodivergência.

  - **HiMama (Lillio)**: Preço não encontrado; forte em comunicação e rotina diária, mas não oferece relatórios pedagógicos avançados ou acompanhamento clínico.

  - **Procare**: Planos empresariais; robusto em gestão financeira e administrativa, porém pesado e caro para instituições menores. 

  - **Famly**: Preço sob consulta; elogiado por reduzir burocracia, mas custo alto e pouco foco em inclusão/neurodiversidade. 

  - **Tadpoles**: Gestão básica de sala e relatórios simples; limitações em usabilidade e análise avançada.  

  - **Sophia (Brasil)**: ERP escolar amplo; bom para gestão administrativa, mas não focado em creches ou acompanhamento clínico. 

  - **Galileu (Brasil)**: Sistema educacional completo; voltado a escolas maiores, sem módulo específico para saúde ou neurodivergência.  

## Análise de Viabilidade

A viabilidade técnica do projeto é *alta, pois a equipe já possui experiência em desenvolvimento de sistemas de gestão e está familiarizada com as tecnologias propostas, como **TypeScript + Express, Astro, Supabase e Docker**.  

O prazo estimado é de *2 meses para desenvolvimento do MVP (Produto Mínimo Viável)*, considerado viável dada a complexidade do projeto e a experiência prévia da equipe.  

O custo estimado durante o desenvolvimento gira em torno de *R$40,00 em hospedagem em nuvem* para backend/frontend e eventuais custos de containers/infraestrutura. Esse valor é competitivo em relação ao mercado e baixo diante da proposta de valor do sistema.  

Assim, o projeto apresenta *alta viabilidade técnica, financeira e de mercado*, com bom curto e médio prazo.  

## Impacto da Solução

A plataforma trará *eficiência administrativa*, reduzindo tarefas que antes levavam horas para poucos minutos e diminuindo custos ao centralizar presença, comunicação e relatórios em um único sistema.  

Também melhora a *experiência de usuários*:  
•⁠  ⁠Responsáveis terão acesso rápido a informações.  
•⁠  ⁠Educadores contarão com relatórios detalhados e acompanhamento individualizado, inclusive para crianças neurodivergentes.  

*Em resumo:* gera *agilidade, economia, aumento de receita e melhor atendimento*, fortalecendo a atuação da empresa no setor educacional.

## Histórico de Versão

| Data | Versão | Descrição | Autor(es) | Revisor(es) |
|------|--------|-----------|-----------|-------------|
| 15/09/2025 | 1.0 | Criação inicial do documento de solução. | Lucas Oliveira | Philipe Morais |