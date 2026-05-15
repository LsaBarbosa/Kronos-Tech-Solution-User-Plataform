# DataTable & List Components Guide

Standardized table and list components for displaying tabular data with pagination, filtering, and row actions.

## Components Overview

### DataTable
Full-featured table with columns, rows, pagination, states (loading, empty, error).

### TableActions
Flexible action buttons for table rows with dropdown menu for additional actions.

### EmptyState
Display message when no data is available with optional icon and action button.

### ErrorState
Display error message with optional retry button and icon.

## Basic Usage

### Simple DataTable

```tsx
import { DataTable } from "@/components/ui"

const columns = [
  { key: "name", header: "Nome" },
  { key: "email", header: "Email" },
  { key: "status", header: "Status" },
]

const data = [
  { id: 1, name: "John", email: "john@example.com", status: "Ativo" },
  { id: 2, name: "Jane", email: "jane@example.com", status: "Inativo" },
]

<DataTable
  columns={columns}
  data={data}
  rowKey="id"
/>
```

### DataTable with Custom Rendering

```tsx
import { DataTable, Badge } from "@/components/ui"

const columns = [
  { key: "name", header: "Nome" },
  {
    key: "status",
    header: "Status",
    render: (value, row) => (
      <Badge variant={value === "Ativo" ? "default" : "secondary"}>
        {value}
      </Badge>
    ),
  },
  {
    key: "joinDate",
    header: "Data de Cadastro",
    render: (value) => new Date(value).toLocaleDateString("pt-BR"),
  },
]

<DataTable columns={columns} data={data} rowKey="id" />
```

### DataTable with Row Actions

```tsx
import { DataTable, TableActions } from "@/components/ui"
import { Edit, Trash2 } from "lucide-react"

const columns = [
  { key: "name", header: "Nome" },
  { key: "email", header: "Email" },
]

<DataTable
  columns={columns}
  data={data}
  rowKey="id"
  renderActions={(row) => (
    <TableActions
      actions={[
        {
          label: "Editar",
          icon: <Edit className="h-4 w-4" />,
          onClick: () => handleEdit(row),
        },
        {
          label: "Deletar",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => handleDelete(row),
          variant: "destructive",
          separator: true,
        },
      ]}
      inline={true}
    />
  )}
/>
```

### DataTable with Pagination

```tsx
import { useState } from "react"
import { DataTable } from "@/components/ui"

const [currentPage, setCurrentPage] = useState(1)
const pageSize = 10

<DataTable
  columns={columns}
  data={allData}
  rowKey="id"
  pagination={{
    pageSize,
    currentPage,
    totalItems: allData.length,
    onPageChange: setCurrentPage,
  }}
/>
```

### DataTable with Loading State

```tsx
<DataTable
  columns={columns}
  data={data}
  rowKey="id"
  isLoading={isLoading}
/>
```

### DataTable with Error State

```tsx
<DataTable
  columns={columns}
  data={data}
  rowKey="id"
  isError={true}
  errorMessage="Falha ao carregar dados"
/>
```

### DataTable with Empty State

```tsx
<DataTable
  columns={columns}
  data={data}
  rowKey="id"
  isEmpty={data.length === 0}
  emptyMessage="Nenhum resultado encontrado"
/>
```

## TableActions Examples

### Simple Inline Actions

```tsx
import { TableActions } from "@/components/ui"
import { Edit, Copy } from "lucide-react"

<TableActions
  actions={[
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => handleEdit(),
    },
    {
      label: "Copiar",
      icon: <Copy className="h-4 w-4" />,
      onClick: () => handleCopy(),
    },
  ]}
  inline={true}
/>
```

### Actions with Dropdown

```tsx
<TableActions
  actions={[
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: () => handleEdit(),
    },
    {
      label: "Exportar",
      icon: <Download className="h-4 w-4" />,
      onClick: () => handleExport(),
    },
    {
      label: "Deletar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => handleDelete(),
      variant: "destructive",
      separator: true,
    },
  ]}
  maxInlineActions={2}
/>
```

## EmptyState Examples

### Basic Empty State

