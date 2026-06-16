# Contexto confirmado para o Codex

## Rota e tela

- Rota alvo: `/relatorio-detalhado`.
- Página atual: `src/pages/RelatorioDetalhado.tsx`.
- A página usa `PageShell`, `DetailedReportDesktop`, `DetailedReportMobile`, `useDetailedReportBuilder` e `useReportResponsiveMode`.

## Hook atual

Arquivo principal atual:

```text
src/hooks/useDetailedReportBuilder.ts
```

O hook concentra hoje:

- filtros do relatório;
- busca do relatório;
- edição de registro;
- exportação PDF;
- exportação CSV.

A refatoração deve extrair a exportação para módulos próprios, mantendo o hook como orquestrador.

## Service atual

Arquivo:

```text
src/service/records.service.ts
```

Contrato atual:

```text
POST /records/report?employeeId=<uuid opcional>
```

Payload atual:

```ts
{
  reference: string; // HH:mm
  active: boolean;
  dates: string[];
  statuses?: string[];
}
```

O backend recebe `employeeId` como query param opcional.

## Campos realmente disponíveis em DetailedReportItem

Conforme `src/utils/report-utils.tsx`, os dados disponíveis por registro são:

```ts
{
  documentId?: string | null;
  documentDownloadUrl?: string | null;
  documentDownloadPath?: string | null;
  id?: string;
  timeRecordId?: number;
  startWork: string;
  startHour: string;
  endWork: string;
  endHour: string;
  hoursWork: string;
  balance: string;
  statusRecord: string;
  edited: boolean;
  active: boolean;
  employeeId: string;
  employeeData: {
    employeeName: string;
    companyName: string;
  };
  latitude?: number;
  longitude?: number;
  endLatitude?: number;
  endLongitude?: number;
}
```

## Campos que não devem ser inventados

Não inserir valores falsos no PDF/CSV para:

- CNPJ;
- CPF de colaborador selecionado por gestor;
- cargo do colaborador selecionado por gestor;
- salário;
- gestor aprovador;
- política de banco de horas;
- convenção coletiva;
- assinatura real;
- geolocalização precisa quando não exibida explicitamente.

Se o dado não estiver disponível, usar uma destas abordagens:

1. omitir o campo; ou
2. exibir `Não disponível no relatório atual`; ou
3. exibir somente para o próprio usuário quando vier de `useAuth().user.profile` e o `employeeId` do relatório for o mesmo do usuário autenticado.
