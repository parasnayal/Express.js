import type { RequestHandler } from "express";

import { authService } from "../services/auth.service.ts";
import { cookieName } from "../config/session.ts";
import { generateAccessToken } from "../utils/jwt.ts";
import { refreshTokenService } from "../services/refreshToken.service.ts";
import { clearRefreshCookie, setRefreshCookie } from "../config/refreshCookie.ts";
import { readRefreshToken } from "../utils/refreshToken.ts";
import { AppError } from "../utils/AppError.ts";

export const registerController: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body ?? {};

  const user = await authService.register(name, email, password);

  res.status(201).json({
    success: true,
    data: user,
  });
};

export const loginController: RequestHandler = async (req, res) => {
  const { email, password } = req.body ?? {};

  const user = await authService.verifyLogin(email, password);

  // Generate access + refresh credentials.
  const tokens = await refreshTokenService.issue(user.id);

  //  const accessToken =
  //   await generateAccessToken(user.id);

  // await new Promise<void>((resolve, reject) => {
  //   req.session.regenerate((error) => {
  //     if (error) reject(error);
  //     else resolve();
  //   });
  // });

  // req.session.userId = user.id;

  //  await new Promise<void>((resolve, reject) => {
  //   req.session.save((error) => {
  //     if (error) reject(error);
  //     else resolve();
  //   });
  // });

  // Refresh token goes into an HttpOnly cookie.
  setRefreshCookie(res, tokens.refreshToken, tokens.expiresAt);

  res.status(200).json({
    success: true,
    data: {
      user,
      accessToken: tokens.accessToken,
      tokenType: "Bearer",
      expiresIn: 120,
    },
    message: "Credentials verified",
  });
};

// export const logoutController: RequestHandler =
// async (req, res) => {
//   await new Promise<void>((resolve, reject) => {
//     req.session.destroy((error) => {
//       if (error) reject(error);
//       else resolve();
//     });
//   });

//   res.clearCookie(cookieName, {
//     path: "/",
//   });

//   res.status(204).end();
// };

export const logoutController: RequestHandler = async (req, res) => {
  const refreshToken = readRefreshToken(req);

  if (refreshToken) {
    await refreshTokenService.revoke(refreshToken);
  }

  clearRefreshCookie(res);

  res.status(204).end();
};

export const refreshController: RequestHandler = async (req, res) => {
  const oldRefreshToken = readRefreshToken(req);

  if (!oldRefreshToken) {
    throw new AppError(401, "MISSING_REFRESH_TOKEN", "Refresh token is missing or invalid");
  }

  const tokens = await refreshTokenService.rotate(oldRefreshToken);

  // Replace the old cookie with the new token.
  setRefreshCookie(res, tokens.refreshToken, tokens.expiresAt);

  res.status(200).json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
      tokenType: "Bearer",
      expiresIn: 120,
    },
  });
};
