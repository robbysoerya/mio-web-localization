import { api } from "../api";
import { Translation } from "../types";

export interface AITranslateResponse {
  success: boolean;
  translatedCount: number;
  skippedCount: number;
  errors: string[];
  translations: Translation[];
}

export interface AITranslateBatchResponse {
  success: boolean;
  translatedCount: number;
  skippedCount: number;
  errors: string[];
  statistics: {
    totalKeys: number;
    processedKeys: number;
    estimatedTimeSeconds: number;
  };
}

export async function aiTranslateSingleKey(data: {
  keyId: string;
  targetLocales: string[];
}): Promise<AITranslateResponse> {
  return (await api.post("/translations/ai-translate", data)).data;
}

export async function aiTranslateBatch(data: {
  featureId?: string;
  projectId?: string;
  targetLocales?: string[];
}): Promise<AITranslateBatchResponse> {
  return (await api.post("/translations/ai-translate-batch", data)).data;
}
