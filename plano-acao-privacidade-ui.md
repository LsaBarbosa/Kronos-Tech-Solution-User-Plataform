# Plano de ação — Refatoração `/privacidade`

## 0. Preparação

### Task 0.1 — Confirmar branches

```bash
git status
git branch --show-current
```

Confirmar:

- front-end em `feature/lgpd-compliance-new-ui`;
- back-end disponível em `PROD_HOSTINGER_V2` para consulta de contrato;
- documentação `kronos-business` em `main`.

### Task 0.2 — Validar referências visuais

Confirmar a existência dos arquivos:

```text
references/docs/kronos_privacidade_diretriz_visual.md
references/mockups/kronos_privacidade_desktop.png
references/mockups/kronos_privacidade_mobile.png
```

Se algum arquivo estiver ausente, interromper e reportar.

---

## 1. Mapeamento funcional

### Task 1.1 — Mapear rota

Ler:

- `src/App.tsx`
- `src/config/app-routes.ts`

Confirmar que:

- `/privacidade` usa `PrivacyCenter`;
- rota é autenticada;
- não possui restrição explícita de role.

### Task 1.2 — Mapear página atual

Ler:

- `src/pages/PrivacyCenter.tsx`

Identificar:

- estados de exportação;
- confirmação de exportação;
- refresh de solicitações;
- componentes de privacidade usados;
- pontos do layout legado.

### Task 1.3 — Mapear serviços LGPD

Ler:

- `src/service/lgpd.service.ts`
- `src/config/api-routes.ts`

Confirmar uso de:

- `createLgpdRequest()`;
- `listLgpdRequests()`;
- `exportMyData()`;
- `LGPD_PATHS.MY_EXPORT`;
- `LGPD_PATHS.REQUESTS`;
- `LGPD_PATHS.PROCESSING_CATALOG`.

---

## 2. Arquitetura da nova UI

### Task 2.1 — Definir componentes

Criar ou organizar componentes em:

```text
src/components/privacy-center/
```

Sugestão:

- `PrivacyDesktop.tsx`
- `PrivacyMobile.tsx`
- `PrivacyHero.tsx`
- `PrivacyMetricStrip.tsx`
- `PrivacyActionCard.tsx`
- `PrivacyGovernancePanel.tsx`
- `PrivacyRecentRequests.tsx`
- `PrivacyMobileActionList.tsx`
- `PrivacyStickyActionBar.tsx`

### Task 2.2 — Separar lógica de dados e apresentação

Manter no `PrivacyCenter`:

- estados de exportação;
- modal de confirmação;
- handler `handleExportDataConfirmed`;
- refresh de solicitações;
- user role;
- manifest de exportação.

Mover para componentes:

- composição visual;
- cards;
- métricas;
- painéis;
- lista resumida;
- CTAs.

---

## 3. Implementação desktop

### Task 3.1 — Hero desktop

Implementar hero com:

- título: `Controle seus dados pessoais e direitos LGPD`;
- subtítulo sobre consentimento biométrico, exportação, solicitações, histórico, revogação, catálogo e DPO;
- métricas visuais: `12 direitos`, `3 solicitações`, `1 consentimento`, `JSON exportação`.

### Task 3.2 — Painel do titular

Criar cards principais:

- Consentimento biométrico;
- Exportar meus dados;
- Nova solicitação LGPD;
- Histórico de termos.

Cada card deve ter:

- título;
- descrição;
- cor semântica;
- botão `Abrir` ou ação equivalente.

### Task 3.3 — Solicitações recentes

Exibir resumo de solicitações com:

- tipo;
- descrição;
- status textual;
- cor por status.

Usar dados reais quando disponíveis via `LgpdRequestsList` ou uma nova abstração baseada em `listLgpdRequests()`.

### Task 3.4 — Governança lateral

Criar painel com:

- Catálogo de tratamento;
- Revogação de consentimentos;
- Política de privacidade;
- Contato DPO;
- botões `Exportar JSON` e `Criar solicitação`.

---

## 4. Implementação mobile

### Task 4.1 — Topo mobile

Implementar topo compacto com:

- marca Kronos;
- título `Privacidade`;
- role atual;
- subtítulo `LGPD`.

### Task 4.2 — Métricas mobile

Exibir:

- `12 direitos`;
- `3 pedidos`;
- `JSON exportar`.

### Task 4.3 — Cards mobile

Criar cards verticais:

- Consentimento biométrico;
- Exportar meus dados;
- Solicitação LGPD;
- Histórico de termos;
- DPO e política.

### Task 4.4 — Rodapé fixo

Criar barra inferior com:

- texto `Próxima ação`;
- botão `Exportar`;
- botão `Solicitar direito`.

O botão `Exportar` deve abrir confirmação antes de baixar JSON.

---

## 5. Preservação funcional

### Task 5.1 — Exportação

Preservar:

- `ExportConfirmationModal`;
- `exportMyData()`;
- download de JSON;
- `ExportManifestDisplay`.

### Task 5.2 — Solicitações LGPD

Preservar:

- criação de solicitações;
- listagem/refresh;
- status textual.

### Task 5.3 — Consentimento e histórico

Preservar:

- `BiometricConsentCard` ou fluxo equivalente;
- `ConsentHistoryCard`;
- `RevocationInfoCard`;
- termos e histórico.

### Task 5.4 — Governança

Preservar:

- catálogo de tratamento;
- política de privacidade;
- contato DPO.

---

## 6. Remoção de legado

### Task 6.1 — Remover layout antigo

Após a nova UI estar funcional:

- remover blocos antigos empilhados de `PrivacyCenter.tsx`;
- remover imports não usados;
- remover estados sem uso;
- remover CSS/classes específicas antigas se não forem usadas.

### Task 6.2 — Não remover componentes compartilhados

Antes de apagar componentes, procurar usos:

```bash
grep -R "BiometricConsentCard\|LgpdRequestForm\|LgpdRequestsList\|ConsentHistoryCard\|RevocationInfoCard\|DPOContactCard\|PrivacyPolicyCard\|DataProcessingCatalogCard" -n src
```

---

## 7. Validação

### Task 7.1 — Build e lint

```bash
npm run lint
npm run build
```

### Task 7.2 — Validação manual

Testar:

- desktop 1440px;
- tablet intermediário;
- mobile 430px;
- exportação com confirmação;
- criação de solicitação;
- histórico de consentimentos;
- abertura de catálogo/política/DPO;
- ausência de overflow horizontal.

### Task 7.3 — Resultado final

Reportar:

- arquivos alterados;
- componentes criados;
- testes executados;
- limitações encontradas;
- confirmação de que legado visual foi removido.
