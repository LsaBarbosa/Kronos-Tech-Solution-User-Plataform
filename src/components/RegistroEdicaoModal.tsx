// src/components/RegistroEdicaoModal.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { EditRecordFormData, DetailedReportItem, Manager } from "@/utils/report-utils";


interface RegistroEdicaoModalProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    managers: Manager[];
    selectedRecord: DetailedReportItem | null;
    // Props de Pausa Removidas
    onSaveRecord: (data: EditRecordFormData) => Promise<void>;
    form: UseFormReturn<EditRecordFormData>;
}

export const RegistroEdicaoModal: React.FC<RegistroEdicaoModalProps> = ({
    isOpen,
    setIsOpen,
    managers,
    onSaveRecord,
    form,
}) => {

    const onSubmit = (data: EditRecordFormData) => {
        onSaveRecord(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-sm border-primary/30">
                <DialogHeader className="border-b border-primary/20 pb-4">
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        <Edit className="h-5 w-5 text-primary" />
                        Editar Registro
                    </DialogTitle>
                    <DialogDescription>
                        Modifique as informações do segmento de trabalho e solicite a aprovação.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data de Início</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} className="focus:border-primary focus:ring-primary/20" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="endDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data de Fim</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} className="focus:border-primary focus:ring-primary/20" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="startHour" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hora de Início</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} className="focus:border-primary focus:ring-primary/20" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="endHour" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hora de Fim</FormLabel>
                                    <FormControl>
                                        <Input type="time" {...field} className="focus:border-primary focus:ring-primary/20" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>


                        {/* A seção de Edição de Pausas foi removida */}


                        <FormField control={form.control} name="managerId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Aprovador</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="focus:border-primary focus:ring-primary/20">
                                            <SelectValue placeholder="Selecione um administrador" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {managers.map((manager) => (
                                            <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                Solicitar Aprovação
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};