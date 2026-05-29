import { api } from "./api";

export interface RoomDTO {
  _id: string;
  name: string;
  kind: "channel" | "dm";
  category: "saved" | "hooked" | "trash";
  role: string | null;
  unread: number;
  memberCount: number;
  lastActivity?: string;
}

export interface MessageDTO {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  tempId?: string | null;
  createdAt: string;
}

export interface MemberDTO {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
}

export interface UserSearchResult {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

export async function fetchRooms(): Promise<{ rooms: RoomDTO[] }> {
  const { data } = await api.get("/chat/rooms");
  return data;
}

export async function createRoom(payload: {
  name: string;
  kind?: string;
  category?: string;
}): Promise<RoomDTO> {
  const { data } = await api.post("/chat/rooms", payload);
  return data;
}

export async function updateRoom(
  roomId: string,
  payload: { name?: string; category?: string },
): Promise<void> {
  await api.put(`/chat/rooms/${roomId}`, payload);
}

export async function deleteRoom(roomId: string): Promise<void> {
  await api.delete(`/chat/rooms/${roomId}`);
}

export async function fetchMessages(
  roomId: string,
  before?: string,
  limit?: number,
): Promise<{ messages: MessageDTO[] }> {
  const params: any = {};
  if (before) params.before = before;
  if (limit) params.limit = limit;
  const { data } = await api.get(`/chat/rooms/${roomId}/messages`, { params });
  return data;
}

export async function fetchMembers(roomId: string): Promise<{ members: MemberDTO[] }> {
  const { data } = await api.get(`/chat/rooms/${roomId}/members`);
  return data;
}

export async function inviteToRoom(roomId: string, email: string): Promise<void> {
  await api.post(`/chat/rooms/${roomId}/invite`, { email });
}

export async function kickMember(roomId: string, userId: string): Promise<void> {
  await api.post(`/chat/rooms/${roomId}/kick`, { userId });
}

export async function promoteMember(roomId: string, userId: string): Promise<void> {
  await api.post(`/chat/rooms/${roomId}/promote`, { userId });
}

export async function demoteMember(roomId: string, userId: string): Promise<void> {
  await api.post(`/chat/rooms/${roomId}/demote`, { userId });
}

export async function searchUsers(q: string): Promise<{ users: UserSearchResult[] }> {
  const { data } = await api.get("/chat/users/search", { params: { q } });
  return data;
}
