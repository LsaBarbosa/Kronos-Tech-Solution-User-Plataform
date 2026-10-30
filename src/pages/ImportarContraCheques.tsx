import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { ArrowLeft, CheckCircle2, FileText, Loader2, Upload, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_PATHS } from "@/config/app-routes";
import { fetchEmployeesForSelection, importPayslip, previewPayslipImport, type PayslipImportPreview } from "@/service/document.service";
import type { EmployeeListItem } from "@/types/document";
import { MAX_UPLOAD_SIZE_BYTES } from "@/types/document";

type QueueItem = { id: string; file: File; preview?: PayslipImportPreview; employeeId: string; confirmed: boolean; state: "queued" | "previewing" | "ready" | "uploading" | "done" | "error"; error?: string };
const fileId = (file: File, index: number) => `${file.name}-${file.size}-${file.lastModified}-${index}`;

export default function ImportarContraCheques() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pendingCount = useMemo(() => items.filter((item) => item.state !== "done").length, [items]);

  const addFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []); event.target.value = "";
    const valid: File[] = [];
    const problems: string[] = [];
    files.forEach((file) => {
      if (!file.name.toLowerCase().endsWith(".pdf") || (file.type && file.type !== "application/pdf")) problems.push(`${file.name}: selecione um PDF.`);
      else if (file.size > MAX_UPLOAD_SIZE_BYTES) problems.push(`${file.name}: excede o limite de 5 MB.`);
      else valid.push(file);
    });
    setError(problems.join(" "));
    if (!valid.length) return;
    try {
      const roster = employees.length ? employees : await fetchEmployeesForSelection(true);
      setEmployees(roster);
      setItems((current) => [...current, ...valid.map((file, index) => ({ id: fileId(file, current.length + index), file, employeeId: "", confirmed: false, state: "queued" as const }))]);
    } catch { setError("Não foi possível carregar os colaboradores da empresa."); }
  };

  const updateItem = (id: string, patch: Partial<QueueItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));

  const previewAll = async () => {
    setBusy(true); setError("");
    for (const item of items) {
      if (item.state === "done" || item.preview) continue;
      updateItem(item.id, { state: "previewing", error: undefined });
      try {
        const preview = await previewPayslipImport(item.file);
        updateItem(item.id, { preview, employeeId: preview.suggestedEmployeeId ?? "", confirmed: false, state: "ready" });
      } catch (cause) { updateItem(item.id, { state: "error", error: cause instanceof Error ? cause.message : "Falha ao analisar o PDF." }); }
    }
    setBusy(false);
  };

  const submitAll = async () => {
    setBusy(true); setError("");
    for (const item of items) {
      if (item.state === "done" || item.state === "uploading" || !item.preview || !item.employeeId || !item.confirmed) continue;
      updateItem(item.id, { state: "uploading", error: undefined });
      try { await importPayslip(item.file, item.employeeId, true); updateItem(item.id, { state: "done" }); }
      catch (cause) { updateItem(item.id, { state: "error", error: cause instanceof Error ? cause.message : "Falha ao enviar o contracheque." }); }
    }
    setBusy(false);
  };

  return <PageShell mainClassName="pt-24 sm:pt-32 mobile-container pb-12 space-y-6 relative z-10">
    <div className="flex items-center justify-between gap-3">
      <div><h1 className="text-2xl font-semibold">Importar contracheques</h1><p className="text-sm text-muted-foreground mt-1">Cada PDF será associado e salvo no perfil de um único colaborador.</p></div>
      <Button asChild variant="outline"><Link to={APP_PATHS.enviarDocumentoColaborador}><ArrowLeft className="h-4 w-4 mr-2"/>Voltar</Link></Button>
    </div>
    <Card><CardHeader><CardTitle>Selecionar arquivos PDF</CardTitle></CardHeader><CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">A identificação usa CPF e nome extraídos do PDF. PDFs digitalizados ou correspondências incertas podem ser associados após conferência manual. Limite de 5 MB por arquivo.</p>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={addFiles}/>
      <Button variant="outline" onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4 mr-2"/>Adicionar PDFs</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {items.length > 0 && <div className="flex flex-wrap gap-2">
        <Button onClick={previewAll} disabled={busy || items.every((item) => item.state === "done" || item.preview)}>{busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : null}Analisar PDFs</Button>
        <Button variant="secondary" onClick={submitAll} disabled={busy || !items.some((item) => item.preview && item.employeeId && item.confirmed && item.state !== "done")}>Enviar confirmados</Button>
        <Button variant="ghost" onClick={() => setItems((current) => current.filter((item) => item.state !== "done"))} disabled={busy}>Limpar concluídos</Button>
      </div>}
    </CardContent></Card>
    <div className="space-y-3">{items.map((item) => <Card key={item.id}><CardContent className="p-4 space-y-3">
      <div className="flex items-start gap-3"><FileText className="h-5 w-5 mt-0.5 text-primary shrink-0"/><div className="min-w-0 flex-1"><p className="font-medium break-all">{item.file.name}</p><p className="text-xs text-muted-foreground">{(item.file.size / 1024 / 1024).toFixed(2)} MB · {item.state === "done" ? "Enviado" : item.state === "previewing" ? "Analisando…" : item.state === "uploading" ? "Enviando…" : item.preview?.message ?? "Aguardando análise"}</p>{item.preview?.maskedCpf && <p className="text-xs text-muted-foreground mt-1">CPF identificado: {item.preview.maskedCpf}</p>}</div>
      {item.state === "done" ? <CheckCircle2 className="h-5 w-5 text-green-600"/> : <button className="text-muted-foreground" aria-label="Remover arquivo" disabled={busy} onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}><XCircle className="h-5 w-5"/></button>}</div>
      {item.preview && item.state !== "done" && <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><label className="text-sm space-y-1 block">Colaborador destinatário<select className="w-full h-10 rounded-md border bg-background px-3" value={item.employeeId} onChange={(event) => updateItem(item.id, { employeeId: event.target.value, confirmed: false })}><option value="">Selecione o colaborador</option>{employees.map((employee) => <option key={employee.employeeId} value={employee.employeeId}>{employee.fullName}</option>)}</select></label><label className="flex items-start gap-2 text-sm max-w-lg"><Checkbox checked={item.confirmed} onCheckedChange={(checked) => updateItem(item.id, { confirmed: checked === true })}/><span>Conferi este PDF e confirmo que pertence ao colaborador selecionado.</span></label></div>}
      {item.error && <p role="alert" className="text-sm text-destructive">{item.error}</p>}
    </CardContent></Card>)}</div>
    {items.length > 0 && <p className="text-xs text-muted-foreground">{pendingCount} arquivo(s) ainda não concluído(s). O envio é individual; arquivos concluídos não serão reenviados.</p>}
  </PageShell>;
}
