export type LandingModule = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: "blue" | "cyan" | "green" | "amber";
  features: string[];
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
