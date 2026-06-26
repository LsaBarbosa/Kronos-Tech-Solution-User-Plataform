import { useQuery } from "@tanstack/react-query";
import { getContextualFaqs } from "@/service/faq.service";
import { queryKeys } from "@/lib/query-keys";

export const useContextualFaqs = (screen: string, limit = 5) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.faqContextual(screen, limit),
    queryFn: () => getContextualFaqs(screen, limit),
    staleTime: 60_000,
    enabled: Boolean(screen),
  });

  return {
    items: data?.items ?? [],
    isLoading,
    isError,
    error,
    isEmpty: !isLoading && (data?.items ?? []).length === 0,
  };
};
