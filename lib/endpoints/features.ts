import { api } from "../api";
import { Feature } from "../types";

export async function fetchFeatures(projectId?: string): Promise<Feature[]> {
  const params = projectId ? { projectId } : {};
  return (await api.get("/features", { params })).data;
}

export async function fetchFeature(id: string): Promise<Feature> {
  return (await api.get(`/features/${id}`)).data;
}

export async function createFeature(data: {
  name: string;
  description?: string;
  projectId: string;
}): Promise<Feature> {
  return (await api.post("/features", data)).data;
}

export async function updateFeature(
  id: string,
  data: { name?: string; description?: string }
): Promise<Feature> {
  return (await api.patch(`/features/${id}`, data)).data;
}

export async function deleteFeature(id: string): Promise<void> {
  await api.delete(`/features/${id}`);
}
