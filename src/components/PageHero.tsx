import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_PATHS } from "@/config/app-routes";

interface PageHeroProps {
  badge: string;
  title: string;
  description: string;
  chips?: string[];
  primaryAction?: ReactNode;
  icon?: ReactNode;
}

const PageHero = ({ badge, title, description, chips, primaryAction, icon }: PageHeroProps) => {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#D8E2EC] bg-gradient-to-br from-[#102A43] via-[#1F4E5F] to-[#102A43] p-5 text-white shadow-[0_18px_50px_rgba(16,42,67,0.22)] sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-3">
          <Badge className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            {badge}
          </Badge>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl xl:text-4xl">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-white/85 sm:text-base sm:leading-7">
              {description}
            </p>
          </div>
          {chips && chips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <Badge
                  key={chip}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white"
                >
                  {chip}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-stretch gap-3 xl:w-[220px]">
          {primaryAction}
          <Button
            asChild
            variant="outline"
            className="h-11 w-full rounded-2xl border-white/20 bg-white/10 px-4 text-white hover:bg-white/15 hover:text-white"
          >
            <Link to={APP_PATHS.dashboard}>
              <ChevronLeft className="h-4 w-4" />
              Voltar ao dashboard
            </Link>
          </Button>
          {icon ? (
            <div className="hidden rounded-2xl border border-white/20 bg-white/10 p-4 xl:block">
              {icon}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
