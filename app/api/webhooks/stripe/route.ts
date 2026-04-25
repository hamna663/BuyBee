import { connectToDatabase } from "@/config/db";
import { Order } from "@/models/order";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";



export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing stripe signature or webhook secret" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  await connectToDatabase();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("No orderId in Stripe session metadata");
      return NextResponse.json({ received: true });
    }

    try {
      const updated = await Order.findByIdAndUpdate(
        orderId,
        { status: "processing" },
        { new: true },
      );

      if (!updated) {
        console.error(`Order ${orderId} not found for webhook update`);
      } else {
        console.log(`Order ${orderId} updated to processing via webhook`);
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  }

  return NextResponse.json({ received: true });
}
