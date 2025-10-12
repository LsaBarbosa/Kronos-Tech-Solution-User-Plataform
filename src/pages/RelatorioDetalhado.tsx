import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // REMOVIDO
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Search, Download, Check, X, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
import { API_BASE_URL } from "@/config/api";

const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(payload);
    } catch (error) {
        console.error("Failed to decode token", error);
        return null;
    }
};

const getBrazilianHolidays = (year) => {
    const holidays = [];

    holidays.push(new Date(year, 0, 1));
    holidays.push(new Date(year, 3, 21));
    holidays.push(new Date(year, 4, 1));
    holidays.push(new Date(year, 8, 7));
    holidays.push(new Date(year, 9, 12));
    holidays.push(new Date(year, 10, 2));
    holidays.push(new Date(year, 10, 15));
    holidays.push(new Date(year, 11, 25));

    const easter = getEasterDate(year);
    const carnival = new Date(easter);
    carnival.setDate(easter.getDate() - 47);
    holidays.push(carnival);

    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    holidays.push(goodFriday);

    const corpusChristi = new Date(easter);
    corpusChristi.setDate(easter.getDate() + 60);
    holidays.push(corpusChristi);

    return holidays;
};

const getEasterDate = (year) => {
    const f = Math.floor;
    const G = year % 19;
    const C = f(year / 100);
    const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30;
    const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11));
    const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7;
    const L = I - J;
    const month = 3 + f((L + 40) / 44);
    const day = L + 28 - 31 * f(month / 4);
    return new Date(year, month - 1, day);
};

const statusOptions = [
    { value: "CREATED", label: "Criado" },
    { value: "PENDING", label: "Saída Pendente" },
    { value: "UPDATED", label: "Atualizado por ADM" },
    { value: "UPDATE_REJECTED", label: "Atualização Rejeitada Por ADM" },
    { value: "DAY_OFF", label: "Folga" },
    { value: "ABSENCE", label: "Falta" },
    { value: "PENDING_APPROVAL", label: "Aguardando Aprovação" },
    { value: "DOCTOR_APPOINTMENT", label: "Consulta Médica" },
];

interface DetailedReportItem {
    id?: string;
    startWork: string;
    startHour: string;
    endWork: string;
    endHour: string;
    hoursWork: string;
    balance: string;
    statusRecord: string;
    active: boolean;
    employeeData: {
        employeeName: string;
        companyName: string;
    };
}

interface ReportDay {
    startDate: string;
    totalHours: string;
    balance: string;
}

interface ReportData {
    totalHoursWorked: string;
    totalBalance: string;
    days: ReportDay[];
    employeeName?: string;
    companyName?: string;
}

interface UserItem {
    userId: string;
    username: string;
    role: string;
    active: boolean;
    employeeId: string;
}

interface Employee {
    employeeId: string;
    fullName: string;
}

const editRecordSchema = z.object({
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().min(1, "Data de fim é obrigatória"),
    startHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    endHour: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
    managerId: z.string().min(1, "Administrador é obrigatório"),
});

type EditRecordFormData = z.infer<typeof editRecordSchema>;

