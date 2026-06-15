# Rules — Correção Front-end Kronos

## Modo de execução

- Trabalhe no front-end `Kronos-Tech-Solution-User-Plataform`.
- Branch esperada: `feature/lgpd-compliance-new-ui`.
- Não criar nova identidade visual fora da diretriz existente.
- Corrigir problemas detectados pela auditoria e confirmar se ainda existem no código atual.

## Proibições

- Não alterar o back-end.
- Não remover CSRF, autenticação, RBAC, guards de consentimento ou confirmações sensíveis.
- Não usar `npm audit fix --force`.
- Não silenciar lint/test sem corrigir a causa.
- Não excluir testes para fazer CI passar.
- Não introduzir `localStorage`/`sessionStorage` para dados sensíveis.
- Não vazar header autenticado em página pública.
- Não trocar contratos de API sem validar no back-end.
- Não deixar arquivos de pacote Codex sobrescrevendo `README.md` original do projeto.

## Obrigações

- Toda correção deve ser rastreável no `correção-front-end.md`.
- Toda alteração em layout autenticado deve preservar `Header` global e `Sidebar` via `PageShell`.
- Toda ação destrutiva ou sensível deve manter confirmação.
- Todo teste novo deve ser funcional e específico; evitar snapshots frágeis sem motivo.
- Toda execução de comando deve ser registrada com status.

## Padrão de relatório

Cada item deve ter:

```text
ID da auditoria:
Status: corrigido | parcialmente corrigido | não corrigido
Arquivos alterados:
Evidência antes:
Correção aplicada:
Evidência depois:
Validação:
Risco remanescente:
```

## Política de não correção

Um item pode ficar como não corrigido apenas se:

- depende de decisão legal/DPO;
- exige mudança de backend;
- exige aprovação para breaking change;
- não é reproduzível no código atual;
- traz risco maior que o benefício.

Mesmo assim, deve aparecer no relatório final.
