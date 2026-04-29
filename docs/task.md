# ANÁLISE E BACKLOG — Kronos Front-end x Backend `flag/redis`

## Repositórios analisados

- Front-end: `Kronos-Tech-Solution-User-Plataform`
- Branch front-end: `v4/fase4/limpeza`
- Backend: `Kronos-Tech-Solutions-KTS`
- Branch backend: `flag/redis`

## Objetivo

Detalhar o que falta para o front-end ficar 100% aderente ao backend `flag/redis` e evoluir para padrão enterprise.

---

# 1. Resumo executivo

O front-end `v4/fase4/limpeza` já está maduro em vários pontos que antes estavam divergentes:

- `GET /documents` já exige `type` no service.
- Download e delete de documentos já aceitam `employeeId?`.
- `DELETE /terms/revoke-biometric` já está implementado no front.
- `FaceLoginPayload` já aceita `livenessPassed`.
- `FaceLoginModal` já envia `livenessPassed`.
- `/records/report/simple` já foi removido.
- CI já possui lint, coverage, audit e build.

Porém, ao trocar o backend de referência de `main_final_version` para `flag/redis`, apareceu um ponto crítico:

> O front consome `POST /geolocation/resolve`, mas a branch backend `flag/redis` não expõe esse endpoint.

Além disso, a branch `flag/redis` adiciona comportamento operacional relevante via Redis:

- idempotência/lock para relatórios legais;
- possíveis respostas `429 Too Many Requests`;
- possíveis respostas `503 Service Unavailable` quando Redis estiver indisponível;
- cache de dados sensíveis de domínio;
- rate limit de biometria/check-in configurável.

Esses comportamentos não mudam todos os endpoints, mas exigem ajustes de UX, tratamento de erro, testes e documentação no front.

---

# 2. Diagnóstico de aderência atual

## 2.1. Aderente

| Domínio | Status | Observação |
|---|---:|---|
| Auth por senha | Aderente | `POST /auth/login` continua igual |
| Login facial | Parcialmente aderente | Payload tem `livenessPassed`, mas valor ainda é temporário |
| Recuperação/reset senha | Aderente | Endpoints continuam iguais |
| Termos biométricos | Aderente | `status`, `accept-biometric` e `revoke-biometric` estão cobertos no front |
| Documentos | Aderente | `type` obrigatório, `employeeId?` em download/delete |
| Relatório detalhado | Aderente | Usa `POST /records/report` |
| `/records/report/simple` | Resolvido | Removido do front |
| Legal/fiscal | Parcialmente aderente | Endpoints existem, mas falta UX adequada para locks Redis e `targetEmployeeId` opcional no espelho |
| Redis/cache | Parcial | Backend adiciona Redis, front precisa tratar 429/503 de forma específica |

## 2.2. Não aderente ou incompleto

| Prioridade | Ponto | Impacto |
|---|---|---|
| P0 | `POST /geolocation/resolve` não existe na branch backend `flag/redis` | Criação/atualização de empresa pode quebrar |
| P1 | Front não trata explicitamente `429` como rate limit/idempotência | Usuário pode receber erro genérico em relatórios legais |
| P1 | Front não trata explicitamente `503` de Redis indisponível | Usuário pode receber erro genérico quando Redis falhar |
| P1 | `FiscalService.downloadMirror` não aceita `targetEmployeeId?` | Manager/CTO não conseguem gerar espelho de colaborador específico via query param |
| P1 | `livenessPassed` ainda é compatibilidade temporária | Biometria não está em padrão enterprise real |
| P2 | `strict: false` no TypeScript | Ainda não é enterprise-grade em tipagem |
| P2 | `test:coverage` pode não gerar relatório real do Vitest | CI pode executar coverage sem relatório útil |
| P2 | Falta validação automatizada de contrato front x backend | Risco de endpoint inexistente voltar |

---

# 3. Evidências técnicas principais

