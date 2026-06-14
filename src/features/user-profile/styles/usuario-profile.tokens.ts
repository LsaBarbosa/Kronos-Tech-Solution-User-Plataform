export const usuarioProfileTokens = {
  colors: {
    deepBlue: "#102A43",
    petrolBlue: "#1F4E5F",
    techCyan: "#22B8CF",
    trustTeal: "#1C8C7C",
    lightBackground: "#F5F8FB",
    surface: "#FFFFFF",
    coldBorder: "#D8E2EC",
    secondaryText: "#627D98",
    risk: "#D64545",
    lgpdTraceability: "#635BFF",
  },
  radii: {
    shell: "28px",
    card: "24px",
    panel: "22px",
    mobileSheet: "24px",
  },
  shadows: {
    soft: "0 18px 50px rgba(16, 42, 67, 0.08)",
    card: "0 12px 30px rgba(31, 78, 95, 0.08)",
    elevated: "0 22px 60px rgba(16, 42, 67, 0.14)",
  },
  gradients: {
    hero: "linear-gradient(135deg, #102A43 0%, #1F4E5F 52%, #1C8C7C 100%)",
    veil: "linear-gradient(180deg, rgba(245, 248, 251, 0.72) 0%, rgba(245, 248, 251, 0.96) 100%)",
    accent: "linear-gradient(135deg, rgba(34, 184, 207, 0.18) 0%, rgba(28, 140, 124, 0.16) 100%)",
  },
} as const;

export type UsuarioProfileTone = "active" | "inactive" | "pending" | "success" | "warning" | "info" | "error";

export const usuarioProfileToneClasses: Record<UsuarioProfileTone, string> = {
  active: "bg-emerald-50 text-emerald-800 border-emerald-200",
  inactive: "bg-slate-100 text-slate-700 border-slate-200",
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  success: "bg-teal-50 text-teal-800 border-teal-200",
  warning: "bg-orange-50 text-orange-800 border-orange-200",
  info: "bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20",
  error: "bg-red-50 text-red-800 border-red-200",
};

