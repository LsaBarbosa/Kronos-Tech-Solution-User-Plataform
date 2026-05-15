import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusPillVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-800",
        inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-300 dark:border-gray-800",
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800",
        error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-800",
        warning: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-800",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300 dark:border-blue-800",
        success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800",
      },
    },
    defaultVariants: {
      variant: "inactive",
    },
  }
)

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusPillVariants> {
  icon?: React.ReactNode
}

const StatusPill = React.forwardRef<HTMLDivElement, StatusPillProps>(
  ({ className, variant, icon, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(statusPillVariants({ variant }), className)}
      role="status"
      aria-label={`Status: ${variant}`}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  )
)
StatusPill.displayName = "StatusPill"

export { StatusPill, statusPillVariants }
