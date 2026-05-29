import { api } from "./api";

export interface WorkspaceSharedState {
  currentUrl: string;
  currentRoute: string;
  panels: Record<string, boolean>;
  scrollPosition: { x: number; y: number };
  activeAnnotations: string[];
  activeBookmarks: string[];
}

export interface WorkspaceSessionDTO {
  _id: string;
  code: string;
  name: string;
  hostId: string;
  members: string[];
  roles: Record<string, string>;
  sharedState: WorkspaceSharedState;
  followMode: boolean;
  isLive: boolean;
  createdAt: string;
  endedAt: string | null;
}

export async function listSessions(): Promise<WorkspaceSessionDTO[]> {
  const { data } = await api.get("/workspace");
  return data;
}

export async function createSession(name?: string): Promise<WorkspaceSessionDTO> {
  const { data } = await api.post("/workspace", { name });
  return data;
}

export async function getSession(code: string): Promise<WorkspaceSessionDTO> {
  const { data } = await api.get(`/workspace/${code}`);
  return data;
}

export async function joinSession(code: string): Promise<WorkspaceSessionDTO> {
  const { data } = await api.post(`/workspace/${code}/join`);
  return data;
}

export async function leaveSession(code: string): Promise<void> {
  await api.post(`/workspace/${code}/leave`);
}

export async function updateSharedState(code: string, sharedState: Partial<WorkspaceSharedState>): Promise<WorkspaceSharedState> {
  const { data } = await api.put(`/workspace/${code}/state`, { sharedState });
  return data;
}

export async function setFollowMode(code: string, followMode: boolean): Promise<void> {
  await api.put(`/workspace/${code}/follow`, { followMode });
}

export async function endSession(code: string): Promise<void> {
  await api.post(`/workspace/${code}/end`);
}
