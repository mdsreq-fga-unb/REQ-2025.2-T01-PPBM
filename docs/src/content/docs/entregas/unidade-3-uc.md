---
title: Especificação de Caso de Uso - Unidade 3 
description: Entregas e apresentações do projeto PPBM - Unidade 3 UC
---

Esta seção contém as especificações de caso de uso e o diagrama UML do projeto HopeBridge.

Abaixo, o link dos estudos da unidade 3, juntamente com as imagens.

> **Visualização:** [Clique aqui para abrir o diagrama no Draw.io](https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=Entregas%20Unidade%203.drawio&dark=auto#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1jpx_nsImgBB8MFV65lZSPCYJ6LNRjNSn%26export%3Ddownload)

---

## PBB CulturaViva

![pbb1](./imagens/pbb1.png)
![pbb2](./imagens/pbb2.png)
![pbb3](./imagens/pbb3.png)
![pbb4](./imagens/pbb4.png)
![pbb5](./imagens/pbb5.png)
![pbb6](./imagens/pbb6.png)
![pbb7](./imagens/pbb7.png)
![pbb8](./imagens/pbb8.png)
![pbb9](./imagens/pbb9.png)
![pbb10](./imagens/pbb10.png)
![pbb11](./imagens/pbb11.png)
![pbb12](./imagens/pbb12.png)
![pbb13](./imagens/pbb13.png)
![pbb14](./imagens/pbb14.png)
![pbb15](./imagens/pbb15.png)
![pbb16](./imagens/pbb16.png)
![pbb17](./imagens/pbb17.png)
![pbb18](./imagens/pbb18.png)
![pbb19](./imagens/pbb19.png)
![pbb20](./imagens/pbb20.png)
![pbb21](./imagens/pbb21.png)

---

## UseCase HopeBridge

![uc1](./imagens/uc1.png)
![uc2](./imagens/uc2.png)
![uc3](./imagens/uc3.png)
![uc4](./imagens/uc4.png)

---

## USM HealthConnect

![usm1](./imagens/usm1.png)
![usm2](./imagens/usm2.png)
![usm3](./imagens/usm3.png)
![usm4](./imagens/usm4.png)
![usm5](./imagens/usm5.png)
![usm6](./imagens/usm6.png)
![usm7](./imagens/usm7.png)

---

## Diagrama de Casos de Uso

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

---

### UC 02 - Solicitar Benefício
Permitir que o refugiado solicite formalmente uma vaga em abrigo ou um voucher de benefício (alimento/kit higiene) através do sistema, garantindo acesso organizado aos recursos limitados.

##### 1.1 - Descrição
Este caso de uso inicia quando um refugiado, após localizar um serviço, deseja garantir seu acesso através de uma reserva ou solicitação. O sistema verifica a disponibilidade do recurso, confirma a elegibilidade do usuário e registra o pedido vinculado ao perfil. Se bem-sucedido, gera um comprovante digital para o usuário apresentar no local.

##### 1.2 - Atores
**Refugiado**: usuário final que solicita o serviço.​
**Agência Humanitária**: ator secundário que gerencia a oferta do recurso (sistema valida com base nos dados da agência).

#### 2 - Fluxo de Eventos (Fluxo Básico)
 ##### 2.1.1 - O refugiado seleciona um serviço específico (ex: "Abrigo Esperança") na lista de serviços e aciona a opção "Solicitar Vaga".

 ##### 2.1.2 - O sistema verifica se o usuário está devidamente autenticado (Include: Realizar Login) [RN05].

 ##### 2.1.3 - O sistema exibe os detalhes da solicitação (regras do local, quantidade de pessoas, data de entrada) e solicita confirmação [REQ08].

 ##### 2.1.4 - O refugiado revisa as informações e confirma a solicitação.

 ##### 2.1.5 - O sistema valida a disponibilidade de vagas ou itens no serviço selecionado em tempo real [RN06].

 ##### 2.1.6 - O sistema registra a solicitação no banco de dados, decrementa a disponibilidade do recurso e gera um identificador único (ex: QR Code) [RN06].

 ##### 2.1.7 - O sistema exibe o comprovante de solicitação com instruções de comparecimento e envia uma notificação de confirmação ao refugiado.

##### 2.2 - Fluxos Alternativos

##### FA01 – Vagas esgotadas
##### 2.2.1.1 - No passo 2.1.5, o sistema identifica que a capacidade do serviço foi atingida [RN06].

##### 2.2.1.2 - O sistema informa o refugiado sobre a indisponibilidade e sugere serviços similares próximos ou a inclusão em uma lista de espera.

##### 2.2.1.3 - O caso de uso encerra ou retorna ao passo de seleção de serviços.

##### 2.3 - Fluxo de Exceções

##### 2.3.1 - No passo 2.1.6, ocorre erro técnico ao processar a reserva ou gerar o comprovante.

##### 2.3.2 - O sistema exibe mensagem de erro amigável, orientando o usuário a tentar novamente ou contatar o suporte, e não realiza o decremento de vagas.

##### 2.3.3 - O caso de uso é encerrado sem criar a solicitação.

#### 3 - Requisitos Especiais
**REQ08** – Feedback Imediato: A confirmação da solicitação e geração do comprovante devem ocorrer em tempo real (menos de 5 segundos) para garantir a segurança do refugiado quanto à sua vaga.

**REQ09** – Comprovante Offline: O comprovante gerado deve ficar acessível no dispositivo mesmo se a conexão cair após a solicitação.

#### 4 - Regras de Negócio
**RN05** – Autenticação Obrigatória: Apenas usuários com perfil registrado e logado podem realizar solicitações de benefícios para garantir a rastreabilidade e evitar fraudes.

**RN06** – Controle de Capacidade: O sistema deve impedir estritamente solicitações que excedam a capacidade cadastrada pela Agência Humanitária para aquele recurso.

#### 5 - Pré-condições
O usuário deve possuir um perfil ativo e estar logado no sistema.
O serviço desejado deve estar cadastrado e ativo.

#### 6 - Pós-condições
Uma reserva é criada no sistema vinculada ao perfil do refugiado.
O estoque ou capacidade do serviço é atualizado.

#### 7 - Pontos de Extensão
No passo 2.1.2, inclui obrigatoriamente o caso de uso "Realizar Login" se o usuário não estiver autenticado.

---

### UC 03 - Localizar Serviços Básicos
Permitir que o refugiado visualize em um mapa ou lista os serviços essenciais (abrigos, hospitais, distribuição de alimentos) disponíveis em sua região, facilitando o acesso a recursos vitais.

##### 1.1 - Descrição
Este caso de uso inicia quando o refugiado acessa a funcionalidade de busca para encontrar recursos próximos. O sistema utiliza a geolocalização ou entrada manual para filtrar e exibir pontos de interesse no mapa interativo. Em cenários sem conectividade, o sistema estende este comportamento para permitir a consulta de dados previamente armazenados.

##### 1.2 - Atores
**Refugiado**: usuário que necessita encontrar serviços.​

#### 2 - Fluxo de Eventos (Fluxo Básico)
 ##### 2.1.1 - O refugiado seleciona a opção "Buscar Serviços" no menu principal.

 ##### 2.1.2 - O sistema solicita permissão para acessar a localização do dispositivo ou pede que o usuário informe uma região manualmente [RN04].

 ##### 2.1.3 - O sistema busca e exibe um mapa ou lista com os serviços cadastrados na área (abrigos, saúde, água) [REQ06].

 ##### 2.1.4 - O refugiado aplica filtros (ex: "Apenas Saúde") ou navega pelo mapa.

 ##### 2.1.5 - O refugiado seleciona um serviço específico para ver detalhes.

 ##### 2.1.6 - O sistema exibe a ficha completa do serviço (endereço, horário, capacidade, status).

##### 2.2 - Fluxos Alternativos

##### FA01 – Localização manual
##### 2.2.1.1 - O refugiado nega a permissão de GPS ou o sinal está indisponível no passo 2.1.2.

##### 2.2.1.2 - O sistema exibe um campo de busca textual para digitar o nome da cidade, campo ou região.

##### 2.2.1.3 - O refugiado insere a localização e confirma.

##### 2.2.1.4 - O fluxo retorna ao passo 2.1.3 com o mapa centralizado na região informada.

##### 2.3 - Fluxo de Exceções

##### 2.3.1 - Sem conexão com a internet (Modo Offline).

##### 2.3.2 - O sistema detecta a ausência de conectividade ao tentar carregar o mapa.

##### 2.3.3 - O sistema aciona a extensão "Consultar Informações Offline", carregando a base de dados local salva anteriormente [REQ07].

#### 3 - Requisitos Especiais
**REQ06** – Performance em Baixa Conexão: O mapa deve ser otimizado (leve) para carregar rapidamente mesmo em redes 3G instáveis.

**REQ07** – Cache Offline: O sistema deve possuir mecanismo de cache automático das últimas regiões visitadas para permitir a consulta básica sem internet.

#### 4 - Regras de Negócio
**RN04** – Privacidade de Localização: A localização exata do usuário não deve ser armazenada permanentemente nos servidores, sendo utilizada apenas para a filtragem momentânea dos serviços.

#### 5 - Pré-condições
O aplicativo deve estar instalado ou o site acessível.
Para geolocalização automática, o dispositivo deve ter GPS funcional.

#### 6 - Pós-condições
O refugiado visualiza as informações de contato e endereço do serviço desejado.

#### 7 - Pontos de Extensão
No passo 2.3.3, o caso de uso é estendido por "Consultar Informações Offline".

## Histórico de Versão

| Data       | Versão | Descrição                              | Autor(es)      | Revisor(es)    |
| ---------- | ------ | -------------------------------------- | -------------- | -------------- |
| 01/12/2025 | 1.0    | Criação da página de especificações e UC 01. | Philipe Morais | Todos |
| 02/12/2025 | 1.1    | Adição do Diagrama UML e UC 02. | Julia Patricio | Todos |
| 02/12/2025 | 1.2    | Adição da especificação do UC 03. | Vitor Trancoso | Todos |