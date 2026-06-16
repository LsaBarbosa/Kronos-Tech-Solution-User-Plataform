# Subagent — Testes e revisão

## Missão

Garantir cobertura automatizada para o fluxo AEJ, sessão, autorização e certificado.

## Testes obrigatórios

### Back-end

```text
AejServiceTest
AejServiceFeature52RangeQueryTest
LegalControllerWebMvcTest
LegalControllerSecurityTest
DigitalSignatureServiceTest
```

Casos mínimos:

1. `MANAGER` autenticado gera AEJ com sucesso.
2. `CTO` autenticado gera AEJ com sucesso.
3. Sem autenticação retorna `401`.
4. `PARTNER` retorna `403`.
5. Período inválido retorna `400`.
6. Certificado ausente retorna código controlado.
7. Ausência com dados inválidos retorna erro controlado.
8. Falha de assinatura não deve ser confundida com sessão expirada.

### Front-end

Casos mínimos:

1. `FiscalService.downloadAej` chama `/legal/aej` com params corretos.
2. Erro `401` aciona sessão expirada.
3. Erro `403` mostra mensagem de permissão.
4. Erro de certificado em Blob é convertido para mensagem fiscal clara.
5. Sucesso baixa arquivo `.p7s`.

## Comandos

```bash
# backend
./gradlew clean test
./gradlew test --tests '*AejService*'
./gradlew test --tests '*LegalController*'

# frontend
npm run lint
npm run build
npm test -- --run
```
