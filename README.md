# Kronos — Pacote Codex CLI para auditoria completa do Front-end

## Objetivo

Este pacote orienta o Codex CLI a auditar o repositório `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`, usando como referência:

- back-end `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`;
- documentação `kronos-business`, branch `main`;
- diretrizes visuais e mockups já anexados ao pacote em `references/visual-guidelines`.

A saída obrigatória da execução é o arquivo:

```text
auditoria-front-end.md
```

Esse arquivo deve ser criado na raiz do repositório front-end auditado.

## Escopo da auditoria

A auditoria deve cobrir todo o front-end:

- rotas públicas;
- rotas autenticadas;
- rotas com role explícita;
- componentes globais;
- hooks;
- services HTTP;
- contextos de autenticação, check-in e sessão;
- LGPD/privacidade;
- upload/download de documentos;
- telas mobile e desktop;
- responsividade real;
- acessibilidade;
- segurança do front-end;
- alinhamento visual com as diretrizes.

## Regra principal

Não corrigir código nesta execução.

Permitido:

- ler arquivos;
- executar comandos de validação;
- gerar evidências;
- criar `auditoria-front-end.md`.

Não permitido:

- alterar componentes;
- refatorar telas;
- remover arquivos;
- ajustar CSS;
- mudar rotas;
- alterar contratos de API;
- commitar alterações.

## Ordem recomendada

1. Copiar `codex/skills`, `codex/agents`, `codex/subagents` e `codex/rules` para o workspace usado pelo Codex, se esse for o padrão local.
2. Abrir o arquivo `prompt-codex-auditoria-front-end.md`.
3. Colar o prompt no Codex CLI a partir da raiz que contém os três repositórios.
4. Validar que o Codex produziu `auditoria-front-end.md` na raiz do front-end.
5. Revisar severidades e evidências por arquivo/linha.
