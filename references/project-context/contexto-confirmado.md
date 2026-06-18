# Contexto confirmado — Dashboard Today `/records/me/today`

## Repositórios

- Back-end: `Kronos-Tech-Solutions-KTS`, branch `prod-redis`.
- Front-end: `Kronos-Tech-Solution-User-Plataform`, branch `feature/lgpd-compliance-new-ui`.
- Documentação: `kronos-business`, branch `main`.

## Contrato confirmado no back-end

`TimeRecordController` expõe:

```java
@PreAuthorize(ANY_EMPLOYEE)
@GetMapping(ME_TODAY)
public ResponseEntity<TodayTimeRecordStatusResponse> getTodayStatus() {
    return ResponseEntity.ok(useCase.getTodayStatus());
}
```

`ApiPaths` define:

```java
public static final String RECORDS = "/records";
public static final String ME_TODAY = "/me/today";
public static final String ME_RECENT = "/me/recent";
public static final String ME_REQUESTS = "/me/requests";
```

DTO principal:

```java
public record TodayTimeRecordStatusResponse(
    LocalDate date,
    String status,
    String nextAction,
    OffsetDateTime lastRecordAt,
    String lastRecordType,
    List<TodayTimeRecordItemResponse> records,
    String source,
    String timezone
) {}
```

DTO dos registros:

```java
public record TodayTimeRecordItemResponse(
    Long id,
    String actionType,
    OffsetDateTime recordedAt,
    String status,
    String source
) {}
```

## Estado atual no front-end

A rota `/dashboard` está em `src/pages/Dashboard.tsx` e já usa:

- `PageShell`;
- `DashboardDesktop`;
- `DashboardMobile`;
- `useDashboardResponsiveMode`;
- `useDashboardData`;
- contagens de férias e abonos;
- `CheckinDashboardCard` nas versões desktop e mobile.

A implementação deve enriquecer/substituir a área de ponto/check-in, preservando as demais áreas da dashboard.

## Princípio principal

A dashboard deve responder:

> Como está meu ponto hoje e qual é a próxima ação correta?

Não inventar campos além do DTO confirmado. Não criar novo fluxo de check-in.
