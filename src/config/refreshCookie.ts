import type { CookieOptions, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const refreshCookieName = isProduction ? "__Host-refreshToken" : "refreshToken";

export const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

export const setRefreshCookie = (res: Response, token: string, expiresAt: Date) => {
  res.cookie(refreshCookieName, token, {
    ...baseOptions,
    maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
  });
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(refreshCookieName, baseOptions);
};
