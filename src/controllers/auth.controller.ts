import type { RequestHandler } from "express";

import { authService } from
  "../services/auth.service.ts";

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

    res.status(200).json({
      success: true,
      data: user,
      message: "Credentials verified",
    });
  };