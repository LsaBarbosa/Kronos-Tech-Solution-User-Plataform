import { useIsMobile } from "@/hooks/use-mobile";
import { CustomDaysDesktop } from "./CustomDaysDesktop";
import { CustomDaysMobile } from "./CustomDaysMobile";

interface CustomDaysSelectorProps {
  value: string[];
  onChange: (days: string[]) => void;
}

export function CustomDaysSelector({ value, onChange }: CustomDaysSelectorProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <CustomDaysMobile value={value} onChange={onChange} />;
  }

  return <CustomDaysDesktop value={value} onChange={onChange} />;
}
