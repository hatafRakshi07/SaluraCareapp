import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { hashPassword, comparePassword, signToken, requireAuth } from "./auth";
import { registerSchema, loginSchema } from "@shared/schema";
import { getUncachableStripeClient } from "./stripeClient";

export async function registerRoutes(app: Express): Promise<Server> {
  // ── Auth Routes ──────────────────────────────────────────────────

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { email, name, password } = parsed.data;

      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }

      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({ email, name, passwordHash });
      const token = signToken(user.id);

      return res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.name, isPremium: user.isPremium },
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = signToken(user.id);
      return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name, isPremium: user.isPremium },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      return res.json({
        user: { id: user.id, email: user.email, name: user.name, isPremium: user.isPremium },
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // ── Bookings Routes ──────────────────────────────────────────────

  app.get("/api/bookings", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const bookings = await storage.getUserBookings(userId);
      return res.json({ bookings });
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // ── Payment Routes ───────────────────────────────────────────────

  app.post("/api/payments/create-intent", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { itemId, itemName, type, amount, scheduledDate, scheduledTime, address } = req.body;

      if (!itemId || !itemName || !type || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const amountInCents = Math.round(parseFloat(amount) * 100);

      let stripe;
      try {
        stripe = await getUncachableStripeClient();
      } catch {
        const booking = await storage.createBooking({
          userId,
          type,
          itemId,
          itemName,
          amount: amount.toString(),
          scheduledDate,
          scheduledTime,
          address,
          status: "confirmed",
        });
        return res.json({ bookingId: booking.id, demo: true });
      }

      const user = await storage.getUser(userId);
      let customerId = user?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user?.email,
          name: user?.name,
          metadata: { userId },
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, { stripeCustomerId: customerId });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        customer: customerId,
        metadata: { userId, itemId, itemName, type },
        automatic_payment_methods: { enabled: true },
      });

      const booking = await storage.createBooking({
        userId,
        type,
        itemId,
        itemName,
        amount: amount.toString(),
        scheduledDate,
        scheduledTime,
        address,
        stripePaymentIntentId: paymentIntent.id,
        status: "pending",
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
        bookingId: booking.id,
        paymentIntentId: paymentIntent.id,
      });
    } catch (err: any) {
      console.error("Payment intent error:", err);
      return res.status(500).json({ error: err.message || "Payment failed" });
    }
  });

  app.post("/api/payments/confirm", requireAuth, async (req: Request, res: Response) => {
    try {
      const { bookingId, paymentIntentId } = req.body;
      if (!bookingId) return res.status(400).json({ error: "Missing bookingId" });

      await storage.updateBookingStatus(bookingId, "confirmed", paymentIntentId);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Failed to confirm payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
