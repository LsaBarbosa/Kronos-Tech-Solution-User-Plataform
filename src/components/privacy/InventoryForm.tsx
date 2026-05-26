import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_PATHS } from "@/config/app-routes";
import {
  createInventory,
  getInventoryByProcessCode,
  updateInventory,
  type CreateInventoryPayload,
  type DataProcessingInventoryResponse,
} from "@/service/inventory.service";

export const InventoryForm = () => {
  const navigate = useNavigate();
  const { processCode } = useParams<{ processCode: string }>();
  const [loading, setLoading] = useState(!!processCode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<DataProcessingInventoryResponse | null>(null);
  const [formData, setFormData] = useState<CreateInventoryPayload>({
    processCode: "",
    processName: "",
    dataCategory: "",
    dataFields: "",
    dataSubjectCategory: "",
    purpose: "",
    legalBasis: "",
    sensitiveData: false,
    sourceSystem: "",
    storageLocation: "",
    retentionPolicyCode: "",
    externalSharing: "",
    internationalTransfer: false,
    securityMeasures: "",
    active: true,
  });

  const loadInventory = useCallback(async () => {
    try {
      if (!processCode) return;
      setLoading(true);
      const data = await getInventoryByProcessCode(processCode);
      setInventory(data);
      setFormData({
        processCode: data.processCode,
        processName: data.processName,
        dataCategory: data.dataCategory,
        dataFields: data.dataFields,
        dataSubjectCategory: data.dataSubjectCategory,
        purpose: data.purpose,
        legalBasis: data.legalBasis,
        sensitiveData: data.sensitiveData,
        sourceSystem: data.sourceSystem,
        storageLocation: data.storageLocation || "",
        retentionPolicyCode: data.retentionPolicyCode || "",
        externalSharing: data.externalSharing || "",
        internationalTransfer: data.internationalTransfer,
        securityMeasures: data.securityMeasures || "",
        active: data.active,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar inventário");
    } finally {
      setLoading(false);
    }
  }, [processCode]);

  useEffect(() => {
    if (processCode) {
      loadInventory();
    }
  }, [processCode, loadInventory]);

  const handleChange = (field: keyof CreateInventoryPayload, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (inventory) {
        await updateInventory(inventory.inventoryId, formData);
      } else {
        await createInventory(formData);
      }

      navigate(APP_PATHS.lgpdAdminInventory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar inventário");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isEditing = !!inventory;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(APP_PATHS.lgpdAdminInventory)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? "Editar Processo" : "Novo Processo"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Atualize as informações do processo" : "Cadastre um novo processo de tratamento de dados"}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Erro</h3>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Código do Processo *
                </label>
                <Input
                  value={formData.processCode}
                  onChange={(e) => handleChange("processCode", e.target.value)}
                  placeholder="ex: AUTH_PASSWORD_LOGIN"
                  disabled={isEditing}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Nome do Processo *
                </label>
                <Input
                  value={formData.processName}
                  onChange={(e) => handleChange("processName", e.target.value)}
                  placeholder="ex: Autenticação por Senha"
                  required
                />
              </div>
            </div>
          </div>

          {/* Data Classification */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Classificação de Dados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Categoria de Dados *
                </label>
                <Input
                  value={formData.dataCategory}
                  onChange={(e) => handleChange("dataCategory", e.target.value)}
                  placeholder="ex: Credenciais"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Categoria de Titular *
                </label>
                <Input
                  value={formData.dataSubjectCategory}
                  onChange={(e) => handleChange("dataSubjectCategory", e.target.value)}
                  placeholder="ex: Funcionário"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Campos de Dados *
              </label>
              <textarea
                value={formData.dataFields}
                onChange={(e) => handleChange("dataFields", e.target.value)}
                placeholder="ex: email, senha_hash, tentativas_falhas"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Legal Basis */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Base Legal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Base Legal *
                </label>
                <Input
                  value={formData.legalBasis}
                  onChange={(e) => handleChange("legalBasis", e.target.value)}
                  placeholder="ex: Execução de Contrato"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Finalidade *
                </label>
                <Input
                  value={formData.purpose}
                  onChange={(e) => handleChange("purpose", e.target.value)}
                  placeholder="ex: Autenticação de Usuário"
                  required
                />
              </div>
            </div>
          </div>

          {/* Data Sensitivity */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Sensibilidade dos Dados</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.sensitiveData}
                  onChange={(e) => handleChange("sensitiveData", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-foreground">Contém dados sensíveis (art. 5, II da LGPD)</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.internationalTransfer}
                  onChange={(e) => handleChange("internationalTransfer", e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-foreground">Realiza transferência internacional de dados</span>
              </label>
            </div>
          </div>

          {/* Systems and Storage */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Sistemas e Armazenamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Sistema de Origem *
                </label>
                <Input
                  value={formData.sourceSystem}
                  onChange={(e) => handleChange("sourceSystem", e.target.value)}
                  placeholder="ex: Kronos Identity Service"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Local de Armazenamento
                </label>
                <Input
                  value={formData.storageLocation}
                  onChange={(e) => handleChange("storageLocation", e.target.value)}
                  placeholder="ex: Banco de Dados Postgresql"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Código de Política de Retenção
              </label>
              <Input
                value={formData.retentionPolicyCode}
                onChange={(e) => handleChange("retentionPolicyCode", e.target.value)}
                placeholder="ex: RETENTION_AUTHENTICATION"
              />
            </div>
          </div>

          {/* Data Sharing */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Compartilhamento de Dados</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Compartilhamento Externo
              </label>
              <Input
                value={formData.externalSharing}
                onChange={(e) => handleChange("externalSharing", e.target.value)}
                placeholder="ex: Não ou Órgãos Governamentais"
              />
            </div>
          </div>

          {/* Security Measures */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Medidas de Segurança</h2>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Medidas de Segurança Implementadas
              </label>
              <textarea
                value={formData.securityMeasures}
                onChange={(e) => handleChange("securityMeasures", e.target.value)}
                placeholder="ex: Hash Seguro (BCRYPT), Conexão TLS"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleChange("active", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-foreground">Ativo</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(APP_PATHS.lgpdAdminInventory)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Processo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
