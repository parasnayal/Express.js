export interface RefreshTokenRow {
  id: string;
  user_id: number;
  family_id: string;
  expires_at: Date;
  used_at: Date | null;
  revoked_at: Date | null;
}