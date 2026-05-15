import { Router, type Request, type Response } from "express";
import { storage } from "../storage";
import { requireAuth } from "../auth";
import { getUncachableStripeClient } from "../stripeClient";

const router = Router();

router.post("/create-intent", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { itemId, itemName, type, amount, scheduledDate, scheduledTime, address } = req.body;

    if (!itemId || !itemName || !type || !amount) {
      res.status(400).json({ error: "Missing required fields" });
      return;
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
      res.json({ bookingId: booking.id, demo: true });
      return;
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

    res.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: any) {
    req.log.error({ err }, "Payment intent error");
    res.status(500).json({ error: err.message || "Payment failed" });
  }
});

router.post("/confirm", requireAuth, async (req: Request, res: Response) => {
  try {
    const { bookingId, paymentIntentId } = req.body;
    if (!bookingId) {
      res.status(400).json({ error: "Missing bookingId" });
      return;
    }
    await storage.updateBookingStatus(bookingId, "confirmed", paymentIntentId);
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Confirm payment error");
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

export default router;
