// src/pages/Avisos.tsx

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; 
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Eye, AlertTriangle, Info, Loader2, Trash2, User } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

// 💡 NOVO: Importa o hook customizado com toda a lógica e estado
import { useMessages } from "@/hooks/useMessages"; 
// 💡 NOVO: Importa Tipos e utilitários de exibição pura
import { Message, MessagePriority, getMessagePriorityTitle, getRecipientIndicatorText } from "@/types/message";

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
        return <Badge variant="secondary" className="bg-muted text-muted-foreground border-muted-foreground/20">Normal</Badge>;
      case 'ALERT':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-200">Alerta</Badge>;
      case 'CRITICAL':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Crítico</Badge>;
      default:
        return <Badge variant="secondary">Aviso</Badge>;
    }
};

const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
};

const getRecipientIndicatorUI = (message: Message) => {
    const { text, isSenderOnly } = getRecipientIndicatorText(message);
    const className = isSenderOnly
      ? "flex items-center gap-2 text-sm text-yellow-700 font-medium bg-yellow-100/50 px-2 py-1 rounded-full border border-yellow-200"
      : "flex items-center gap-2 text-sm text-foreground/80 font-medium bg-muted/50 px-2 py-1 rounded-full border border-border/50";
    
    return (
        <div className={className}>
            <User className="h-4 w-4" />
            <span>{text}</span>
        </div>
    );
};


const Avisos = () => {
    // 💡 Estado de UI (Sidebar) é o único estado mantido localmente
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    
    // 💡 HOOK: Desestrutura toda a lógica e estado
    const {
        messages,
        userRole,
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
    } = useMessages();


    const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
    
    // Permissão para deletar: MANAGER ou CTO
    const canDelete = userRole === 'MANAGER' || userRole === 'CTO';

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
                                <Bell className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent page-title">
                                    Avisos
                                </h1>
                                <p className="text-muted-foreground">Visualize todas as comunicações importantes</p>
                            </div>
                            {/* Botão de criar aviso (visível para Manager/CTO) */}
                            {canDelete && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => navigate("/criar-aviso")}
                                    className="ml-4 bg-success hover:bg-success/90"
                                >
                                    <Bell className="h-4 w-4 mr-2" /> Novo Aviso
                                </Button>
                            )}
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <span className="ml-2 text-primary">Carregando avisos...</span>
                        </div>
                    )}

                    {error && (
                        <Card className="text-center py-12 border-destructive bg-destructive/10">
                            <CardContent>
                                <h3 className="text-xl font-semibold text-destructive mb-2">
                                    Erro ao carregar mensagens
                                </h3>
                                <p className="text-destructive/80">
                                    {error}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {!isLoading && !error && messages.length > 0 && (
                        <div className="grid gap-4">
                            {messages.map((message) => (
                                <Card
                                    key={message.messageId}
                                    className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${message.priority === 'NORMAL' ? 'border-l-muted-foreground' :
                                        message.priority === 'ALERT' ? 'border-l-yellow-600' :
                                            'border-l-destructive'
                                        }`}
                                    onClick={() => handleOpenMessage(message)}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {getIconePorTipo(message.priority)}
                                                <div className="flex-1">
                                                    <CardTitle className={`text-lg font-semibold`}>
                                                        {message.title} 
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground/80 mt-1">
                                                        {getMessagePriorityTitle(message.priority)}
                                                    </p>
                                                </div>
                                            </div>
                                            {getBadgePorTipo(message.priority)}
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="pt-2 pb-4">
                                        <div className="flex items-center justify-between">
                                            
                                            {/* INDICADOR DE DESTINATÁRIO NA LISTA */}
                                            {getRecipientIndicatorUI(message)}

                                            <div className="flex items-center gap-4 ml-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatarData(message.createdAt)}
                                                </div>
                                                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Ver detalhes
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && !error && messages.length === 0 && (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Bell className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                                    Nenhum aviso disponível
                                </h3>
                                <p className="text-muted-foreground">
                                    Quando houver novos avisos, eles aparecerão aqui.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </main>
                
                {/* DIALOG PRINCIPAL - Detalhes do Aviso */}
                <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
                    <DialogContent className="max-w-xl sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-foreground">
                                {selectedMessage && getIconePorTipo(selectedMessage.priority)}
                                {selectedMessage && selectedMessage.title}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground/80 -mt-1 ml-9">
                                {selectedMessage && getMessagePriorityTitle(selectedMessage.priority)}
                            </p>
                        </DialogHeader>

                        {selectedMessage && (
                            <div className="space-y-4">
                                {/* INDICADOR DE DESTINATÁRIO NO MODAL */}
                                <div className="pb-3 border-b border-border/50">
                                        {getRecipientIndicatorUI(selectedMessage)}
                                </div>

                                <div className="flex items-center justify-between border-b pb-3 border-border/50">
                                    {getBadgePorTipo(selectedMessage.priority)}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {formatarData(selectedMessage.createdAt)}
                                    </div>
                                </div>
                    
                                <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                                        {selectedMessage.messageText}
                                    </p>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            {/* Permite deletar se tiver permissão */}
                            {selectedMessage && canDelete && ( 
                                <Button
                                    variant="destructive"
                                    onClick={handleConfirmDelete}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Deletar Mensagem
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                {/* DIALOG - Confirmação de Exclusão */}
                <Dialog open={isConfirmDeleteDialogOpen} onOpenChange={handleCancelDelete}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl text-destructive">
                                <AlertTriangle className="h-6 w-6" /> Confirmação de Exclusão
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-muted-foreground">
                                Você tem certeza que deseja excluir este aviso? Esta ação é irreversível.
                            </p>
                            {selectedMessage && (
                                <p className="mt-2 text-sm font-medium text-foreground">
                                    Aviso: <span className="italic line-clamp-1 font-bold">{selectedMessage.title}</span>
                                </p>
                            )}
                        </div>
                        <DialogFooter className="sm:justify-between gap-2">
                            <Button
                                variant="outline"
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteMessage}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                        
            </div>
        </div>
    );
};

export default Avisos;