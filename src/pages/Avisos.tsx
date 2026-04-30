// src/pages/Avisos.tsx

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; 
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ChevronLeft, ChevronRight, Eye, AlertTriangle, Info, Loader2, Trash2, User } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

import { useMessages } from "@/hooks/useMessages"; 
import type { Message, MessagePriority} from "@/types/message";
import { getMessagePriorityTitle, getRecipientIndicatorText } from "@/types/message";

// --- FUNÇÕES DE APRESENTAÇÃO (Puras) ---

const getIconePorTipo = (priority: MessagePriority) => {
    switch (priority) {
      case 'NORMAL':
        return <Info className="h-4 w-4 text-muted-foreground" />;
      case 'ALERT':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4 text-destructive" />; 
      default:
        return <Bell className="h-4 w-4" />;
    }
};

const getBadgePorTipo = (priority: MessagePriority) => {
    switch (priority) {
      case 'NORMAL':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground border-muted-foreground/20 whitespace-nowrap">Normal</Badge>;
      case 'ALERT':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-200 whitespace-nowrap">Alerta</Badge>;
      case 'CRITICAL':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200 whitespace-nowrap">Crítico</Badge>;
      default:
        return <Badge variant="secondary" className="whitespace-nowrap">Aviso</Badge>;
    }
};

const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
};

const getRecipientIndicatorUI = (message: Message) => {
    const { text, isSenderOnly } = getRecipientIndicatorText(message);
    const className = isSenderOnly
      ? "flex items-center gap-2 text-sm text-yellow-700 font-medium bg-yellow-100/50 px-3 py-1.5 rounded-full border border-yellow-200 w-fit"
      : "flex items-center gap-2 text-sm text-foreground/80 font-medium bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 w-fit";
    
    return (
        <div className={className}>
            <User className="h-4 w-4" />
            <span className="truncate max-w-[200px] sm:max-w-none">{text}</span>
        </div>
    );
};


