# Subagent — Report Domain

## Objetivo

Garantir que a nova UI respeite o domínio de relatório de ponto.

## Regras de domínio

- A tela gera relatório detalhado de registros de ponto.
- Filtros principais: datas, carga horária de referência, status, colaborador e ativo/inativo.
- `reference` é obrigatório e tem formato `HH:mm`.
- `dates` é obrigatório e aceita múltiplas datas.
- `statuses` é opcional e multi-seleção.
- `active` representa registros aprovados/reprovados conforme comportamento legado.
- `employeeId` é opcional para perfis com visão mais ampla e obrigatório/travado para `PARTNER` pela sessão.

## Regras por ROLE

### PARTNER

- Relatório próprio.
- Sem troca de colaborador.
- Mostrar `Colaborador bloqueado pela sessão`.

### MANAGER

- Relatório para colaboradores do tenant/equipe.
- Pode usar filtros de colaborador e status.

### CTO

- Comunicação visual de escopo administrativo.
- Não inventar seleção de empresa se o contrato atual não oferece isso no front.

## Dados de resultado

Preservar exibição ou acesso a:

- quantidade de registros;
- total trabalhado;
- saldo;
- status do registro;
- colaborador;
- empresa;
- edição de registro, quando suportada pelo fluxo atual;
- download de documentos anexados, quando já existir.
