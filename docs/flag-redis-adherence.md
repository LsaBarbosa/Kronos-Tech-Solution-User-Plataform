# Aderência do Front-end ao Backend flag/redis

## Escopo

- Front-end: Kronos-Tech-Solution-User-Plataform
- Branch front-end: v4/fase4/limpeza
- Backend: Kronos-Tech-Solutions-KTS
- Branch backend: flag/redis

## Matriz de aderência

| Domínio | Status | Evidência |
|---|---|---|
| Auth | Aderente | Login por senha, recuperação/reset e login facial usam os contratos atuais. |
| Terms | Aderente | Status, aceite e revogação biométrica estão mapeados. |
| Documents | Aderente | `GET /documents` sempre envia `type`; download/delete aceitam `employeeId?`. |
| Companies | Aderente | Criação, atualização, consulta e toggle usam services centralizados. |
| Geolocation | Aderente | Front consome `POST /geolocation/resolve`; backend `flag/redis` expõe `GeolocationController`. |
| Records | Aderente | Relatório detalhado usa `POST /records/report`; endpoint simples legado não é consumido. |
| Vacation | Aderente | Solicitação, listagem, aprovação e rejeição seguem os endpoints atuais. |
| Time-off | Aderente | Solicitação, listagem, aprovação e rejeição seguem os endpoints atuais. |
| Legal/Fiscal | Aderente com atenção a UX 429/503 | Downloads fiscais usam service centralizado e helper de erro compartilhado. |
| Messages | Aderente | Listagem, criação e exclusão usam contratos mapeados. |
| Redis/Idempotency | Aderente no tratamento de erro, validar UX | `429` e `503` são normalizados; telas devem manter bloqueio durante downloads. |
| TypeScript | Enterprise-ready | Guardas validam `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals` e `noUnusedParameters`. |
| CI/CD | Enterprise básico | Lint, testes, coverage e build existem como scripts npm. |
| Biometria/Liveness | Contrato aderente, liveness real pendente | Payload envia `livenessPassed`; validação atual é mínima e local. |

## Redis e idempotência

O backend `flag/redis` pode retornar `429` quando houver processamento em andamento ou bloqueio por rate limit/idempotência.
Também pode retornar `503` quando a camada Redis estiver temporariamente indisponível em fluxo crítico.
O front normaliza esses status em `src/service/helpers/service-error.helper.ts`, usando `rateLimit` para `429` e `serviceUnavailable` para `503`.
As telas fiscais devem evitar múltiplos cliques durante downloads para reduzir concorrência desnecessária contra os locks do backend.

## Cobertura automatizada

- O helper de erro possui testes específicos para `429` e `503`.
- `AuditoriaFiscal` e `EspelhoPonto` possuem testes de bloqueio de clique durante download.
- `EspelhoPonto` cobre o envio de `targetEmployeeId` quando um colaborador é selecionado.

## Geolocalização

O front consome `POST /geolocation/resolve` por meio de `src/service/geolocation.service.ts`.
O backend `flag/redis` expõe `GeolocationController` para esse contrato.
Chaves externas de geocoding ficam no backend e não são expostas no navegador.

## Pendências enterprise restantes

- Evoluir liveness biométrico real.
- Validar UX de loading/bloqueio de múltiplos cliques em downloads legais.
- Opcional: criar bundle size check.
- Opcional: publicar artifact de coverage.

## Ajustes concluídos nesta aderência

- `package.json` e `package-lock.json` usam `kronos-user-platform` como nome do pacote.

## Validação

```bash
npm run lint
npm run test
npm run build
npm run test:coverage
```
