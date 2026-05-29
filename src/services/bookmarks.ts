import { api } from "./api";

export interface BookmarkDTO {
  _id: string;
  userId: string;
  title: string;
  url: string;
  notes: string;
  createdAt: string;
}

export async function fetchBookmarks(search?: string): Promise<BookmarkDTO[]> {
  const { data } = await api.get("/bookmarks", { params: { search } });
  return data;
}

export async function createBookmark(title: string, url: string, notes?: string): Promise<BookmarkDTO> {
  const { data } = await api.post("/bookmarks", { title, url, notes });
  return data;
}

export async function updateBookmark(id: string, updates: Partial<Pick<BookmarkDTO, "title" | "url" | "notes">>): Promise<BookmarkDTO> {
  const { data } = await api.put(`/bookmarks/${id}`, updates);
  return data;
}

export async function deleteBookmark(id: string): Promise<void> {
  await api.delete(`/bookmarks/${id}`);
}
