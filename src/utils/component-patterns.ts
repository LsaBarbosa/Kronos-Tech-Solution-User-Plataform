/**
 * Component Patterns & Design System
 * Centralized definitions for reusable component patterns
 * Based on shadcn/ui with KRONOS customizations
 */

export const componentPatterns = {
  button: {
    variants: {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/30",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline:
        "border border-border bg-background text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/40 dark:hover:bg-primary/20",
      ghost: "text-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      link: "text-primary underline-offset-4 hover:underline",
    },
    sizes: {
      sm: "h-9 rounded-md px-3 text-sm",
      default: "h-10 px-4 py-2",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    },
    states: {
      disabled: "pointer-events-none opacity-50 cursor-not-allowed",
      loading: "pointer-events-none opacity-70",
    },
  },

  input: {
    base: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    variants: {
      default: "border-input",
      error: "border-destructive focus-visible:ring-destructive/30",
      success: "border-green-500 focus-visible:ring-green-500/30",
    },
    states: {
      disabled: "cursor-not-allowed opacity-50 bg-muted",
      readonly: "bg-muted",
    },
  },

  card: {
    base: "rounded-lg border bg-card text-card-foreground shadow-sm",
    variants: {
      default: "border-border",
      elevated: "border-border shadow-md hover:shadow-lg transition-shadow",
      outlined: "border-2 border-border",
      interactive: "cursor-pointer border-border hover:border-primary/40 hover:shadow-md transition-all",
    },
  },

  badge: {
    variants: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "border border-border text-foreground",
      success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    shapes: {
      pill: "rounded-full",
      rounded: "rounded-md",
      square: "rounded-none",
    },
  },

  statusPill: {
    variants: {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      warning: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
  },

  form: {
    label: "text-sm font-medium text-foreground",
    hint: "text-xs text-muted-foreground mt-1",
    error: "text-xs text-destructive mt-1 font-medium",
    required: "ml-1 text-destructive",
  },

  states: {
    disabled: "opacity-50 cursor-not-allowed pointer-events-none",
    loading: "opacity-70 cursor-wait",
    error: "border-destructive focus-visible:ring-destructive/30",
    success: "border-green-500 focus-visible:ring-green-500/30",
    focus: "outline-none ring-2 ring-ring ring-offset-2",
  },

  transitions: {
    fast: "transition-all duration-150",
    normal: "transition-all duration-200",
    slow: "transition-all duration-300",
  },

  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },

  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },

  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  },
};

/**
 * Common component patterns for quick reference
 */
export const commonPatterns = {
  // Button combinations
  primaryButton: `${componentPatterns.button.variants.primary} ${componentPatterns.button.sizes.default} ${componentPatterns.transitions.normal}`,
  secondaryButton: `${componentPatterns.button.variants.secondary} ${componentPatterns.button.sizes.default} ${componentPatterns.transitions.normal}`,
  ghostButton: `${componentPatterns.button.variants.ghost} ${componentPatterns.button.sizes.default} ${componentPatterns.transitions.normal}`,
  destructiveButton: `${componentPatterns.button.variants.destructive} ${componentPatterns.button.sizes.default} ${componentPatterns.transitions.normal}`,

  // Card combinations
  baseCard: `${componentPatterns.card.base} ${componentPatterns.card.variants.default}`,
  elevatedCard: `${componentPatterns.card.base} ${componentPatterns.card.variants.elevated}`,
  interactiveCard: `${componentPatterns.card.base} ${componentPatterns.card.variants.interactive}`,

  // Badge combinations
  successBadge: componentPatterns.badge.variants.success,
  warningBadge: componentPatterns.badge.variants.warning,
  errorBadge: componentPatterns.badge.variants.destructive,

  // Form field
  formField: "space-y-2",
  formGroup: "space-y-4",

  // Focus
  focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
};

/**
 * Tailwind class combinations for common use cases
 */
export const tailwindPatterns = {
  // Flex utilities
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexCol: "flex flex-col",
  flexRowGap: "flex items-center gap-2",
  flexColGap: "flex flex-col gap-2",

  // Grid utilities
  gridCols2: "grid grid-cols-2 gap-4",
  gridCols3: "grid grid-cols-3 gap-4",
  gridCols4: "grid grid-cols-4 gap-4",

  // Responsive
  container: "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  section: "py-4 sm:py-8 space-y-4",

  // Text utilities
  textMuted: "text-muted-foreground",
  textSmall: "text-xs sm:text-sm",
  textLarge: "text-lg sm:text-xl",
  textBold: "font-semibold",
};
