# SPEC Frontend — Exportação LGPD vinculada a solicitação

## Objetivo

Adaptar o frontend ao novo fluxo seguro de exportação LGPD.

## Backend esperado

1. Exportação própria:
   GET /lgpd/me/export

2. Exportação administrativa:
   POST /lgpd/admin/requests/{requestId}/export

Body:
{
  "includePreciseGeolocation": false,
  "legalBasis": "...",
  "operationalReason": "...",
  "reviewerNotes": "..."
}

## Alterações obrigatórias

### 1. src/config/api-routes.ts

Adicionar:

LGPD_PATHS.MY_EXPORT = "me/export"

LGPD_PATHS.ADMIN_REQUEST_EXPORT = (requestId: string) =>
  `admin/requests/${requestId}/export`

### 2. src/service/lgpd.service.ts

Criar:

exportMyData()

Deve chamar:
GET /lgpd/me/export

Criar:

exportApprovedLgpdRequestData(requestId, payload)

Payload:
- includePreciseGeolocation: boolean
- legalBasis: string
- operationalReason: string
- reviewerNotes: string

Deve chamar:
POST /lgpd/admin/requests/{requestId}/export

Não usar employeeId para exportação administrativa.

### 3. src/pages/PrivacyCenter.tsx

Trocar:

exportEmployeeData(user.profile.employeeId)

Por:

exportMyData()

Regras:
- não enviar employeeId
- não permitir includePreciseGeolocation
- informar que a exportação própria é minimizada

### 4. src/components/privacy/AdminLgpdRequestDetails.tsx

Adicionar botão:

"Exportar dados revisados"

Exibir somente quando:
- request.status == APPROVED_FOR_EXPORT
- requestType em:
  ACCESS
  PORTABILITY
  SHARING_INFORMATION
  CONFIRM_PROCESSING

Criar modal administrativo exigindo:
- legalBasis
- operationalReason
- reviewerNotes
- confirmação explícita de revisão de escopo
- includePreciseGeolocation false por padrão

Ao confirmar:
- chamar exportApprovedLgpdRequestData(requestId, payload)
- baixar JSON
- exibir sucesso/manifest se já existir componente reutilizável

### 5. Tipos

Atualizar LgpdRequestStatus para incluir:

APPROVED_FOR_EXPORT

Atualizar labels e cores.

### 6. Testes obrigatórios

- exportMyData chama /lgpd/me/export
- PrivacyCenter não envia employeeId
- exportApprovedLgpdRequestData chama /lgpd/admin/requests/{requestId}/export
- botão administrativo só aparece em APPROVED_FOR_EXPORT
- modal bloqueia envio sem legalBasis
- modal bloqueia envio sem operationalReason
- modal bloqueia envio sem reviewerNotes
- includePreciseGeolocation inicia false

## Critério final

O frontend não deve mais usar employeeId para exportação própria nem administrativa nova.
