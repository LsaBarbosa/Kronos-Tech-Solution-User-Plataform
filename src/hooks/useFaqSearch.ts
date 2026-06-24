import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchFaqs } from "@/service/faq.service";
import { queryKeys } from "@/lib/query-keys";

const DEBOUNCE_MS = 300;

export const useFaqSearch = (
  rawQuery: string,
  screen?: string,
  page = 0,
  size = 10
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(rawQuery);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [rawQuery]);

  const enabled = debouncedQuery.trim().length >= 1;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.faqSearch(debouncedQuery, screen, page),
    queryFn: () => searchFaqs(debouncedQuery, screen, page, size),
    enabled,
    staleTime: 30_000,
  });

  return {
    results: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading: enabled && isLoading,
    isError,
    error,
    isEmpty: enabled && !isLoading && (data?.content ?? []).length === 0,
  };
};