## 3.1. Front consome geolocalização

O front possui `API_ROUTES.GEOLOCATION = "geolocation"` e `resolveCompanyGeolocation()` chama:

```txt
POST /geolocation/resolve
```

Payload:

```json
{
  "postalCode": "00000000",
  "number": "123"
}
```

Resposta esperada:

```json
{
  "latitude": -23.000000,
  "longitude": -46.000000
}
```

## 3.2. Backend `flag/redis` não expõe geolocalização

Na branch `flag/redis`, o `ApiPaths.java` não contém constantes `GEOLOCATION` ou `RESOLVE`, e não foi encontrado `GeolocationController.java`.

Isso torna o endpoint consumido pelo front incompatível com o backend `flag/redis`.

## 3.3. Backend `flag/redis` adiciona Redis operacional

A branch `flag/redis` adiciona:

- `spring-boot-starter-data-redis`;
- `spring-boot-starter-cache`;
- configurações `kronos.redis.enabled`;
- TTLs de cache;
- idempotência;
- rate limit;
- tratamento de `TooManyRequestsException` como `429`;
- tratamento de `RedisUnavailableException` como `503`.

## 3.4. Legal/fiscal com locks Redis

A branch `flag/redis` protege relatórios legais com lock/idempotência:

- `/legal/technical-certificate`;
- `/legal/afd`;
- `/legal/aej`;
- `/legal/espelho-ponto`.

Quando uma geração concorrente ocorre, o backend pode retornar `429` com mensagem similar a:

```txt
Processamento em andamento. Aguarde alguns instantes antes de gerar este relatório novamente.
```

O front deve exibir essa mensagem corretamente, desabilitar botões durante download e evitar duplo clique.

---

# 4. Backlog orientado ao Codex CLI

---

# Sprint 1 — Bloqueador P0: geolocalização compatível com `flag/redis`

## Objetivo

Resolver a divergência entre o front e o backend `flag/redis` para o endpoint:

```txt
POST /geolocation/resolve
```

## História 1.1 — Validar e corrigir contrato de geolocalização

### Problema

O front chama `POST /geolocation/resolve`, mas o backend `flag/redis` não expõe esse endpoint.

### Opção recomendada

Portar para a branch backend `flag/redis` o mesmo endpoint de geolocalização existente na linha funcional anterior.

### Critérios de aceite

- `POST /geolocation/resolve` existe no backend `flag/redis`.
- Endpoint recebe `{ postalCode, number }`.
- Endpoint retorna `{ latitude, longitude }`.
- Endpoint é protegido por `CTO`, se mantida a regra de empresa.
- Front `resolveCompanyGeolocation()` funciona sem alteração.
- Testes de criação/atualização de empresa passam.

### Prompt para Codex CLI

```txt
Você está trabalhando com dois repositórios:

1. Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `v4/fase4/limpeza`.
2. Backend: `Kronos-Tech-Solutions-KTS`, branch `flag/redis`.

Problema:
O front consome `POST /geolocation/resolve`, mas o backend `flag/redis` não possui esse endpoint.

Objetivo:
Deixar o backend `flag/redis` compatível com o front atual, sem voltar a geolocalização para o navegador.

Execute no backend:
1. Criar ou portar `GeolocationController`.
2. Criar/portar DTO `GeolocationResolveRequest` com:
   - `postalCode`
   - `number`
3. Retornar `Location` com:
   - `latitude`
   - `longitude`
4. Adicionar constantes no `ApiPaths`, se o padrão do backend exigir:
   - `GEOLOCATION = "/geolocation"`
   - `RESOLVE = "/resolve"`
5. Proteger endpoint com role coerente com criação/atualização de empresa, preferencialmente `CTO`.
6. Não expor chave HERE no front.
7. Usar serviço backend para ViaCEP/HERE ou serviço já existente.
8. Adicionar teste de controller/service.

Validação backend:
./gradlew test
./gradlew build

Validação front:
npm run lint
npm run test
npm run build

Critérios:
- Front não chama endpoint inexistente.
- Criação/atualização de empresa não quebra.
```

