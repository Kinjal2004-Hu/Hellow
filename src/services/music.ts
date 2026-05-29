import { api } from "./api";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number;
}

export interface MusicRoomDTO {
  _id: string;
  code: string;
  roles: Record<string, string>;
  members: string[];
  currentTrack: MusicTrack | null;
  queue: MusicTrack[];
  isPlaying: boolean;
  position: number;
  powerToAll: boolean;
  createdAt: string;
}

export async function fetchMusicRooms(): Promise<MusicRoomDTO[]> {
  const { data } = await api.get("/music");
  return data;
}

export async function createMusicRoom(): Promise<MusicRoomDTO> {
  const { data } = await api.post("/music");
  return data;
}

export async function fetchMusicRoom(code: string): Promise<MusicRoomDTO> {
  const { data } = await api.get(`/music/${code}`);
  return data;
}

export async function joinMusicRoom(code: string): Promise<MusicRoomDTO> {
  const { data } = await api.post(`/music/${code}/join`);
  return data;
}

export async function leaveMusicRoom(code: string): Promise<void> {
  await api.post(`/music/${code}/leave`);
}

export async function addToQueue(code: string, track: MusicTrack): Promise<MusicRoomDTO> {
  const { data } = await api.post(`/music/${code}/queue`, track);
  return data;
}

export async function removeFromQueue(code: string, index: number): Promise<MusicRoomDTO> {
  const { data } = await api.delete(`/music/${code}/queue/${index}`);
  return data;
}

export async function clearQueue(code: string): Promise<MusicRoomDTO> {
  const { data } = await api.delete(`/music/${code}/queue`);
  return data;
}

export async function skipTrack(code: string): Promise<MusicRoomDTO> {
  const { data } = await api.post(`/music/${code}/skip`);
  return data;
}
