import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { GmailToken } from "../models/GmailToken.js";
import { getGmailAuthURL, getGoogleTokens } from "../services/google.js";
import * as gmailService from "../services/gmail.js";
import { emit } from "../events/index.js";
import { env } from "../config/env.js";

export async function connectGmail(_req: AuthRequest, res: Response): Promise<void> {
  const url = getGmailAuthURL();
  res.json({ url });
}

export async function gmailCallback(req: AuthRequest, res: Response): Promise<void> {
  const { code, state } = req.query;
  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing auth code" });
    return;
  }

  try {
    const tokens = await getGoogleTokens(code);

    const { google } = await import("googleapis");
    const oauth2 = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_CALLBACK_URL,
    );
    oauth2.setCredentials({ access_token: tokens.access_token });
    const oauth2Client = google.oauth2({ version: "v2", auth: oauth2 });
    const { data } = await oauth2Client.userinfo.get();

    const userId = req.userId!;
    if (!tokens.refresh_token) {
      const existing = await GmailToken.findOne({ userId });
      if (!existing) {
        res.status(400).json({ error: "No refresh token received. Please disconnect and reconnect." });
        return;
      }
      existing.accessToken = tokens.access_token;
      existing.expiryDate = new Date(tokens.expiry_date);
      existing.gmailAddress = data.email!;
      await existing.save();
    } else {
      await GmailToken.findOneAndUpdate(
        { userId },
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          scope: tokens.scope,
          tokenType: tokens.token_type,
          expiryDate: new Date(tokens.expiry_date),
          gmailAddress: data.email!,
        },
        { upsert: true },
      );
    }

    emit("gmail:connected", { userId, email: data.email! });
    res.redirect(`${env.FRONTEND_URL}/oauth-callback?gmail=connected`);
  } catch (err) {
    res.status(500).json({ error: "Failed to connect Gmail" });
  }
}

export async function checkStatus(req: AuthRequest, res: Response): Promise<void> {
  const token = await GmailToken.findOne({ userId: req.userId! });
  res.json({
    connected: !!token,
    email: token?.gmailAddress ?? null,
  });
}

export async function inbox(req: AuthRequest, res: Response): Promise<void> {
  try {
    const maxResults = Math.min(Number(req.query.max) || 20, 50);
    const messages = await gmailService.fetchInbox(req.userId!, maxResults);
    res.json(messages);
  } catch (err: any) {
    if (err.message === "Gmail not connected") {
      res.status(401).json({ error: "Gmail not connected" });
      return;
    }
    res.status(500).json({ error: "Failed to fetch inbox" });
  }
}

export async function messageDetail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const messageId = req.params.messageId as string;
    const message = await gmailService.fetchMessage(req.userId!, messageId);
    res.json(message);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch message" });
  }
}

export async function disconnect(req: AuthRequest, res: Response): Promise<void> {
  await gmailService.disconnectGmail(req.userId!);
  emit("gmail:disconnected", { userId: req.userId! });
  res.json({ success: true });
}
