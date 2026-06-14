import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Clock, Shield, User, UserCircle, MapPin } from "lucide-react";
import type { CollaboratorEditorDraft, CollaboratorRecord } from "../types/collaborator-view.types";
import { DAYS_OF_WEEK, SCHEDULE_TYPES } from "../utils/collaborator-formatters";

type CollaboratorEditFormProps = {
  record: CollaboratorRecord;
  draft: CollaboratorEditorDraft;
  isSaving: boolean;
  onChange: <K extends keyof CollaboratorEditorDraft>(field: K, value: CollaboratorEditorDraft[K]) => void;
  onSave: () => void;
  onCancel: () => void;
  className?: string;
};

const Section = ({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <Card className="rounded-[24px] border border-[#CBD5E1] bg-[#F8FAFC] shadow-none">
    <CardHeader className="space-y-2 pb-3">
      <div className="flex items-center gap-2">
        <span className="text-[#2563EB]">{icon}</span>
        <CardTitle className="text-base text-[#0F172A]">{title}</CardTitle>
      </div>
      {description && <p className="text-sm text-[#64748B]">{description}</p>}
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);

export const CollaboratorEditForm = ({
  record,
  draft,
  isSaving,
  onChange,
  onSave,
  onCancel,
  className,
}: CollaboratorEditFormProps) => {
  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-[#64748B]">
            Edição de cadastro
          </div>
          <h3 className="text-xl font-semibold text-[#0F172A]">{record.fullName}</h3>
          <p className="text-sm text-[#64748B]">As alterações de acesso e dados são separadas da biometria.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving} className="h-10 rounded-full border-[#CBD5E1]">
            Cancelar
          </Button>
          <Button type="button" onClick={onSave} disabled={isSaving} className="h-10 rounded-full bg-[#2563EB] px-5 hover:bg-[#1E3A8A]">
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>

      {!record.hasAccount && (
        <div className="rounded-[20px] border border-[#F59E0B]/25 bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]">
          Esse colaborador ainda não possui conta vinculada. Os campos de usuário e perfil ficam desabilitados.
        </div>
      )}

      <Section icon={<UserCircle className="h-4 w-4" />} title="Conta e acesso" description="Usuário e perfil. O status ativo é alterado por confirmação separada.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Usuário</Label>
            <Input
              value={draft.username}
              onChange={(event) => onChange("username", event.target.value)}
              placeholder="nome.de.usuario"
              disabled={!record.hasAccount}
              className="h-11 rounded-[16px] border-[#CBD5E1] bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Perfil</Label>
            <Select value={draft.role} onValueChange={(value) => onChange("role", value as CollaboratorEditorDraft["role"])}>
              <SelectTrigger className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" disabled={!record.hasAccount}>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANAGER">Administrador</SelectItem>
                <SelectItem value="PARTNER">Colaborador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section icon={<User className="h-4 w-4" />} title="Identidade profissional" description="Dados cadastrais e contato principal.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Nome completo</Label>
            <Input value={draft.fullName} onChange={(event) => onChange("fullName", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Cargo</Label>
            <Input value={draft.jobPosition} onChange={(event) => onChange("jobPosition", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">CPF</Label>
            <Input value={draft.maskedCpf} onChange={(event) => onChange("maskedCpf", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" maxLength={11} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">PIS</Label>
            <Input value={draft.pis} onChange={(event) => onChange("pis", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Salário</Label>
            <Input value={draft.salary} onChange={(event) => onChange("salary", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" inputMode="decimal" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">E-mail</Label>
            <Input value={draft.email} onChange={(event) => onChange("email", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Telefone</Label>
            <Input value={draft.phone} onChange={(event) => onChange("phone", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
          </div>
        </div>
      </Section>

      <Section icon={<MapPin className="h-4 w-4" />} title="Endereço" description="Localização operacional do colaborador.">
        <div className="grid gap-4 md:grid-cols-[1.5fr_0.6fr]">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">CEP</Label>
            <Input value={draft.postalCode} onChange={(event) => onChange("postalCode", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Número</Label>
            <Input value={draft.number} onChange={(event) => onChange("number", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
          </div>
        </div>
      </Section>

      <Section icon={<Clock className="h-4 w-4" />} title="Jornada e escala" description="Ajuste dos horários contratuais e modelo de trabalho.">
        <div className="flex items-center justify-between rounded-[18px] border border-[#CBD5E1] bg-white px-4 py-3">
          <div>
            <div className="font-medium text-[#0F172A]">Home office</div>
            <p className="text-sm text-[#64748B]">Define o local de trabalho principal.</p>
          </div>
          <Switch checked={draft.homeOffice} onCheckedChange={(checked) => onChange("homeOffice", checked)} />
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Tipo de escala</Label>
            <Select value={draft.scheduleType} onValueChange={(value) => onChange("scheduleType", value)}>
              <SelectTrigger className="h-11 rounded-[16px] border-[#CBD5E1] bg-white">
                <SelectValue placeholder="Selecione a escala" />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULE_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Entrada</Label>
              <Input type="time" value={draft.workStartTime} onChange={(event) => onChange("workStartTime", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Saída</Label>
              <Input type="time" value={draft.workEndTime} onChange={(event) => onChange("workEndTime", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Início do intervalo</Label>
              <Input type="time" value={draft.breakStartTime} onChange={(event) => onChange("breakStartTime", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Fim do intervalo</Label>
              <Input type="time" value={draft.breakEndTime} onChange={(event) => onChange("breakEndTime", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
            </div>
          </div>

          {(draft.scheduleType === "ROTATING_12X36" || draft.scheduleType === "ROTATING_24X72") && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Data de início do ciclo</Label>
              <Input type="date" value={draft.scaleStartDate} onChange={(event) => onChange("scaleStartDate", event.target.value)} className="h-11 rounded-[16px] border-[#CBD5E1] bg-white" />
            </div>
          )}

          {draft.scheduleType?.includes("SIX_BY_ONE") && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Folga fixa</Label>
              <Select value={draft.preferredDayOff} onValueChange={(value) => onChange("preferredDayOff", value)}>
                <SelectTrigger className="h-11 rounded-[16px] border-[#CBD5E1] bg-white">
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {draft.scheduleType === "TRADITIONAL_5X2" && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B]">Dias de trabalho</Label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {DAYS_OF_WEEK.map((day) => {
                  const checked = draft.fixedWorkDays.includes(day.value);
                  return (
                    <label key={day.value} className="flex items-center gap-2 rounded-[16px] border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#0F172A]">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(selected) => {
                          const next = selected
                            ? [...draft.fixedWorkDays, day.value]
                            : draft.fixedWorkDays.filter((current) => current !== day.value);
                          onChange("fixedWorkDays", next);
                        }}
                      />
                      {day.short}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving} className="h-11 rounded-full border-[#CBD5E1]">
          Cancelar
        </Button>
        <Button type="button" onClick={onSave} disabled={isSaving} className="h-11 rounded-full bg-[#2563EB] px-6 hover:bg-[#1E3A8A]">
          <Shield className="mr-2 h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
};
