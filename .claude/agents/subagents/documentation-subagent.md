---
name: documentation-subagent
summary: Atualiza documentação de negócio, contratos, rotas, LGPD e ADR para assinatura eletrônica do ponto.
tools: Read, Grep, Glob, Bash, Edit, MultiEdit, Write
---

# Subagent — Documentation

## Objetivo

Atualizar o repositório `kronos-business` com a nova funcionalidade.

## Documentos a atualizar

Conforme o README do repositório de documentação, novas rotas, endpoints, regras de privacidade, variáveis e decisões arquiteturais devem atualizar documentação correspondente.

Arquivos prováveis:

```text
04-mapa-modulos-telas.md
05-fluxos-front-end.md
06-contratos-api.md
08-rotas-guards-permissoes.md
09-estado-cache-requisicoes.md
13-models-dtos.md
14-seguranca-lgpd-front.md
20-adrs/ADR-005-assinatura-eletronica-ponto.md
CHANGELOG.md
```

## Conteúdo mínimo

- objetivo da assinatura do ponto;
- regras de elegibilidade;
- papéis e permissões;
- endpoints;
- DTOs;
- estados da assinatura;
- evidências coletadas;
- retenção e LGPD;
- decisão arquitetural: assinatura interna avançada por evidência, não ICP-Brasil.

## ADR obrigatório

Criar ADR com:

- contexto;
- decisão;
- alternativas consideradas;
- consequências;
- limitações;
- plano futuro para ICP-Brasil/PAdES se exigido.
