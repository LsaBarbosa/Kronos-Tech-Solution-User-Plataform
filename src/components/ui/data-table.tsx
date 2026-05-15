import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface DataTableColumn<T> {
  key: keyof T | string
  header: string | React.ReactNode
  render?: (value: T[keyof T], row: T) => React.ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  isLoading?: boolean
  isEmpty?: boolean
  isError?: boolean
  emptyMessage?: string
  errorMessage?: string
  rowKey: keyof T | string
  onRowClick?: (row: T) => void
  className?: string
  rowClassName?: string
  striped?: boolean
  hover?: boolean
  bordered?: boolean
  pagination?: {
    pageSize: number
    currentPage: number
    totalItems: number
    onPageChange: (page: number) => void
  }
  renderActions?: (row: T) => React.ReactNode
  actionsClassName?: string
}

const DataTable = React.forwardRef<HTMLTableElement, DataTableProps<Record<string, unknown>>>(
  ({
    columns,
    data,
    isLoading = false,
    isEmpty = false,
    isError = false,
    emptyMessage = "Nenhum dado disponível",
    errorMessage = "Erro ao carregar dados",
    rowKey,
    onRowClick,
    className,
    rowClassName,
    striped = true,
    hover = true,
    bordered = true,
    pagination,
    renderActions,
    actionsClassName,
  }, ref) => {
    const getRowKey = (row: Record<string, unknown>) => {
      return typeof rowKey === "string" ? row[rowKey] : rowKey
    }

    const paginatedData = pagination
      ? data.slice(
          (pagination.currentPage - 1) * pagination.pageSize,
          pagination.currentPage * pagination.pageSize
        )
      : data

    const totalPages = pagination
      ? Math.ceil(pagination.totalItems / pagination.pageSize)
      : 1

    return (
      <div className={cn("w-full", className)}>
        {/* Table */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table
            ref={ref}
            className={cn(
              "w-full text-sm",
              bordered && "border-collapse"
            )}
          >
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {columns.map((column, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      "text-left px-4 py-3 font-semibold text-foreground",
                      bordered && "border-r border-border last:border-r-0",
                      column.headerClassName
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && (
                        <span className="text-xs text-muted-foreground">↕</span>
                      )}
                    </div>
                  </th>
                ))}
                {renderActions && (
                  <th className={cn(
                    "text-center px-4 py-3 font-semibold text-foreground",
                    bordered && "border-l border-border",
                    actionsClassName
                  )}>
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + (renderActions ? 1 : 0)}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Carregando dados...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={columns.length + (renderActions ? 1 : 0)}
                    className="px-4 py-8 text-center text-destructive"
                  >
                    <div className="flex items-center justify-center">
                      <span>{errorMessage}</span>
                    </div>
                  </td>
                </tr>
              ) : isEmpty || paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (renderActions ? 1 : 0)}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIdx) => (
                  <tr
                    key={getRowKey(row)}
                    className={cn(
                      "border-b border-border last:border-b-0 transition-colors",
                      striped && rowIdx % 2 === 1 && "bg-muted/30",
                      hover && "hover:bg-muted/50 cursor-pointer",
                      onRowClick && "cursor-pointer",
                      rowClassName
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column, colIdx) => {
                      const value = typeof column.key === "string"
                        ? row[column.key]
                        : column.key

                      return (
                        <td
                          key={colIdx}
                          className={cn(
                            "px-4 py-3 text-foreground",
                            bordered && "border-r border-border last:border-r-0",
                            column.className
                          )}
                        >
                          {column.render
                            ? column.render(value, row)
                            : String(value ?? "—")}
                        </td>
                      )
                    })}
                    {renderActions && (
                      <td
                        className={cn(
                          "px-4 py-3 text-center",
                          bordered && "border-l border-border",
                          actionsClassName
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderActions(row)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-4">
            <div className="text-sm text-muted-foreground">
              Página {pagination.currentPage} de {totalPages} (
              {pagination.totalItems} itens)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  pagination.onPageChange(pagination.currentPage - 1)
                }
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page indicators */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                  let pageNum: number

                  if (totalPages <= 5) {
                    pageNum = idx + 1
                  } else if (pagination.currentPage <= 3) {
                    pageNum = idx + 1
                  } else if (pagination.currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx
                  } else {
                    pageNum = pagination.currentPage - 2 + idx
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => pagination.onPageChange(pageNum)}
                      className={cn(
                        "px-3 py-1 rounded-md border transition-colors",
                        pageNum === pagination.currentPage
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() =>
                  pagination.onPageChange(pagination.currentPage + 1)
                }
                disabled={pagination.currentPage === totalPages}
                className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
)
DataTable.displayName = "DataTable"

export { DataTable }
export type { DataTableProps, DataTableColumn }
