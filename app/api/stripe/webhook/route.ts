import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase";

// Stripe sends raw body, we need to handle it
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // If no webhook secret configured, just log events (dev mode)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Dev mode - parse directly (not secure for production)
      event = JSON.parse(body);
      console.log("⚠️  No webhook secret configured - parsing event directly");
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServerClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("✅ Checkout completed:", session.id);
        console.log("   Customer:", session.customer);
        console.log("   Subscription:", session.subscription);
        console.log("   Email:", session.customer_email);

        // Update billing_records in Supabase
        // For MVP, we'll use a hardcoded agency_id
        const { error } = await supabase.from("billing_records").upsert(
          {
            agency_id: "00000000-0000-0000-0000-000000000001", // MVP hardcoded
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            plan: "assistant",
            billing_type: "flat",
            flat_rate_cents: 29900,
            status: "active",
          },
          { onConflict: "agency_id" }
        );

        if (error) console.error("Supabase upsert error:", error);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        console.log("💰 Invoice paid:", invoice.id);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("🔄 Subscription updated:", subscription.id, "Status:", subscription.status);

        const { error } = await supabase
          .from("billing_records")
          .update({ status: subscription.status })
          .eq("stripe_subscription_id", subscription.id);

        if (error) console.error("Supabase update error:", error);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("❌ Subscription canceled:", subscription.id);

        const { error } = await supabase
          .from("billing_records")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        if (error) console.error("Supabase update error:", error);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error("Error processing webhook:", err);
  }

  return NextResponse.json({ received: true });
}
