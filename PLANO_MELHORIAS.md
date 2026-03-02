# Plano de melhorias (performance, boas práticas e segurança)

## 1) Escopo e varredura executada

Foi realizada uma varredura técnica no frontend (React + Vite + TypeScript) com foco em:
- Qualidade de código e boas práticas (lint).
- Gargalos de build e sinais de performance (bundle/chunks).
- Riscos de segurança no fluxo de autenticação e transporte de credenciais.

### Comandos usados na varredura
- `npm run lint`
- `npm run build`
- `npm audit --omit=dev` *(falhou por bloqueio 403 no registry no ambiente atual)*
- `rg -n "localStorage|sessionStorage|dangerouslySetInnerHTML|eval\(|new Function|http://|token|Authorization|innerHTML|document\.cookie" src README.md`
- `rg -n "const decodeToken|function decodeToken|atob\(|split\('\.'\)\[1\]" src`

---

## 2) Achados principais

## Segurança (prioridade alta)
1. **Token JWT persistido em `localStorage` e usado em múltiplos pontos**.
   - Risco: em cenário de XSS, o token pode ser exfiltrado.
   - Evidências: `src/components/LoginForm.tsx`, `src/components/FaceLoginModal.tsx`, `src/components/ProtectedRoute.tsx`, `src/config/api.ts`.

2. **Token enviado por query string em URL de download**.
   - Risco: vazamento em logs, histórico, analytics e cabeçalho `Referer`.
   - Evidência direta em `src/service/document.Service.ts` na função `generateDownloadUrl`.

3. **Decodificação de JWT replicada em vários arquivos sem validação de assinatura (apenas parsing do payload)**.
   - Risco: decisões de UI/autorização baseadas em token adulterado no client.
   - Evidências: `src/components/Sidebar.tsx`, `src/pages/Documentos.tsx`, `src/pages/DocumentoColaborador.tsx`, `src/pages/EspelhoPonto.tsx`, `src/pages/AuditoriaFiscal.tsx`, `src/lib/utils.ts`, `src/utils/report-utils.tsx`, `src/service/message.service.ts`.

## Performance (prioridade alta/média)
1. **Bundle principal muito grande**.
   - Build reportou chunk de ~1.44 MB minificado (`dist/assets/index-*.js`).
   - Impacto: TTI/FCP piores em redes móveis e devices modestos.

2. **Ausência aparente de estratégia de code splitting por rotas mais pesadas**.
   - Recomendação: lazy loading em páginas de relatórios, documentos, dashboard e fluxos administrativos.

3. **Duplicação de utilitários de token**.
   - Repetição de lógica de parse/decode aumenta custo de manutenção e risco de inconsistência.

## Boas práticas / Manutenibilidade (prioridade alta)
1. **Lint com alta dívida técnica: 93 erros e 15 warnings**.
   - Problemas dominantes: `no-explicit-any`, hooks com dependências faltantes, blocos vazios, escapes desnecessários.

2. **Inconsistência de camada de acesso HTTP**.
   - Projeto usa `axios` com interceptors (`src/config/api.ts`) e também `fetch` manual em vários services.
   - Impacto: tratamento de erro, autenticação e observabilidade fragmentados.

3. **Tratamento de erro heterogêneo e com muitos `console.error` dispersos**.
   - Recomendação: normalizar erro em helper único + telemetria (Sentry/Datadog/OpenTelemetry).

---

## 3) Plano de ação priorizado (30/60/90 dias)

## Fase 1 — 0 a 30 dias (Quick Wins críticos)
1. **Mitigar exposição de token**
   - Migrar autenticação para cookie `HttpOnly` + `Secure` + `SameSite` (com apoio backend).
   - Enquanto a migração completa não ocorre: reduzir superfície XSS e revisar renderização HTML dinâmica.

2. **Remover token da URL de download**
   - Ajustar endpoint para aceitar `Authorization` header no download.
   - Substituir `generateDownloadUrl` por fluxo de download autenticado via `fetch` + blob.

3. **Padronizar utilitário de autenticação**
   - Centralizar `decodeToken` em um único módulo e eliminar duplicações.
   - Garantir que permissões reais venham da API/back-end (não confiar só no payload local).

4. **Saneamento inicial de lint (meta: reduzir 93 -> <= 30 erros)**
   - Priorizar `any` em camadas de serviço/hooks e correção de hooks com dependências inválidas.

## Fase 2 — 31 a 60 dias (Estabilidade e performance)
1. **Code splitting por rota**
   - Aplicar `React.lazy`/`Suspense` nas páginas administrativas e relatórios.

2. **Refatorar camada HTTP**
   - Escolher uma stack única (`axios` ou `fetch`) com interceptação centralizada de token/erros/retry.

3. **Padronizar modelos tipados da API**
   - Criar contratos de request/response por domínio (auth, employee, document, dashboard).
   - Eliminar `any` remanescentes nas integrações com backend.

4. **Orçamento de bundle (performance budget)**
   - Definir alvo de chunk principal (< 500KB gzip idealmente dividido) e monitorar em CI.

## Fase 3 — 61 a 90 dias (Governança e prevenção)
1. **Gate de qualidade em CI**
   - Bloquear merge se `lint` falhar.
   - Rodar auditoria de dependências em ambiente com acesso ao advisory DB.

2. **Observabilidade de frontend**
   - Captura de exceções, breadcrumbs de navegação e erro de API com correlation id.

3. **Checklist de segurança de release**
   - Revisão de armazenamento de sessão, CSP, headers de segurança, política de dependências.

---

## 4) Backlog técnico recomendado (prioridade objetiva)

## P0 (imediato)
- [ ] Remover token em query string no download.
- [ ] Definir estratégia de sessão segura (cookie HttpOnly).
- [ ] Corrigir regras de lint críticas (`any`, `no-empty`, `hooks`).

## P1 (curto prazo)
- [ ] Centralizar autenticação/token utils.
- [ ] Adotar code splitting nas rotas pesadas.
- [ ] Unificar cliente HTTP com tratamento de erro comum.

## P2 (médio prazo)
- [ ] Implantar performance budget e monitoramento de bundle.
- [ ] Implantar auditoria de dependências no pipeline.
- [ ] Fortalecer observabilidade e rastreamento de erros.

---

## 5) Métricas de sucesso (KPIs)
- **Segurança**: 0 uso de token em query string; 100% de endpoints autenticados por header/cookie seguro.
- **Qualidade**: reduzir lint para 0 erros e <= 5 warnings.
- **Performance**: diminuir chunk inicial para patamar sem alerta do Vite e melhorar tempo de carregamento inicial.
- **Operação**: 100% dos erros críticos capturados por telemetria com contexto.
