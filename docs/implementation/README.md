# Kronos — Pacote Claude Code para Assinatura de Contrato

## Objetivo

Este pacote orienta o `CLAUDE CODE` a implementar o recurso de assinatura eletrônica de contrato no Kronos, usando como referência direta o fluxo já existente de assinatura do espelho de ponto.

## Repositórios e branches alvo

| Camada | Repositório | Branch |
|---|---|---|
| Back-end | `LsaBarbosa/Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` |
| Front-end | `LsaBarbosa/Kronos-Tech-Solution-User-Plataform` | `PROD_HOSTINGER_v2` |
| Documentação | `LsaBarbosa/kronos-business` | `main` |

## Arquivos criados neste pacote

```text
.claude/
├── skills/
│   └── kronos-contract-signature/
│       └── SKILL.md
├── agents/
│   ├── contract-signature-orchestrator.md
│   ├── backend-contract-signature-subagent.md
│   ├── frontend-contract-signature-subagent.md
│   ├── documentation-contract-signature-subagent.md
│   └── qa-security-review-subagent.md
└── rules/
    └── contract-signature-rules.md

docs/
└── implementation/
    └── contract-signature-action-plan.md

prompts/
└── claude-code-contract-signature-main-prompt.md
```

## Como usar

1. Copie a pasta `.claude/` para a raiz do ambiente onde o Claude Code será executado.
2. Copie `docs/implementation/contract-signature-action-plan.md` para o repositório de documentação ou mantenha como backlog local.
3. Abra o arquivo `prompts/claude-code-contract-signature-main-prompt.md`.
4. Cole o prompt no Claude Code.
5. Execute a implementação por etapas, validando build e testes a cada camada.

## Decisão arquitetural principal

O contrato será implementado como um domínio próprio, não como simples upload genérico de documento.

O upload do PDF original deve salvar o arquivo no bucket por meio do fluxo de documentos, usando obrigatoriamente:

```java
DocumentType.SERVICE_CONTRACT_TERMS
```

A atribuição e assinatura devem ser controladas por tabelas próprias:

```text
tb_service_contract
tb_service_contract_assignment
tb_service_contract_signature
```

A tela de assinatura deve listar somente contratos pendentes do colaborador autenticado. Após assinatura ativa, o contrato não deve aparecer novamente na lista de pendências.

## Fluxo esperado

```text
MANAGER envia PDF do contrato
  ↓
Back-end valida tenant, PDF, colaboradores e salva documento no bucket
  ↓
Back-end cria contrato + atribuições para colaboradores
  ↓
Colaborador acessa tela "Assinatura de Contratos"
  ↓
Front consulta contratos pendentes
  ↓
Colaborador visualiza o PDF
  ↓
Colaborador confirma declaração e reautentica com senha
  ↓
Back-end valida hash do PDF, declaração, senha e duplicidade
  ↓
Back-end gera PDF assinado com carimbo + assinatura PAdES
  ↓
Back-end salva evidência e documento assinado
  ↓
Contrato deixa de aparecer como pendente para aquele colaborador
```
