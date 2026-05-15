// src/pages/CriarAviso.tsx

import { useState, useCallback } from "react";
// 💡 Imports de UI e Ícones
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FormInput, TextareaInput } from "@/components/ui";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquarePlus, Send, User, Users, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

// 💡 NOVO: Importa o hook customizado com toda a lógica
import { useCreateAvisoForm } from "@/hooks/useCreateAvisoForm";
// 💡 NOVO: Importa funções utilitárias puras de exibição
import { getTipoColor, getTipoLabel } from "@/types/message";

const CriarAviso = () => {
  // 💡 Estado de UI (Sidebar) é o único estado mantido localmente
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  // 💡 HOOK: Desestrutura toda a lógica e estado
  const {
    formState,
    employees, // Lista completa
    filteredEmployees, // Lista filtrada (usada na renderização)
    isPosting,
    isFetchingEmployees,
    isAllSelected,
    isFormValid,
    setTitle,
    setTipo,
    setMensagem,
    setFilterTerm,
    handleSelectAll,
    handleToggleEmployee,
    handlePostar,
  } = useCreateAvisoForm();
  
  const { title, tipo, mensagem, filterTerm, selectedEmployeeIds } = formState;

  return (
   <div className="min-h-screen bg-background relative  overflow-hidden">
      {/* Animated Background and Header/Sidebar components */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 15s ease-in-out infinite'
          }}
        />
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.50), transparent)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
              animation: 'float-shapes 20s ease-in-out infinite'
            }}
          />
          <div
            className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
            style={{
              background: 'linear-gradient(45deg, hsl(var(--black-primary) / 0.50), transparent)',
              borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
              animation: 'float-shapes 25s ease-in-out infinite reverse'
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.50), transparent)',
              borderRadius: '50%',
              animation: 'float-shapes 18s ease-in-out infinite 5s'
            }}
          />
        </div>
      </div>

    <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 💡 CORREÇÃO: Header usa 'toggleSidebar' */}
        <Header toggleSidebar={handleToggleSidebar} />

      <main className="pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquarePlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl mt-8 font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                  Criar Aviso</h1>
                <p className="text-muted-foreground">Comunique-se de forma clara e objetiva com a equipe.</p>
              </div>
            </div>
          </div>

          <Card className="border-l-4 border-l-primary shadow-card">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
              <CardTitle className="text-xl text-foreground">Novo Aviso</CardTitle>
              <CardDescription className="text-muted-foreground">
              Crie comunicados direcionados a colaboradores específicos.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Título do Aviso */}
              <FormInput
                id="title"
                label="Título do Aviso"
                placeholder="Ex: Mudança no Horário de Verão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                hint="Recomendado um título curto e direto."
                className="bg-background border-input"
              />
              
              {/* Tipo do Aviso */}
              <div className="space-y-2">
                <Label htmlFor="tipo" className="text-sm font-medium text-foreground">
                  Tipo do Aviso
                </Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="w-full bg-background border-input">
                    <SelectValue placeholder="Selecione o tipo do aviso" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="normal" className="hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                        <span>Informativo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="alert" className="hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                        <span>Alerta</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="critical" className="hover:bg-accent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive"></div>
                        <span>Crítico</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {tipo && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">Tipo selecionado:</span>
                    <span className={`text-sm font-medium ${getTipoColor(tipo)}`}>
                      {getTipoLabel(tipo)}
                    </span>
                  </div>
                )}
              </div>

              {/* SELEÇÃO DE DESTINATÁRIOS */}
              <div className="space-y-4 pt-2 border-t border-border/50">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Destinatários Específicos
                  </Label>
                  
                  {/* Campo de Filtro */}
                  <Input
                      id="employee-filter"
                      placeholder="Filtrar por nome do colaborador..."
                      value={filterTerm}
                      onChange={(e) => setFilterTerm(e.target.value)}
                      className="bg-background border-input"
                  />

                  {/* CHECKBOX MESTRE */}
                  <div className="flex items-center space-x-2 pb-2 border-b border-border">
                      <Checkbox
                          id="select-all-employees"
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll} 
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          disabled={filteredEmployees.length === 0}
                      />
                      <Label htmlFor="select-all-employees" className="text-sm font-bold flex-1 cursor-pointer text-primary">
                          Selecionar Todos os Colaboradores Visíveis ({selectedEmployeeIds.length}/{employees.length})
                      </Label>
                      {isFetchingEmployees && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  </div>
                  
                  {/* LISTA DE COLABORADORES FILTRADA */}
                  <div className="p-3 bg-muted/30 rounded-lg space-y-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {isFetchingEmployees && employees.length === 0 && (
                          <p className="text-sm text-muted-foreground">Carregando lista de colaboradores...</p>
                      )}
                      
                      {filteredEmployees.length === 0 && !isFetchingEmployees && filterTerm && (
                          <p className="text-sm text-muted-foreground">Nenhum colaborador encontrado com o filtro "{filterTerm}".</p>
                      )}

                      {filteredEmployees.map((employee) => (
                          <div key={employee.employeeId} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                              <Checkbox
                                  id={`emp-${employee.employeeId}`}
                                  checked={selectedEmployeeIds.includes(employee.employeeId)}
                                  onCheckedChange={() => handleToggleEmployee(employee.employeeId)}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <Label htmlFor={`emp-${employee.employeeId}`} className="text-sm font-medium flex-1 cursor-pointer text-foreground">
                                  <div className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      <span>{employee.fullName}</span>
                                      {selectedEmployeeIds.includes(employee.employeeId) && (
                                           <span className="text-xs text-primary/70 ml-auto">Selecionado</span>
                                      )}
                                  </div>
                              </Label>
                          </div>
                      ))}
                  </div>
                  
                  {selectedEmployeeIds.length === 0 && (
                      <p className="text-sm text-muted-foreground font-medium pt-2">Selecione os colaboradores. Se não selecionar ninguém, o aviso só será visível para você.</p>
                  )}
              </div>

              {/* Mensagem do Aviso */}
              <div className="pt-4 border-t border-border/50">
                <TextareaInput
                  id="mensagem"
                  label="Mensagem do Aviso"
                  placeholder="Digite aqui a mensagem detalhada do aviso..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  className="min-h-[200px] bg-background border-input resize-none"
                  helperText={
                    <div className="flex justify-between items-center">
                      <span>{mensagem.length} caracteres</span>
                      {mensagem.length > 500 && (
                        <span className="text-destructive">
                          Mensagem muito longa (recomendado até 500 caracteres)
                        </span>
                      )}
                    </div>
                  }
                />
              </div>

              {/* Botão de Postar */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handlePostar}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                  disabled={!isFormValid || isPosting}
                >
                  {isPosting ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
                      Postando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Postar Aviso
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CriarAviso;
