---
title: Ata de Reunião - 24/09/2025
description: Reunião realizada via Google Meet de 21:20h às 21:54h.
---

import { LinkButton } from '@astrojs/starlight/components';

#### Participantes

- Julia Oliveira Patricio
- Lucas Borges Branco
- Lucas de Oliveira Rodrigues
- Vitor Marconi Trancoso Albuquerque
- Philipe Barbosa de Morais

#### Cliente

- Ana Aparecida da Silva Oliveira
## Objetivos da Reunião

- **Primeira conversa com o cliente sobre as soluções propostas para o projeto.**

## Tópicos Abordados

- Responsáveis e Contatos
  - Responsável nem sempre é o pai/mãe (caso de crianças vulneráveis)
  - Adicionar função de múltiplos responsáveis
  - Registrar nome e contatos dos responsáveis

- Ficha Médica
  - Anexar documentos, laudos e diagnósticos
  - Criar alertas para educadores

- Justificativas de Faltas
  - Considerar apenas nome e matrícula

- Comunicação
  - Preferência pelo uso do WhatsApp

- Advertências
  - Campo para registrar advertência de comportamento inadequado do aluno

- Controle de Acesso e Segurança
  - Permissões diferenciadas: Administrativo / Operacional
  - Sistema atual é precário e o responsável não tem acesso
  - Considerar LGPD para segurança e privacidade

- Autorização de Imagem
  - Campo para responsável autorizar uso de imagem / declaração

Atividades e Técnicas Aplicadas:
| Atividade              | Técnicas aplicadas                                                                                  | Resultado esperado                                                 |
|-----------------------------|----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| Análise e Consenso      | JAD (Joint Application Development), Workshop de Requisitos, Negociação, uso de roteiro estruturado      | Conjunto de requisitos consensuados com cliente e equipe               |
| Verificação e Validação | Checklist, Walkthrough, Revisão com cliente                                                             | Requisitos revisados, consistentes e aprovados (critérios DEEP)        |
| Modelagem de fluxos     | User Story Mapping (USM), Casos de Uso                                                                  | Fluxos de usuário confirmados com cliente                              |
| Priorização (Backlog)   | Product Backlog Building (PBB), MoSCoW                                                                  | Backlog priorizado, com user stories organizadas para próximas sprints |

## DEEP (Qualidade do Backlog)

**Um backlog saudável deve ser DEEP**:

**D – Detailed appropriately (Detalhado de forma adequada)**
→ Histórias mais próximas da sprint devem estar bem detalhadas, as futuras podem ser mais vagas.

**E – Estimated (Estimado)**
→ Cada item deve ter alguma estimativa de esforço ou tamanho (pontos de história, complexidade).

**E – Emergent (Emergente)**
→ O backlog não é fixo, ele evolui conforme aprendizados, feedbacks e mudanças de prioridade.

**P – Prioritized (Priorizado)**
→ Os itens mais importantes para o cliente ficam no topo.

## Explicações sobre as técnicas aplicadas no projeto

- JAD (Joint Application Development)
Sessões colaborativas e estruturadas entre cliente + equipe (gestores, docentes, responsáveis, analistas e devs).
  - No projeto: a reunião com o cliente funcionou como um JAD, alinhando requisitos, fluxos e regras em conjunto, reduzindo retrabalho.
  - Walkthrough
  Revisão passo a passo dos requisitos, fluxos ou protótipos, simulando o uso real do sistema.
  - No projeto: quando revisaram os fluxos com o cliente e confirmaram se cada parte fazia sentido, aplicaram um Walkthrough.

- Casos de Uso
Forma de representar interações entre usuário → sistema → resposta.
  - No projeto: fluxos como “docente registra presença” e “responsável justifica falta” foram equivalentes a casos de uso simplificados.

- MoSCoW (Must, Should, Could, Won’t)
Técnica de priorização para definir o que entra no MVP e o que pode ficar para versões futuras.
  - No projeto: aplicada junto ao PBB para classificar requisitos funcionais (Must = MVP; Should/Could = incrementos; Won’t = descartado por agora).

## Próximos Passos e Decisões

- Definir atividades para a próxima reunião

- **Decisões**
  - Adicionar múltiplos responsáveis com contatos
  - Incluir ficha médica com anexos e alertas
  - Criar campo de advertência comportamental
  - Restringir acessos via permissões (Adm/Operacional)
  - Adequar sistema à LGPD

## Mídia

  <LinkButton 
    href="/REQ-2025.2-T01-PPBM/evidencias/sprint-1/" 
    icon="right-arrow"
    iconPlacement="end">
    Ir para Evidências da Sprint 1
  </LinkButton>

## Histórico de Versão

| Data       | Versão | Descrição                              | Autor(es)      | Revisor(es)    |
| ---------- | ------ | -------------------------------------- | -------------- | -------------- |
| 30/09/2025 | 1.0    | Criação inicial da página de atas. | Philipe Morais | Todos |
