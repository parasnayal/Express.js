import type { RequestHandler } from "express";

import { authService } from
  "../services/auth.service.ts";
import { cookieName } from "../config/session.ts";

export const registerController: RequestHandler =
  async (req, res) => {
    const { name, email, password } = req.body ?? {};

    const user = await authService.register(
      name,
      email,
      password
    );

    res.status(201).json({
      success: true,
      data: user,
    });
  };

export const loginController: RequestHandler =
  async (req, res) => {
    const { email, password } = req.body ?? {};

    const user = await authService.verifyLogin(
      email,
      password
    );

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    req.session.userId = user.id;

     await new Promise<void>((resolve, reject) => {
      req.session.save((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    res.status(200).json({
      success: true,
      data: user,
      message: "Credentials verified",
    });
  };

  export const logoutController: RequestHandler =
  async (req, res) => {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    res.clearCookie(cookieName, {
      path: "/",
    });

    res.status(204).end();
  };