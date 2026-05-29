import { api } from "./api";

export interface DriveFileDTO {
  _id: string;
  userId: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  folderId: string | null;
  isStarred: boolean;
  isTrashed: boolean;
  source: "user" | "app";
  createdAt: string;
}

export interface DriveFolderDTO {
  _id: string;
  userId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export async function listFiles(folderId?: string, search?: string, trashed?: boolean): Promise<DriveFileDTO[]> {
  const params: any = {};
  if (folderId) params.folderId = folderId;
  if (search) params.search = search;
  if (trashed) params.trashed = "true";
  const { data } = await api.get("/drive/files", { params });
  return data;
}

export async function getFile(id: string): Promise<DriveFileDTO> {
  const { data } = await api.get(`/drive/files/${id}`);
  return data;
}

export async function uploadFile(file: File, folderId?: string, source?: string): Promise<DriveFileDTO> {
  const form = new FormData();
  form.append("file", file);
  if (folderId) form.append("folderId", folderId);
  if (source) form.append("source", source);
  const { data } = await api.post("/drive/files/upload", form);
  return data;
}

export async function updateFile(id: string, updates: Partial<Pick<DriveFileDTO, "name" | "folderId" | "isStarred">>): Promise<DriveFileDTO> {
  const { data } = await api.put(`/drive/files/${id}`, updates);
  return data;
}

export async function deleteFile(id: string): Promise<void> {
  await api.delete(`/drive/files/${id}`);
}

export async function restoreFile(id: string): Promise<DriveFileDTO> {
  const { data } = await api.post(`/drive/files/${id}/restore`);
  return data;
}

export async function permanentDeleteFile(id: string): Promise<void> {
  await api.delete(`/drive/files/${id}/permanent`);
}

export async function saveAppContent(name: string, content: string, mimeType?: string, folderId?: string): Promise<DriveFileDTO> {
  const { data } = await api.post("/drive/files/save-content", { name, content, mimeType, folderId });
  return data;
}

export async function listFolders(parentId?: string): Promise<DriveFolderDTO[]> {
  const params: any = {};
  if (parentId) params.parentId = parentId;
  const { data } = await api.get("/drive/folders", { params });
  return data;
}

export async function createFolder(name: string, parentId?: string): Promise<DriveFolderDTO> {
  const { data } = await api.post("/drive/folders", { name, parentId });
  return data;
}

export async function updateFolder(id: string, updates: Partial<Pick<DriveFolderDTO, "name" | "parentId">>): Promise<DriveFolderDTO> {
  const { data } = await api.put(`/drive/folders/${id}`, updates);
  return data;
}

export async function deleteFolder(id: string): Promise<void> {
  await api.delete(`/drive/folders/${id}`);
}
