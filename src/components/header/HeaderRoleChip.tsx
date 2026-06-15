import { cn } from "@/lib/utils";
import { getRoleChip } from "./header.helpers";

interface HeaderRoleChipProps {
  role: string | null | undefined;
  size?: "sm" | "xs";
  className?: string;
}

const HeaderRoleChip = ({ role, size = "sm", className }: HeaderRoleChipProps) => {
  const copy = getRoleChip(role);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]",
        copy.bgClass,
        copy.borderClass,
        copy.textClass,
        className
      )}
    >
      {copy.label}
    </span>
  );
};

export default HeaderRoleChip;
