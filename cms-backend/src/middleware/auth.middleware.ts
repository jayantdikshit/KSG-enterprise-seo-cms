import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

// Define proper user type (safe & scalable)
type JwtUser = {
  id: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

// Extend Request
interface AuthRequest extends Request {
  user?: JwtUser;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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