// src/components/RegistroEdicaoModal.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Edit3, Loader2, Send } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type {
    EditRecordFormData,
    DetailedReportItem,
    Manager,
} from "@/utils/report-utils";

interface RegistroEdicaoModalProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    managers: Manager[];
    selectedRecord: DetailedReportItem | null;
    onSaveRecord: (data: EditRecordFormData) => Promise<void>;
    form: UseFormReturn<EditRecordFormData>;
    isSavingRecord?: boolean;
}

const inputClass =
    "h-11 rounded-2xl border-[#E2E8F0] bg-white text-sm text-[#0F172A] focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#BFDBFE]";

export const RegistroEdicaoModal: React.FC<RegistroEdicaoModalProps> = ({
    isOpen,
    setIsOpen,
    managers,
    onSaveRecord,
    form,
    isSavingRecord = false,
}) => {
    const onSubmit = (data: EditRecordFormData) => {
        onSaveRecord(data);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && isSavingRecord) return;
        setIsOpen(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-[480px] flex-col gap-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-0 shadow-[0_18px_50px_rgba(11,18,32,0.18)] sm:max-w-[520px]"
            >
                <DialogHeader className="space-y-3 border-b border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6 text-left">
                    <div className="flex items-start gap-3">
                        <span
                            aria-hidden="true"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#92400E]"
                        >
                            <Edit3 className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748B]">
                                Solicitação de aprovação
                            </p>
                            <DialogTitle className="text-lg font-semibold text-[#0F172A]">
                                Editar registro de ponto
                            </DialogTitle>
                            <DialogDescription className="text-sm text-[#64748B]">
                                Ajuste o segmento de jornada e envie para aprovação do gestor.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                                                    Data de início
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className={inputClass} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                                                    Data de fim
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className={inputClass} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="startHour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                                                    Hora de início
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} className={inputClass} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endHour"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                                                    Hora de fim
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="time" {...field} className={inputClass} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="managerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-[0.08em] text-[#64748B]">
                                                Aprovador
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className={inputClass}>
                                                        <SelectValue placeholder="Selecione um administrador" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {managers.map((manager) => (
                                                        <SelectItem key={manager.id} value={manager.id}>
                                                            {manager.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="rounded-2xl border border-[#FCD34D] bg-[#FEF3C7] p-3">
                                    <p className="text-xs leading-5 text-[#92400E]">
                                        A alteração será enviada para o gestor aprovar antes de ser aplicada ao
                                        relatório.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isSavingRecord}
                                className="h-11 w-full gap-2 rounded-2xl border-[#E2E8F0] text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9] sm:w-auto"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSavingRecord}
                                className="h-11 w-full gap-2 rounded-2xl bg-[#2563EB] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8] disabled:opacity-70 sm:w-auto"
                            >
                                {isSavingRecord ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Solicitar aprovação
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
