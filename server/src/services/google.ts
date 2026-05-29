import { google } from "googleapis";
import { env } from "../config/env.js";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_CALLBACK_URL,
);

export function getGoogleAuthURL(): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
}

export function getGmailAuthURL(): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.readonly",
    ],
  });
}

export async function getGoogleProfile(code: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture: string;
}> {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  return {
    id: data.id!,
    email: data.email!,
    name: data.name!,
    picture: data.picture!,
  };
}

export async function getGoogleTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}> {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens as any;
}

export function createOAuth2WithRefresh(refreshToken: string) {
  const client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALLBACK_URL,
  );
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}
