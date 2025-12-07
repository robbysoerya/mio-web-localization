import { api } from "../api";
import { TranslationStatistics } from "../types";

export async function fetchStatistics(
  featureId?: string,
  projectId?: string
): Promise<TranslationStatistics> {
  const params: Record<string, string> = {};
  if (featureId) params.featureId = featureId;
  if (projectId) params.projectId = projectId;
  return (await api.get("/translations/statistics", { params })).data;
}
