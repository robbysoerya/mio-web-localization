import { api } from "../api";
import { Project } from "../types";

export async function fetchProjects(): Promise<Project[]> {
  return (await api.get("/projects")).data;
}

export async function fetchProject(id: string): Promise<Project> {
  return (await api.get(`/projects/${id}`)).data;
}

export async function createProject(data: {
  name: string;
  description?: string;
}): Promise<Project> {
  return (await api.post("/projects", data)).data;
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string }
): Promise<Project> {
  return (await api.patch(`/projects/${id}`, data)).data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}
