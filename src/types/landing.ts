export type LandingModuleColor = "blue" | "cyan" | "green" | "amber" | "purple";

export type LandingModuleBackDetail = {
  label: string;
  value: string;
};

export type LandingModuleStat = {
  value: string;
  label: string;
};

export type LandingModule = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: LandingModuleColor;
  features: string[];
  backTitle: string;
  backDescription: string;
  backDetails: LandingModuleBackDetail[];
  backStats: LandingModuleStat[];
  highlight?: boolean;
};

export type LandingFeature = {
  title: string;
  description: string;
  icon: string;
};

export type LandingSection = {
  id: string;
  label: string;
};
