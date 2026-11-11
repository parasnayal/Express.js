import type { PoolClient } from "pg";
import { pool } from "../config/database.ts";
import type { RefreshTokenRow } from "../types/refreshToken.type.ts";

export const refreshTokenRepository = {
  async create(userId: number, familyId: string, tokenHash: string, expiresAt: Date) {
    await pool.query(
      `INSERT INTO refresh_tokens
        (user_id, family_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, familyId, tokenHash, expiresAt],
    );
  },
  async findForUpdate(client: PoolClient, tokenHash: string) {
    const result = await client.query<RefreshTokenRow>(
      `SELECT
           id,
           user_id,
           family_id,
           expires_at,
           used_at,
           revoked_at
         FROM refresh_tokens
         WHERE token_hash = $1
         FOR UPDATE`,
      [tokenHash],
    );

    return result.rows[0] ?? null;
  },
  async markUsed(client: PoolClient, id: string) {
    await client.query(
      `UPDATE refresh_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [id],
    );
  },
  async createRotated(
    client: PoolClient,
    userId: number,
    familyId: string,
    tokenHash: string,
    expiresAt: Date,
  ) {
    await client.query(
      `INSERT INTO refresh_tokens
        (user_id, family_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, familyId, tokenHash, expiresAt],
    );
  },
  async revokeFamily(client: PoolClient, familyId: string) {
    await client.query(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE family_id = $1
         AND revoked_at IS NULL`,
      [familyId],
    );
  },
};
