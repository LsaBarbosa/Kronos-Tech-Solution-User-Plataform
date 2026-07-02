import { Button } from "@/components/ui/button";
import { type UserCreationType, USER_TYPE_OPTIONS } from "../types/create-user.types";

interface UserTypeSelectorProps {
  selectedType: UserCreationType;
  onTypeChange: (type: UserCreationType) => void;
  disabled?: boolean;
}

export const UserTypeSelector = ({ selectedType, onTypeChange, disabled = false }: UserTypeSelectorProps) => (
  <div className="flex gap-3">
    {USER_TYPE_OPTIONS.map((option) => (
      <Button
        key={option.value}
        type="button"
        variant={selectedType === option.value ? "default" : "outline"}
        className="flex-1"
        onClick={() => onTypeChange(option.value)}
        disabled={disabled}
      >
        {option.label}
      </Button>
    ))}
  </div>
);
