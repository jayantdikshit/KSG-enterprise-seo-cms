import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import mongoose from "mongoose";

type JwtUser = {
  id: string;
  email?: string;
  role?: string;
  roleId?: string;
  iat?: number;
  exp?: number;
};

interface AuthRequest extends Request {
  user?: JwtUser;
}

// Middleware to check authentication and attach user
export const checkAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "No token provided",
    });
  }

  try {
    const decoded = verifyAccessToken(token) as JwtUser;
    req.user = decoded;
    return next();
  } catch (error: unknown) {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

// Middleware to check role-based access
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role || "")) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Only ${allowedRoles.join(", ")} can perform this action`,
      });
    }

    return next();
  };
};
