import { RoleDTO } from "./role.types";

export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: RoleDTO | string;
  isActive?: boolean;
  loginAttempts?: number;
  lockedUntil?: string;
  refreshToken?: string;
  createdAt?: string;
  updatedAt?: string;
}