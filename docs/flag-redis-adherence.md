# Aderência do Front-end ao Backend flag/redis

Front-end: `Kronos-Tech-Solution-User-Plataform`  
Branch front-end: `PROD_HOSTINGER`
Backend: `Kronos-Tech-Solutions-KTS`  
Branch backend: `flag/redis`

| Domínio | Status | Evidência |
|---|---|---|
| Auth | Aderente | Login por senha, recuperação/reset e login facial usam endpoints do backend. |
| Terms | Aderente para aceite obrigatório | `GET /terms/status` bloqueia rotas protegidas e `POST /terms/accept-biometric` registra aceite no PLATAFORM. |
| Documents | Aderente | `GET /documents` sempre envia `type`; download usa `documentId`. |
| Companies | Aderente | CRUD e geolocalização usam backend. |
| Geolocation | Aderente | `POST /geolocation/resolve` existe no backend flag/redis e é consumido pelo front. |
| Records | Aderente | Relatório detalhado, férias e abonos usam services tipados. |
| Vacation | Aderente | Datas enviadas no formato do DTO backend. |
| Time-off | Aderente | Multipart e datas no formato `dd-MM-yyyy`. |
| Legal/Fiscal | Aderente com atenção a UX 429/503 | Botões bloqueiam duplo clique e mensagens são normalizadas. |
| Messages | Aderente | Avisos usam endpoints oficiais. |
| Redis/Idempotency | Aderente no tratamento de erro | `429` e `503` são normalizados e exibidos em fluxos fiscais. |
| TypeScript | Enterprise-ready | Guardas mantêm `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals` e `noUnusedParameters`. |
| CI/CD | Enterprise básico | Scripts de lint, test, build, coverage, E2E e análise de bundle estão previstos. |
| Biometria/Liveness | Contrato aderente, liveness real pendente | `livenessPassed` vem de validação mínima explícita. |

## Redis e Idempotência

O backend `flag/redis` pode retornar `429` quando um relatório legal já estiver em processamento e `503` quando a camada Redis/lock estiver temporariamente indisponível. O front normaliza esses status em `service-error.helper.ts` e usa mensagens administrativas em `admin-error-message.helper.ts`.

As telas fiscais desabilitam o botão durante downloads para evitar múltiplos cliques simultâneos.

## Geolocalização

O front consome `POST /geolocation/resolve` via `geolocation.service.ts`. O backend `flag/redis` expõe `GeolocationController` para essa rota, então chaves externas de geocoding não ficam no navegador.

## Contrato Administrativo

- Datas de férias e abonos são enviadas em `dd-MM-yyyy`.
- `GET /documents` sempre recebe `type`.
- Espelho de ponto aceita `targetEmployeeId?` para MANAGER/CTO.
- PARTNER gera apenas o próprio espelho.
- `X-Correlation-Id` é enviado em chamadas Axios.

## Pendências Enterprise Restantes

- Evoluir liveness biométrico real com múltiplos frames, desafio de movimento, piscada ou validação backend especializada.
- Validar UX fiscal com testes E2E contra ambiente integrado.
- Publicar artefato de coverage em CI.
- Definir limiar formal de bundle size por rota.

## Comandos de Validação

```bash
npm install
npm run generate:api-types
npm run lint
npm run test
npm run build
npm run test:e2e
npm run analyze
```