---

## História 1.2 — Criar guarda anti-regressão de geolocalização no front

### Objetivo

Impedir que o front documente `/geolocation/resolve` como aderente se o backend usado como referência não tiver esse endpoint.

### Critérios de aceite

- Existe teste ou documento de validação de contrato.
- O contrato de geolocalização está explicitado.
- A documentação avisa que `flag/redis` precisa expor `/geolocation/resolve`.

### Prompt para Codex CLI

```txt
No front `Kronos-Tech-Solution-User-Plataform`, branch `v4/fase4/limpeza`, crie uma guarda/documentação para o contrato de geolocalização.

Faça:
1. Atualizar `docs/api-contract-map.md` para indicar que `/geolocation/resolve` depende do backend `flag/redis` expor o endpoint.
2. Criar ou atualizar teste de contrato em `src/test/api-contract-guard.test.ts` para garantir que o front continua chamando apenas `/geolocation/resolve` para geolocalização.
3. Não voltar a usar HERE/ViaCEP diretamente no navegador.
4. Não remover `geolocation.service.ts`.

Validação:
npm run lint
npm run test
npm run build
```

---

# Sprint 2 — Redis: tratamento enterprise de 429 e 503

## Objetivo

Adaptar o front aos novos comportamentos da branch `flag/redis`:

- `429 Too Many Requests` para idempotência/rate limit;
- `503 Service Unavailable` para Redis indisponível.

---

## História 2.1 — Classificar 429 e 503 no helper de erro

### Arquivo alvo

```txt
src/service/helpers/service-error.helper.ts
```

### Tasks

- [ ] Adicionar kind `rateLimit` para status `429`.
- [ ] Adicionar kind `serviceUnavailable` para status `503`.
- [ ] Preservar extração de `detail` do backend.
- [ ] Criar mensagens fallback específicas.
- [ ] Atualizar testes.

### Critérios de aceite

- `429` não aparece como erro HTTP genérico.
- `503` não aparece como erro HTTP genérico.
- Mensagem `detail` do backend é exibida quando existir.
- Testes passam.

### Prompt para Codex CLI

```txt
No front `Kronos-Tech-Solution-User-Plataform`, branch `v4/fase4/limpeza`, atualize `src/service/helpers/service-error.helper.ts`.

Contexto:
O backend `flag/redis` pode retornar:
- 429 para idempotência/rate limit.
- 503 para Redis indisponível.

Faça:
1. Adicionar `rateLimit` em `ServiceErrorKind`.
2. Adicionar `serviceUnavailable` em `ServiceErrorKind`.
3. Mapear status `429` para `rateLimit`.
4. Mapear status `503` para `serviceUnavailable`.
5. Criar mensagens fallback:
   - 429: `Processamento em andamento. Aguarde alguns instantes e tente novamente.`
   - 503: `Serviço temporariamente indisponível. Tente novamente em instantes.`
6. Preservar extração de `detail`, `message`, `title` e erros de validação.
7. Atualizar testes do helper.

Validação:
npm run lint
npm run test
npm run build
```

---

## História 2.2 — Melhorar UX dos downloads legais com lock Redis

### Arquivos prováveis

```txt
src/service/fiscal.service.ts
src/pages/AuditoriaFiscal.tsx
src/pages/EspelhoPonto.tsx
src/hooks/*fiscal*
```

### Tasks

- [ ] Garantir loading por tipo de relatório.
- [ ] Desabilitar botão durante geração.
- [ ] Tratar 429 exibindo mensagem do backend.
- [ ] Tratar 503 com mensagem clara.
- [ ] Evitar múltiplos cliques enquanto download está em andamento.
- [ ] Adicionar testes.

### Critérios de aceite

