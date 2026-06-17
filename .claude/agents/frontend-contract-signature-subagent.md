---
name: frontend-contract-signature-subagent
description: Implementa as telas, serviços e tipos front-end da assinatura eletrônica de contratos no Kronos.
tools: Read, Grep, Glob, Bash, Edit, MultiEdit, Write, TodoWrite
---

# Subagent — Frontend Contract Signature

## Missão

Criar a experiência de usuário para:

1. `MANAGER` enviar contrato PDF e atribuir a colaboradores.
2. Colaborador visualizar contratos pendentes.
3. Colaborador assinar contrato com confirmação e senha.
4. Contrato assinado deixar de aparecer como pendente.

## Branch

```bash
git checkout PROD_HOSTINGER_v2
```

## Arquivos de referência obrigatórios

Leia antes de editar:

```text
package.json
src/config/api-routes.ts
src/config/app-routes.ts
src/App.tsx

src/pages/AssinaturaPonto.tsx
src/features/timesheet-signature/useTimesheetSignatureViewModel.ts
src/service/timesheetSignature.service.ts
src/types/timesheet-signature.ts
src/components/timesheet-signature/SignaturePendingBlockers.tsx
src/components/timesheet-signature/SignatureDeclarationBox.tsx
src/components/timesheet-signature/SignatureStatusCard.tsx

src/pages/EnviarDocumentos.tsx
src/pages/DocumentoColaborador.tsx
src/service/document.service.ts
src/service/employee.service.ts
src/components/PageShell.tsx
src/hooks/use-toast.ts
src/service/helpers/service-error.helper.ts
```

## Rotas front-end sugeridas

Adicionar em `APP_PATHS`:

```ts
assinaturaContrato: "/assinatura-contrato",
enviarContrato: "/contratos/enviar",
contratosAdmin: "/contratos/admin",
```

Adicionar em `APP_ROUTE_META`:

```ts
assinaturaContrato: defineRoute(APP_PATHS.assinaturaContrato, "Assinatura de Contratos", {
  breadcrumbs: [
    { label: "Início", path: APP_PATHS.dashboard },
    { label: "Assinatura de Contratos", path: APP_PATHS.assinaturaContrato },
  ],
}),

enviarContrato: defineRoute(APP_PATHS.enviarContrato, "Enviar Contrato", {
  allowedRoles: ["MANAGER"],
  showInMenu: false,
  breadcrumbs: [
    { label: "Início", path: APP_PATHS.dashboard },
    { label: "Contratos", path: APP_PATHS.contratosAdmin },
    { label: "Enviar Contrato", path: APP_PATHS.enviarContrato },
  ],
}),
```

Adicionar lazy imports em `App.tsx`:

```ts
const AssinaturaContrato = lazy(() => import("./pages/AssinaturaContrato"));
const EnviarContrato = lazy(() => import("./pages/EnviarContrato"));
const ContratosAdmin = lazy(() => import("./pages/ContratosAdmin"));
```

Adicionar rotas:

```tsx
<Route path={APP_PATHS.assinaturaContrato} element={<AssinaturaContrato />} />
{renderProtectedRoleRoute({ routeKey: "enviarContrato", element: <EnviarContrato /> })}
{renderProtectedRoleRoute({ routeKey: "contratosAdmin", element: <ContratosAdmin /> })}
```

## API routes

Adicionar em `src/config/api-routes.ts`:

```ts
export const API_ROUTES = {
  ...
  SERVICE_CONTRACTS: "service-contracts",
} as const;

export const SERVICE_CONTRACT_PATHS = {
  ADMIN: "admin",
  ADMIN_DETAIL: (contractId: string) => `admin/${contractId}`,
  ME_PENDING: "me/pending",
  PREVIEW: (contractId: string) => `${contractId}/preview`,
  SIGN: (contractId: string) => `${contractId}/sign`,
  SIGNATURE_DOCUMENT: (signatureId: string) => `signatures/${signatureId}/document`,
  ADMIN_SIGNATURES: "admin/signatures",
} as const;
```

## Tipos

Criar:

```text
src/types/service-contract-signature.ts
```

Tipos sugeridos:

