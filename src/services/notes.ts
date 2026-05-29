import { api } from "./api";

export interface NoteDTO {
  _id: string;
  userId: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFolderDTO {
  _id: string;
  userId: string;
  name: string;
  parentId: string | null;
}

export async function fetchNotes(params?: { folderId?: string; tag?: string; archived?: boolean }): Promise<NoteDTO[]> {
  const { data } = await api.get("/notes", { params });
  return data;
}

export async function fetchNote(noteId: string): Promise<NoteDTO> {
  const { data } = await api.get(`/notes/${noteId}`);
  return data;
}

export async function createNote(payload: { title?: string; content?: string; folderId?: string; tags?: string[] }): Promise<NoteDTO> {
  const { data } = await api.post("/notes", payload);
  return data;
}

export async function updateNote(noteId: string, payload: Partial<Pick<NoteDTO, "title" | "content" | "folderId" | "tags" | "isArchived">>): Promise<NoteDTO> {
  const { data } = await api.put(`/notes/${noteId}`, payload);
  return data;
}

export async function deleteNote(noteId: string): Promise<void> {
  await api.delete(`/notes/${noteId}`);
}

export async function fetchNoteFolders(): Promise<NoteFolderDTO[]> {
  const { data } = await api.get("/notes/folders/all");
  return data;
}

export async function createNoteFolder(payload: { name: string; parentId?: string }): Promise<NoteFolderDTO> {
  const { data } = await api.post("/notes/folders", payload);
  return data;
}

export async function updateNoteFolder(folderId: string, name: string): Promise<NoteFolderDTO> {
  const { data } = await api.put(`/notes/folders/${folderId}`, { name });
  return data;
}

export async function deleteNoteFolder(folderId: string): Promise<void> {
  await api.delete(`/notes/folders/${folderId}`);
}
