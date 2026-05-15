import * as React from "react"
import { cn } from "@/lib/utils"
import { MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface TableAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: "default" | "destructive" | "secondary"
  disabled?: boolean
  separator?: boolean
}

interface TableActionsProps {
  actions: TableAction[]
  inline?: boolean
  maxInlineActions?: number
  className?: string
}

const TableActions = React.forwardRef<HTMLDivElement, TableActionsProps>(
  ({ actions, inline = false, maxInlineActions = 2, className }, ref) => {
    const visibleActions = actions.slice(0, maxInlineActions)
    const moreActions = actions.slice(maxInlineActions)

    if (inline && actions.length <= maxInlineActions) {
      return (
        <div ref={ref} className={cn("flex items-center gap-2", className)}>
          {actions.map((action, idx) => (
            <React.Fragment key={idx}>
              {action.separator && <div className="w-px h-4 bg-border" />}
              <Button
                size="sm"
                variant={action.variant === "destructive" ? "destructive" : "ghost"}
                onClick={action.onClick}
                disabled={action.disabled}
                title={action.label}
              >
                {action.icon || action.label}
              </Button>
            </React.Fragment>
          ))}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)}>
        {/* Inline actions */}
        {visibleActions.map((action, idx) => (
          <Button
            key={idx}
            size="sm"
            variant="ghost"
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.label}
          >
            {action.icon || action.label}
          </Button>
        ))}

        {/* Dropdown for more actions */}
        {moreActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {moreActions.map((action, idx) => (
                <React.Fragment key={idx}>
                  {action.separator && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={action.variant === "destructive" ? "text-destructive" : ""}
                  >
                    {action.icon && (
                      <span className="mr-2 h-4 w-4 flex items-center">
                        {action.icon}
                      </span>
                    )}
                    {action.label}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }
)
TableActions.displayName = "TableActions"

export { TableActions }
export type { TableActionsProps, TableAction }
