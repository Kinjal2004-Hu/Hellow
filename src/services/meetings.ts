import { api } from "./api";

export interface MeetingDTO {
  _id: string;
  code: string;
  name: string;
  roles: Record<string, string>;
  participants: string[];
  createdAt: string;
  endedAt: string | null;
}

export async function fetchMeetings(): Promise<MeetingDTO[]> {
  const { data } = await api.get("/meetings");
  return data;
}

export async function createMeeting(name?: string): Promise<MeetingDTO> {
  const { data } = await api.post("/meetings", { name });
  return data;
}

export async function fetchMeeting(code: string): Promise<MeetingDTO> {
  const { data } = await api.get(`/meetings/${code}`);
  return data;
}

export async function joinMeeting(code: string): Promise<MeetingDTO> {
  const { data } = await api.post(`/meetings/${code}/join`);
  return data;
}

export async function leaveMeeting(code: string): Promise<void> {
  await api.post(`/meetings/${code}/leave`);
}

export async function endMeeting(code: string): Promise<void> {
  await api.post(`/meetings/${code}/end`);
}

export async function kickParticipant(code: string, userId: string): Promise<void> {
  await api.post(`/meetings/${code}/kick`, { userId });
}