const RelatorioDetalhado = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);
    const [referenceTime, setReferenceTime] = useState("08:00");
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [employeeActive, setEmployeeActive] = useState("active");
    const [isActive, setIsActive] = useState(true);
    const [status, setStatus] = useState("");
    const [reportType, setReportType] = useState("detailed"); // NOVO ESTADO: "detailed" ou "simple"
    const [reportData, setReportData] = useState<DetailedReportItem[]>([]);
    const [reportDataSimple, setReportDataSimple] = useState<ReportData | null>(null); // NOVO ESTADO: Para relatório simples
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [employees, setEmployees] = useState([]);
    const { toast } = useToast();
    const [managers, setManagers] = useState([]);
    const reportTableRef = useRef(null);
    const [isPartner, setIsPartner] = useState(false);

    const form = useForm<EditRecordFormData>({
        resolver: zodResolver(editRecordSchema),
        defaultValues: {
            startDate: "",
            endDate: "",
            startHour: "",
            endHour: "",
            managerId: "",
        },
    });

    const fetchEmployees = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            const decoded = decodeToken(token);
            const userRole = decoded?.role;
            const userId = decoded?.employeeId;
            const userName = decoded?.fullName;

            if (userRole === "PARTNER") {
                setIsPartner(true);
                setEmployees([{ employeeId: userId, fullName: userName }]);
                setSelectedEmployee(userId);
                return;
            } else {
                setIsPartner(false);
            }

            const activeStatus = employeeActive === "active";
            const url = employeeActive ? `${API_BASE_URL}employee?active=${activeStatus}` : `${API_BASE_URL}employee`;


            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();

                setEmployees(data.employees || []);
                if (!selectedEmployee) {
                    setSelectedEmployee("");
                }
            }
        } catch (error) {
            console.error("Erro ao buscar funcionários:", error);
        }
    }, [employeeActive, selectedEmployee]);

    const fetchManagers = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const response = await fetch(`${API_BASE_URL}users/search`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Erro ao buscar usuários.");
            }

            const data = await response.json();
            const filteredManagers = data.users
                .filter((user) => user.role === "MANAGER")
                .map((user) => ({
                    id: user.userId,
                    name: user.username,
                }));
            setManagers(filteredManagers);
        } catch (error) {
            console.error("Erro ao buscar gerentes:", error);
            toast({
                title: "Erro",
                description: error.message || "Não foi possível carregar a lista de administradores.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchManagers();
    }, [fetchEmployees]);

    const currentYear = new Date().getFullYear();
    const holidays = [
        ...getBrazilianHolidays(currentYear),
        ...getBrazilianHolidays(currentYear + 1)
    ];

    const isHoliday = (date) => {
        return holidays.some(holiday =>
            holiday.toDateString() === date.toDateString()
        );
    };

    const handleDateSelect = (date) => {
        if (!date) return;

        setSelectedDates(prev => {
            const isAlreadySelected = prev.some(selectedDate =>
                selectedDate.getDate() === date.getDate() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getFullYear() === date.getFullYear()
            );

            if (isAlreadySelected) {
                return prev.filter(selectedDate =>
                    !(selectedDate.getDate() === date.getDate() &&
                        selectedDate.getMonth() === date.getMonth() &&
                        selectedDate.getFullYear() === date.getFullYear())
                );
            } else {
                return [...prev, date];
            }
        });
    };

    const handleEmployeeStatusChange = (statusValue) => {
        setEmployeeActive(prev => (prev === statusValue ? "" : statusValue));
    };

    // NOVO: Função para alternar o tipo de relatório (Radio Check)
    const handleReportTypeChange = (typeValue) => {
        if (reportType !== typeValue) {
            setReportType(typeValue);
            // Limpa o status se for para o simples
            if (typeValue === "simple") {
                setStatus("");
            }
            // Limpa os dados do relatório anterior
            setReportData([]);
            setReportDataSimple(null);
        }
    };

    // FUNÇÃO DE BUSCA DETALHADA (EXISTENTE)
    const handleSearch = async () => {
        setReportDataSimple(null); // Limpa dados simples

        if (!status) {
            toast({
                title: "Erro",
                description: "Selecione um status para gerar o relatório.",
                variant: "destructive"
            });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const formattedDates = selectedDates.map(date => format(date, "dd-MM-yyyy"));
            const requestBody = {
                reference: referenceTime,
                active: isActive,
                status: status,
                dates: formattedDates,
            };

            const apiUrl = new URL(`${API_BASE_URL}records/report`, window.location.origin);
            if (selectedEmployee) {
                apiUrl.searchParams.append("employeeId", selectedEmployee);
            }

            const response = await fetch(apiUrl.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Erro ao buscar o relatório detalhado. Tente novamente mais tarde.");
            }

            const data = await response.json();

            if (data.length === 0) {
                setReportData([]);
                toast({
                    title: "Aviso",
                    description: "Não há registro para as datas selecionadas",
                    variant: "default",
                });
                return;
            }

            setReportData(data);
            setReportDataSimple(null); // Garante que o simples esteja vazio

            const datesList = selectedDates
                .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
                .join(", ");

            toast({
                title: "Busca realizada",
                description: `Relatório detalhado gerado para as datas: ${datesList}`,
            });
        } catch (error) {
            console.error("Erro na busca:", error);
            toast({
                title: "Erro",
                description: error.message || "Ocorreu um erro ao buscar o relatório.",
                variant: "destructive",
            });
        }
    };

    // NOVO: FUNÇÃO DE BUSCA SIMPLES
    const handleSimpleSearch = async () => {
        setReportData([]); // Limpa dados detalhados

        if (selectedDates.length === 0) {
            toast({
                title: "Erro",
                description: "Por favor, selecione pelo menos uma data.",
                variant: "destructive",
            });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            const formattedDates = selectedDates.map(date => format(date, "dd-MM-yyyy"));
            const requestBody = {
                reference: referenceTime,
                dates: formattedDates,
                employeeActive: employeeActive === "active",
                active: isActive,
            };

            const apiUrl = new URL(`${API_BASE_URL}records/report/simple`, window.location.origin);
            if (selectedEmployee) {
                apiUrl.searchParams.append("employeeId", selectedEmployee);
            }

            const response = await fetch(apiUrl.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Erro ao buscar o relatório simples. Tente novamente mais tarde.");
            }

            const data = await response.json();

            if (data.days.length === 0) {
                setReportDataSimple(null);
                toast({
                    title: "Aviso",
                    description: "Não há registro para as datas selecionadas com os filtros aplicados.",
                    variant: "default",
                });
                return;
            }

            setReportDataSimple(data);
            setReportData([]); // Garante que o detalhado esteja vazio

            const datesList = selectedDates
                .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
                .join(", ");

            toast({
                title: "Busca realizada",
                description: `Relatório simples gerado para as datas: ${datesList}`,
            });
        } catch (error) {
            console.error("Erro na busca simples:", error);
            toast({
                title: "Erro",
                description: error.message || "Ocorreu um erro ao buscar o relatório simples.",
                variant: "destructive",
            });
        }
    };

    // FUNÇÃO DE DOWNLOAD DETALHADA (EXISTENTE)
    const handleDownload = () => {
        const parseDate = (dateString) => {
            if (!dateString) return null;
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const [day, month, year] = parts;
                const date = new Date(`${year}/${month}/${day}`);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
            return null;
        };

        if (reportData.length === 0) {
            toast({
                title: "Erro",
                description: "Gere o relatório primeiro para poder fazer o download.",
                variant: "destructive"
            });
            return;
        }

        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text('RELATÓRIO DETALHADO DE PONTO', 20, 25);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");

            let yPosition = 40;

            if (reportData.length > 0 && reportData[0].employeeData) {
                doc.text(`Funcionário: ${reportData[0].employeeData.employeeName}`, 20, yPosition);
                yPosition += 7;
                doc.text(`Empresa: ${reportData[0].employeeData.companyName}`, 20, yPosition);
                yPosition += 7;
            }

            if (status) {
                const statusLabel = statusOptions.find(opt => opt.value === status)?.label || status;
                doc.text(`Status: ${statusLabel}`, 20, yPosition);
                yPosition += 7;
            }

            doc.text(`Carga horária diária: ${referenceTime}`, 20, yPosition);
            yPosition += 7;

            if (selectedDates.length > 0) {
                const validDates = selectedDates.filter(date => date && !isNaN(date.getTime()));
                const datesList = validDates
                    .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
                    .join(", ");
                doc.text(`Datas: ${datesList}`, 20, yPosition);
                yPosition += 10;
            }
            doc.setFont("helvetica", "bold");
            yPosition += 5;
            yPosition += 10;
            const tableData = reportData.map(item => {
                const startDate = parseDate(item.startWork);
                const endDate = parseDate(item.endWork);

                return [
                    startDate ? format(startDate, "dd/MM/yyyy") : 'N/A',
                    item.startHour,
                    endDate ? format(endDate, "dd/MM/yyyy") : 'N/A',
                    item.endHour,
                    item.hoursWork,
                    item.balance,
                    statusOptions.find(opt => opt.value === item.statusRecord)?.label || item.statusRecord
                ];
            });

            autoTable(doc, {
                head: [['Data Entrada', 'Hora Entrada', 'Data Saída', 'Hora Saída', 'Horas Trabalhadas', 'Saldo', 'Status']],
                body: tableData,
                startY: yPosition,
                margin: { left: 20, right: 20 },
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    halign: 'center'
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    5: {
                        cellWidth: 20,
                        halign: 'center'
                    }
                },
                didParseCell: function (data) {
                    if (data.column.index === 5 && data.section === 'body') {
                        const balance = data.cell.text[0];
                        if (balance && balance.toString().startsWith('-')) {
                            data.cell.styles.textColor = [220, 53, 69];
                            data.cell.styles.fontStyle = 'bold';
                        } else if (balance && !balance.toString().startsWith('-') && balance !== '00:00') {
                            data.cell.styles.textColor = [40, 167, 69];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });

            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
                doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, doc.internal.pageSize.height - 10);
            }

            const fileName = `relatorio_detalhado_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
            doc.save(fileName);

            toast({
                title: "PDF Gerado",
                description: "Relatório detalhado baixado com sucesso!",
            });

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast({
                title: "Erro",
                description: "Não foi possível gerar o PDF. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    // NOVO: FUNÇÃO DE DOWNLOAD SIMPLES
    const handleSimpleDownload = () => {
        if (!reportDataSimple || reportDataSimple.days.length === 0) {
            toast({
                title: "Erro",
                description: "Gere o relatório primeiro para poder fazer o download.",
                variant: "destructive"
            });
            return;
        }

        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text('RELATÓRIO SIMPLES DE PONTO', 20, 25);

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            let yPosition = 40;

            if (reportDataSimple.employeeName) {
                doc.text(`Funcionário: ${reportDataSimple.employeeName}`, 20, yPosition);
                yPosition += 7;
            }

            if (reportDataSimple.companyName) {
                doc.text(`Empresa: ${reportDataSimple.companyName}`, 20, yPosition);
                yPosition += 7;
            }

            doc.text(`Carga horária diária: ${referenceTime}`, 20, yPosition);
            yPosition += 7;

            if (selectedDates.length > 0) {
                const validDates = selectedDates.filter(date => date && !isNaN(date.getTime()));
                const datesList = validDates
                    .map(date => format(date, "dd/MM/yyyy", { locale: ptBR }))
                    .join(", ");
                doc.text(`Datas: ${datesList}`, 20, yPosition);
                yPosition += 10;
            }

            // Adicionando os totais antes da tabela
            doc.setFont("helvetica", "bold");
            doc.text(`Total de Horas Trabalhadas: ${reportDataSimple.totalHoursWorked}`, 20, yPosition);
            yPosition += 7;
            doc.text(`Saldo Total: ${reportDataSimple.totalBalance}`, 20, yPosition);
            yPosition += 10;
            doc.setFont("helvetica", "normal"); // Volta para normal

            const tableData = reportDataSimple.days.map(day => {
                const parts = day.startDate.split('/');
                const dayDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                const holiday = isHoliday(dayDate) ? ' 🎉' : '';
                return [
                    `${day.startDate}${holiday}`,
                    day.totalHours,
                    day.balance,
                ];
            });

            autoTable(doc, {
                head: [['Data', 'Total de Horas', 'Saldo do Dia']],
                body: tableData,
                startY: yPosition,
                margin: { left: 20, right: 20 },
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    halign: 'center'
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    2: { // Coluna do saldo
                        cellWidth: 25,
                        halign: 'center'
                    }
                },
                didParseCell: function (data) {
                    // Colorir saldo positivo/negativo
                    if (data.column.index === 2 && data.section === 'body') {
                        const balance = data.cell.text[0];
                        if (balance && balance.startsWith('-')) {
                            data.cell.styles.textColor = [220, 53, 69]; // Vermelho para negativo
                            data.cell.styles.fontStyle = 'bold';
                        } else if (balance && !balance.startsWith('-') && balance !== '00:00') {
                            data.cell.styles.textColor = [40, 167, 69]; // Verde para positivo
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                }
            });

            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
                doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, doc.internal.pageSize.height - 10);
            }

            const fileName = `relatorio_simples_${format(new Date(), "yyyyMMdd_HHmmss")}.pdf`;
            doc.save(fileName);

            toast({
                title: "PDF Gerado",
                description: "Relatório simples baixado com sucesso!",
            });

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast({
                title: "Erro",
                description: "Não foi possível gerar o PDF. Tente novamente.",
                variant: "destructive",
            });
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case "CREATED": return "default";
            case "PENDING": return "secondary";
            case "UPDATED": return "default";
            case "UPDATE_REJECTED": return "destructive";
            case "DAY_OFF": return "outline";
            case "ABSENCE": return "destructive";
            case "PENDING_APPROVAL": return "secondary";
            case "DOCTOR_APPOINTMENT": return "outline";
            default: return "default";
        }
    };

    const getStatusColor = (status) => {
        const baseClass = "text-white";
        switch (status) {
            case "CREATED": return `${baseClass} bg-green-600`;
            case "PENDING": return `${baseClass} bg-yellow-600`;
            case "ABSENCE": return `${baseClass} bg-red-600`;
            default: return `${baseClass} bg-primary`;
        }
    };

    const handleEditRecord = (record) => {
        setSelectedRecord(record);

        const formatDateToInput = (dateString) => {
            if (!dateString) return "";
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const [day, month, year] = parts;
                return `${year}-${month}-${day}`;
            }
            return dateString;
        };

        form.reset({
            startDate: formatDateToInput(record.startWork),
            endDate: formatDateToInput(record.endWork),
            startHour: record.startHour,
            endHour: record.endHour,
            managerId: managers[0]?.id || "",
        });

        setEditModalOpen(true);
    };

    const handleSaveRecord = async (data: EditRecordFormData) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Token de autenticação não encontrado.");
            }

            if (!selectedRecord || !selectedRecord.timeRecordId) {
                throw new Error("Registro selecionado para edição não encontrado.");
            }

            const formatDate = (dateString: string) => {
                const [year, month, day] = dateString.split('-');
                return `${day}-${month}-${year}`;
            };

            const requestBody = {
                startDate: formatDate(data.startDate),
                endDate: formatDate(data.endDate),
                startHour: data.startHour,
                endHour: data.endHour,
                managerId: data.managerId,
            };

            const endpoint = `${API_BASE_URL}records/update/time-record/${selectedRecord.timeRecordId}`;

            const response = await fetch(endpoint, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Erro ao atualizar o registro.");
            }

            toast({
                title: "Sucesso",
                description: "Registro atualizado com sucesso!",
            });

            setEditModalOpen(false);
            setSelectedRecord(null);
            form.reset();

            // Atualiza o relatório após a edição (sempre busca o detalhado após edição de um registro detalhado)
            handleSearch();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast({
                title: "Erro",
                description: error.message || "Ocorreu um erro ao salvar o registro.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                {/* Gradient Background */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))',
                        backgroundSize: '400% 400%',
                        animation: 'gradient-flow 15s ease-in-out infinite'
                    }}
                />

                {/* Floating Geometric Shapes */}
                <div className="absolute inset-0">
                    <div
                        className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3"
                        style={{
                            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), transparent)',
                            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                            animation: 'float-shapes 20s ease-in-out infinite'
                        }}
                    />
                    <div
                        className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
                        style={{
                            background: 'linear-gradient(45deg, hsl(var(--black-primary) / 0.05), transparent)',
                            borderRadius: '70% 30% 30% 70% / 70% 70% 30% 30%',
                            animation: 'float-shapes 25s ease-in-out infinite reverse'
                        }}
                    />
                    <div
                        className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
                        style={{
                            background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent)',
                            borderRadius: '50%',
                            animation: 'float-shapes 18s ease-in-out infinite 5s'
                        }}
                    />
                </div>
            </div>


            <Header onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="container mx-auto px-4 py-20 relative z-10">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                        Relatório De Horas
                    </h1>
                    <p className="text-muted-foreground">
                        Gere relatórios detalhados com informações completas de registros de ponto
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-2 border-primary/20 shadow-card bg-gradient-to-br from-card via-card to-primary/5">
                        <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <CalendarIcon className="h-5 w-5 text-primary" />
                                </div>
                                Selecionar Datas
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Escolha múltiplas datas para o relatório detalhado
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Card className="border-l-4 border-l-primary shadow-card w-fit mx-auto">
                                <Calendar
                                    mode="multiple"
                                    selected={selectedDates}
                                    onSelect={setSelectedDates}
                                    className="w-full pointer-events-auto"
                                    classNames={{
                                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-calendar-selected-hover/20 hover:text-calendar-selected transition-colors duration-200 relative", day_selected: "bg-calendar-selected text-calendar-selected-foreground hover:bg-calendar-selected-hover hover:text-calendar-selected-foreground focus:bg-calendar-selected focus:text-calendar-selected-foreground font-semibold shadow-sm z-10",
                                        day_today: "bg-transparent text-foreground font-bold border-2 border-primary hover:bg-primary/10",
                                        day_outside: "text-muted-foreground opacity-50 aria-selected:bg-calendar-selected/50 aria-selected:text-calendar-selected-foreground aria-selected:opacity-80",
                                        day_disabled: "text-muted-foreground opacity-50",
                                        day_range_middle: "aria-selected:bg-calendar-selected/20 aria-selected:text-calendar-selected",
                                        day_hidden: "invisible",
                                    }}
                                    modifiers={{
                                        selected: selectedDates,
                                        holiday: holidays,
                                    }}
                                    modifiersClassNames={{
                                        elected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground z-10",
                                        holiday: "bg-destructive/10 text-destructive font-semibold border border-destructive/20 hover:bg-destructive/20 hover:text-destructive !text-destructive",

                                    }}
                                />
                            </Card>
                            <div className="mt-4 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/20 backdrop-blur-sm">
                                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                                    💡 Dica de uso:
                                </h4>
                                <p className="text-xs text-muted-foreground mb-4">
                                    1. Clique em qualquer data no calendário para selecioná-la.<br />
                                    2. Os feriados nacionais brasileiros estão destacados automaticamente.
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    3. O status FOLGA é atribuido automaticamente no dia que não houver registro<br />
                                    4. Em caso de FALTA, navegue até a pagina  <a
                                        href="status-do-registro"
                                        className="text-primary hover:text-primary/80 underline font-semibold transition-colors duration-150 ml-1"
                                    >
                                        Status do registro
                                    </a>  para realizar a mudança
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    5.Relatorio Simples:<br />
                                    - Retorna o data dia trabalhado, as horas trabalhadas e o saldo do dia selecionado.
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    5.Relatorio Detalhado:<br />
                                    - Retorna todos os registros realizados na data selecionada.<br />
                                    - Retorna o status do registros também.
                                    - Ao cliclar no registro é possivel solicitar a alteração (data e hora).
                                </p>
                                <div className="grid grid-cols-1 gap-3 text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-primary/80 shadow-sm"></div>
                                        <span className="text-muted-foreground">Data selecionada</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded bg-destructive/10 border-2 border-destructive/30"></div>
                                        <span className="text-destructive font-semibold">Feriado nacional (Texto em Vermelho)</span>

                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded border-2 border-primary/50 bg-transparent"></div>
                                        <span className="text-muted-foreground">Hoje</span>
                                    </div>
                                </div>
                            </div>

                            {selectedDates.length > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/30 backdrop-blur-sm">
                                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                        Datas Selecionadas ({selectedDates.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDates.map((date, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-sm border border-primary/20"
                                            >
                                                {format(date, "dd/MM/yyyy", { locale: ptBR })}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-card via-card/95 to-primary/10 backdrop-blur-sm">
                        <CardHeader className="border-b border-primary/30 bg-gradient-to-r from-primary/15 via-primary/8 to-secondary/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
                            <CardTitle className="text-foreground flex items-center gap-3 relative z-10">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/80 animate-pulse shadow-sm"></div>
                                </div>
                                <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent font-semibold">
                                    Parâmetros do Relatório
                                </span>
                            </CardTitle>
                            <CardDescription className="text-muted-foreground relative z-10 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-primary/50"></div>
                                Configure os filtros para o relatório detalhado
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6 relative">
                            <div className="absolute inset-0 opacity-5">
                                <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-full blur-sm"></div>
                                <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-secondary to-secondary/60 rounded-full blur-sm"></div>
                            </div>

                            {/* NOVO: SEÇÃO DE TIPO DE RELATÓRIO (Radio Check) */}
                            <div className="space-y-3 relative border-b border-primary/20 pb-4">
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Tipo de Relatório
                                </Label>
                                <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 flex space-x-6">
                                    {/* Checkbox Detalhado (Radio Check 1) */}
                                    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                        <Checkbox
                                            id="report-detailed"
                                            checked={reportType === "detailed"}
                                            onCheckedChange={() => handleReportTypeChange("detailed")}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                                        />
                                        <Label htmlFor="report-detailed" className="text-sm cursor-pointer font-medium">
                                            Detalhado
                                        </Label>
                                    </div>

                                    {/* Checkbox Simples (Radio Check 2) */}
                                    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                        <Checkbox
                                            id="report-simple"
                                            checked={reportType === "simple"}
                                            onCheckedChange={() => handleReportTypeChange("simple")}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                                        />
                                        <Label htmlFor="report-simple" className="text-sm cursor-pointer font-medium">
                                            Simples
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            {/* FIM: SEÇÃO DE TIPO DE RELATÓRIO */}

                            <div className="space-y-3 relative">
                                <Label htmlFor="reference-time" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Carga Horária diária
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="reference-time"
                                        type="time"
                                        value={referenceTime}
                                        onChange={(e) => setReferenceTime(e.target.value)}
                                        className="focus:border-primary focus:ring-2 focus:ring-primary/20 border-primary/20 bg-gradient-to-r from-background to-primary/5 transition-all duration-200"
                                    />
                                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                                    Horário de referência para cálculo do relatório
                                </p>
                            </div>

                            <div className="space-y-3 relative">
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Funcionário
                                </Label>
                                <Select value={selectedEmployee} onValueChange={setSelectedEmployee} disabled={isPartner}>
                                    <SelectTrigger className="focus:border-primary focus:ring-2 focus:ring-primary/20 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:bg-primary/10 transition-all duration-200">
                                        <SelectValue placeholder="Selecione um funcionário" />
                                    </SelectTrigger>
                                    <SelectContent className="border-primary/20">
                                        {employees.map((employee) => (
                                            <SelectItem
                                                key={employee.employeeId}
                                                value={employee.employeeId}
                                                className="hover:bg-primary/10 focus:bg-primary/10"
                                            >
                                                {employee.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* INÍCIO DA SEÇÃO DE STATUS DO FUNCIONÁRIO COM CHECKBOX/RADIO LOGIC */}
                            <div className="space-y-3 relative">
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Status do Funcionário
                                </Label>
                                <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 flex space-x-6">
                                    {/* Checkbox Ativo (Radio Check 1) */}
                                    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                        <Checkbox
                                            id="emp-active"
                                            checked={employeeActive === "active"}
                                            onCheckedChange={() => handleEmployeeStatusChange("active")}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                                        />
                                        <Label htmlFor="emp-active" className="text-sm cursor-pointer font-medium">
                                            Ativo
                                        </Label>
                                    </div>

                                    {/* Checkbox Inativo (Radio Check 2) */}
                                    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                        <Checkbox
                                            id="emp-inactive"
                                            checked={employeeActive === "inactive"}
                                            onCheckedChange={() => handleEmployeeStatusChange("inactive")}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                                        />
                                        <Label htmlFor="emp-inactive" className="text-sm cursor-pointer font-medium">
                                            Inativo
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            {/* FIM DA SEÇÃO DE STATUS DO FUNCIONÁRIO COM CHECKBOX/RADIO LOGIC */}

                            <div className="space-y-3 relative">
                                <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Registro Ativo/Inativo
                                </Label>
                                <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
                                    <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary/10 transition-colors">
                                        <Checkbox
                                            id="active"
                                            checked={isActive}
                                            onCheckedChange={(checked) => setIsActive(checked as boolean)}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/50"
                                        />
                                        <Label
                                            htmlFor="active"
                                            className="text-sm text-muted-foreground cursor-pointer font-medium"
                                        >
                                            {isActive ? "Incluir registros ativos" : "Incluir registros inativos"}
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 relative">
                                <Label className={`text-sm font-semibold text-foreground flex items-center gap-2 ${reportType === "simple" ? 'opacity-50' : ''}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    Status
                                </Label>
                                <Select value={status} onValueChange={setStatus} disabled={reportType === "simple"}>
                                    <SelectTrigger className={`focus:border-primary focus:ring-2 focus:ring-primary/20 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:bg-primary/10 transition-all duration-200 ${reportType === "simple" ? 'opacity-50' : ''}`}>
                                        <SelectValue placeholder="Selecione um status" />
                                    </SelectTrigger>
                                    <SelectContent className="border-primary/20">
                                        {statusOptions.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                                className="hover:bg-primary/10 focus:bg-primary/10 hover:text-foreground focus:text-foreground"
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-muted-foreground/50"></div>
                                    Status dos registros a serem filtrados
                                </p>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-primary/20 relative">
                                <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>

                                <Button
                                    onClick={reportType === "detailed" ? handleSearch : handleSimpleSearch} // Ação condicional
                                    size="lg"
                                    className="w-full font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-primary/25 transition-all duration-200 relative overflow-hidden"
                                    disabled={reportType === "detailed" && !status} // Se detalhado, exige status
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                                    <Search className="mr-2 h-4 w-4" />
                                    <span className="relative z-10">Buscar</span>
                                </Button>

                                <Button
                                    onClick={reportType === "detailed" ? handleDownload : handleSimpleDownload} // Ação condicional
                                    size="lg"
                                    variant="outline"
                                    className="w-full font-semibold border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-foreground hover:text-primary shadow-md hover:shadow-primary/20 transition-all duration-200 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                                    <Download className="mr-2 h-4 w-4" />
                                    <span className="relative z-10">Download</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* EXIBIÇÃO CONDICIONAL DOS RESULTADOS */}

                {/* 1. RELATÓRIO DETALHADO */}
                {(reportType === "detailed" && reportData.length > 0) && (
                    <Card className="mt-8 border-2 border-primary/20 shadow-lg bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Resultados do Relatório Detalhado</CardTitle>
                            <CardDescription>{reportData.length} registro(s) detalhado(s) encontrado(s).</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reportData.map((item, index) => (
                                    <Card
                                        key={item.id || index}
                                        className="border-l-4 border-primary shadow-md cursor-pointer hover:shadow-lg hover:border-primary/80 transition-all duration-300 group"
                                        onClick={() => handleEditRecord(item)}
                                    >
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-center pb-2 border-b">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4 text-primary" />
                                                    <span className="font-bold text-lg text-foreground">{item.startWork}</span>
                                                </div>
                                                <Badge className={`${getStatusColor(item.statusRecord)}`}>
                                                    {statusOptions.find(opt => opt.value === item.statusRecord)?.label || item.statusRecord}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                <div className="font-medium text-muted-foreground">Entrada:</div>
                                                <div className="text-right font-semibold text-foreground">{item.startHour}</div>

                                                <div className="font-medium text-muted-foreground">Saída:</div>
                                                <div className="text-right font-semibold text-foreground">{item.endHour}</div>

                                                <div className="font-medium text-muted-foreground">Horas Trabalhadas</div>
                                                <div className="text-right font-semibold text-foreground">{item.hoursWork}</div>

                                                <div className="font-medium text-muted-foreground">Saldo:</div>
                                                <div className={`text-right font-bold ${item.balance.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>{item.balance}</div>
                                            </div>
                                            <div className="flex justify-end pt-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit className="h-4 w-4" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 2. RELATÓRIO SIMPLES */}
                {(reportType === "simple" && reportDataSimple && reportDataSimple.days.length > 0) && (
                    <Card className="mt-8 border-2 border-primary/20 shadow-lg bg-card/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Resultados do Relatório Simples</CardTitle>
                            <CardDescription>Resumo de saldo para {reportDataSimple.days.length} dias.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="mb-4 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                                <h3 className="text-xl font-bold mb-2 text-foreground">Totais do Período</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="font-medium text-muted-foreground">Total de Horas Trabalhadas:</div>
                                    <div className="text-right font-bold text-foreground">{reportDataSimple.totalHoursWorked}</div>

                                    <div className="font-medium text-muted-foreground">Saldo Total:</div>
                                    <div className={`text-right font-bold ${reportDataSimple.totalBalance.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>
                                        {reportDataSimple.totalBalance}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-primary/20 rounded-lg overflow-hidden border border-primary/20">
                                    <thead className="bg-primary/10">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                                                Data
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                                                Horas Trabalhadas
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                                                Saldo do Dia
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-card divide-y divide-primary/10">
                                        {reportDataSimple.days.map((day, index) => {
                                            const parts = day.startDate.split('/');
                                            const dayDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                            const isDayOffOrHoliday = isHoliday(dayDate) || day.totalHours === '00:00';

                                            return (
                                                <tr key={index} className={`hover:bg-primary/5 transition-colors ${isDayOffOrHoliday ? 'bg-secondary/5 text-muted-foreground/80' : ''}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground flex items-center gap-2">
                                                        <CalendarIcon className="h-4 w-4 text-primary/70" />
                                                        {day.startDate}
                                                        {isHoliday(dayDate) && <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/5">Feriado</Badge>}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">{day.totalHours}</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${day.balance.startsWith('-') ? 'text-destructive' : 'text-green-600'}`}>
                                                        {day.balance}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-l-4 border-l-primary shadow-card">
                    <div>
                        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
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
                                    <form onSubmit={form.handleSubmit(handleSaveRecord)} className="space-y-6 pt-4">
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
                                            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
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
                    </div>
                </Card>

            </main>
        </div>
    );
};

export default RelatorioDetalhado;