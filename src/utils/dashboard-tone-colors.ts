/**
 * Dashboard Tone Colors
 * Centralized color palette for dashboard metric cards
 * Uses semantic tokens for brand consistency
 */

export type DashboardTone = "brand" | "blue" | "cyan" | "success" | "warning" | "danger";

interface ToneColorPalette {
  icon: string;
  accent: string;
  text: string;
  skeleton?: {
    background: string;
    line: string;
  };
  emptyState?: {
    border: string;
    background: string;
    icon: string;
    text: string;
  };
  errorState?: {
    border: string;
    background: string;
    icon: string;
    title: string;
    description: string;
  };
}

/**
 * Color definitions for all dashboard tones
 * Light mode uses standard Tailwind colors
 * Dark mode adjusts luminosity and saturation for readability
 */
export const dashboardToneColors: Record<DashboardTone, ToneColorPalette> = {
  brand: {
    icon: "bg-primary/10 text-primary",
    accent: "from-primary to-secondary",
    text: "text-primary",
    skeleton: {
      background: "bg-primary/10",
      line: "bg-primary/30",
    },
    emptyState: {
      border: "border-primary/30",
      background: "bg-background",
      icon: "bg-primary/10 text-primary",
      text: "text-primary",
    },
  },
  blue: {
    icon: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    accent: "from-blue-500 to-primary",
    text: "text-blue-700 dark:text-blue-300",
    skeleton: {
      background: "bg-blue-50 dark:bg-blue-950",
      line: "bg-blue-200 dark:bg-blue-900",
    },
  },
  cyan: {
    icon: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    accent: "from-cyan-500 to-blue-400",
    text: "text-cyan-700 dark:text-cyan-300",
    skeleton: {
      background: "bg-cyan-50 dark:bg-cyan-950",
      line: "bg-cyan-200 dark:bg-cyan-900",
    },
  },
  success: {
    icon: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    accent: "from-success to-green-400",
    text: "text-green-700 dark:text-green-300",
    skeleton: {
      background: "bg-green-50 dark:bg-green-950",
      line: "bg-green-200 dark:bg-green-900",
    },
  },
  warning: {
    icon: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    accent: "from-amber-500 to-amber-300",
    text: "text-amber-700 dark:text-amber-300",
    skeleton: {
      background: "bg-amber-50 dark:bg-amber-950",
      line: "bg-amber-200 dark:bg-amber-900",
    },
    emptyState: {
      border: "border-amber-200 dark:border-amber-800",
      background: "bg-amber-50 dark:bg-amber-950",
      icon: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
      text: "text-amber-700 dark:text-amber-300",
    },
  },
  danger: {
    icon: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    accent: "from-red-500 to-amber-500",
    text: "text-red-700 dark:text-red-300",
    skeleton: {
      background: "bg-red-50 dark:bg-red-950",
      line: "bg-red-200 dark:bg-red-900",
    },
    emptyState: {
      border: "border-red-200 dark:border-red-800",
      background: "bg-red-50 dark:bg-red-950",
      icon: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
      text: "text-red-700 dark:text-red-300",
    },
    errorState: {
      border: "border-red-200 dark:border-red-800",
      background: "bg-red-50 dark:bg-red-950",
      icon: "text-red-700 dark:text-red-300",
      title: "text-red-900 dark:text-red-100",
      description: "text-red-700 dark:text-red-200",
    },
  },
};

/**
 * Priority badge colors for warnings and alerts
 */
export const priorityBadgeColors = {
  critical: {
    className: "border-red-200 bg-red-50 text-red-700",
    label: "Crítico",
  },
  high: {
    className: "border-red-200 bg-red-50 text-red-700",
    label: "Crítico",
  },
  alert: {
    className: "border-amber-200 bg-amber-50 text-amber-700",
    label: "Alerta",
  },
  warning: {
    className: "border-amber-200 bg-amber-50 text-amber-700",
    label: "Alerta",
  },
  normal: {
    className: "border-blue-200 bg-blue-50 text-primary",
    label: "Normal",
  },
};

/**
 * Dashboard card common styles
 */
export const dashboardCardStyles = {
  base: "border-border bg-card shadow-sm",
  interactive:
    "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
};

/**
 * Section text colors
 */
export const sectionTextColors = {
  title: "text-foreground",
  description: "text-muted-foreground",
};

/**
 * Skeleton loaders base colors
 */
export const skeletonColors = {
  base: "bg-border",
  light: "bg-muted",
};
