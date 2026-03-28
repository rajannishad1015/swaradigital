import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing RAZORPAY_WEBHOOK_SECRET in environment");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    // Verify webhook authenticity
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);

    // Handle events securely
    switch (event.event) {
      case "payment.captured":
        const payment = event.payload.payment.entity;
        console.log("💳 Payment successfully captured:", payment.id, "Order:", payment.order_id);
        break;

      case "payment.failed":
        const failedPayment = event.payload.payment.entity;
        console.warn("❌ Payment failed:", failedPayment.id, "Order:", failedPayment.order_id);
        break;

      case "subscription.activated":
        const sub = event.payload.subscription.entity;
        console.log("✅ Subscription activated:", sub.id);
        break;

      case "subscription.cancelled":
        const cancelledSub = event.payload.subscription.entity;
        console.warn("❌ Subscription cancelled:", cancelledSub.id);
        break;

      default:
        console.log("ℹ️ Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook event processing failed" }, { status: 500 });
  }
}
