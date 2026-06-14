import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VacationPlanningGridProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}

const VacationPlanningGrid = ({ left, right, className }: VacationPlanningGridProps) => {
  return (
    <div className={cn("grid gap-6 lg:grid-cols-[minmax(0,1.6fr),minmax(360px,1fr)]", className)}>
      {left}
      {right}
    </div>
  );
};

export default VacationPlanningGrid;
