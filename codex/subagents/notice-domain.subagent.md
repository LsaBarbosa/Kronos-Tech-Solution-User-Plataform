# Subagent — Notice Domain

## Objetivo

Modelar o domínio de avisos para a nova UI sem alterar contrato HTTP.

## Verificar

- `MessagePriority = NORMAL | ALERT | CRITICAL`
- `Message`
- `MessagePayload`
- `getMessagePriorityTitle`
- `getRecipientIndicatorText`
- permissões por `userRole`
- paginação atual

## Implementar ou sugerir

- `getNoticePriorityMeta(priority)`
- `getNoticeScopeLabel(message)`
- `calculateNoticeMetrics(messages)`
- `filterNotices(messages, query, priority)`
- `getNoticePermissionCopy(role)`
- `canManageNotices(role)`

## Regras

- Não inventar campo inexistente.
- `senderName` pode ser usado se existir no payload retornado.
- Não mostrar `recipientEmployeeId` bruto.
