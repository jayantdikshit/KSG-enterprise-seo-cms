import mongoose from "mongoose";
import User from "../models/User";
import Role from "../models/Role";
import { hashPassword, comparePassword } from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
import { connectDB } from "../lib/mongodb";
import { seedRoles } from "../utils/seed";
import { RegisterDTO } from "../types/auth.types";
import { RoleDTO, RoleName } from "../types/role.types";

type RoleDocument = {
  _id: mongoose.Types.ObjectId;
  name: RoleName;
  permissions: string[];
};

export class AuthService {

  // ---------------- REGISTER ----------------
  static async register(data: RegisterDTO) {
    await connectDB();
    await seedRoles();

    let role: RoleDocument | null = null;

    // 1️⃣ Safe ObjectId check
    if (data.role && typeof data.role === "string" && data.role.match(/^[0-9a-fA-F]{24}$/)) {
      role = (await Role.findById(data.role).exec()) as RoleDocument | null;
    }

    // 2️⃣ Role name check
    else if (data.role) {
      role = (await Role.findOne({ name: data.role as RoleName }).exec()) as RoleDocument | null;
    }

    // 3️⃣ Default fallback role
    if (!role) {
      role = (await Role.findOne({ name: "EDITOR" }).exec()) as RoleDocument | null;
    }

    if (!role) {
      throw new Error("Default role 'EDITOR' not found in database");
    }

    // 4️⃣ Email duplicate check
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    // 5️⃣ Create user
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: await hashPassword(data.password),
      role: role._id,
    });

    return user;
  }

  // ---------------- LOGIN ----------------
  static async login(email: string, password: string) {
    await connectDB();

    const user = await User.findOne({ email }).populate<{ role: RoleDTO }>("role");

    if (!user) {
      throw new Error("User not found");
    }

    // Check if account is locked out
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (60 * 1000)
      );
      throw new Error(
        `Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`
      );
    }

    const match = await comparePassword(password, user.password);

    if (!match) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        await user.save();
        throw new Error(
          "Account locked due to 5 consecutive failed attempts. Try again in 15 minutes."
        );
      }
      
      await user.save();
      throw new Error("Invalid credentials");
    }

    // Reset lockout counters on success
    user.loginAttempts = 0;
    user.lockedUntil = undefined;

    // SAFE ROLE HANDLING
    const role = user.role as unknown as RoleDTO;

    const payload = {
      id: user._id.toString(),
      role: role?.name || "UNKNOWN",
      permissions: role?.permissions || [],
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();

    const safeUser = user.toObject() as { password?: string } & Record<string, unknown>;
    delete safeUser.password;

    return { user: safeUser, accessToken, refreshToken };
  }

  // ---------------- REFRESH ----------------
  static async refresh(token: string) {
    await connectDB();

    const user = await User.findOne({ refreshToken: token }).populate<{ role: RoleDTO }>("role");

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    const role = user.role as unknown as RoleDTO;

    const payload = {
      id: user._id.toString(),
      role: role?.name || "UNKNOWN",
      permissions: role?.permissions || [],
    };

    const accessToken = generateAccessToken(payload);

    const safeUser = user.toObject() as { password?: string } & Record<string, unknown>;
    delete safeUser.password;

    return { accessToken, user: safeUser };
  }
}