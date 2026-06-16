---
name: frontend-signature-subagent
summary: Implementa UI React/Vite para assinatura do espelho de ponto do mês anterior.
tools: Read, Grep, Glob, Bash, Edit, MultiEdit, Write
---

# Subagent — Frontend Signature

## Objetivo

Criar experiência para o colaborador assinar o espelho de ponto do mês anterior.

## Arquivos que deve ler primeiro

```text
package.json
src/App.tsx
src/config/app-routes.ts
src/pages/EspelhoPonto.tsx
src/pages/RelatorioDetalhado.tsx
src/pages/PrivacyCenter.tsx
src/context/AuthContext.tsx
src/components/ProtectedRoute.tsx
src/components/RoleRoute.tsx
src/lib/**/*
src/services/**/*
src/hooks/**/*
```

Se algum arquivo não existir, localizar equivalentes com `rg "espelho-ponto|records|axios|csrf|api" src`.

## UX obrigatória

A tela deve mostrar:

- mês anterior elegível;
- status: não assinado, assinado, bloqueado por pendências, divergência posterior;
- resumo do período;
- botão para visualizar/baixar espelho;
- texto da declaração;
- checkbox de confirmação;
- campo de senha para reautenticação;
- hash do documento após assinatura;
- data/hora da assinatura após sucesso.

## Fluxo de UI

1. Ao carregar, chamar `GET /records/timesheet-signatures/previous-month/status`.
2. Se `eligible = false`, exibir motivo.
3. Se houver bloqueios, listar bloqueios de forma clara.
4. Se não assinado e elegível, permitir preview.
5. Para assinar, exigir:
   - checkbox marcado;
   - senha preenchida;
   - hash do espelho retornado pelo preview/status, se backend exigir.
6. Enviar `POST /records/timesheet-signatures/previous-month/sign`.
7. Invalidar queries e atualizar estado.
8. Mostrar comprovante.

## Arquivos sugeridos

```text
src/pages/AssinaturaPonto.tsx
src/services/timesheetSignatureService.ts
src/types/timesheet-signature.ts
src/components/timesheet-signature/SignatureStatusCard.tsx
src/components/timesheet-signature/SignatureDeclarationBox.tsx
src/components/timesheet-signature/SignaturePendingBlockers.tsx
```

Atualizar:

```text
src/App.tsx
src/config/app-routes.ts
```

## Contratos TypeScript sugeridos

```ts
export type TimesheetSignatureStatus =
  | "NOT_SIGNED"
  | "SIGNED_VALID"
  | "SIGNED_WITH_CURRENT_DIVERGENCE"
  | "BLOCKED_BY_PENDING_ISSUES"
  | "NOT_ELIGIBLE";

export interface PreviousMonthSignatureStatusResponse {
  referenceYear: number;
  referenceMonth: number;
  periodStart: string;
  periodEnd: string;
  status: TimesheetSignatureStatus;
  eligible: boolean;
  alreadySigned: boolean;
  signatureId?: string;
  signedAt?: string;
  pointMirrorHashSha256?: string;
  recordsSnapshotHashSha256?: string;
  blockers: string[];
}

export interface SignPreviousMonthTimesheetRequest {
  confirmed: boolean;
  declarationVersion: string;
  declarationHashSha256: string;
  pointMirrorHashSha256?: string;
  password: string;
}
```

## Segurança frontend

- Não salvar senha em estado global, localStorage ou sessionStorage.
- Limpar senha após resposta.
- Usar cliente Axios existente para CSRF/cookie.
- Não exibir CPF completo.
- Não permitir informar `employeeId` manualmente na tela de assinatura própria.

## Testes mínimos

- renderiza estado pendente;
- bloqueia submit sem confirmação;
- bloqueia submit sem senha;
- exibe bloqueios retornados pelo backend;
- chama serviço de assinatura com payload correto;
- exibe sucesso com hash e data.
