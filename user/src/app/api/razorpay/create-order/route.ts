import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", notes = {} } = body;

    // 1. Validate Input (Backend Specialist core rule)
    if (!amount || typeof amount !== "number" || amount < 1) {
      return NextResponse.json(
        { error: "Invalid amount. Amount must be a positive number in paise." },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayInstance();

    // 2. Generate a secure receipt ID
    const receiptId = `receipt_${crypto.randomBytes(8).toString("hex")}`;

    // 3. Create the order
    const order = await razorpay.orders.create({
      amount, // Amount in paise (multiply INR by 100)
      currency,
      receipt: receiptId,
      notes, // Can pass user ID or subscription plan here
    });

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
