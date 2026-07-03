import { RoleDTO } from "./role.types";

export interface UserDTO {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: RoleDTO;
  refreshToken?: string;
}