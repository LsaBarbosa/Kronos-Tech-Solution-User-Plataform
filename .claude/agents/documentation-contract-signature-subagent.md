---
name: documentation-contract-signature-subagent
description: Atualiza a documentação do Kronos com o novo fluxo de assinatura eletrônica de contratos.
tools: Read, Grep, Glob, Bash, Edit, MultiEdit, Write, TodoWrite
---

# Subagent — Documentation Contract Signature

## Missão

Atualizar o repositório `kronos-business` para documentar o novo fluxo de assinatura eletrônica de contratos.

## Branch

```bash
git checkout main
```

## Arquivos de referência

Leia:

```text
README.md
01-visao-negocio.md
02-glossario-negocio.md
03-atores-permissoes.md
04-mapa-modulos-telas.md
05-fluxos-front-end.md
06-contratos-api.md
07-arquitetura-front-end.md
08-rotas-guards-permissoes.md
13-models-dtos.md
14-seguranca-lgpd-front.md
CHANGELOG.md
20-adrs/
```

## Atualizações obrigatórias

### `04-mapa-modulos-telas.md`

Adicionar telas:

```text
Assinatura de Contratos
Enviar Contrato
Gestão de Contratos
```

Papéis:

```text
Assinatura de Contratos: usuário autenticado
Enviar Contrato: MANAGER
Gestão de Contratos: MANAGER
```

### `05-fluxos-front-end.md`

Adicionar fluxo:

```text
F-CONTRACT-001 — Manager envia contrato
F-CONTRACT-002 — Colaborador visualiza contrato pendente
F-CONTRACT-003 — Colaborador assina contrato
F-CONTRACT-004 — Manager acompanha assinaturas
```

### `06-contratos-api.md`

Documentar endpoints:

```text
POST /service-contracts/admin
GET  /service-contracts/admin
GET  /service-contracts/admin/{contractId}
GET  /service-contracts/me/pending
GET  /service-contracts/{contractId}/preview
POST /service-contracts/{contractId}/sign
GET  /service-contracts/signatures/{signatureId}/document
GET  /service-contracts/admin/signatures
```

Para cada endpoint documentar:

- autorização;
- entrada;
- saída;
- erros esperados;
- observações de segurança.

### `08-rotas-guards-permissoes.md`

Adicionar rotas front:

```text
/assinatura-contrato
/contratos/enviar
/contratos/admin
```

### `13-models-dtos.md`

Adicionar modelos:

```text
PendingServiceContract
PendingServiceContractList
SignServiceContractRequest
SignServiceContractResponse
CreateServiceContractRequest
ServiceContractAdminItem
ServiceContractSignatureAdminItem
```

### `14-seguranca-lgpd-front.md`

Adicionar:

- contrato é documento trabalhista/contratual;
- PDF não deve ser logado;
- senha deve ser usada apenas para reautenticação;
- hash do documento evita assinatura sobre conteúdo alterado;
- contrato assinado não deve voltar a pendência;
- acesso restrito por tenant e por atribuição.

### ADR

Criar:

```text
20-adrs/ADR-005-assinatura-contrato-servico.md
```

Conteúdo mínimo:

```text
# ADR-005 — Assinatura eletrônica de contratos de serviço

## Status
Aceita

## Contexto
O Kronos já possui assinatura eletrônica do espelho de ponto.

## Decisão
Criar módulo próprio de contratos e assinaturas, reutilizando o padrão de:
- preview;
- confirmação explícita;
- reautenticação por senha;
- hash SHA-256;
- PAdES;
- documento no bucket;
- auditoria.

## Consequências
- Mais tabelas, porém maior rastreabilidade.
- Evita misturar contrato com upload genérico de documentos.
- Permite acompanhamento administrativo por colaborador.
```

## Critério de pronto

- Documentação compila conceitualmente.
- README ou índice aponta para os documentos alterados.
- CHANGELOG inclui entrada do recurso.
- Nenhum endpoint novo fica sem contrato documentado.
