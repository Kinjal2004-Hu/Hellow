import { google } from "googleapis";
import { GmailToken } from "../models/GmailToken.js";
import { createOAuth2WithRefresh } from "./google.js";

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

export async function getGmailTokens(userId: string) {
  const tokenDoc = await GmailToken.findOne({ userId });
  if (!tokenDoc) return null;
  return tokenDoc;
}

export async function refreshAccessToken(userId: string): Promise<string | null> {
  const tokenDoc = await GmailToken.findOne({ userId });
  if (!tokenDoc) return null;

  try {
    const auth = createOAuth2WithRefresh(tokenDoc.refreshToken);
    const { credentials } = await auth.refreshAccessToken();

    if (credentials.access_token) {
      tokenDoc.accessToken = credentials.access_token;
      tokenDoc.expiryDate = new Date(credentials.expiry_date!);
      await tokenDoc.save();
    }

    return tokenDoc.accessToken;
  } catch {
    return null;
  }
}

export async function fetchInbox(
  userId: string,
  maxResults: number = 20,
): Promise<GmailMessage[]> {
  const tokenDoc = await getGmailTokens(userId);
  if (!tokenDoc) throw new Error("Gmail not connected");

  let accessToken = tokenDoc.accessToken;

  const auth = createOAuth2WithRefresh(tokenDoc.refreshToken);
  auth.setCredentials({
    access_token: accessToken,
    refresh_token: tokenDoc.refreshToken,
    expiry_date: tokenDoc.expiryDate.getTime(),
  });

  const gmail = google.gmail({ version: "v1", auth });

  const listRes = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: "in:inbox",
  });

  const messageIds = listRes.data.messages ?? [];
  const messages: GmailMessage[] = [];

  for (const msg of messageIds) {
    const detail = await gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "full",
    });

    const headers = detail.data.payload?.headers ?? [];
    const from = headers.find((h) => h.name === "From")?.value ?? "";
    const to = headers.find((h) => h.name === "To")?.value ?? "";
    const subject = headers.find((h) => h.name === "Subject")?.value ?? "(no subject)";
    const date = headers.find((h) => h.name === "Date")?.value ?? "";

    const body = extractBody(detail.data.payload);
    const isUnread = !detail.data.labelIds?.includes("SEEN");

    messages.push({
      id: detail.data.id!,
      threadId: detail.data.threadId!,
      from,
      to,
      subject,
      snippet: detail.data.snippet ?? "",
      body,
      date,
      isUnread,
      labelIds: detail.data.labelIds ?? [],
    });
  }

  return messages;
}

export async function fetchMessage(userId: string, messageId: string): Promise<GmailMessage> {
  const tokenDoc = await getGmailTokens(userId);
  if (!tokenDoc) throw new Error("Gmail not connected");

  const auth = createOAuth2WithRefresh(tokenDoc.refreshToken);
  auth.setCredentials({
    access_token: tokenDoc.accessToken,
    refresh_token: tokenDoc.refreshToken,
    expiry_date: tokenDoc.expiryDate.getTime(),
  });

  const gmail = google.gmail({ version: "v1", auth });

  const detail = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const headers = detail.data.payload?.headers ?? [];
  const from = headers.find((h) => h.name === "From")?.value ?? "";
  const to = headers.find((h) => h.name === "To")?.value ?? "";
  const subject = headers.find((h) => h.name === "Subject")?.value ?? "(no subject)";
  const date = headers.find((h) => h.name === "Date")?.value ?? "";

  return {
    id: detail.data.id!,
    threadId: detail.data.threadId!,
    from,
    to,
    subject,
    snippet: detail.data.snippet ?? "",
    body: extractBody(detail.data.payload),
    date,
    isUnread: !detail.data.labelIds?.includes("SEEN"),
    labelIds: detail.data.labelIds ?? [],
  };
}

function extractBody(payload: any): string {
  if (payload?.body?.data) {
    return Buffer.from(payload.body.data, "base64url").toString("utf-8");
  }
  if (payload?.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64url").toString("utf-8");
      }
      if (part.mimeType === "text/html" && part.body?.data) {
        const html = Buffer.from(part.body.data, "base64url").toString("utf-8");
        return html.replace(/<[^>]*>/g, "").substring(0, 2000);
      }
      if (part.parts) {
        const nested = extractBody(part);
        if (nested) return nested;
      }
    }
  }
  return "";
}

export async function disconnectGmail(userId: string): Promise<void> {
  await GmailToken.deleteOne({ userId });
}