- Usuário não dispara dois downloads iguais por duplo clique.
- `429` aparece como mensagem amigável.
- `503` aparece como indisponibilidade temporária.
- Botão volta ao normal após sucesso/erro.

### Prompt para Codex CLI

```txt
No front `Kronos-Tech-Solution-User-Plataform`, branch `v4/fase4/limpeza`, melhore a UX dos downloads legais.

Contexto:
Na branch backend `flag/redis`, os endpoints legais usam idempotência Redis e podem retornar 429 quando já existe processamento em andamento.

Endpoints afetados:
- GET /legal/technical-certificate
- GET /legal/afd
- GET /legal/aej
- GET /legal/espelho-ponto

Faça:
1. Localizar telas/hook que chamam `FiscalService`.
2. Criar loading separado por botão/relatório.
3. Desabilitar botão enquanto o download está em andamento.
4. Exibir mensagem do backend em caso de 429.
5. Exibir mensagem amigável em caso de 503.
6. Não fazer retry automático de download legal.
7. Manter download de blob funcionando.
8. Adicionar testes de 429 e 503.

Validação:
npm run lint
npm run test
npm run build
```

---

# Sprint 3 — Aderência completa do espelho de ponto

## Objetivo

Ajustar o front ao backend `flag/redis`, onde `/legal/espelho-ponto` aceita:

```txt
targetEmployeeId? 
startDate
endDate
```

## História 3.1 — Adicionar `targetEmployeeId?` no download do espelho

### Arquivo alvo

```txt
src/service/fiscal.service.ts
```

### Tasks

- [ ] Alterar `downloadMirror(startDate, endDate)` para aceitar `targetEmployeeId?`.
- [ ] Enviar `targetEmployeeId` nos params quando existir.
- [ ] Preservar fluxo do usuário comum sem `targetEmployeeId`.
- [ ] Atualizar UI de gestor se houver seleção de colaborador.
- [ ] Atualizar testes.

### Critérios de aceite

- Partner gera próprio espelho sem `targetEmployeeId`.
- Manager/CTO conseguem gerar espelho para colaborador quando houver seleção.
- Query param fica correto.
- Testes passam.

### Prompt para Codex CLI

```txt
No front `Kronos-Tech-Solution-User-Plataform`, branch `v4/fase4/limpeza`, ajuste o download do espelho de ponto.

Contexto:
O backend `flag/redis` expõe:
GET /legal/espelho-ponto?targetEmployeeId={uuid}&startDate=yyyy-MM-dd&endDate=yyyy-MM-dd

`targetEmployeeId` é opcional.

Faça:
1. Em `src/service/fiscal.service.ts`, alterar:
   `downloadMirror(startDate: string, endDate: string)`
   para:
   `downloadMirror(startDate: string, endDate: string, targetEmployeeId?: string)`
2. Se `targetEmployeeId` existir, enviar em `params`.
3. Se não existir, manter comportamento atual.
4. Atualizar tela/hook de `EspelhoPonto` para passar colaborador selecionado quando aplicável.
5. Adicionar teste validando query param `targetEmployeeId`.
6. Não alterar AFD, AEJ ou atestado técnico.

Validação:
npm run lint
npm run test
npm run build
```

---

# Sprint 4 — Biometria enterprise

## Objetivo

Melhorar o uso de `livenessPassed`, que hoje atende o contrato mas ainda não é liveness real.

## História 4.1 — Remover `livenessPassed: true` literal do payload

### Critérios de aceite

- Valor vem de função/estado explícito.
- Documentação explica limitação atual.
- Teste cobre payload.

### Prompt para Codex CLI

```txt
No front `Kronos-Tech-Solution-User-Plataform`, branch `v4/fase4/limpeza`, refatore `FaceLoginModal`.

Problema:
O payload atual envia `livenessPassed: true` diretamente. Isso é compatibilidade contratual, mas não é enterprise.

Faça:
1. Criar função ou estado explícito para liveness.
2. O payload deve usar `livenessPassed` vindo dessa função/estado.
3. Não usar literal `livenessPassed: true` diretamente no objeto enviado ao backend.
4. Se a validação ainda for mínima, documentar no código e docs.
5. Atualizar teste do payload.

Validação:
npm run lint
npm run test
npm run build
```

