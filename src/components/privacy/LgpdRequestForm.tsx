import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import { createLgpdRequest } from "@/service/lgpd.service";
import { getServiceErrorMessage } from "@/service/helpers/service-error.helper";
import { LGPD_REQUEST_TYPE_LABELS, LGPD_REQUEST_TYPES } from "@/constants/lgpd.constants";

interface LgpdRequestFormProps {
  onSuccess: () => void;
}

const LgpdRequestForm = ({ onSuccess }: LgpdRequestFormProps) => {
  const [requestType, setRequestType] = useState<LgpdRequestType | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const descriptionLength = description.length;
  const maxLength = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestType || !description.trim()) {
      toast.error("Por favor, preenchidos todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createLgpdRequest({
        type: requestType as LgpdRequestType,
        description: description.trim(),
      });

      toast.success("Solicitação LGPD criada com sucesso!");
      setRequestType("");
      setDescription("");
      onSuccess();
    } catch (error) {
      toast.error(
        getServiceErrorMessage(
          error,
          "Erro ao criar solicitação LGPD. Tente novamente."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Solicitação LGPD</CardTitle>
        <CardDescription>
          Submeta uma solicitação relacionada aos seus direitos sob a LGPD
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <label className="text-sm font-medium" htmlFor="request-type">
              Tipo de Solicitação <span className="text-red-500">*</span>
            </label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger id="request-type">
                <SelectValue placeholder="Selecione o tipo de solicitação" />
              </SelectTrigger>
              <SelectContent>
                {LGPD_REQUEST_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {LGPD_REQUEST_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>

          <FieldGroup>
            <label className="text-sm font-medium" htmlFor="description">
              Descrição <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              placeholder="Descreva sua solicitação em detalhes..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, maxLength))}
              disabled={isSubmitting}
              className="resize-none"
              rows={5}
            />
            <div className="text-xs text-muted-foreground text-right">
              {descriptionLength}/{maxLength} caracteres
            </div>
          </FieldGroup>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !requestType || !description.trim()}
          >
            {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LgpdRequestForm;
