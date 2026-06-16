import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CreateAvisoViewModel } from "./useCreateAvisoViewModel";

interface CreateAvisoActionFooterProps {
  viewModel: CreateAvisoViewModel;
  variant: "desktop" | "mobile";
}

export const CreateAvisoActionFooter = ({
  viewModel,
  variant,
}: CreateAvisoActionFooterProps) => {
  const { handlePostar, isPosting, isFormValid } = viewModel;

  const isMobile = variant === "mobile";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_10px_30px_rgba(16,42,67,0.08)] sm:flex-row sm:items-center sm:justify-between",
        isMobile && "sticky bottom-4 z-20"
      )}
    >
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-[#102A43]">Pronto para postar?</p>
        <p className="text-xs text-[#627D98]">
          {isFormValid
            ? "O aviso será publicado imediatamente para os destinatários selecionados."
            : "Complete o título, a prioridade e a mensagem para habilitar o envio."}
        </p>
      </div>
      <Button
        onClick={() => void handlePostar()}
        disabled={!isFormValid || isPosting}
        className="h-11 w-full gap-2 rounded-2xl bg-[#102A43] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(16,42,67,0.18)] hover:bg-[#1F4E5F] sm:w-auto"
      >
        {isPosting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Postando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Postar aviso
          </>
        )}
      </Button>
    </div>
  );
};

export default CreateAvisoActionFooter;
