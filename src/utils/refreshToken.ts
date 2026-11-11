import {type Request} from "express";
import {
  randomBytes,
  createHash,
} from "node:crypto";
import { refreshCookieName } from "../config/refreshCookie.ts";

export const generateRefreshToken = (): string => {
  return randomBytes(32).toString("base64url");
}

export const hashRefreshToken = (
  token: string
): string => {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export const readRefreshToken = (
  req: Request
): string | null => {
  const value: unknown =
    req.cookies?.[refreshCookieName];

  if (
    typeof value !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(value)
  ) {
    return null;
  }

  return value;
}