export type Role = "USER" | "ADMIN";

export interface AuthenticatedUser {
  id: number;
  role: Role;
}