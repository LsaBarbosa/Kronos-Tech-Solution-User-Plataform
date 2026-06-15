# Kronos — Pacote Codex para `/auditoria`

Este pacote orienta o Codex CLI a refatorar a tela **Auditoria Fiscal** na rota `/auditoria`, transformando a experiência atual em uma **central de arquivos legais e fiscais** para conformidade de jornada.

## Escopo

- Repositório front-end: `Kronos-Tech-Solution-User-Plataform`
- Branch front-end: `feature/lgpd-compliance-new-ui`
- Repositório back-end: `Kronos-Tech-Solutions-KTS`
- Branch back-end: `PROD_HOSTINGER_V2`
- Repositório de documentação: `kronos-business`
- Branch documentação: `main`
- Rota: `/auditoria`
- Arquivo principal atual: `src/pages/AuditoriaFiscal.tsx`

## Referências incluídas

```text
references/
├── docs/
│   └── kronos_auditoria_fiscal_diretriz_visual.md
└── mockups/
    ├── kronos_auditoria_fiscal_desktop.png
    └── kronos_auditoria_fiscal_mobile.png
```

## Resultado esperado

A tela deve deixar de ser um card único com radio buttons e calendário e passar a funcionar como **Fiscal Compliance Console**:

- Desktop: console fiscal com hero, cards grandes de AEJ/AFD/ATESTADO, mês de referência, painel lateral de conformidade e CTA explícito.
- Mobile: fluxo guiado com seleção compacta de tipo, referência, prévia e CTA fixo.
- Contratos HTTP preservados.
- Legado visual removido após teste.
- Sem alteração de back-end, salvo se o Codex encontrar divergência real de contrato.

## Contratos que devem ser preservados

```text
GET /legal/technical-certificate
GET /legal/afd
GET /legal/aej?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

## Comandos mínimos de validação

Executar no front-end:

```bash
npm install
npm run lint
npm run build
```

Se existirem testes no workspace:

```bash
npm test
```

## Observações de negócio

- `AEJ` usa período/mês e gera `.p7s`.
- `AFD` não deve sugerir que mês seja obrigatório.
- `ATESTADO` é documento estático e não depende de data.
- A rota é restrita a `MANAGER` e `CTO`.
- Loading deve bloquear múltiplas solicitações.
- Erros devem usar linguagem administrativa.
