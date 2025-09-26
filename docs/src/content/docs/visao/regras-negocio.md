---
title: Regras de Negócio
---

# Regras de Negócio (RB)

Este documento apresenta as Regras de Negócio (RB) do sistema FireForce - PPBM. As regras de negócio definem as políticas, restrições e comportamentos específicos que o sistema deve seguir para atender aos requisitos organizacionais e operacionais do Programa Bombeiro Mirim.

---

## Regras de Negócio Principais

**RB-001**
Faltas justificadas impactam a frequência, mas são reportadas separadamente nos indicadores.

**RB-002**
Apenas Gestor de Unidade pode aprovar/recusar justificativas.

**RB-003**
Crianças com condições médicas críticas devem exibir alerta em telas de chamada e relatórios.

**RB-004**
Responsáveis visualizam apenas dados da(s) criança(s) sob sua tutela.

**RB-005**
Comunicação oficial deve permanecer registrada no sistema (não apagar, apenas arquivar).

---

## Detalhamento das Regras

### RB-001 - Contabilização de Faltas Justificadas
**Descrição:** Faltas justificadas devem ser contabilizadas separadamente das faltas não justificadas para permitir análise mais precisa da frequência dos alunos.

**Aplicação:**
- Relatórios de frequência devem distinguir entre faltas justificadas e não justificadas
- Cálculos de percentual de presença devem considerar apenas faltas não justificadas
- Indicadores devem mostrar ambos os tipos de falta para análise completa

### RB-002 - Aprovação de Justificativas
**Descrição:** Apenas usuários com perfil de Gestor de Unidade podem aprovar ou recusar justificativas de falta.

**Aplicação:**
- Sistema deve validar permissões antes de permitir aprovação/recusa
- Docentes podem registrar justificativas, mas não aprová-las
- Responsáveis podem enviar justificativas, mas não aprová-las
- Logs de auditoria devem registrar quem aprovou/recusou cada justificativa

### RB-003 - Alertas Médicos Críticos
**Descrição:** Crianças com condições médicas críticas devem ter alertas visuais em telas de chamada e relatórios.

**Aplicação:**
- Alertas devem aparecer em telas de registro de presença
- Relatórios devem destacar alunos com condições críticas
- Docentes devem ser notificados sobre condições médicas relevantes
- Informações médicas devem ser facilmente acessíveis durante emergências

### RB-004 - Privacidade de Dados
**Descrição:** Responsáveis devem visualizar apenas dados das crianças sob sua tutela legal.

**Aplicação:**
- Sistema deve validar vínculo responsável-criança antes de exibir dados
- Responsáveis não podem acessar dados de outras crianças
- Transferência de tutela deve ser documentada e auditada
- Relatórios para responsáveis devem conter apenas dados autorizados

### RB-005 - Preservação de Comunicação Oficial
**Descrição:** Comunicações oficiais devem permanecer registradas no sistema para manter histórico institucional.

**Aplicação:**
- Comunicações não podem ser deletadas, apenas arquivadas
- Histórico de comunicações deve ser mantido por período definido
- Arquivo deve preservar integridade e autenticidade das mensagens
- Busca em comunicações arquivadas deve ser possível