const Avisos = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    
    const {
        messages,
        userRole,
        currentPage,
        hasPreviousPage,
        hasNextPage,
        selectedMessage,
        isLoading,
        isDeleting,
        isDialogOpen,
        isConfirmDeleteDialogOpen,
        error,
        handleOpenMessage,
        handleCloseDialog,
        handleConfirmDelete,
        handleCancelDelete,
        handleDeleteMessage,
        handlePreviousPage,
        handleNextPage,
    } = useMessages();


    const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
    
    const canDelete = userRole === 'MANAGER' || userRole === 'CTO';

    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Animado mantido conforme original */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))',
            backgroundSize: '400% 400%',
            animation: 'gradient-flow 15s ease-in-out infinite'
          }}
        />
        {/* Formas animadas mantidas... */}
      </div>

      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden h-screen"> {/* Adicionado h-screen para fixar layout */}
        <Header toggleSidebar={handleToggleSidebar} />

        {/* Adicionado overflow-y-auto para scroll interno correto */}
        <main className="flex-1 overflow-y-auto pt-16 px-4 sm:px-8 py-6 sm:py-10 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
                    
                    {/* CABEÇALHO RESPONSIVO */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg shrink-0"> {/* shrink-0 para não amassar o ícone */}
                                <Bell className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl mt-16 sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                                    Avisos
                                </h1>
                                <p className="text-sm sm:text-base text-muted-foreground">Comunicações importantes</p>
                            </div>
                        </div>
                        
                        {/* Botão adaptável: largura total no mobile */}
                        {canDelete && (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => navigate("/criar-aviso")}
                                className="w-full sm:w-auto bg-success hover:bg-success/90"
                            >
                                <Bell className="h-4 w-4 mr-2" /> Novo Aviso
                            </Button>
                        )}
                    </div>

                    {isLoading && (
                        <div className="flex flex-col justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <span className="text-primary animate-pulse">Carregando avisos...</span>
                        </div>
                    )}

                    {error && (
                        <Card className="text-center py-12 border-destructive bg-destructive/5 mx-auto max-w-lg">
                            <CardContent>
                                <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-destructive mb-2">
                                    Não foi possível carregar
                                </h3>
                                <p className="text-sm text-destructive/80">
                                    {error}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && !error && messages.length > 0 && (
                        <div className="grid gap-4 pb-20"> {/* pb-20 para dar espaço no final do scroll */}
                            {messages.map((message) => (
                                <Card
                                    key={message.messageId}
                                    className={`group cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 active:scale-[0.99] ${
                                        message.priority === 'NORMAL' ? 'border-l-muted-foreground' :
                                        message.priority === 'ALERT' ? 'border-l-yellow-600' :
                                        'border-l-destructive'
                                    }`}
                                    onClick={() => handleOpenMessage(message)}
                                >
                                    <CardHeader className="pb-3 px-4 sm:px-6 pt-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 overflow-hidden">
                                                <div className="mt-1 shrink-0">
                                                    {getIconePorTipo(message.priority)}
                                                </div>
                                                <div className="min-w-0"> {/* min-w-0 permite truncate funcionar em flex child */}
                                                    <CardTitle className="text-base sm:text-lg font-semibold leading-tight truncate pr-2">
                                                        {message.title} 
                                                    </CardTitle>
                                                    <p className="text-xs sm:text-sm text-muted-foreground/80 mt-1">
                                                        {getMessagePriorityTitle(message.priority)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                {getBadgePorTipo(message.priority)}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="px-4 sm:px-6 pt-0 pb-4">
                                        {/* LAYOUT RESPONSIVO: Flex Col no Mobile -> Flex Row no Desktop */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                                            
                                            {/* Indicador de Destinatário */}
                                            {getRecipientIndicatorUI(message)}

                                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                                                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {formatarData(message.createdAt)}
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8 text-xs sm:text-sm hover:bg-primary/10 -mr-2 sm:mr-0">
                                                    <Eye className="h-3.5 w-3.5 mr-2" />
                                                    <span className="hidden xs:inline">Detalhes</span>
                                                    <span className="xs:hidden">Ver</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={!hasPreviousPage || isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Anterior
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Página {currentPage + 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={!hasNextPage || isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    Próxima
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4">
                            <div className="bg-muted/30 p-6 rounded-full mb-4">
                                <Bell className="h-10 w-10 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                                Tudo tranquilo por aqui
                            </h3>
                            <p className="text-sm text-muted-foreground/80 max-w-xs mx-auto">
                                Nenhum aviso novo foi postado para você no momento.
                            </p>
                        </div>
                    )}
                </main>
                
                {/* DIALOG DETALHES - Ajustado padding e tamanho */}
                <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                    <DialogContent className="w-[95%] max-w-2xl rounded-xl shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
                        <DialogHeader className="p-4 sm:p-6 border-b border-border/40 bg-muted/5">
                            <DialogTitle className="flex items-start gap-3 text-lg sm:text-xl font-bold text-foreground leading-tight">
                                <div className="mt-1 shrink-0">{selectedMessage && getIconePorTipo(selectedMessage.priority)}</div>
                                {selectedMessage && selectedMessage.title}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-2 ml-7">
                                {selectedMessage && getBadgePorTipo(selectedMessage.priority)}
                                <span className="text-xs text-muted-foreground">
                                    {selectedMessage && getMessagePriorityTitle(selectedMessage.priority)}
                                </span>
                            </div>
                        </DialogHeader>

                        {selectedMessage && (
                            <div className="p-4 sm:p-6 overflow-y-auto">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground pb-4 border-b border-border/40">
                                         {getRecipientIndicatorUI(selectedMessage)}
                                         <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {formatarData(selectedMessage.createdAt)}
                                         </div>
                                    </div>
                    
                                    <div className="p-4 bg-muted/20 rounded-lg border border-border/50 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                                        {selectedMessage.messageText}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <DialogFooter className="p-4 sm:p-6 border-t border-border/40 bg-muted/5">
                            {selectedMessage && canDelete && ( 
                                <Button
                                    variant="destructive"
                                    onClick={handleConfirmDelete}
                                    className="w-full sm:w-auto"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Deletar Mensagem
                                </Button>
                            )}
                            <Button variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto mt-2 sm:mt-0">
                                Fechar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                {/* DIALOG DELETE - Mantido simples, apenas garantindo responsividade */}
                <Dialog open={isConfirmDeleteDialogOpen} onOpenChange={handleCancelDelete}>
                    <DialogContent className="w-[90%] sm:max-w-md rounded-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg text-destructive">
                                <AlertTriangle className="h-5 w-5" /> Excluir Aviso?
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-sm text-muted-foreground">
                                Esta ação não pode ser desfeita. O aviso será removido para todos os usuários.
                            </p>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={handleCancelDelete} disabled={isDeleting} className="w-full sm:w-auto">
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteMessage} disabled={isDeleting} className="w-full sm:w-auto">
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Confirmar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                        
            </div>
        </div>
    );
};

export default Avisos;
