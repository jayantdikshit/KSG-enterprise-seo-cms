export type RoleName =
  | "SUPER_ADMIN"
  | "EDITOR"
  | "MARKETING_MANAGER"
  | "SEO_MANAGER";

export interface RoleDTO {
  _id: string;
  name: RoleName;
  permissions: string[];
}