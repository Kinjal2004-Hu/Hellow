import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { hashPassword, comparePassword, generateToken } from "../services/auth.js";
import { getGoogleAuthURL, getGoogleProfile } from "../services/google.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    res.status(400).json({ error: "Email, password, and username required" });
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, passwordHash, username });

  const token = generateToken({ userId: user._id.toString(), email: user.email });
  res.status(201).json({
    token,
    user: { id: user._id, email: user.email, username: user.username, avatarUrl: user.avatarUrl },
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const match = await comparePassword(password, user.passwordHash);
  if (!match) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken({ userId: user._id.toString(), email: user.email });
  res.json({
    token,
    user: { id: user._id, email: user.email, username: user.username, avatarUrl: user.avatarUrl },
  });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user: { id: user._id, email: user.email, username: user.username, avatarUrl: user.avatarUrl } });
});

export const logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
  res.json({ message: "Logged out" });
});

export const googleAuth = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const url = getGoogleAuthURL();
  res.redirect(url);
});

export const googleCallback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "Missing auth code" });
    return;
  }

  const profile = await getGoogleProfile(code);

  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.findOne({ email: profile.email });
    if (user) {
      user.googleId = profile.id;
      user.avatarUrl ??= profile.picture;
      await user.save();
    } else {
      user = await User.create({
        email: profile.email,
        username: profile.name,
        googleId: profile.id,
        avatarUrl: profile.picture,
      });
    }
  }

  const token = generateToken({ userId: user._id.toString(), email: user.email });
  res.redirect(`${env.FRONTEND_URL}/oauth-callback?token=${token}`);
});
