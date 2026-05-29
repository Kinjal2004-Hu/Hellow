import { api } from "./api";

export interface YouTubeRoomDTO {
  _id: string;
  code: string;
  roles: Record<string, string>;
  participants: string[];
}

export async function createYouTubeRoom(): Promise<YouTubeRoomDTO> {
  const { data } = await api.post("/youtube/rooms");
  return data;
}

export async function fetchYouTubeRoom(code: string): Promise<YouTubeRoomDTO> {
  const { data } = await api.get(`/youtube/rooms/${code}`);
  return data;
}
