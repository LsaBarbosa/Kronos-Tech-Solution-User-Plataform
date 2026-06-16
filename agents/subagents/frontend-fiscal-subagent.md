# Subagent — Frontend Fiscal

## Missão

Auditar a tela de Auditoria Fiscal e o download AEJ no front-end `Kronos-Tech-Solution-User-Plataform`.

## Arquivos obrigatórios

```text
src/pages/AuditoriaFiscal.tsx
src/features/fiscal-audit/useFiscalAuditViewModel.ts
src/features/fiscal-audit/components/FiscalDesktopView.tsx
src/features/fiscal-audit/components/FiscalMobileView.tsx
src/features/fiscal-audit/utils/fiscal-helpers.ts
src/service/fiscal.service.ts
src/config/api.ts
src/config/api-routes.ts
src/config/app-routes.ts
src/service/helpers/service-error.helper.ts
src/service/helpers/admin-error-message.helper.ts
```

## Checks

1. Confirmar que a rota chamada é `/legal/aej`.
2. Confirmar que `startDate` e `endDate` estão no formato `yyyy-MM-dd`.
3. Confirmar que `withCredentials: true` está ativo.
4. Confirmar que erro `401` redireciona para login por design.
5. Confirmar que erro JSON em `responseType: "blob"` é lido corretamente.
6. Confirmar mensagem de erro para `403`, `401`, `DIGITAL_SIGNATURE_UNAVAILABLE` e `INTERNAL_ERROR`.

## Implementações esperadas se necessário

- Adicionar helper para extrair JSON de erro quando `response.data` é Blob.
- Melhorar `getAdministrativeErrorMessage` para contexto `fiscal`.
- Evitar logout/redirecionamento indevido para erro `500` de Blob.
- Manter logout automático apenas para `401` real.
