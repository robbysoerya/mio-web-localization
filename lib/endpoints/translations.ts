import { api } from "../api";
import {
  Translation,
  TranslationListItem,
  PaginatedResponse,
  TranslationSearchParams,
} from "../types";

export interface BulkUploadResult {
  created?: number;
  updated?: number;
  skipped?: number;
  message?: string;
  error?: boolean;
}

export async function fetchTranslations(keyId: string): Promise<Translation[]> {
  return (await api.get(`/translations/key/${keyId}`)).data;
}

export async function fetchTranslationsList(
  params?: TranslationSearchParams
): Promise<PaginatedResponse<TranslationListItem>> {
  return (await api.get("/translations", { params })).data;
}

export async function searchTranslations(
  params: TranslationSearchParams
): Promise<PaginatedResponse<TranslationListItem>> {
  return (await api.get("/translations/search", { params })).data;
}

export async function updateTranslation(id: string, value: string) {
  return (await api.patch(`/translations/${id}`, { value })).data;
}
export async function createTranslation(data: {
  keyId: string;
  locale: string;
  value: string;
}): Promise<Translation> {
  return (await api.post("/translations", data)).data;
}

export async function deleteTranslation(id: string): Promise<void> {
  await api.delete(`/translations/${id}`);
}

export async function bulkUploadTranslations(
  featureId: string,
  file: File
): Promise<BulkUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  return (
    await api.post(`/translations/bulk-upload?featureId=${featureId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  ).data;
}

export async function bulkUpsertTranslations(data: {
  keyId: string;
  translations: Array<{ locale: string; value: string }>;
}): Promise<Translation[]> {
  return (await api.post("/translations/bulk-upsert", data)).data;
}
