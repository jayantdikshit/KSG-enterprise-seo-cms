import { RoleName } from "./role.types";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role?: RoleName;
}