# Contrato oficial do fluxo facial

Este documento define o contrato canônico para autenticação facial e registro de ponto facial no frontend.

## Serviço canônico

- **Arquivo oficial**: `src/service/faceOrchestration.service.ts`
- **Responsabilidade**:
  - executar login facial (`auth/login-face`)
  - executar check-in (`records/checkin`)
  - permitir retry de check-in sem recaptura da face
  - encerrar sessão curta quando aplicável (`auth/logout`)

## Contrato de retorno (`FaceFlowResult`)

Todas as operações públicas do serviço retornam uma união discriminada por `status`.

### 1) Sucesso

```ts
{ status: "success" }
```

Sem erros. No check-in, indica que login facial + registro de ponto concluíram com sucesso.

### 2) Falha de login facial

```ts
{ status: "face_login_failure", message: string }
```

O reconhecimento facial falhou e o fluxo não prossegue para check-in.

### 3) Falha parcial com retry

```ts
{
  status: "partial_checkin_failure",
  message: string,
  retryContext: FaceCheckinRetryContext
}
```

Login facial foi aceito, mas o registro de ponto falhou. O `retryContext` deve ser preservado para permitir nova tentativa sem nova captura de imagem.

## API pública esperada

- `executeFaceLoginFlow(faceImageBase64)`
- `executeFaceCheckinFlow({ faceImageBase64, location, requireShortSession? })`
- `retryFaceCheckinFlow(retryContext)`

> Observação: evitar aliases duplicados para o mesmo fluxo, para reduzir inconsistências de uso.
