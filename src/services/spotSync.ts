import { api } from "./api";

export interface SpotPin {
  lat: number;
  lng: number;
  label: string;
  description: string;
  imageUrl: string | null;
  createdBy: string;
  createdAt: string;
}

export interface SpotMessage {
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface SpotSessionDTO {
  _id: string;
  code: string;
  name: string;
  hostId: string;
  members: string[];
  pins: SpotPin[];
  isLive: boolean;
  createdAt: string;
  endedAt: string | null;
}

export async function listSessions(): Promise<SpotSessionDTO[]> {
  const { data } = await api.get("/spotsync");
  return data;
}

export async function createSession(name?: string): Promise<SpotSessionDTO> {
  const { data } = await api.post("/spotsync", { name });
  return data;
}

export async function getSession(code: string): Promise<SpotSessionDTO> {
  const { data } = await api.get(`/spotsync/${code}`);
  return data;
}

export async function joinSession(code: string): Promise<SpotSessionDTO> {
  const { data } = await api.post(`/spotsync/${code}/join`);
  return data;
}

export async function leaveSession(code: string): Promise<void> {
  await api.post(`/spotsync/${code}/leave`);
}

export async function addPin(code: string, pin: Partial<SpotPin>): Promise<SpotPin> {
  const { data } = await api.post(`/spotsync/${code}/pins`, pin);
  return data;
}

export async function getMessages(code: string): Promise<SpotMessage[]> {
  const { data } = await api.get(`/spotsync/${code}/messages`);
  return data;
}

export async function sendMessage(code: string, content: string): Promise<SpotMessage> {
  const { data } = await api.post(`/spotsync/${code}/messages`, { content });
  return data;
}

export async function removePin(code: string, pinIndex: number): Promise<void> {
  await api.delete(`/spotsync/${code}/pins/${pinIndex}`);
}

export async function endSession(code: string): Promise<void> {
  await api.post(`/spotsync/${code}/end`);
}
