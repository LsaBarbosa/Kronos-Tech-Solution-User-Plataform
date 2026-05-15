import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  compact?: boolean
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({
    icon,
    title = "Erro ao carregar dados",
    message,
    onRetry,
    retryLabel = "Tentar novamente",
    compact = false,
    className,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8" : "py-16",
        className
      )}
      role="alert"
      {...props}
    >
      <div className={cn(
        "flex items-center justify-center rounded-full text-destructive bg-destructive/10 mb-4",
        compact ? "w-12 h-12" : "w-16 h-16"
      )}>
        {icon || <AlertCircle className={compact ? "h-6 w-6" : "h-8 w-8"} />}
      </div>

      <h3 className={cn(
        "font-semibold text-destructive mb-1",
        compact ? "text-base" : "text-lg"
      )}>
        {title}
      </h3>

      <p className={cn(
        "text-muted-foreground mb-4 max-w-sm",
        compact ? "text-sm" : "text-base"
      )}>
        {message}
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size={compact ? "sm" : "default"}
          className="mt-2"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  )
)
ErrorState.displayName = "ErrorState"

export { ErrorState }
export type { ErrorStateProps }
