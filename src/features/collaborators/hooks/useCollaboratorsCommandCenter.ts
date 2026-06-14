import { useCallback, useEffect, useMemo, useState } from "react";
import { preloadCsrfToken } from "@/service/csrf.service";
import { fetchEmployeeList, toggleUserStatus, updateCollaborator, updateUser } from "@/service/collaborator-management.service";
import { listUsers } from "@/service/user.service";
import { normalizeServiceError } from "@/service/helpers/service-error.helper";
import { useToast } from "@/hooks/use-toast";
import type {
  CollaboratorEditorDraft,
  CollaboratorFilters,
  CollaboratorGroupFilter,
  CollaboratorRecord,
  CollaboratorStatusFilter,
  CollaboratorSummary,
  CollaboratorMutationTarget,
} from "../types/collaborator-view.types";
import {
  defaultCollaboratorFilters,
  filterCollaborators,
  findRecordById,
  isFilterActive,
  mergeCollaborators,
  summarizeCollaborators,
} from "../utils/collaborator-view.helpers";
import { createCollaboratorEditorDraft } from "../utils/collaborator-formatters";

type LoadState = "idle" | "loading" | "loaded" | "error";

type UpdateField = keyof CollaboratorEditorDraft;

type MutationKind = "toggle" | "biometric";

const sanitizeNumeric = (value: string) => value.replace(/\D/g, "");

const buildCollaboratorEmployeePayload = (record: CollaboratorRecord, draft: CollaboratorEditorDraft) => {
  const payload: Record<string, unknown> = {};

  if (draft.fullName.trim() && draft.fullName !== record.fullName) {
    payload.fullName = draft.fullName.trim();
  }

  const cpfDigits = sanitizeNumeric(draft.maskedCpf);
  if (cpfDigits.length === 11 && cpfDigits !== record.maskedCpf.replace(/\D/g, "")) {
    payload.cpf = cpfDigits;
  }

  const pisDigits = sanitizeNumeric(draft.pis);
  if (pisDigits && pisDigits !== record.pis?.replace(/\D/g, "")) {
    payload.pis = pisDigits;
  }

  if (draft.jobPosition.trim() && draft.jobPosition !== record.jobPosition) {
    payload.jobPosition = draft.jobPosition.trim();
  }

  if (draft.email.trim() && draft.email !== record.email) {
    payload.email = draft.email.trim();
  }

  const salaryNumeric = draft.salary ? Number(draft.salary.replace(",", ".")) : Number.NaN;
  if (Number.isFinite(salaryNumeric) && salaryNumeric !== record.salary) {
    payload.salary = salaryNumeric;
  }

  const phoneDigits = sanitizeNumeric(draft.phone);
  if (phoneDigits && phoneDigits !== record.phone.replace(/\D/g, "")) {
    payload.phone = phoneDigits;
  }

  if (draft.homeOffice !== record.homeOffice) {
    payload.homeOffice = draft.homeOffice;
  }

  if (draft.workStartTime && draft.workStartTime !== record.workStartTime) {
    payload.workStartTime = draft.workStartTime;
  }

  if (draft.workEndTime && draft.workEndTime !== record.workEndTime) {
    payload.workEndTime = draft.workEndTime;
  }

  if (draft.breakStartTime && draft.breakStartTime !== record.breakStartTime) {
    payload.breakStartTime = draft.breakStartTime;
  }

  if (draft.breakEndTime && draft.breakEndTime !== record.breakEndTime) {
    payload.breakEndTime = draft.breakEndTime;
  }

  if (draft.scheduleType && draft.scheduleType !== record.scheduleType) {
    payload.scheduleType = draft.scheduleType;
  }

  if (draft.scaleStartDate !== (record.scaleStartDate ?? "")) {
    payload.scaleStartDate = draft.scaleStartDate || null;
  }

  if (draft.preferredDayOff !== (record.preferredDayOff ?? "")) {
    payload.preferredDayOff = draft.preferredDayOff || null;
  }

  const weekendOffIndex = draft.weekendOffIndex ? Number(draft.weekendOffIndex) : null;
  if (weekendOffIndex !== (record.weekendOffIndex ?? null)) {
    payload.weekendOffIndex = Number.isFinite(weekendOffIndex as number) ? weekendOffIndex : null;
  }

  if (JSON.stringify(draft.fixedWorkDays) !== JSON.stringify(record.fixedWorkDays ?? [])) {
    payload.fixedWorkDays = draft.fixedWorkDays;
  }

  if (draft.postalCode.trim() || draft.number.trim()) {
    const existingPostalCode = record.address?.postalCode ?? "";
    const existingNumber = record.address?.number ?? "";
    const hasAddressChange =
      sanitizeNumeric(draft.postalCode) !== existingPostalCode ||
      draft.number.trim() !== existingNumber;

    if (hasAddressChange) {
      payload.address = {
        postalCode: sanitizeNumeric(draft.postalCode) || existingPostalCode,
        number: draft.number.trim() || existingNumber,
      };
    }
  }

  return payload;
};

