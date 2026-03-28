import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate inputs per backend-specialist principles
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment fields for verification." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error("Server Misconfiguration: RAZORPAY_KEY_SECRET is missing.");
    }

    // Generate HMAC SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed. Cryptographic signature mismatch." },
        { status: 400 }
      );
    }

    // Success - In a real scenario, update your DB here
    return NextResponse.json(
      { success: true, paymentId: razorpay_payment_id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Razorpay verify payment error:", error);
    return NextResponse.json(
      { error: error?.message || "Payment verification encountered an unexpected error." },
      { status: 500 }
    );
  }
}
