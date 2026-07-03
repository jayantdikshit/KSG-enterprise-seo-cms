import { Request, Response, NextFunction } from "express";

// Proper user type
type RBACUser = {
  id: string;
  role?: string;
  permissions?: string[];
};

interface AuthRequest extends Request {
  user?: RBACUser;
}

export const rbac = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userPermissions = req.user?.permissions || [];

    if (
      !userPermissions.includes(permission) &&
      !userPermissions.includes("ALL")
    ) {
      return res.status(403).json({
        success: false,
        error: "Access Denied: Missing Permission",
      });
    }

    return next();
  };
};