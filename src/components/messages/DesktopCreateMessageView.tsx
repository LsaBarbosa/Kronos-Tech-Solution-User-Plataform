import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { useCreateAvisoForm } from "@/hooks/useCreateAvisoForm";
import { MessagePriorityBadge } from "./MessagePriorityBadge";
import { MessageScopeBadge } from "./MessageScopeBadge";

interface DesktopCreateMessageViewProps {
  form: ReturnType<typeof useCreateAvisoForm>;
}

const PRIORITIES = ["NORMAL", "ALERT", "CRITICAL"] as const;

export const DesktopCreateMessageView = ({ form }: DesktopCreateMessageViewProps) => {
  const { formState } = form;

  const handleSubmit = async () => {
    if (form.isCto) {
      const confirmed = window.confirm(
        "Este aviso sera entregue para todos os usuarios ativos da plataforma. Deseja continuar?"
      );
      if (!confirmed) {
        return;
      }
    }

    await form.submit();
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 xl:grid-cols-[minmax(0,1.2fr)_400px]">
      <div className="space-y-6">
        <Card className="border-[#D9E2EC] bg-white">
          <CardHeader>
            <CardTitle className="text-2xl text-[#102A43]">Criar aviso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo</Label>
              <Input
                id="title"
                value={formState.title}
                onChange={(event) => form.setTitle(event.target.value)}
                placeholder="Ex.: Janela de manutencao do sistema"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageText">Mensagem</Label>
              <Textarea
                id="messageText"
                className="min-h-[180px]"
                value={formState.mensagem}
                onChange={(event) => form.setMensagem(event.target.value)}
                placeholder="Descreva o aviso que sera exibido na plataforma."
              />
            </div>

            <div className="space-y-3">
              <Label>Prioridade</Label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((priority) => (
                  <Button
                    key={priority}
                    type="button"
                    variant={formState.tipo === priority.toLowerCase() ? "default" : "outline"}
                    onClick={() => form.setPriority(priority)}
                    className={formState.tipo === priority.toLowerCase() ? "bg-[#0F4C81]" : ""}
                  >
                    {priority}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {form.isCto ? (
          <Card className="border-[#9FB3C8] bg-[#F0F4F8]">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <MessageScopeBadge scope="GLOBAL" />
              </div>
              <p className="text-lg font-semibold text-[#102A43]">Envio global</p>
              <p className="text-sm leading-6 text-[#486581]">
                Este aviso sera entregue automaticamente para todos os usuarios ativos da plataforma.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {form.isManager ? (
          <Card className="border-[#D9E2EC] bg-white">
            <CardHeader>
              <CardTitle className="text-xl text-[#102A43]">Colaboradores ativos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeFilter">Filtrar por nome</Label>
                <Input
                  id="employeeFilter"
                  value={formState.filterTerm}
                  onChange={(event) => form.setFilterTerm(event.target.value)}
                  placeholder="Buscar colaborador"
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[#D9E2EC] bg-[#F8FAFC] px-4 py-3">
                <span className="text-sm text-[#334E68]">{form.selectedCount} selecionado(s)</span>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.isAllSelected} onCheckedChange={(checked) => form.handleSelectAll(Boolean(checked))} />
                  <span className="text-sm text-[#102A43]">Selecionar visiveis</span>
                </div>
              </div>
              <div className="max-h-[320px] space-y-2 overflow-y-auto">
                {form.filteredEmployees.map((employee) => (
                  <label
                    key={employee.employeeId}
                    className="flex items-center gap-3 rounded-2xl border border-[#D9E2EC] px-4 py-3 text-sm text-[#102A43]"
                  >
                    <Checkbox
                      checked={formState.selectedEmployeeIds.includes(employee.employeeId)}
                      onCheckedChange={() => form.handleToggleEmployee(employee.employeeId)}
                    />
                    <span>{employee.fullName}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="space-y-6">
        <Card className="border-[#D9E2EC] bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-[#102A43]">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <MessageScopeBadge scope={form.isCto ? "GLOBAL" : "DIRECT"} />
              {formState.tipo ? (
                <MessagePriorityBadge priority={formState.tipo.toUpperCase() as "NORMAL" | "ALERT" | "CRITICAL"} />
              ) : null}
            </div>
            <h2 className="text-2xl font-semibold text-[#102A43]">
              {formState.title.trim() || "Titulo do aviso"}
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#334E68]">
              {formState.mensagem.trim() || "A mensagem sera exibida aqui conforme voce preencher o conteudo."}
            </p>
            <div className="rounded-2xl border border-[#D9E2EC] bg-[#F8FAFC] px-4 py-3 text-sm text-[#486581]">
              {form.isCto
                ? "Audiencia: todos os usuarios ativos da plataforma."
                : `Audiencia: ${form.selectedCount} colaborador(es) selecionado(s).`}
            </div>
          </CardContent>
        </Card>

        {form.isPartner ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-5 text-sm text-red-700">
              Colaboradores nao podem criar avisos.
            </CardContent>
          </Card>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!form.canSubmit || form.isPosting}
            className="h-12 w-full bg-[#0F4C81] text-white hover:bg-[#0B3A61]"
          >
            {form.isPosting ? "Enviando..." : "Publicar aviso"}
          </Button>
        )}
      </div>
    </div>
  );
};
