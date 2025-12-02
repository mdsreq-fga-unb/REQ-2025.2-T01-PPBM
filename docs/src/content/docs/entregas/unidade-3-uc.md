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

#### 2 - Fluxo de Eventos (Fluxo Básico)
 ##### 2.1.1 - O refugiado seleciona a opção “Registrar Perfil” na tela inicial.

 ##### 2.1.2 - O sistema exibe o formulário de registro com campos mínimos obrigatórios (nome, país de origem, idioma principal, contato, documento ou identificação alternativa, localização aproximada, aceitação de termos) [RN01][REQ01][REQ02].

 ##### 2.1.3 - O refugiado preenche os campos obrigatórios e, opcionalmente, adiciona informações complementares (habilidades, formação, situação familiar, necessidades prioritárias).

 ##### 2.1.4 - O refugiado confirma o envio dos dados.

 ##### 2.1.5 - O sistema valida os campos obrigatórios e verifica se o contato (e‑mail/telefone) já não está cadastrado [RN01][RN02][FA01][FA02][FE01].

 ##### 2.1.6 - Em caso de sucesso na validação, o sistema registra o perfil do refugiado, armazena os dados conforme as regras de privacidade e, se aplicável, cria as credenciais de acesso (login/senha ou outro mecanismo) [RN02][RN03].

 ##### 2.1.7 - O sistema apresenta mensagem de sucesso e, opcionalmente, direciona o usuário para completar informações adicionais ou para a tela inicial após login [REQ05][PE01].

##### 2.2 - Fluxos Alternativos

##### FA01 – Dados obrigatórios incompletos
##### 2.2.1.1 - O sistema identifica campos obrigatórios não preenchidos ou inválidos.

##### 2.2.1.2 - O sistema destaca os campos com problema e informa ao refugiado que é necessário corrigi-los [REQ05].

##### 2.2.1.3 - O fluxo retorna ao passo 2.1.3 do fluxo básico.

##### FA02 – Contato já cadastrado
##### 2.2.2.1 - No passo 2.1.5 do fluxo básico, o sistema identifica que o e‑mail ou telefone informado já está associado a outro perfil [RN02].

##### 2.2.2.2 - O sistema informa ao refugiado que aquele contato já está em uso e oferece opção de recuperar acesso ou usar outro contato [REQ05].

##### 2.2.2.3 - Caso o refugiado informe um novo contato, o fluxo retorna ao passo 2.1.3 do fluxo básico; caso opte por recuperar o acesso, ocorre desvio para o caso de uso “Recuperar Acesso”.

##### 2.3 - Fluxo de Exceções

##### 2.3.1 - No passo 2.1.5 ou 2.1.6 do fluxo básico, ocorre falha de comunicação com o módulo de autenticação ou banco de dados, ou indisponibilidade temporária da plataforma.

##### 2.3.2 - O sistema registra o erro técnico e exibe mensagem de erro genérica, orientando o usuário a tentar novamente mais tarde [REQ05].

##### 2.3.3 - O caso de uso é encerrado sem criar o perfil [RN03].

#### 3 - Requisitos Especiais
**REQ01** – A interface deve ser simples, com linguagem acessível e, preferencialmente, disponível em múltiplos idiomas relevantes para o público‑alvo.​

**REQ02** – O formulário deve ser responsivo e funcionar em dispositivos móveis com conexão instável, minimizando perda de dados em caso de interrupção.​

**REQ03** – Deve existir opção de acessibilidade mínima (por exemplo, contraste adequado, textos legíveis).

**REQ04** - O caso de uso deve ser acessível diretamente da tela inicial, sem exigir login prévio.

**REQ05** - Deve existir feedback visual claro para erros de validação e para o sucesso do registro.

#### 4 - Regras de Negócio
**RN01** – Campos obrigatórios: nome, algum meio de contato (e‑mail ou telefone), aceitação dos termos de uso e política de privacidade devem ser informados para que o registro seja concluído.​

**RN02** – Unicidade de contato: cada e‑mail ou telefone só pode estar vinculado a um perfil ativo de refugiado.​

**RN03** – Privacidade e proteção de dados: informações sensíveis do refugiado devem ser armazenadas e tratadas conforme boas práticas de proteção de dados e legislação aplicável.​

#### 5 - Pré-condições
O usuário tem acesso a um dispositivo com o aplicativo ou site HopeBridge disponível.​

A plataforma está operacional e conectada ao módulo de autenticação (quando o registro exigir credenciais).

#### 6 - Pós-condições
Um novo perfil de refugiado é criado e marcado como ativo no sistema.​

Os dados básicos e preferências registradas ficam disponíveis para outros casos de uso que dependem do perfil (por exemplo, Solicitar Benefício, Localizar Serviços Básicos, Buscar Cursos).​​

#### 7 - Pontos de Extensão
Após o passo 2.1.7, este caso de uso pode ser estendido para o caso de uso de “Realizar Login”, reaproveitando as credenciais criadas para o refugiado.

## Histórico de Versão

| Data       | Versão | Descrição                              | Autor(es)      | Revisor(es)    |
| ---------- | ------ | -------------------------------------- | -------------- | -------------- |
| 01/12/2025 | 1.0    | Criação da página de especificações e UC 01. | Philipe Morais | Todos |
