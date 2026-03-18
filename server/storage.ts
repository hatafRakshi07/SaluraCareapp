import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { users, bookings, type User, type InsertUser, type Booking } from "@shared/schema";

export class Storage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(data: { email: string; name: string; passwordHash: string }): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, info: { stripeCustomerId?: string; stripeSubscriptionId?: string; isPremium?: boolean }): Promise<User> {
    const [user] = await db.update(users).set(info).where(eq(users.id, userId)).returning();
    return user;
  }

  async createBooking(data: {
    userId: string;
    type: string;
    itemId: string;
    itemName: string;
    amount: string;
    scheduledDate?: string;
    scheduledTime?: string;
    address?: string;
    stripePaymentIntentId?: string;
  }): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(data).returning();
    return booking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async updateBookingStatus(bookingId: string, status: string, stripePaymentIntentId?: string): Promise<Booking> {
    const updates: any = { status };
    if (stripePaymentIntentId) updates.stripePaymentIntentId = stripePaymentIntentId;
    const [booking] = await db.update(bookings).set(updates).where(eq(bookings.id, bookingId)).returning();
    return booking;
  }

  async getProduct(productId: string) {
    const result = await db.execute(sql`SELECT * FROM stripe.products WHERE id = ${productId}`);
    return result.rows[0] || null;
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`);
    return result.rows[0] || null;
  }
}

export const storage = new Storage();
