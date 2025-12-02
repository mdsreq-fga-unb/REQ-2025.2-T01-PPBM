---
title: Especificação de Caso de Uso - Unidade 3 
description: Entregas e apresentações do projeto PPBM - Unidade 3 UC
---

Esta seção contém as especificações de caso de uso do projeto HopeBridge.

### UC 01 - Registrar Perfil
Permitir que o refugiado crie um perfil no HopeBridge com seus dados pessoais básicos, situação atual e necessidades prioritárias, para que possa receber recomendações e acessar serviços adequados.​

##### 1.1 - Descrição
Este caso de uso inicia quando um refugiado deseja começar a usar a plataforma e precisa se registrar informando seus dados mínimos de identificação e contato, além de aceitar os termos de uso e política de privacidade. O sistema valida as informações, cria o perfil e o deixa pronto para uso em outros casos de uso (como solicitar benefício, localizar serviços, etc.).​

##### 1.2 - Atores
**Refugiado**: usuário final que acessa a plataforma para buscar apoio, serviços e oportunidades.​

#### 5 - Pré-condições
O usuário tem acesso a um dispositivo com o aplicativo ou site HopeBridge disponível.​

A plataforma está operacional e conectada ao módulo de autenticação (quando o registro exigir credenciais).​

#### 6 - Pós-condições
Um novo perfil de refugiado é criado e marcado como ativo no sistema.​

Os dados básicos e preferências registradas ficam disponíveis para outros casos de uso que dependem do perfil (por exemplo, Solicitar Benefício, Localizar Serviços Básicos, Buscar Cursos).​

#### 2 - Fluxo de Eventos (Fluxo Básico)
 O refugiado seleciona a opção “Registrar Perfil” na tela inicial.

 O sistema exibe o formulário de registro com campos mínimos obrigatórios (nome, país de origem, idioma principal, contato, documento ou identificação alternativa, localização aproximada, aceitação de termos).

 O refugiado preenche os campos obrigatórios e, opcionalmente, adiciona informações complementares (habilidades, formação, situação familiar, necessidades prioritárias).

 O refugiado confirma o envio dos dados.

 O sistema valida os campos obrigatórios e verifica se contato (e‑mail/telefone) já não está cadastrado.

 Em caso de sucesso na validação, o sistema registra o perfil do refugiado e, se aplicável, cria as credenciais de acesso (login/senha ou outro mecanismo).

 O sistema apresenta mensagem de sucesso e, opcionalmente, direciona o usuário para completar informações adicionais ou para a tela inicial após login.

##### 2.2 - Fluxos Alternativos

##### 5A – Dados obrigatórios incompletos
O sistema identifica campos obrigatórios não preenchidos ou inválidos.

O sistema destaca os campos com problema e informa ao refugiado que é necessário corrigi-los.

O fluxo retorna ao passo 3 do fluxo básico.

##### 5B – Contato já cadastrado
O sistema identifica que o e‑mail ou telefone informado já está associado a outro perfil.

O sistema informa ao refugiado que aquele contato já está em uso e oferece opção de recuperar acesso ou usar outro contato.

O fluxo retorna ao passo 3 do fluxo básico, caso o usuário forneça novo contato; se o usuário optar por recuperar acesso, ocorre desvio para o caso de uso “Recuperar Acesso” (quando existir).

##### 2.3 - Fluxo de Exceções
Falha de comunicação com o módulo de autenticação ou banco de dados.

Indisponibilidade temporária da plataforma.

Em ambos os casos, o sistema exibe mensagem de erro genérica e orienta o usuário a tentar novamente mais tarde, sem criar o perfil.

#### 4 - Regras de Negócio
**RN01** – Campos obrigatórios: nome, algum meio de contato (e‑mail ou telefone), aceitação dos termos de uso e política de privacidade devem ser informados para que o registro seja concluído.​

**RN02** – Unicidade de contato: cada e‑mail ou telefone só pode estar vinculado a um perfil ativo de refugiado.​

**RN03** – Privacidade e proteção de dados: informações sensíveis do refugiado devem ser armazenadas e tratadas conforme boas práticas de proteção de dados e legislação aplicável.​

#### 3 - Requisitos Especiais
**REQ01** – A interface deve ser simples, com linguagem acessível e, preferencialmente, disponível em múltiplos idiomas relevantes para o público‑alvo.​

**REQ02** – O formulário deve ser responsivo e funcionar em dispositivos móveis com conexão instável, minimizando perda de dados em caso de interrupção.​

**REQ03** – Deve existir opção de acessibilidade mínima (por exemplo, contraste adequado, textos legíveis).

#### 7 - Pontos de Extensão
Extensão para “Verificar Documentos” caso, em versões futuras, seja necessária a validação documental mais rígida (por exemplo, confirmação de status de refugiado).

Extensão para “Completar Perfil Avançado”, permitindo que o refugiado adicione detalhes adicionais após o registro mínimo.

##### 7.1 - Requisitos de Interface

O caso de uso deve ser acessível diretamente da tela inicial, sem exigir login prévio.

Deve existir feedback visual claro para erros de validação e para o sucesso do registro.

## Histórico de Versão

| Data       | Versão | Descrição                              | Autor(es)      | Revisor(es)    |
| ---------- | ------ | -------------------------------------- | -------------- | -------------- |
| 01/12/2025 | 1.0    | Criação da página de especificações e UC 01. | Philipe Morais | Todos |