---

## História 4.2 — Criar plano de liveness real

### Prompt para Codex CLI

```txt
Crie `docs/biometric-liveness-plan.md`.

Inclua:
1. Situação atual.
2. Risco de spoofing.
3. Estratégia futura.
4. Opções técnicas:
   - múltiplos frames
   - desafio de movimento
   - piscada
   - validação backend
   - serviço especializado
5. Critérios de aceite enterprise.
6. Relação com `/auth/login-face` e `livenessPassed`.

Adicione link no README.

Validação:
npm run lint
npm run test
npm run build
```

---

# Sprint 5 — TypeScript enterprise

## História 5.1 — Ativar `strict: true`

### Problema

O projeto ainda mantém `strict: false`.

### Prompt para Codex CLI

```txt
Ative TypeScript strict completo no front.

Arquivo:
`tsconfig.app.json`

Faça:
1. Alterar `strict` para `true`.
2. Rodar build.
3. Corrigir erros de tipo corretamente.
4. Não adicionar `any`.
5. Não usar `@ts-ignore`.
6. Não desabilitar flags já ativas.
7. Preferir type guards e tipos de domínio.

Validação:
npm run lint
npm run test
npm run build
```

---

## História 5.2 — Criar guarda do tsconfig

### Prompt para Codex CLI

```txt
Crie `src/test/tsconfig-contract-guard.test.ts`.

O teste deve ler `tsconfig.app.json` e validar:
- strict === true
- noImplicitAny === true
- strictNullChecks === true
- noUnusedLocals === true
- noUnusedParameters === true

Validação:
npm run test
npm run lint
npm run build
```

---

# Sprint 6 — Coverage e CI enterprise

## História 6.1 — Corrigir coverage real do Vitest

### Problema

O script atual pode coletar dados V8 brutos, mas não necessariamente gerar relatório real do Vitest.

### Prompt para Codex CLI

```txt
Corrija o coverage do Vitest.

Arquivos:
- package.json
- vitest.config.ts
- .github/workflows/ci.yml

Faça:
1. Se necessário, adicionar `@vitest/coverage-v8`.
2. Alterar script `test:coverage` para `vitest run --coverage`.
3. Configurar coverage em `vitest.config.ts`.
4. Reporters mínimos: text, json, html ou lcov.
5. Manter CI rodando coverage.
6. Não remover lint/audit/build.

Validação:
npm install
npm run test:coverage
npm run lint
npm run test
npm run build
```

---

## História 6.2 — Adicionar thresholds de coverage

### Prompt para Codex CLI

```txt
Adicione thresholds mínimos de coverage no Vitest.

Sugestão inicial:
- statements: 60
- branches: 50
- functions: 60
- lines: 60

Se o coverage atual estiver abaixo, use valor atual arredondado para baixo e documente plano de evolução.

Validação:
npm run test:coverage
npm run lint
npm run build
```

---

# Sprint 7 — Contrato automatizado front x backend

## História 7.1 — Criar guarda de endpoints

### Prompt para Codex CLI

```txt
Crie ou atualize `src/test/api-contract-guard.test.ts`.

Objetivo:
Evitar endpoints inexistentes ou legados no front.

O teste deve falhar se encontrar:
- /records/report/simple
- report/simple
- /documents/me
- /documents/upload
- /records/time-off-request

O teste deve garantir presença de endpoints críticos:
- /records/report
- /terms/revoke-biometric
- /auth/login-face
- /documents
- /legal/espelho-ponto

Para `/geolocation/resolve`, documentar que o backend `flag/redis` precisa expor o endpoint antes de considerar aderente.

Validação:
npm run test
npm run lint
npm run build
```

