import * as React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  compact?: boolean
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, compact = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8" : "py-16",
        className
      )}
      {...props}
    >
      {icon && (
        <div className={cn(
          "flex items-center justify-center rounded-full text-muted-foreground mb-4",
          compact ? "w-12 h-12" : "w-16 h-16"
        )}>
          {icon}
        </div>
      )}

      <h3 className={cn(
        "font-semibold text-foreground mb-1",
        compact ? "text-base" : "text-lg"
      )}>
        {title}
      </h3>

      {description && (
        <p className={cn(
          "text-muted-foreground mb-4",
          compact ? "text-sm" : "text-base"
        )}>
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  )
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
export type { EmptyStateProps }
