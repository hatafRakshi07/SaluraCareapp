import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "saluracare-secret-key-2024";
const JWT_EXPIRES = "30d";

type UserPayload = { userId: string };
type ProviderPayload = { providerId: string };

function isUserPayload(p: unknown): p is UserPayload {
  return typeof p === "object" && p !== null && typeof (p as Record<string, unknown>).userId === "string";
}

function isProviderPayload(p: unknown): p is ProviderPayload {
  return typeof p === "object" && p !== null && typeof (p as Record<string, unknown>).providerId === "string";
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(userId: string): string {
  return jwt.sign({ userId } satisfies UserPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return isUserPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

export function signProviderToken(providerId: string): string {
  return jwt.sign({ providerId } satisfies ProviderPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyProviderToken(token: string): ProviderPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return isProviderPayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  (req as Request & { userId: string }).userId = payload.userId;
  next();
}
