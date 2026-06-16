# Kronos — Pacote Codex CLI para `/lgpd/admin/requests`

## Objetivo

Refatorar a tela administrativa de solicitações LGPD na rota `/lgpd/admin/requests`, transformando a tela atual em uma **LGPD Governance Inbox**.

A implementação deve criar duas experiências reais:

- **Desktop:** mesa administrativa de governança, com hero, métricas, filtros, inbox/tabela operacional e painel lateral do caso selecionado.
- **Mobile:** fila de cards de governança, com resumo, busca, chips de status e drawer/bottom bar para o caso selecionado.

## Repositórios alvo

| Repositório | Branch |
|---|---|
| `Kronos-Tech-Solutions-KTS` | `PROD_HOSTINGER_V2` |
| `Kronos-Tech-Solution-User-Plataform` | `feature/lgpd-compliance-new-ui` |
| `kronos-business` | `main` |

## Arquivos de referência

```text
references/docs/kronos_lgpd_admin_requests_diretriz_visual.md
references/mockups/kronos_lgpd_admin_requests_desktop.png
references/mockups/kronos_lgpd_admin_requests_mobile.png
```

## Resultado esperado

A rota `/lgpd/admin/requests` deve deixar de parecer apenas uma tabela e passar a funcionar como uma fila de governança LGPD, preservando contratos, RBAC, histórico e navegação para detalhes.
