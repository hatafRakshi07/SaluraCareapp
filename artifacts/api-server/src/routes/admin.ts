import { Router, type Request, type Response, type NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { providers } from "@workspace/db";

const router = Router();

const ADMIN_KEY = process.env.ADMIN_KEY ?? "salura-admin";

function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const key = (req.headers["x-admin-key"] as string | undefined) ?? (typeof req.query.key === "string" ? req.query.key : undefined);
  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

function safeProvider(p: Record<string, unknown>): Record<string, unknown> {
  const { passwordHash: _ph, ...rest } = p;
  return rest;
}

router.get("/providers", requireAdminKey, async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    let results;
    if (status) {
      results = await db.select().from(providers).where(eq(providers.status, status));
    } else {
      results = await db.select().from(providers);
    }
    res.json(results.map((p) => safeProvider(p as Record<string, unknown>)));
  } catch (err) {
    req.log.error({ err }, "Admin list providers error");
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

router.put("/providers/:id/status", requireAdminKey, async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status?: string };
    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const [updated] = await db
      .update(providers)
      .set({ status })
      .where(eq(providers.id, String(req.params.id)))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    res.json({ provider: safeProvider(updated as Record<string, unknown>) });
  } catch (err) {
    req.log.error({ err }, "Admin update provider status error");
    res.status(500).json({ error: "Failed to update status" });
  }
});

export default router;
