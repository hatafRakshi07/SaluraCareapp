import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";

const router = Router();

router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const bookingList = await storage.getUserBookings(userId);
    res.json({ bookings: bookingList });
  } catch (err) {
    req.log.error({ err }, "Get bookings error");
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

export default router;