const buildCollaboratorUserPayload = (record: CollaboratorRecord, draft: CollaboratorEditorDraft) => {
  if (!record.hasAccount || !record.userId) {
    return {};
  }

  const payload: Record<string, unknown> = {};

  if (draft.username.trim() && draft.username !== record.username) {
    payload.username = draft.username.trim();
  }

  if (draft.role && draft.role !== record.role) {
    payload.role = draft.role;
  }

  return payload;
};

export const useCollaboratorsCommandCenter = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [records, setRecords] = useState<CollaboratorRecord[]>([]);
  const [filters, setFilters] = useState<CollaboratorFilters>(defaultCollaboratorFilters);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);
  const [editingCollaboratorId, setEditingCollaboratorId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CollaboratorEditorDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mutationTarget, setMutationTarget] = useState<CollaboratorMutationTarget | null>(null);
  const [biometricTarget, setBiometricTarget] = useState<CollaboratorRecord | null>(null);

  const { toast } = useToast();

  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const fetchCollaborators = useCallback(async () => {
    setLoadState("loading");

    try {
      const [employees, users] = await Promise.all([
        fetchEmployeeList(null),
        listUsers(null),
      ]);

      const merged = mergeCollaborators(employees, users);
      setRecords(merged);
      setLoadState("loaded");

      setSelectedCollaboratorId((currentId) => {
        if (currentId && merged.some((item) => item.employeeId === currentId)) {
          return currentId;
        }

        return merged[0]?.employeeId ?? null;
      });
    } catch (error) {
      const serviceError = normalizeServiceError(error);
      setLoadState("error");
      toast({
        title: "Erro ao carregar colaboradores",
        description: serviceError.message || "Não foi possível carregar a central de pessoas.",
        variant: "destructive",
      });
      setRecords([]);
    }
  }, [toast]);

  useEffect(() => {
    void fetchCollaborators();
  }, [fetchCollaborators]);

  const filteredCollaborators = useMemo(
    () => filterCollaborators(records, filters),
    [filters, records]
  );

  const summary = useMemo<CollaboratorSummary>(() => summarizeCollaborators(records), [records]);

  const selectedCollaborator = useMemo(
    () => findRecordById(filteredCollaborators, selectedCollaboratorId) ?? findRecordById(records, selectedCollaboratorId),
    [filteredCollaborators, records, selectedCollaboratorId]
  );

  useEffect(() => {
    if (!filteredCollaborators.length) {
      return;
    }

    if (!selectedCollaboratorId || !filteredCollaborators.some((item) => item.employeeId === selectedCollaboratorId)) {
      setSelectedCollaboratorId(filteredCollaborators[0].employeeId);
    }
  }, [filteredCollaborators, selectedCollaboratorId]);

  const selectedEditingRecord = useMemo(
    () => findRecordById(records, editingCollaboratorId),
    [editingCollaboratorId, records]
  );

  useEffect(() => {
    if (!selectedEditingRecord) {
      return;
    }

    if (!draft) {
      setDraft(createCollaboratorEditorDraft(selectedEditingRecord));
    }
  }, [draft, selectedEditingRecord]);

  const hasActiveFilters = isFilterActive(records, filters);

  const clearFilters = useCallback(() => {
    setFilters(defaultCollaboratorFilters);
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((current) => ({ ...current, search }));
  }, []);

  const setStatusFilter = useCallback((status: CollaboratorStatusFilter) => {
    setFilters((current) => ({ ...current, status }));
  }, []);

  const setGroupFilter = useCallback((group: CollaboratorGroupFilter) => {
    setFilters((current) => ({ ...current, group }));
  }, []);

  const selectCollaborator = useCallback((employeeId: string) => {
    setSelectedCollaboratorId(employeeId);
  }, []);

  const startEditing = useCallback((record: CollaboratorRecord) => {
    setSelectedCollaboratorId(record.employeeId);
    setEditingCollaboratorId(record.employeeId);
    setDraft(createCollaboratorEditorDraft(record));
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingCollaboratorId(null);
    setDraft(null);
  }, []);

  const updateDraftField = useCallback(<K extends UpdateField>(field: K, value: CollaboratorEditorDraft[K]) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }, []);

  const saveEditing = useCallback(async (): Promise<boolean> => {
    if (!selectedEditingRecord || !draft || isSaving) {
      return false;
    }

    setIsSaving(true);

    try {
      await preloadCsrfToken();

      const employeePayload = buildCollaboratorEmployeePayload(selectedEditingRecord, draft);
      const userPayload = buildCollaboratorUserPayload(selectedEditingRecord, draft);

      if (Object.keys(employeePayload).length === 0 && Object.keys(userPayload).length === 0) {
        toast({
          title: "Nenhuma alteração",
          description: "Nenhum dado foi modificado para salvar.",
        });
        setEditingCollaboratorId(null);
        setDraft(null);
        return true;
      }

      const mutations: Array<Promise<unknown>> = [];

      if (Object.keys(employeePayload).length > 0) {
        mutations.push(updateCollaborator(selectedEditingRecord.employeeId, employeePayload));
      }

      if (Object.keys(userPayload).length > 0 && selectedEditingRecord.userId) {
        mutations.push(updateUser(selectedEditingRecord.userId, userPayload as Parameters<typeof updateUser>[1]));
      }

      await Promise.all(mutations);
      await fetchCollaborators();

      toast({
        title: "Atualização concluída",
        description: "Os dados do colaborador foram salvos.",
      });
      setEditingCollaboratorId(null);
      setDraft(null);
      return true;
    } catch (error) {
      const serviceError = normalizeServiceError(error);
      toast({
        title: "Erro ao salvar",
        description: serviceError.message || "Não foi possível atualizar o colaborador.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [draft, fetchCollaborators, isSaving, selectedEditingRecord, toast]);

  const requestToggle = useCallback((record: CollaboratorRecord) => {
    if (!record.userId) {
      toast({
        title: "Conta ausente",
        description: "Esse colaborador ainda não possui conta vinculada.",
        variant: "destructive",
      });
      return;
    }

    setSelectedCollaboratorId(record.employeeId);
    setMutationTarget({
      employeeId: record.employeeId,
      userId: record.userId,
      fullName: record.fullName,
      username: record.username,
      active: record.active,
    });
  }, [toast]);

  const clearToggleTarget = useCallback(() => {
    setMutationTarget(null);
  }, []);

  const confirmToggle = useCallback(async (): Promise<boolean> => {
    if (!mutationTarget?.userId || isSaving) {
      return false;
    }

    setIsSaving(true);

    try {
      await preloadCsrfToken();
      await toggleUserStatus(mutationTarget.userId);
      await fetchCollaborators();
      toast({
        title: "Status atualizado",
        description: `O acesso de ${mutationTarget.fullName} foi ${mutationTarget.active ? "desativado" : "reativado"}.`,
      });
      setMutationTarget(null);
      return true;
    } catch (error) {
      const serviceError = normalizeServiceError(error);
      toast({
        title: "Erro ao atualizar status",
        description: serviceError.message || "Não foi possível alterar o status do usuário.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [fetchCollaborators, isSaving, mutationTarget, toast]);

  const openBiometricEnrollment = useCallback((record: CollaboratorRecord) => {
    setSelectedCollaboratorId(record.employeeId);
    setBiometricTarget(record);
  }, []);

  const closeBiometricEnrollment = useCallback(() => {
    setBiometricTarget(null);
  }, []);

  return {
    sidebarOpen,
    handleToggleSidebar,
    loadState,
    isLoading: loadState === "loading",
    isError: loadState === "error",
    records,
    filteredCollaborators,
    summary,
    filters,
    hasActiveFilters,
    selectedCollaborator,
    selectedCollaboratorId,
    editingCollaboratorId,
    editingCollaborator: selectedEditingRecord,
    draft,
    isSaving,
    mutationTarget,
    biometricTarget,
    setSearch,
    setStatusFilter,
    setGroupFilter,
    clearFilters,
    selectCollaborator,
    startEditing,
    cancelEditing,
    updateDraftField,
    saveEditing,
    requestToggle,
    clearToggleTarget,
    confirmToggle,
    openBiometricEnrollment,
    closeBiometricEnrollment,
    refresh: fetchCollaborators,
  };
};
