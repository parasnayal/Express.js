import { authRepository } from "../repositories/auth.repository.ts";
import { AppError } from "../utils/AppError.ts";
import { hashPassword, verifyPassword } from "../utils/password.ts";

export const authService = {
  async register(name: unknown, email: unknown, password: unknown) {
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 1024
    ) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid registration details");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const passwordHash = await hashPassword(password);

    return authRepository.createUser(name.trim(), normalizedEmail, passwordHash);
  },
  async verifyLogin(email: unknown, password: unknown) {
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      password.length === 0
    ) {
      throw new AppError(400, "VALIDATION_ERROR", "Email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await authRepository.findByEmail(normalizedEmail);

    if (!user?.password_hash) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const isValid = await verifyPassword(user.password_hash, password);

    if (!isValid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  },
};
