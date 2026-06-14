# Subagent — api-contract

## Objetivo

Garantir que a refatoração visual não quebre o contrato do back-end.

## Verificações

1. Confirmar rota de front:
   - `/solicitar-abono`
   - `RequestManualRegistration`

2. Confirmar endpoint:
   - `POST /records/time-off/request`

3. Confirmar formato:
   - `multipart/form-data`
   - `request`: Blob JSON `application/json`
   - `document`: `File` opcional

4. Confirmar DTO:
   - `startDate`
   - `endDate`
   - `startHour`
   - `endHour`
   - `managerId`
   - `type`

5. Confirmar enum:
   - `TIME_OFF_REQUEST`
   - `FORGOTTEN_REGISTRATION`

## Proibições

- Não enviar `requestType` diretamente se o back-end espera `type`.
- Não trocar `document` por outro nome de part.
- Não remover normalização de data.
- Não remover validação de horário.
- Não tornar anexo obrigatório.
