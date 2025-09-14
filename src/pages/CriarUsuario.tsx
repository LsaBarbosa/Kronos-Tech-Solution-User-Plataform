import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Check, ChevronsUpDown, ArrowLeft, Eye, EyeOff } from "lucide-react";
// Components
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.string().min(2, "Função é obrigatória"),
  employeeId: z.string().min(1, "Selecione um funcionário"),
});

type FormData = z.infer<typeof formSchema>;

interface Employee {
  id: string;
  name: string;
}

const CriarUsuario = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSelectOpen, setEmployeeSelectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to generate random password
  const generateRandomPassword = (length: number = 8): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "",
      employeeId: "",
    },
  });

  // Simulate fetching employees from API and generate password
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Simulated API call - replace with actual endpoint
        const mockEmployees: Employee[] = [
          { id: "1", name: "Luis Barbosa" },
          { id: "2", name: "Maria Silva" },
          { id: "3", name: "João Santos" },
          { id: "4", name: "Ana Costa" },
          { id: "5", name: "Pedro Oliveira" },
        ];
        setEmployees(mockEmployees);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de funcionários",
          variant: "destructive",
        });
      }
    };

    // Generate and set random password on component mount
    const randomPassword = generateRandomPassword(8);
    form.setValue("password", randomPassword);

    fetchEmployees();
  }, [toast, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Dados do novo usuário:", data);
      
      toast({
        title: "Sucesso!",
        description: "Usuário criado com sucesso.",
      });
      
      form.reset();
      navigate("/admin/usuarios");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar usuário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEmployee = employees.find(
    (employee) => employee.id === form.watch("employeeId")
  );

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-64" : "lg:ml-16"
      )}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/usuarios")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Criar Usuário</h1>
              <p className="text-muted-foreground">Cadastre um novo usuário no sistema</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="flex justify-center">
            <Card className="w-full max-w-2xl shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-foreground">
                  Registro de Novo Usuário
                </CardTitle>
              </CardHeader>
              
              <CardContent className="px-8 pb-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Username Field */}
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Nome de Usuário
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o nome de usuário"
                              className="h-12 text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password Field */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Senha
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Digite a senha"
                                className="h-12 text-base pr-12"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Role Field */}
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Função
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Selecione a função..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MANAGER">Administrador</SelectItem>
                              <SelectItem value="PARTNER">Colaborador</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Employee Selection Field */}
                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            Funcionário
                          </FormLabel>
                          <Popover open={employeeSelectOpen} onOpenChange={setEmployeeSelectOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={employeeSelectOpen}
                                  className="w-full h-12 justify-between text-base"
                                >
                                  {selectedEmployee ? selectedEmployee.name : "Selecione um funcionário..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <Command>
                                <CommandInput 
                                  placeholder="Pesquisar funcionário..." 
                                  className="h-12"
                                />
                                <CommandList>
                                  <CommandEmpty>Nenhum funcionário encontrado.</CommandEmpty>
                                  <CommandGroup>
                                    {employees.map((employee) => (
                                      <CommandItem
                                        key={employee.id}
                                        value={employee.name}
                                        onSelect={() => {
                                          field.onChange(employee.id);
                                          setEmployeeSelectOpen(false);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedEmployee?.id === employee.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {employee.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <div className="pt-6">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 text-lg font-semibold bg-[#EF6C00] hover:bg-[#EF6C00]/90 text-white shadow-lg"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Registrando...
                          </div>
                        ) : (
                          "Registrar"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CriarUsuario;