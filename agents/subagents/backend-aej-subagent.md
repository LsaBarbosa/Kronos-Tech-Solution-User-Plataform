# Subagent — Backend AEJ

## Missão

Auditar e corrigir o fluxo back-end de geração do AEJ em `Kronos-Tech-Solutions-KTS`.

## Arquivos obrigatórios

```text
src/main/java/com/kts/kronos/adapter/in/web/http/LegalController.java
src/main/java/com/kts/kronos/application/port/in/usecase/AejUseCase.java
src/main/java/com/kts/kronos/application/service/AejService.java
src/main/java/com/kts/kronos/application/service/LegalExportRangeGuard.java
src/main/java/com/kts/kronos/application/port/out/provider/TimeRecordProvider.java
src/main/java/com/kts/kronos/adapter/out/persistence/impl/TimeRecordProviderImpl.java
src/main/java/com/kts/kronos/adapter/out/persistence/TimeRecordRepository.java
src/main/java/com/kts/kronos/domain/model/TimeRecord.java
src/main/java/com/kts/kronos/domain/model/Employee.java
src/main/java/com/kts/kronos/domain/model/Company.java
src/main/java/com/kts/kronos/domain/model/enuns/StatusRecord.java
```

## Checks

1. Confirmar endpoint `GET /legal/aej`.
2. Confirmar `@PreAuthorize("hasAnyRole('MANAGER', 'CTO')")`.
3. Confirmar parsing ISO de `startDate` e `endDate`.
4. Confirmar origem do `companyId` pelo usuário logado.
5. Confirmar geração em lote por colaboradores do tenant.
6. Confirmar tratamento de período inválido.
7. Confirmar tratamento de empresa não encontrada.
8. Confirmar se ausências sem `startWork` podem entrar no AEJ.
9. Confirmar se o controller compromete headers antes de erro.

## Implementações esperadas se necessário

- Gerar AEJ em `ByteArrayOutputStream` antes de escrever no `HttpServletResponse`.
- Lançar exceções de negócio controladas para dados inválidos.
- Melhorar logs de geração sem CPF, sem PIS e sem dados pessoais.
- Não remover assinatura digital obrigatória.
