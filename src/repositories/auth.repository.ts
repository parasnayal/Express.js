import { pool } from "../config/database.ts";
import type { AuthUserRow } from "../types/auth.types.ts";

export const authRepository = {
  async createUser(name: string, email: string, passwordHash: string) {
    const result = await pool.query(
      `INSERT INTO users(name,email,password_hash)
            VALUES($1,$2,$3) RETURNING id, name, email`,
      [name, email, passwordHash],
    );

    const user = result.rows[0];

    if (!user) {
      throw new Error("User creation returned no row");
    }

    return user;
  },
  async findByEmail(email: string): Promise<AuthUserRow | null> {
    const result = await pool.query(`SELECT id,name,email , password_hash FROM users WHERE email=$1`, [email]);

    return result.rows[0] ?? null;
  },
};
