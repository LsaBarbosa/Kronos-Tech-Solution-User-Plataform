import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Upload, Download, FileText, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface MedicalDocument {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
}

const AtestadoMedico = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<MedicalDocument[]>([
    {
      id: "1",
      name: "atestado_medico_janeiro_2024.pdf",
      uploadDate: "2024-01-15",
      size: "245 KB"
    },
    {
      id: "2", 
      name: "atestado_medico_dezembro_2023.pdf",
      uploadDate: "2023-12-10",
      size: "198 KB"
    }
  ]);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simular upload - em produção seria uma requisição POST com ?type=MEDICAL
      const newDocument: MedicalDocument = {
        id: Date.now().toString(),
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${Math.round(file.size / 1024)} KB`
      };
      
      setDocuments(prev => [newDocument, ...prev]);
      toast({
        title: "Arquivo enviado com sucesso",
        description: `${file.name} foi adicionado aos seus documentos.`,
      });
      
      // Reset input
      event.target.value = '';
    }
  };

  const handleDownload = (document: MedicalDocument) => {
    // Simular download - em produção seria uma requisição GET com ?type=MEDICAL
    toast({
      title: "Download iniciado",
      description: `Baixando ${document.name}...`,
    });
  };

  const handleDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    toast({
      title: "Documento removido",
      description: "O arquivo foi removido com sucesso.",
    });
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

      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="pt-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">Documentos - Atestados Médicos</h1>
            <p className="text-lg text-muted-foreground">
              Gerencie seus atestados médicos de forma fácil e segura
            </p>
          </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Upload className="h-6 w-6 text-primary" />
                Upload de Atestado
              </CardTitle>
              <CardDescription>
                Envie seus atestados médicos em formato PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 hover:border-primary/50 transition-colors">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Clique para selecionar ou arraste seus arquivos aqui
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Arquivo
                    </span>
                  </Button>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
              </p>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Seus Atestados ({documents.length})
              </CardTitle>
              <CardDescription>
                Lista de todos os seus atestados médicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum atestado encontrado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Faça o upload do seu primeiro atestado
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((document, index) => (
                    <div key={document.id}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {document.name}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(document.uploadDate).toLocaleDateString('pt-BR')}
                               </span>
                               <span>{document.size}</span>
                             </div>
                           </div>
                         </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(document)}
                            className="hover:bg-primary hover:text-primary-foreground"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(document.id)}
                            className="hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {index < documents.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Upload Fácil</h3>
                <p className="text-sm text-muted-foreground">
                  Envie seus atestados de forma rápida e segura
                </p>
              </div>
              <div>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Organização</h3>
                <p className="text-sm text-muted-foreground">
                  Mantenha todos seus documentos organizados em um só lugar
                </p>
              </div>
              <div>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Acesso Rápido</h3>
                <p className="text-sm text-muted-foreground">
                  Baixe seus documentos quando precisar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
};

export default AtestadoMedico;