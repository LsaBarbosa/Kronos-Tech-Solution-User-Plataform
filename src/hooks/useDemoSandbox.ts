import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDemoSandbox,
  deleteDemoSandbox,
  fetchDemoStatus,
  validateDemoSandbox,
} from "@/service/demo-sandbox.service";

const DEMO_STATUS_KEY = ["demo", "status"] as const;

export const useDemoStatus = () =>
  useQuery({
    queryKey: DEMO_STATUS_KEY,
    queryFn: fetchDemoStatus,
    staleTime: 30_000,
  });

export const useDemoCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDemoSandbox,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEMO_STATUS_KEY });
    },
  });
};

export const useDemoDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDemoSandbox,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEMO_STATUS_KEY });
    },
  });
};

export const useDemoValidate = () =>
  useMutation({ mutationFn: validateDemoSandbox });
