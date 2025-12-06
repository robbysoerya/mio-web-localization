import { api } from "../api";
import { TranslationStatistics } from "../types";

export async function fetchStatistics(
  featureId?: string
): Promise<TranslationStatistics> {
  const params = featureId ? { featureId } : {};
  return (await api.get("/translations/statistics", { params })).data;
}
