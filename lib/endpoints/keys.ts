import { api } from "../api";
import { KeyItem, KeyItemWithFeature } from "../types";

export async function fetchKeys(featureId: string): Promise<KeyItem[]> {
  return (await api.get(`/keys/feature/${featureId}`)).data;
}

export async function fetchKey(keyId: string): Promise<KeyItemWithFeature> {
  return (await api.get(`/keys/${keyId}`)).data;
}
export async function createKey(data: {
  key: string;
  description?: string;
  featureId: string;
}): Promise<KeyItem> {
  return (await api.post("/keys", data)).data;
}

export async function updateKey(
  id: string,
  data: { key?: string; description?: string }
): Promise<KeyItem> {
  return (await api.patch(`/keys/${id}`, data)).data;
}

export async function deleteKey(id: string): Promise<void> {
  await api.delete(`/keys/${id}`);
}
