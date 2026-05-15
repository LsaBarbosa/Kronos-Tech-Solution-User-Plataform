import * as React from "react"
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastMessageProps {
  variant?: "default" | "success" | "error" | "warning" | "info"
  title?: string
  message: string
  icon?: React.ReactNode
  action?: React.ReactNode
  onDismiss?: () => void
  autoClose?: boolean
  duration?: number
}

const ToastMessage = React.forwardRef<HTMLDivElement, ToastMessageProps>(
  ({
    variant = "default",
    title,
    message,
    icon,
    action,
    onDismiss,
    autoClose = true,
    duration = 5000,
  }, ref) => {
    React.useEffect(() => {
      if (autoClose && onDismiss) {
        const timer = setTimeout(onDismiss, duration)
        return () => clearTimeout(timer)
      }
    }, [autoClose, duration, onDismiss])

    const defaultIcon = React.useMemo(() => {
      if (icon !== undefined) return icon
      switch (variant) {
        case "success":
          return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        case "error":
          return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        case "warning":
          return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        case "info":
          return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        default:
          return null
      }
    }, [variant, icon])

    const variantStyles = {
      default: "border-border bg-background text-foreground",
      success: "border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100",
      error: "border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100",
      warning: "border-yellow-200 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100",
      info: "border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-top-2",
          variantStyles[variant]
        )}
        role="alert"
      >
        {defaultIcon && <div className="flex-shrink-0 mt-0.5">{defaultIcon}</div>}

        <div className="flex-1">
          {title && <div className="font-semibold text-sm">{title}</div>}
          <div className={cn("text-sm", title && "mt-1")}>{message}</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {action && <div>{action}</div>}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-foreground/50 hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)
ToastMessage.displayName = "ToastMessage"

export { ToastMessage }
export type { ToastMessageProps }
