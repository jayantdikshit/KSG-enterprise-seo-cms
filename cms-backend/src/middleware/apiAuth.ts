import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Role from "@/models/Role";

export type AuthenticatedHandler = (
  req: NextRequest,
  user: { id: string; role: string; permissions: string[] },
  context: { params?: any }
) => Promise<NextResponse>;

export function withApiAuth(
  handler: AuthenticatedHandler,
  requiredPermission?: string
) {
  return async (req: NextRequest, context: { params?: any } = {}) => {
    try {
      const authHeader = req.headers.get("authorization");
      
      if (!authHeader) {
        console.error("401: authHeader missing");
        return NextResponse.json(
          { success: false, error: "Authorization header is missing" },
          { status: 401 }
        );
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader.split(" ")[1];

      if (!token) {
        console.error("401: token missing");
        return NextResponse.json(
          { success: false, error: "Bearer token is missing" },
          { status: 401 }
        );
      }

      let decoded: any;
      try {
        decoded = verifyAccessToken(token);
      } catch (err) {
        console.error("401: verifyAccessToken failed", err);
        return NextResponse.json(
          { success: false, error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      // Dynamically fetch the current permissions from the database
      await connectDB();
      const userDoc: any = await User.findById(decoded.id).populate("role");
      
      if (!userDoc) {
        return NextResponse.json(
          { success: false, error: "User not found or does not exist" },
          { status: 401 }
        );
      }

      if (!userDoc.isActive) {
        return NextResponse.json(
          { success: false, error: "User account is suspended" },
          { status: 403 }
        );
      }

      const userRole = userDoc.role;
      const userPermissions: string[] = userRole?.permissions || [];
      
      // Update decoded object permissions dynamically for the route handler
      decoded.permissions = userPermissions;
      decoded.role = userRole?.name || decoded.role;

      // Check permission if specified
      if (requiredPermission) {
        if (!userPermissions.includes(requiredPermission) && !userPermissions.includes("ALL")) {
          return NextResponse.json(
            {
              success: false,
              error: `Access Denied: Missing permission '${requiredPermission}'`,
            },
            { status: 403 }
          );
        }
      }

      return handler(req, decoded, context);
    } catch (error: any) {
      console.error("Auth Middleware Error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error during authentication" },
        { status: 500 }
      );
    }
  };
}
