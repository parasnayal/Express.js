import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

import { generateRefreshToken, hashRefreshToken } from "../utils/refreshToken.js";

import { generateAccessToken } from "../utils/jwt.js";

import { REFRESH_TTL_MS } from "../config/refreshCookie.js";

import { refreshTokenRepository as repo } from "../repositories/refreshToken.repository.js";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export const refreshTokenService = {
  async issue(userId: number): Promise<TokenPair> {
    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    const familyId = randomUUID();

    const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);

    const accessToken = await generateAccessToken(userId);

    await repo.create(userId, familyId, tokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  },

  //   async rotate(oldRefreshToken: string): Promise<TokenPair> {
  //     const oldHash = hashRefreshToken(oldRefreshToken);

  //     const client = await pool.connect();

  //     // Used to handle replay after committing revocation.
  //     let replayDetected = false;

  //     let result: TokenPair | null = null;

  //     try {
  //       await client.query("BEGIN");

  //       const stored = await repo.findForUpdate(client, oldHash);

  //       if (!stored) {
  //         throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
  //       }

  //       if (stored.revoked_at) {
  //         throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token revoked");
  //       }

  //       if (stored.used_at) {
  //         // Possible stolen/replayed refresh token.
  //         await repo.revokeFamily(client, stored.family_id);

  //         replayDetected = true;
  //       } else if (stored.expires_at.getTime() <= Date.now()) {
  //         throw new AppError(401, "REFRESH_TOKEN_EXPIRED", "Refresh token expired");
  //       } else {
  //         // Verify the user still exists.
  //         const userResult = await client.query<{
  //           id: number;
  //         }>(
  //           `SELECT id
  //            FROM users
  //            WHERE id = $1`,
  //           [stored.user_id],
  //         );

  //         if (!userResult.rows[0]) {
  //           throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
  //         }

  //         // Generate replacement credentials.
  //         const newRefreshToken = generateRefreshToken();

  //         const newHash = hashRefreshToken(newRefreshToken);

  //         const accessToken = await generateAccessToken(stored.user_id);

  //         // Invalidate old token.
  //         await repo.markUsed(client, stored.id);

  //         // Insert the replacement into the same family.
  //         await repo.createRotated(
  //           client,
  //           stored.user_id,
  //           stored.family_id,
  //           newHash,
  //           stored.expires_at,
  //         );

  //         result = {
  //           accessToken,
  //           refreshToken: newRefreshToken,
  //           expiresAt: stored.expires_at,
  //         };
  //       }

  //       await client.query("COMMIT");
  //     } catch (error) {
  //         let discard = false;
  //       try {
  //         await client.query("ROLLBACK");
  //       } catch {
  //         discard = true;
  //         // PoolClient should not be reused if rollback fails.

  //       }
  //        client.release(discard);
  //         throw error;

  //     } finally {
  //       // release() is called only if rollback didn't fail.
  //       if (!client.release) {
  //         client.release();
  //       }
  //     }

  //     if (replayDetected) {
  //       throw new AppError(401, "REFRESH_TOKEN_REUSED", "Session expired. Please log in again");
  //     }

  //     if (!result) {
  //       throw new Error("Refresh rotation produced no result");
  //     }

  //     return result;
  //   },

  async rotate(oldRefreshToken: string): Promise<TokenPair> {
    const oldHash = hashRefreshToken(oldRefreshToken);
    const client = await pool.connect();

    let replayDetected = false;
    let result: TokenPair | null = null;
    let discardClient = false;

    try {
      await client.query("BEGIN");

      const stored = await repo.findForUpdate(client, oldHash);

      if (!stored || stored.revoked_at) {
        throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
      }

      if (stored.used_at) {
        await repo.revokeFamily(client, stored.family_id);

        replayDetected = true;
      } else if (stored.expires_at.getTime() <= Date.now()) {
        throw new AppError(401, "REFRESH_TOKEN_EXPIRED", "Refresh token expired");
      } else {
        const userResult = await client.query<{
          id: number;
        }>(`SELECT id FROM users WHERE id = $1`, [stored.user_id]);

        if (!userResult.rows[0]) {
          throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
        }

        const nextToken = generateRefreshToken();
        const nextHash = hashRefreshToken(nextToken);

        const accessToken = await generateAccessToken(stored.user_id);

        await repo.markUsed(client, stored.id);

        await repo.createRotated(
          client,
          stored.user_id,
          stored.family_id,
          nextHash,
          stored.expires_at,
        );

        result = {
          accessToken,
          refreshToken: nextToken,
          expiresAt: stored.expires_at,
        };
      }

      await client.query("COMMIT");
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        discardClient = true;
      }

      throw error;
    } finally {
      client.release(discardClient);
    }

    if (replayDetected) {
      throw new AppError(401, "REFRESH_TOKEN_REUSED", "Session expired. Please log in again");
    }

    if (!result) {
      throw new Error("Refresh rotation produced no result");
    }

    return result;
  },
  async revoke(refreshToken: string): Promise<void> {
    const client = await pool.connect();

    let discard = false;

    try {
      await client.query("BEGIN");

      const stored = await repo.findForUpdate(client, hashRefreshToken(refreshToken));

      if (stored) {
        await repo.revokeFamily(client, stored.family_id);
      }

      await client.query("COMMIT");
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        discard = true;
      }

      throw error;
    } finally {
      client.release(discard);
    }
  },
};
