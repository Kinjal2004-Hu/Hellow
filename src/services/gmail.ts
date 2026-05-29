import { api } from "./api";

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  isUnread: boolean;
  labelIds: string[];
}

export interface GmailStatus {
  connected: boolean;
  email: string | null;
}

export async function checkGmailStatus(): Promise<GmailStatus> {
  const { data } = await api.get("/gmail/status");
  return data;
}

export async function connectGmail(): Promise<string> {
  const { data } = await api.get("/gmail/connect");
  return data.url;
}

export async function fetchInbox(max?: number): Promise<GmailMessage[]> {
  const { data } = await api.get("/gmail/inbox", { params: { max } });
  return data;
}

export async function fetchMessage(messageId: string): Promise<GmailMessage> {
  const { data } = await api.get(`/gmail/message/${messageId}`);
  return data;
}

export async function disconnectGmail(): Promise<void> {
  await api.post("/gmail/disconnect");
}
