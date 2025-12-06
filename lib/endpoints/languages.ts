import { api } from "../api";
import { Language } from "../types";

export async function fetchLanguages(): Promise<Language[]> {
  return (await api.get("/languages")).data;
}

export async function createLanguage(data: {
  locale: string;
  name: string;
  isActive: boolean;
}): Promise<Language> {
  return (await api.post("/languages", data)).data;
}

export async function updateLanguage(
  id: string,
  data: { locale?: string; name?: string; isActive?: boolean }
): Promise<Language> {
  return (await api.patch(`/languages/${id}`, data)).data;
}

export async function deleteLanguage(id: string): Promise<void> {
  await api.delete(`/languages/${id}`);
}
