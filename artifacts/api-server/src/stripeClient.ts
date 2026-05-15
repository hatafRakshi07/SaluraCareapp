import Stripe from "stripe";

async function getStripeCredentials(): Promise<{ secretKey: string; publishableKey: string }> {
  const connectorHostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const replIdentity = process.env.REPL_IDENTITY;

  if (!connectorHostname || !replIdentity) {
    throw new Error("Stripe connector environment variables are not set.");
  }

  const response = await fetch(`https://${connectorHostname}/connectors/stripe/credentials`, {
    headers: { Authorization: `Bearer ${replIdentity}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Stripe credentials: ${response.statusText}`);
  }

  return response.json() as Promise<{ secretKey: string; publishableKey: string }>;
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = await getStripeCredentials();
  return new Stripe(secretKey, { apiVersion: "2025-04-30.basil" as any });
}

let stripeSyncInstance: any = null;

export async function getStripeSync(): Promise<any> {
  if (stripeSyncInstance) return stripeSyncInstance;
  try {
    const { StripeSync } = await import("stripe-replit-sync");
    const { secretKey } = await getStripeCredentials();
    stripeSyncInstance = new StripeSync({
      stripeSecretKey: secretKey,
      poolConfig: { connectionString: process.env.DATABASE_URL! },
    });
    return stripeSyncInstance;
  } catch {
    throw new Error("stripe-replit-sync not available");
  }
}
