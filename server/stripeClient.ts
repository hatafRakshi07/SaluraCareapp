import { StripeSync } from "stripe-replit-sync";
import Stripe from "stripe";

let stripeSyncInstance: StripeSync | null = null;

async function getStripeCredentials(): Promise<{ secretKey: string; publishableKey: string }> {
  const connectorHostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const replIdentity = process.env.REPL_IDENTITY;

  if (!connectorHostname || !replIdentity) {
    throw new Error("Stripe connector environment variables are not set. Please connect Stripe integration.");
  }

  const response = await fetch(
    `https://${connectorHostname}/connectors/stripe/credentials`,
    {
      headers: {
        Authorization: `Bearer ${replIdentity}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Stripe credentials: ${response.statusText}`);
  }

  const data = await response.json() as { secretKey: string; publishableKey: string };
  return data;
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = await getStripeCredentials();
  return new Stripe(secretKey, { apiVersion: "2025-04-30.basil" });
}

export async function getStripeSync(): Promise<StripeSync> {
  if (stripeSyncInstance) return stripeSyncInstance;
  const { secretKey } = await getStripeCredentials();
  stripeSyncInstance = new StripeSync({ stripeSecretKey: secretKey, databaseUrl: process.env.DATABASE_URL! });
  return stripeSyncInstance;
}
