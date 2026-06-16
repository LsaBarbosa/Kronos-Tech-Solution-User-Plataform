import { MessageSquarePlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FormInput, TextareaInput } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CreateAvisoViewModel } from "./useCreateAvisoViewModel";

interface CreateAvisoFormCardProps {
  viewModel: CreateAvisoViewModel;
  variant: "desktop" | "mobile";
}

export const CreateAvisoFormCard = ({ viewModel, variant }: CreateAvisoFormCardProps) => {
  const {
    formState,
    setTitle,
    setTipo,
    setMensagem,
    tipoLabel,
    tipoTone,
    messageLength,
    isMessageTooLong,
  } = viewModel;
  const { title, tipo, mensagem } = formState;
  const isCompact = variant === "mobile";

  return (
    <Card className="border border-[#D8E2EC] bg-white shadow-[0_10px_30px_rgba(16,42,67,0.08)]">
      <CardHeader className={cn("space-y-2", isCompact ? "p-4" : "p-6")}>
        <CardTitle className="flex items-center gap-2 text-lg text-[#102A43] sm:text-xl">
          <MessageSquarePlus className="h-5 w-5 text-[#1F4E5F]" />
          Conteúdo do aviso
        </CardTitle>
        <CardDescription className="text-sm text-[#627D98]">
          Defina o título, a prioridade e a mensagem que será exibida no painel de avisos.
        </CardDescription>
      </CardHeader>

      <CardContent className={cn("space-y-5", isCompact ? "p-4 pt-0" : "p-6 pt-0")}>
        <FormInput
          id="title"
          label="Título do aviso"
          placeholder="Ex.: Mudança no horário de verão"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          hint="Recomendado um título curto e direto."
          className="rounded-2xl border-[#D8E2EC] bg-white text-[#102A43]"
        />

        <div className="space-y-2">
          <Label htmlFor="tipo" className="text-sm font-semibold text-[#102A43]">
            Prioridade do aviso
          </Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger
              id="tipo"
              className="h-12 w-full rounded-2xl border-[#D8E2EC] bg-white text-left text-[#102A43]"
            >
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                  <span>Informativo</span>
                </div>
              </SelectItem>
              <SelectItem value="alert">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                  <span>Alerta</span>
                </div>
              </SelectItem>
              <SelectItem value="critical">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                  <span>Crítico</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {tipo ? (
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                tipoTone.badge
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", tipoTone.dot)} />
              Prioridade selecionada: {tipoLabel}
            </div>
          ) : null}
        </div>

        <TextareaInput
          id="mensagem"
          label="Mensagem do aviso"
          placeholder="Digite aqui a mensagem detalhada do aviso..."
          value={mensagem}
          onChange={(event) => setMensagem(event.target.value)}
          className="min-h-[180px] resize-none rounded-2xl border-[#D8E2EC] bg-white text-[#102A43]"
          helperText={
            <div className="flex items-center justify-between text-[#627D98]">
              <span>{messageLength} caracteres</span>
              {isMessageTooLong ? (
                <span className="text-[#B91C1C]">
                  Mensagem muito longa (recomendado até 500 caracteres)
                </span>
              ) : null}
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};

export default CreateAvisoFormCard;
