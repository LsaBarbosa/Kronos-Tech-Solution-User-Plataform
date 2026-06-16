# Plano de ação — Refatoração `/lgpd/admin/requests/:requestId`

## Fase 0 — Preparação

### Task 0.1 — Confirmar ambiente
- Entrar no front-end `Kronos-Tech-Solution-User-Plataform`.
- Confirmar branch:
  ```bash
  git branch --show-current
  ```
- Esperado: `feature/lgpd-compliance-new-ui`.
- Registrar `git status --short`.

### Task 0.2 — Confirmar repositórios auxiliares
- Back-end: `Kronos-Tech-Solutions-KTS`, branch `PROD_HOSTINGER_V2`.
- Documentação: `kronos-business`, branch `main`.

## Fase 1 — Leitura obrigatória

### Task 1.1 — Ler diretriz visual
Ler:

```text
references/docs/kronos_lgpd_admin_request_details_diretriz_visual.md
```

Extrair:
- objetivo;
- conceito visual;
- dados principais;
- fluxo de tratamento;
- ações administrativas;
- regras mobile/desktop;
- estados obrigatórios.

### Task 1.2 — Ler documentação de negócio
Ler no `kronos-business`:

```text
04-mapa-modulos-telas.md
```

Confirmar:
- rota `/lgpd/admin/requests/:requestId`;
- componente `AdminLgpdRequestDetails`;
- roles `CTO` e `MANAGER`;
- services principais.

### Task 1.3 — Ler implementação atual
Ler:

```text
src/App.tsx
src/config/app-routes.ts
src/components/privacy/AdminLgpdRequestDetails.tsx
src/service/lgpd.service.ts
src/constants/lgpd.constants.ts
src/types/legal.ts
```

## Fase 2 — Mapeamento funcional

### Task 2.1 — Mapear ações atuais
Mapear e preservar:

- carregar detalhes;
- carregar resultado de anonimização;
- aprovar exportação;
- exportar dados revisados;
- concluir solicitação;
- rejeitar solicitação;
- solicitar complemento;
- cancelar solicitação;
- avançar análise manualmente;
- abrir fluxo de anonimização.

### Task 2.2 — Mapear validações
Preservar validações de:

- `approvalJustification`;
- `approvalScope`;
- `rejectionReason`;
- `rejectionPublicNote`;
- `complementMessage`;
- `cancelReason`;
- `completionPublicNotes`;
- `exportLegalBasis`;
- `exportOperationalReason`;
- `exportReviewerNotes`.

## Fase 3 — Arquitetura da nova UI

### Task 3.1 — Criar estrutura de feature
Preferencial:

```text
src/features/lgpd-admin-request-details/
├── AdminLgpdRequestDetailsPage.tsx
├── components/
├── hooks/
├── utils/
└── __tests__/
```

Se o projeto já usa outro padrão, adaptar.

### Task 3.2 — Criar responsive mode
Criar hook baseado em `matchMedia("(min-width: 1024px)")`.

- `desktop`: sala de controle.
- `mobile`: fluxo guiado por cartões.

### Task 3.3 — Criar helpers de domínio
Extrair helpers para:

- status label;
- status tone;
- type label;
- exportable request;
- workflow steps;
- primary action;
- SLA label quando disponível;
- sensitive data indicator.

## Fase 4 — Implementação desktop

### Task 4.1 — Hero LGPD Case Control Room
Criar topo com:
- badge “Detalhes da Solicitação”;
- título institucional;
- cards compactos:
  - status;
  - SLA ou atualização;
  - tipo;
  - exportável/anonimização.

### Task 4.2 — Coluna principal
Criar:
- card do caso;
- titular, empresa, e-mail/cargo quando disponível;
- tipo/status/SLA;
- fluxo horizontal;
- descrição pública;
- notas de resolução;
- histórico de mudanças;
- resultado de anonimização.

### Task 4.3 — Painel lateral
Criar:
- próxima ação sugerida;
- ações primárias;
- ações secundárias;
- ações avançadas recolhidas ou visualmente secundárias;
- alertas de dados sensíveis e exigência de justificativa.

## Fase 5 — Implementação mobile

### Task 5.1 — Topo compacto
Criar:
- título “Detalhe LGPD”;
- role atual;
- subtítulo com ID.

### Task 5.2 — Cards de fluxo
Criar:
- resumo do titular;
- status/SLA;
- fluxo compacto numerado;
- descrição curta;
- ações disponíveis.

### Task 5.3 — Barra inferior fixa
Criar CTA inferior:
- próxima decisão;
- badges de status/risco;
- botão voltar;
- botão executar ação.

Mobile não deve renderizar tabela.

## Fase 6 — Diálogos e ações sensíveis

### Task 6.1 — Preservar dialogs atuais ou refatorá-los
Garantir:
- aprovação de exportação exige justificativa e escopo;
- exportação exige fundamento, motivo e notas;
- rejeição exige motivo e nota pública;
- complemento exige mensagem;
- cancelamento exige motivo;
- conclusão exige nota pública.

### Task 6.2 — ObjectURL
Garantir que toda exportação JSON use:

```ts
URL.revokeObjectURL(url)
```

## Fase 7 — Remoção do legado

### Task 7.1 — Limpar componente antigo
- Remover JSX antigo baseado em cards genéricos/tabela.
- Remover imports mortos.
- Remover helpers duplicados.

### Task 7.2 — Preservar export
A rota atual deve continuar importando `AdminLgpdRequestDetails`.

Se criar page nova, manter:

```ts
export { AdminLgpdRequestDetailsPage as AdminLgpdRequestDetails }
```

ou adaptar o import no `App.tsx` sem quebrar rota.

## Fase 8 — Testes

### Task 8.1 — Testes de helpers
Criar testes para:
- `isExportableType`;
- `getPrimaryAction`;
- `getWorkflowSteps`;
- labels/status tones;
- regra CTO para cancelamento.

### Task 8.2 — Testes de render básico
Quando viável, testar:
- loading;
- erro;
- render de caso;
- ações visíveis por status.

## Fase 9 — Validação

Executar:

```bash
npm run lint
npx tsc --noEmit
npm run build
npx vitest run
```

Corrigir regressões geradas pela refatoração.

## Fase 10 — Relatório técnico

Registrar no final:
- arquivos alterados;
- decisões tomadas;
- validações executadas;
- pendências se houver.