---

## História 7.2 — Criar plano de OpenAPI

### Prompt para Codex CLI

```txt
Crie `docs/openapi-contract-plan.md`.

Inclua:
1. Problema atual: contratos manuais.
2. Risco visto com `/geolocation/resolve` e branches divergentes.
3. Proposta:
   - backend expõe OpenAPI
   - front gera tipos/client
   - CI compara contrato
4. Ferramentas possíveis:
   - openapi-typescript
   - openapi-fetch
   - swagger-codegen, se fizer sentido
5. Plano em fases.
6. Critérios de aceite futuros.

Adicione link no README.

Validação:
npm run lint
npm run test
npm run build
```

---

# Sprint 8 — Documentação final de aderência `flag/redis`

## História 8.1 — Atualizar documentação de contrato para `flag/redis`

### Prompt para Codex CLI

```txt
Atualize a documentação do front para refletir o backend `flag/redis`.

Arquivos prováveis:
- docs/api-contract-map.md
- docs/frontend-http-inventory.md
- docs/frontend-architecture.md
- README.md

Faça:
1. Marcar `/geolocation/resolve` como bloqueado enquanto não existir no backend `flag/redis`, ou marcar como aderente apenas após backend implementar.
2. Documentar respostas 429 e 503 da camada Redis.
3. Documentar que relatórios legais possuem proteção contra concorrência.
4. Documentar `targetEmployeeId` opcional em `/legal/espelho-ponto`.
5. Documentar liveness atual e plano enterprise.
6. Não reintroduzir endpoints removidos.

Validação:
npm run lint
npm run test
npm run build
```

---

# Sprint 9 — Validação final

## Prompt final para Codex CLI

```txt
Execute a validação final da aderência do front `v4/fase4/limpeza` contra o backend `flag/redis`.

Comandos:
npm run lint
npm run test
npm run test:coverage
npm run build
npm audit --audit-level=moderate

Buscas obrigatórias:
grep -R "records/report/simple" src docs README.md .github || true
grep -R "report/simple" src docs README.md .github || true
grep -R "fetchDocuments()" src || true
grep -R "fetchUserDocuments()" src || true
grep -R "livenessPassed: true" src || true
grep -R "@ts-ignore" src || true
grep -R "any" src --include="*.ts" --include="*.tsx" || true

Critérios:
1. Nenhum endpoint inexistente consumido pelo front.
2. `/geolocation/resolve` resolvido no backend `flag/redis` ou documentado como bloqueador.
3. 429 e 503 tratados corretamente.
4. Espelho de ponto aceita `targetEmployeeId?`.
5. Liveness não é literal solto.
6. TypeScript strict ativo.
7. Coverage real funcionando.
8. Documentação atualizada.
```

---

# Checklist final para considerar 100% aderente ao backend `flag/redis`

## Contrato HTTP

- [ ] `/geolocation/resolve` existe no backend `flag/redis` ou o front deixa de consumir esse endpoint.
- [ ] `GET /documents` sempre envia `type`.
- [ ] `DELETE /terms/revoke-biometric` implementado e testado.
- [ ] `/auth/login-face` envia `livenessPassed`.
- [ ] `/legal/espelho-ponto` aceita `targetEmployeeId?` no front.
- [ ] Nenhum `/records/report/simple` existe.

## Redis e UX

- [ ] `429` tratado como rate limit/idempotência.
- [ ] `503` tratado como indisponibilidade temporária.
- [ ] Botões de relatórios legais bloqueiam duplo clique.
- [ ] Mensagens do backend são exibidas.

## Enterprise

- [ ] `strict: true` no TypeScript.
- [ ] Coverage real com thresholds.
- [ ] Audit documentado.
- [ ] Contrato automatizado ou plano OpenAPI.
- [ ] Liveness real planejado/documentado.
- [ ] Documentação atualizada para `flag/redis`.
