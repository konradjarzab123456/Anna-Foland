import { createContext, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { defaultContent } from "@/content/defaultContent";
import api from "@/lib/api";

const SiteContext = createContext(null);

export const useSite = () => useContext(SiteContext);

function deepMerge(base, patch) {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(base) || Array.isArray(patch) || typeof base !== "object" || typeof patch !== "object" || base === null) return patch;
  const out = { ...base };
  for (const k of Object.keys(patch)) out[k] = deepMerge(base[k], patch[k]);
  return out;
}

export function SiteProvider({ children }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => (await api.get("/content")).data.data,
    staleTime: 0,
    refetchOnMount: true,
  });

  const content = useMemo(() => deepMerge(defaultContent, data ?? null), [data]);

  const value = useMemo(
    () => ({ content, isLoading, hasServerData: !!data, refresh: () => queryClient.invalidateQueries(["site-content"]) }),
    [content, isLoading, data, queryClient]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export default SiteContext;
