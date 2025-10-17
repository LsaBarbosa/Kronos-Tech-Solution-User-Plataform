// src/components/RegistroEdicaoModal.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Edit, Pause } from "lucide-react";
import { useForm, UseFormReturn } from "react-hook-form";
import { BreakEditItem, EditRecordFormData, DetailedReportItem, Manager, editRecordSchema } from "@/utils/report-utils";
import { zodResolver } from "@hookform/resolvers/zod";


interface RegistroEdicaoModalProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    managers: Manager[];
    selectedRecord: DetailedReportItem | null;
    editBreaks: BreakEditItem[];
    setEditBreaks: React.Dispatch<React.SetStateAction<BreakEditItem[]>>;
    onSaveRecord: (data: EditRecordFormData) => Promise<void>;
    form: UseFormReturn<EditRecordFormData>;
}

export const RegistroEdicaoModal: React.FC<RegistroEdicaoModalProps> = ({
    isOpen,
    setIsOpen,
    managers,
    editBreaks,
    setEditBreaks,
    onSaveRecord,
    form,
}) => {

    const onSubmit = (data: EditRecordFormData) => {
        onSaveRecord(data);
    };

    // NOVO: Função para alternar a flag 'delete' de uma pausa
    const handleBreakDeleteToggle = (breakId: string) => {
        setEditBreaks(prev => prev.map(item => {
            if (item.id === breakId) {
                // Alterna a flag 'delete'
                return { ...item, delete: !item.delete };
            }
            return item;
        }));
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
                        Modifique as informações do registro e solicite a aprovação.
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


                        <div className="space-y-4 pt-4 border-t border-primary/20">
                            <FormLabel className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Pause className="h-4 w-4" /> Edição de Pausas ({editBreaks.filter(b => !b.delete).length} período(s) ativos)
                            </FormLabel>

                            {editBreaks.map((breakItem, index) => (
                                <Card 
                                    key={breakItem.id} 
                                    className={`p-3 border-l-2 ${breakItem.delete ? 'border-l-destructive/50 opacity-60 line-through' : 'border-l-primary/50'} bg-muted/10 transition-all`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h5 className={`text-xs font-bold ${breakItem.delete ? 'text-destructive' : 'text-primary'}`}>
                                            Pausa {index + 1} ({breakItem.status === 'BREAK_IN_PROGRESS' ? 'Em Andamento' : 'Concluída'})
                                        </h5>
                                        {/* Botão de Excluir/Restaurar */}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={breakItem.delete ? "default" : "destructive"}
                                            onClick={() => handleBreakDeleteToggle(breakItem.id)}
                                            className="h-6 px-3 text-xs"
                                        >
                                            {breakItem.delete ? 'Restaurar' : 'Excluir'}
                                        </Button>
                                    </div>
                                    
                                    {/* Fieldset desabilitado se a pausa for marcada para exclusão */}
                                    <fieldset disabled={breakItem.delete}>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Data Início Pausa */}
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Data Início</Label>
                                                <Input
                                                    type="date"
                                                    value={breakItem.startDate}
                                                    onChange={(e) => {
                                                        const newDate = e.target.value;
                                                        setEditBreaks(prev => prev.map(item => item.id === breakItem.id ? { ...item, startDate: newDate } : item));
                                                    }}
                                                    className="h-9 focus:border-primary focus:ring-primary/20"
                                                />
                                            </div>
                                            {/* Hora Início Pausa */}
                                            <div className="space-y-1">
                                                <Label className="text-xs text-muted-foreground">Hora Início</Label>
                                                <Input
                                                    type="time"
                                                    value={breakItem.startHour}
                                                    onChange={(e) => {
                                                        const newHour = e.target.value;
                                                        setEditBreaks(prev => prev.map(item => item.id === breakItem.id ? { ...item, startHour: newHour } : item));
                                                    }}
                                                    className="h-9 focus:border-primary focus:ring-primary/20"
                                                />
                                            </div>

                                            {/* Data Fim Pausa (Apenas se não estiver em andamento) */}
                                            {breakItem.status !== 'BREAK_IN_PROGRESS' && (
                                                <>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Data Fim</Label>
                                                        <Input
                                                            type="date"
                                                            value={breakItem.endDate}
                                                            onChange={(e) => {
                                                                const newDate = e.target.value;
                                                                setEditBreaks(prev => prev.map(item => item.id === breakItem.id ? { ...item, endDate: newDate } : item));
                                                            }}
                                                            className="h-9 focus:border-primary focus:ring-primary/20"
                                                        />
                                                    </div>
                                                    {/* Hora Fim Pausa */}
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Hora Fim</Label>
                                                        <Input
                                                            type="time"
                                                            value={breakItem.endHour}
                                                            onChange={(e) => {
                                                                const newHour = e.target.value;
                                                                setEditBreaks(prev => prev.map(item => item.id === breakItem.id ? { ...item, endHour: newHour } : item));
                                                            }}
                                                            className="h-9 focus:border-primary focus:ring-primary/20"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </fieldset>
                                </Card>
                            ))}
                        </div>
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