```ts
export type ServiceContractPendingStatus = "PENDING" | "SIGNED";

export interface PendingServiceContract {
  contractId: string;
  assignmentId: string;
  title: string;
  description: string | null;
  originalFileName: string;
  createdAt: string;
  documentHashSha256: string;
  declarationVersion: string;
  declarationText: string;
  declarationHashSha256: string;
}

export interface PendingServiceContractList {
  items: PendingServiceContract[];
}

export interface SignServiceContractRequest {
  confirmed: boolean;
  declarationVersion: string;
  declarationHashSha256: string;
  contractDocumentHashSha256: string;
  password: string;
}

export interface SignServiceContractResponse {
  signatureId: string;
  contractId: string;
  assignmentId: string;
  signedAt: string;
  signatureType: string;
  signatureMethod: string;
  signedPdfHashSha256: string;
  contractDocumentHashSha256: string;
  signedDocumentId: string | null;
  declarationVersion: string;
}
```

## Service HTTP

Criar:

```text
src/service/serviceContractSignature.service.ts
```

Métodos:

```ts
getPendingContracts(): Promise<PendingServiceContractList>
fetchContractPreviewPdf(contractId: string): Promise<{ blob: Blob }>
sign(contractId: string, request: SignServiceContractRequest): Promise<SignServiceContractResponse>
downloadSignedDocument(signatureId: string): Promise<{ blob: Blob; fileName: string }>
createContract(formData: FormData): Promise<void>
listAdmin(...)
listAdminSignatures(...)
```

Padrões:

- Usar `api` de `src/config/api`.
- Reaproveitar parse de `content-disposition` do serviço de ponto/documentos.
- Usar `responseType: "blob"` para PDFs.

## ViewModel da assinatura

Criar:

```text
src/features/service-contract-signature/useServiceContractSignatureViewModel.ts
```

Comportamentos obrigatórios:

- carregar pendências no mount;
- manter `selectedContract`;
- exigir preview antes de assinatura;
- exigir checkbox de confirmação;
- exigir senha;
- enviar:
  - `confirmed`;
  - `declarationVersion`;
  - `declarationHashSha256`;
  - `contractDocumentHashSha256`;
  - `password`;
- limpar senha após tentativa;
- ao assinar com sucesso, recarregar pendências;
- contrato assinado deve sumir da lista;
- tratar erros `BAD_REQUEST`, `FORBIDDEN`, `CONFLICT`.

## Páginas

### `src/pages/AssinaturaContrato.tsx`

Estrutura sugerida:

1. Título: `Assinatura de Contratos`.
2. Lista de contratos pendentes.
3. Estado vazio: `Você não possui contratos pendentes de assinatura.`
4. Ao selecionar contrato:
   - card com título, descrição, arquivo, data;
   - botão `Abrir contrato`;
   - declaração versionada;
   - checkbox `Li e concordo`;
   - senha atual;
   - botão `Assinar contrato`.
5. Após assinatura:
   - toast de sucesso;
   - remoção da lista;
   - opção de baixar comprovante assinado se retorno trouxer `signatureId`.

### `src/pages/EnviarContrato.tsx`

Acesso: `MANAGER`.

Campos:

- título;
- descrição opcional;
- arquivo PDF;
- seleção múltipla de colaboradores ativos;
- botão enviar.

Validações no front:

- arquivo obrigatório;
- extensão `.pdf`;
- `type === application/pdf`, quando disponível;
- pelo menos um colaborador selecionado;
- título obrigatório.

A validação definitiva fica no back-end.

### `src/pages/ContratosAdmin.tsx`

Acesso: `MANAGER`.

Exibir:

- contratos enviados;
- total de atribuídos;
- total de assinados;
- total pendente;
- filtro por colaborador/status;
- botão `Enviar contrato`.

## Componentes sugeridos

Criar pacote:

```text
src/components/service-contract-signature
```

Componentes:

```text
ContractPendingList.tsx
ContractDeclarationBox.tsx
ContractStatusCard.tsx
ContractUploadForm.tsx
ContractEmployeeMultiSelect.tsx
ContractSignatureHistoryTable.tsx
```

Pode reaproveitar padrão visual dos componentes de `timesheet-signature`.

## Critérios de aceite front-end

- Build passa:
  ```bash
  npm run build
  ```
- Testes passam:
  ```bash
  npm run test
  ```
- Tela de colaborador não mostra contrato assinado.
- Tela de manager não permite envio sem PDF e sem colaborador.
- A senha é limpa após sucesso ou erro.
- PDF abre em nova aba antes da assinatura.
- Erros do back-end são normalizados pelo helper atual.