```tsx
import { EmptyState } from "@/components/ui"
import { Inbox } from "lucide-react"

<EmptyState
  icon={<Inbox className="h-8 w-8" />}
  title="Nenhum item"
  description="Você ainda não tem nenhum item. Comece criando um novo."
/>
```

### Empty State with Action

```tsx
<EmptyState
  icon={<Inbox className="h-8 w-8" />}
  title="Nenhum item"
  description="Você ainda não tem nenhum item. Comece criando um novo."
  action={<Button onClick={() => navigate("/create")}>Criar Novo</Button>}
/>
```

### Compact Empty State

```tsx
<EmptyState
  title="Sem dados"
  description="Nenhum resultado encontrado"
  compact={true}
/>
```

## ErrorState Examples

### Basic Error State

```tsx
import { ErrorState } from "@/components/ui"

<ErrorState
  message="Não foi possível carregar os dados. Tente novamente mais tarde."
/>
```

### Error State with Retry

```tsx
<ErrorState
  title="Erro ao carregar"
  message="Falha ao conectar com o servidor"
  onRetry={() => handleRetry()}
  retryLabel="Tentar Novamente"
/>
```

## Advanced DataTable Usage

### Complete Example with All Features

```tsx
import { useState } from "react"
import { DataTable, TableActions } from "@/components/ui"
import { Edit, Trash2 } from "lucide-react"

const MyTable = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState([...])

  const columns = [
    { key: "name", header: "Nome" },
    { key: "email", header: "Email" },
    {
      key: "status",
      header: "Status",
      render: (value) => <Badge>{value}</Badge>,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey="id"
      isLoading={isLoading}
      isError={isError}
      errorMessage="Falha ao carregar dados"
      emptyMessage="Nenhum resultado encontrado"
      pagination={{
        pageSize: 10,
        currentPage,
        totalItems: data.length,
        onPageChange: setCurrentPage,
      }}
      striped={true}
      hover={true}
      bordered={true}
      renderActions={(row) => (
        <TableActions
          actions={[
            {
              label: "Editar",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => handleEdit(row),
            },
            {
              label: "Deletar",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => handleDelete(row),
              variant: "destructive",
              separator: true,
            },
          ]}
          inline={true}
        />
      )}
    />
  )
}
```

## DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | DataTableColumn[] | required | Column definitions |
| data | T[] | required | Table data rows |
| rowKey | keyof T | required | Unique key for each row |
| isLoading | boolean | false | Show loading state |
| isEmpty | boolean | false | Show empty state |
| isError | boolean | false | Show error state |
| emptyMessage | string | "Nenhum dado disponível" | Empty state text |
| errorMessage | string | "Erro ao carregar dados" | Error state text |
| onRowClick | (row: T) => void | - | Row click handler |
| striped | boolean | true | Alternate row colors |
| hover | boolean | true | Hover effect on rows |
| bordered | boolean | true | Show borders |
| pagination | PaginationConfig | - | Enable pagination |
| renderActions | (row: T) => ReactNode | - | Actions column renderer |

## DataTableColumn Props

| Prop | Type | Description |
|------|------|-------------|
| key | keyof T \| string | Column data key |
| header | string \| ReactNode | Column header text/element |
| render | (value, row) => ReactNode | Custom cell renderer |
| className | string | Cell className |
| headerClassName | string | Header className |
| sortable | boolean | Show sort indicator |

## TableActions Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| actions | TableAction[] | required | Array of action buttons |
| inline | boolean | false | Show all actions inline |
| maxInlineActions | number | 2 | Max inline before dropdown |

## Accessibility

- **DataTable**: Proper table semantics, ARIA labels for pagination
- **TableActions**: Keyboard navigable, clear action labels
- **EmptyState**: Semantic heading hierarchy
- **ErrorState**: role="alert" for error announcements

## Dark Mode

All components fully support dark mode with automatic color adjustment.

## Payload Preservation

These components are presentation-only and do not modify data:
- Data flow is unidirectional (props → component)
- No automatic mutations
- Row click handlers receive row data unchanged
- Actions receive row data unchanged
