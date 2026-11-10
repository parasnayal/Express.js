export type Role = "USER" | "ADMIN";

export interface AuthenticatedUser {
  id: number;
  role: Role;
}

export interface AuthUserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string | null;
}
