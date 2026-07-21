import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { useCreateAvisoForm } from "@/hooks/useCreateAvisoForm";
import { MessagePriorityBadge } from "./MessagePriorityBadge";
import { MessageScopeBadge } from "./MessageScopeBadge";

interface MobileCreateMessageWizardProps {
  form: ReturnType<typeof useCreateAvisoForm>;
}

const PRIORITIES = ["NORMAL", "ALERT", "CRITICAL"] as const;

export const MobileCreateMessageWizard = ({ form }: MobileCreateMessageWizardProps) => {
  const [step, setStep] = useState(0);
  const { formState } = form;

  const handleSend = async () => {
    await form.submit();
  };

  return (
    <div className="flex w-full flex-col gap-4 pb-28">
      <div className="flex gap-2">
        {["Conteudo", "Prioridade", "Audiencia"].map((label, index) => (
          <div
            key={label}
            className={`flex-1 rounded-full px-3 py-2 text-center text-xs font-semibold ${
              step === index ? "bg-[#0F4C81] text-white" : "bg-[#D9E2EC] text-[#486581]"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <Card className="border-[#D9E2EC] bg-white">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="mobile-title">Titulo</Label>
              <Input
                id="mobile-title"
                value={formState.title}
                onChange={(event) => form.setTitle(event.target.value)}
                placeholder="Informe o titulo do aviso"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile-message">Mensagem</Label>
              <Textarea
                id="mobile-message"
                className="min-h-[180px]"
                value={formState.mensagem}
                onChange={(event) => form.setMensagem(event.target.value)}
                placeholder="Escreva o conteudo do aviso"
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="border-[#D9E2EC] bg-white">
          <CardContent className="space-y-4 p-4">
            <Label>Prioridade</Label>
            <div className="grid gap-3">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => form.setPriority(priority)}
                  className={`rounded-2xl border px-4 py-4 text-left ${
                    formState.tipo === priority.toLowerCase()
                      ? "border-[#0F4C81] bg-[#F0F4F8]"
                      : "border-[#D9E2EC] bg-white"
                  }`}
                >
                  <MessagePriorityBadge priority={priority} />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <Card className="border-[#D9E2EC] bg-white">
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <MessageScopeBadge scope={form.isCto ? "GLOBAL" : "DIRECT"} />
                {formState.tipo ? (
                  <MessagePriorityBadge priority={formState.tipo.toUpperCase() as "NORMAL" | "ALERT" | "CRITICAL"} />
                ) : null}
              </div>
              {form.isCto ? (
                <p className="text-sm leading-6 text-[#486581]">
                  Este aviso sera entregue automaticamente para todos os usuarios ativos da plataforma.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-employee-filter">Filtrar colaboradores</Label>
                    <Input
                      id="mobile-employee-filter"
                      value={formState.filterTerm}
                      onChange={(event) => form.setFilterTerm(event.target.value)}
                      placeholder="Buscar colaborador"
                    />
                  </div>
                  <div className="space-y-2">
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
                  <p className="text-sm text-[#627D98]">{form.selectedCount} colaborador(es) selecionado(s)</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#D9E2EC] bg-white">
            <CardContent className="space-y-3 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#627D98]">Preview</p>
              <h2 className="text-xl font-semibold text-[#102A43]">{formState.title || "Titulo do aviso"}</h2>
              <p className="whitespace-pre-wrap text-sm leading-6 text-[#334E68]">
                {formState.mensagem || "O conteudo sera exibido aqui para confirmacao final."}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="fixed bottom-5 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 gap-3 rounded-3xl border border-[#D9E2EC] bg-white p-3 shadow-lg">
        <Button variant="outline" className="flex-1" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>
          Voltar
        </Button>
        {step < 2 ? (
          <Button className="flex-1 bg-[#0F4C81] text-white hover:bg-[#0B3A61]" onClick={() => setStep((current) => current + 1)}>
            Proximo
          </Button>
        ) : (
          <Button className="flex-1 bg-[#0F4C81] text-white hover:bg-[#0B3A61]" disabled={!form.canSubmit || form.isPosting} onClick={handleSend}>
            {form.isPosting ? "Enviando..." : "Enviar"}
          </Button>
        )}
      </div>
    </div>
  );
};
