import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Verify a JWT and return the minimal payload containing user id and role.
 * Returns null if verification fails.
 */
export const getUserFromToken = async (token: string): Promise<{ id: string; role: string } | null> => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    return { id: payload.id, role: payload.role };
  } catch (err) {
    return null;
  }
};
