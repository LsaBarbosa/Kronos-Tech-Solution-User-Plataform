# Rules — Correção do fluxo AEJ

## Regras obrigatórias

1. Não remover autenticação de `/legal/aej`.
2. Não permitir `PARTNER` gerar AEJ.
3. Não retornar token JWT no body.
4. Não desabilitar assinatura digital para produção.
5. Não logar CPF, PIS, token, senha, conteúdo do certificado ou senha do certificado.
6. Não mascarar `401` como erro genérico.
7. Não redirecionar para login em erro `500` de certificado/generation.
8. Não alterar layout AEJ sem teste e sem documentação.
9. Não usar certificado fake em produção.
10. Não alterar regras LGPD/consentimento sem necessidade.

## Regras de erro

| Situação | Status recomendado | Código recomendado |
|---|---:|---|
| Sem autenticação | `401` | `AUTHENTICATION_REQUIRED` |
| Sessão revogada | `401` | `SESSION_REVOKED` |
| Sem permissão | `403` | `ACCESS_DENIED` |
| Período inválido | `400` | `BAD_REQUEST` |
| Certificado indisponível | `503` ou `500` controlado | `DIGITAL_SIGNATURE_UNAVAILABLE` |
| Dados inconsistentes para AEJ | `422` ou `400` | `AEJ_INVALID_DATA` |

## Regras de observabilidade

Logs devem conter:

```text
event=legal_aej_generation
result=success|failure
reason=authentication|authorization|digital_signature|generation|invalid_data
company_id=<uuid>
period_start=<yyyy-MM-dd>
period_end=<yyyy-MM-dd>
correlation_id=<id>
```

Não incluir:

```text
CPF
PIS
senha
JWT
conteúdo do arquivo AEJ
senha do certificado
path completo se for sensível
```
