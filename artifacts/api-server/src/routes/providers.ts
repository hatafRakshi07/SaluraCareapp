import { Router, type Request, type Response, type NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { providers, bookings } from "@workspace/db";
import { providerRegisterSchema, providerLoginSchema } from "@workspace/db";
import { hashPassword, comparePassword, signProviderToken, verifyProviderToken } from "../auth";

const router = Router();

function requireProviderAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyProviderToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  (req as Request & { providerId: string }).providerId = payload.providerId;
  next();
}

function safeProvider(p: Record<string, unknown>): Record<string, unknown> {
  const { passwordHash: _ph, ...rest } = p;
  return rest;
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = providerRegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }
    const { password, ...rest } = parsed.data;
    const [existing] = await db.select().from(providers).where(eq(providers.email, rest.email));
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }
    const passwordHash = await hashPassword(password);
    const [provider] = await db
      .insert(providers)
      .values({ ...rest, passwordHash, status: "pending" })
      .returning();
    const token = signProviderToken(provider.id);
    res.status(201).json({ token, provider: safeProvider(provider as Record<string, unknown>) });
  } catch (err) {
    req.log.error({ err }, "Provider register error");
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = providerLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
      return;
    }
    const { email, password } = parsed.data;
    const [provider] = await db.select().from(providers).where(eq(providers.email, email));
    if (!provider) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const valid = await comparePassword(password, provider.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = signProviderToken(provider.id);
    res.json({ token, provider: safeProvider(provider as Record<string, unknown>) });
  } catch (err) {
    req.log.error({ err }, "Provider login error");
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    let results;
    if (role) {
      results = await db
        .select()
        .from(providers)
        .where(and(eq(providers.status, "approved"), eq(providers.role, role)));
    } else {
      results = await db.select().from(providers).where(eq(providers.status, "approved"));
    }
    res.json(results.map((p) => safeProvider(p as Record<string, unknown>)));
  } catch (err) {
    req.log.error({ err }, "List providers error");
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

router.get("/me", requireProviderAuth, async (req: Request, res: Response) => {
  try {
    const { providerId } = req as Request & { providerId: string };
    const [provider] = await db.select().from(providers).where(eq(providers.id, providerId));
    if (!provider) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    res.json({ provider: safeProvider(provider as Record<string, unknown>) });
  } catch (err) {
    req.log.error({ err }, "Get provider me error");
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.get("/me/bookings", requireProviderAuth, async (req: Request, res: Response) => {
  try {
    const { providerId } = req as Request & { providerId: string };
    const [provider] = await db.select({ id: providers.id }).from(providers).where(eq(providers.id, providerId));
    if (!provider) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    const bookingList = await db.select().from(bookings).where(eq(bookings.itemId, providerId));
    const totalEarnings = bookingList.reduce((sum, b) => sum + parseFloat(b.amount ?? "0"), 0);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEarnings = bookingList
      .filter((b) => b.createdAt && new Date(b.createdAt) >= startOfMonth)
      .reduce((sum, b) => sum + parseFloat(b.amount ?? "0"), 0);
    res.json({ bookings: bookingList, totalEarnings, monthlyEarnings });
  } catch (err) {
    req.log.error({ err }, "Get provider bookings error");
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

router.put("/:id", requireProviderAuth, async (req: Request, res: Response) => {
  try {
    const { providerId } = req as Request & { providerId: string };
    if (req.params.id !== providerId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { password: _pw, passwordHash: _ph, status: _st, id: _id, email: _em, createdAt: _ca, ...updateData } = req.body as Record<string, unknown>;
    const [updated] = await db
      .update(providers)
      .set(updateData as Partial<typeof providers.$inferInsert>)
      .where(eq(providers.id, providerId))
      .returning();
    res.json({ provider: safeProvider(updated as Record<string, unknown>) });
  } catch (err) {
    req.log.error({ err }, "Update provider error");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
