/**
 * Dashboard Tone Colors
 * Centralized color palette for dashboard metric cards
 * Uses Tailwind arbitrary values for consistency
 */

export type DashboardTone = "purple" | "blue" | "cyan" | "success" | "warning" | "danger";

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
  purple: {
    icon: "bg-[#EDE9FE] dark:bg-[#3F3F46] text-[#7C3AED] dark:text-[#A78BFA]",
    accent: "from-[#7C3AED] to-[#A78BFA] dark:from-[#A78BFA] dark:to-[#8B5CF6]",
    text: "text-[#7C3AED] dark:text-[#A78BFA]",
    skeleton: {
      background: "bg-[#EDE9FE] dark:bg-[#3F3F46]",
      line: "bg-[#DDD6FE] dark:bg-[#5B47A8]",
    },
    emptyState: {
      border: "border-[#C4B5FD] dark:border-[#5B47A8]",
      background: "bg-[#F8FAFC] dark:bg-[#1F293B]",
      icon: "bg-[#EDE9FE] dark:bg-[#3F3F46] text-[#7C3AED] dark:text-[#A78BFA]",
      text: "text-[#7C3AED] dark:text-[#A78BFA]",
    },
  },
  blue: {
    icon: "bg-[#DBEAFE] dark:bg-[#1E3A5F] text-[#3B82F6] dark:text-[#60A5FA]",
    accent: "from-[#3B82F6] to-[#67E8F9] dark:from-[#60A5FA] dark:to-[#67E8F9]",
    text: "text-[#2563EB] dark:text-[#60A5FA]",
    skeleton: {
      background: "bg-[#DBEAFE] dark:bg-[#1E3A5F]",
      line: "bg-[#BFDBFE] dark:bg-[#1E40AF]",
    },
  },
  cyan: {
    icon: "bg-[#ECFEFF] dark:bg-[#1F3A4F] text-[#0891B2] dark:text-[#67E8F9]",
    accent: "from-[#06B6D4] to-[#67E8F9] dark:from-[#67E8F9] dark:to-[#06B6D4]",
    text: "text-[#0E7490] dark:text-[#67E8F9]",
    skeleton: {
      background: "bg-[#ECFEFF] dark:bg-[#1F3A4F]",
      line: "bg-[#CFFAFE] dark:bg-[#164E63]",
    },
  },
  success: {
    icon: "bg-[#D1FAE5] dark:bg-[#1F3A2F] text-[#10B981] dark:text-[#34D399]",
    accent: "from-[#10B981] to-[#67E8F9] dark:from-[#34D399] dark:to-[#67E8F9]",
    text: "text-[#047857] dark:text-[#34D399]",
    skeleton: {
      background: "bg-[#D1FAE5] dark:bg-[#1F3A2F]",
      line: "bg-[#A7F3D0] dark:bg-[#047857]",
    },
  },
  warning: {
    icon: "bg-[#FEF3C7] dark:bg-[#3F2F1F] text-[#D97706] dark:text-[#FBBF24]",
    accent: "from-[#F59E0B] to-[#FDE68A] dark:from-[#FBBF24] dark:to-[#F59E0B]",
    text: "text-[#B45309] dark:text-[#FBBF24]",
    skeleton: {
      background: "bg-[#FEF3C7] dark:bg-[#3F2F1F]",
      line: "bg-[#FCD34D] dark:bg-[#78350F]",
    },
    emptyState: {
      border: "border-[#FDE68A] dark:border-[#92400E]",
      background: "bg-[#FFFBEB] dark:bg-[#2F1F0F]",
      icon: "bg-[#FEF3C7] dark:bg-[#3F2F1F] text-[#D97706] dark:text-[#FBBF24]",
      text: "text-[#B45309] dark:text-[#FBBF24]",
    },
  },
  danger: {
    icon: "bg-[#FEE2E2] dark:bg-[#3F1F1F] text-[#EF4444] dark:text-[#F87171]",
    accent: "from-[#EF4444] to-[#F59E0B] dark:from-[#F87171] dark:to-[#FB923C]",
    text: "text-[#B91C1C] dark:text-[#F87171]",
    skeleton: {
      background: "bg-[#FEE2E2] dark:bg-[#3F1F1F]",
      line: "bg-[#FECACA] dark:bg-[#7F1D1D]",
    },
    emptyState: {
      border: "border-[#FECACA] dark:border-[#7F1D1D]",
      background: "bg-[#FEF2F2] dark:bg-[#2F1F1F]",
      icon: "bg-[#FEE2E2] dark:bg-[#3F1F1F] text-[#EF4444] dark:text-[#F87171]",
      text: "text-[#B91C1C] dark:text-[#F87171]",
    },
    errorState: {
      border: "border-[#FECACA] dark:border-[#7F1D1D]",
      background: "bg-[#FEF2F2] dark:bg-[#2F1F1F]",
      icon: "text-[#EF4444] dark:text-[#F87171]",
      title: "text-[#991B1B] dark:text-[#FECACA]",
      description: "text-[#7F1D1D] dark:text-[#FCA5A5]",
    },
  },
};

/**
 * Priority badge colors for warnings and alerts
 */
export const priorityBadgeColors = {
  critical: {
    className: "border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
    label: "Crítico",
  },
  high: {
    className: "border-[#FECACA] bg-[#FEE2E2] text-[#B91C1C]",
    label: "Crítico",
  },
  alert: {
    className: "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]",
    label: "Alerta",
  },
  warning: {
    className: "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]",
    label: "Alerta",
  },
  normal: {
    className: "border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]",
    label: "Normal",
  },
};

/**
 * Dashboard card common styles
 */
export const dashboardCardStyles = {
  base: "border-[#E5E7EB] dark:border-[#334155] bg-white/95 dark:bg-slate-800/80 shadow-[0_18px_48px_-28px_rgba(17,24,39,0.45)] dark:shadow-[0_18px_48px_-28px_rgba(0,0,0,0.6)]",
  interactive:
    "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C4B5FD] dark:hover:border-[#8B5CF6] hover:shadow-[0_22px_60px_-30px_rgba(124,58,237,0.45)] dark:hover:shadow-[0_22px_60px_-30px_rgba(139,92,246,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/30 dark:focus-visible:ring-[#A78BFA]/30 focus-visible:ring-offset-2",
};

/**
 * Section text colors
 */
export const sectionTextColors = {
  title: "text-[#111827] dark:text-[#F8FAFC]",
  description: "text-[#6B7280] dark:text-[#CBD5E1]",
};

/**
 * Skeleton loaders base colors
 */
export const skeletonColors = {
  base: "bg-[#E5E7EB] dark:bg-[#404854]",
  light: "bg-[#F3F4F6] dark:bg-[#404854]",
};
