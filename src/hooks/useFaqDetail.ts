import { useQuery } from "@tanstack/react-query";
import { getFaqById } from "@/service/faq.service";
import { queryKeys } from "@/lib/query-keys";

export const useFaqDetail = (faqId: string | null) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.faqDetail(faqId ?? ""),
    queryFn: () => getFaqById(faqId!),
    enabled: Boolean(faqId),
    staleTime: 60_000,
  });

  return {
    faq: data ?? null,
    isLoading: Boolean(faqId) && isLoading,
    isError,
    error,
  };
};
