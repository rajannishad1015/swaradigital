---
name: razorpay-nextjs
description: Complete Razorpay payment gateway integration skill for Next.js (App Router & Pages Router). Use when a user wants to add payments, subscriptions, orders, webhooks, or checkout flows using Razorpay in a Next.js project. Covers one-time payments, recurring subscriptions, refunds, webhook verification, and UI checkout components. Trigger on keywords like "Razorpay", "payment gateway", "checkout", "subscription billing", "order creation", "webhook", "payment verification" in a Next.js context.
---

# Razorpay + Next.js Integration Skill

This skill provides a complete, production-ready blueprint for integrating Razorpay into a Next.js application. It covers environment setup, order creation, client-side checkout, server-side payment verification, webhooks, subscriptions, and refunds.

---

## Prerequisites

### 1. Install Dependencies

```bash
npm install razorpay
npm install axios          # optional, for client-side API calls
```

Razorpay's client-side SDK is loaded via a `<Script>` tag — no npm package needed for the frontend.

---

## Environment Variables

Create or update `.env.local`:

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
```

> ⚠️ **NEVER** expose `RAZORPAY_KEY_SECRET` to the client. Only `NEXT_PUBLIC_RAZORPAY_KEY_ID` should be prefixed with `NEXT_PUBLIC_`.

---

## Project Structure

```
/app
  /api
    /razorpay
      /create-order/route.ts      ← creates Razorpay order
      /verify-payment/route.ts    ← verifies payment signature
      /webhook/route.ts           ← handles Razorpay webhooks
      /create-subscription/route.ts
      /refund/route.ts
  /checkout
    page.tsx                      ← checkout UI page
/lib
  razorpay.ts                     ← Razorpay singleton
/types
  razorpay.d.ts                   ← TypeScript types
```

---

## Razorpay Singleton (`/lib/razorpay.ts`)

```typescript
import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpayInstance;
}
```

---

## TypeScript Types (`/types/razorpay.d.ts`)

```typescript
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface CreateOrderPayload {
  amount: number; // in paise (INR) — multiply rupees by 100
  currency?: string; // default "INR"
  receipt?: string;
  notes?: Record<string, string>;
}
```

---

## API Routes (App Router)

### 1. Create Order — `/app/api/razorpay/create-order/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";
import { nanoid } from "nanoid"; // or use crypto.randomUUID()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", notes = {} } = body;

    if (!amount || typeof amount !== "number" || amount < 1) {
      return NextResponse.json(
        { error: "Invalid amount. Amount must be a positive number in paise." },
        { status: 400 },
      );
    }

    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount, // e.g., 49900 = ₹499
      currency,
      receipt: `receipt_${nanoid(10)}`,
      notes,
    });

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 },
    );
  }
}
```

---

### 2. Verify Payment — `/app/api/razorpay/verify-payment/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 },
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET!;

    // Generate HMAC SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed. Signature mismatch." },
        { status: 400 },
      );
    }

    // ✅ Payment is verified — save to DB, fulfill order, send email, etc.
    // await db.orders.update({ orderId: razorpay_order_id, status: "paid" })

    return NextResponse.json(
      { success: true, paymentId: razorpay_payment_id },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error?.message || "Verification failed" },
      { status: 500 },
    );
  }
}
```

---

### 3. Webhook Handler — `/app/api/razorpay/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook authenticity
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    const event = JSON.parse(rawBody);

    // Handle events
    switch (event.event) {
      case "payment.captured":
        const payment = event.payload.payment.entity;
        console.log("Payment captured:", payment.id);
        // await fulfillOrder(payment.order_id);
        break;

      case "payment.failed":
        const failedPayment = event.payload.payment.entity;
        console.log("Payment failed:", failedPayment.id);
        // await markOrderFailed(failedPayment.order_id);
        break;

      case "refund.created":
        const refund = event.payload.refund.entity;
        console.log("Refund created:", refund.id);
        break;

      case "subscription.activated":
        const sub = event.payload.subscription.entity;
        console.log("Subscription activated:", sub.id);
        break;

      case "subscription.cancelled":
        const cancelledSub = event.payload.subscription.entity;
        console.log("Subscription cancelled:", cancelledSub.id);
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
```

> Add `RAZORPAY_WEBHOOK_SECRET` to your `.env.local`. Set it in Razorpay Dashboard → Webhooks → Secret.

---

### 4. Create Subscription — `/app/api/razorpay/create-subscription/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const {
      planId,
      totalCount = 12,
      quantity = 1,
      notes = {},
    } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: "planId is required" },
        { status: 400 },
      );
    }

    const razorpay = getRazorpayInstance();

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: totalCount, // number of billing cycles
      quantity,
      notes,
    });

    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error: any) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create subscription" },
      { status: 500 },
    );
  }
}
```

---

### 5. Refund — `/app/api/razorpay/refund/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, amount, notes = {} } = await req.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
        { status: 400 },
      );
    }

    const razorpay = getRazorpayInstance();

    const refund = await razorpay.payments.refund(paymentId, {
      amount, // partial refund in paise; omit for full refund
      notes,
    });

    return NextResponse.json({ refund }, { status: 200 });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { error: error?.message || "Refund failed" },
      { status: 500 },
    );
  }
}
```

---

## Checkout UI — `/app/checkout/page.tsx`

This is a complete, working checkout page using the Razorpay JS SDK loaded via Next.js `Script`.

```tsx
"use client";

import { useState } from "react";
import Script from "next/script";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handlePayment = async () => {
    setLoading(true);
    setStatus("idle");

    try {
      // Step 1: Create order on the server
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 49900, // Rs 499 in paise
          currency: "INR",
          notes: { product: "Pro Plan" },
        }),
      });

      const { order, error: orderError } = await orderRes.json();
      if (!orderRes.ok || orderError)
        throw new Error(orderError || "Order creation failed");

      // Step 2: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        name: "Your Company Name",
        description: "Pro Plan Purchase",
        order_id: order.id,
        prefill: {
          name: "Customer Name",
          email: "customer@email.com",
          contact: "9999999999",
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            console.log("Checkout dismissed");
          },
        },
        handler: async (response) => {
          // Step 3: Verify payment on the server
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok && verifyData.success) {
            setStatus("success");
          } else {
            setStatus("error");
          }
          setLoading(false);
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setStatus("error");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Razorpay JS SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Pro Plan</h1>
          <p className="mb-6 text-gray-500">
            Unlock all features for Rs 499/month
          </p>

          {status === "success" && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-green-800">
              Payment successful! Thank you for your purchase.
            </div>
          )}

          {status === "error" && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">
              Payment failed or verification error. Please try again.
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white
                       transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Pay Rs 499"}
          </button>
        </div>
      </div>
    </>
  );
}
```

---

## Pages Router Equivalents

If using `/pages/api/` instead of App Router:

```typescript
// pages/api/razorpay/create-order.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getRazorpayInstance } from "@/lib/razorpay";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { amount, currency = "INR" } = req.body;
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
    });
    res.status(200).json({ order });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

The verify and webhook routes follow the same pattern — just replace `NextRequest/NextResponse` with `NextApiRequest/NextApiResponse`.

---

## Subscription Checkout (Client Side)

```tsx
// For subscriptions, replace order_id with subscription_id
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  subscription_id: subscription.id, // use this instead of order_id
  name: "Your SaaS",
  description: "Monthly subscription",
  handler: async (response) => {
    console.log("Subscription payment:", response);
  },
};
const rzp = new window.Razorpay(options);
rzp.open();
```

---

## Common Gotchas & Best Practices

| Issue                                  | Fix                                                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `window.Razorpay is not defined`       | Ensure `<Script src="...checkout.js">` is rendered before `rzp.open()` — use `strategy="lazyOnload"` and call open only after script loads |
| Amount confusion                       | Razorpay always uses the **smallest currency unit** — paise for INR. Rs 499 = `49900` paise                                                |
| Signature mismatch                     | Double-check you're concatenating `order_id                                                                                                | payment_id`with a pipe`\|` before hashing |
| Webhook not receiving                  | Make sure your server URL is publicly accessible (use ngrok in dev). Register it in Razorpay Dashboard → Webhooks                          |
| Test vs Live keys                      | `rzp_test_*` keys use test mode. Switch to `rzp_live_*` for production                                                                     |
| CORS errors                            | API routes are server-side — no CORS issues. Never call Razorpay server API from the browser                                               |
| TypeScript errors on `window.Razorpay` | Add the `declare global` block shown in the checkout component                                                                             |

---

## Testing

### Test Card Numbers

| Card           | Number                | CVV          | Expiry          |
| -------------- | --------------------- | ------------ | --------------- |
| Visa (success) | `4111 1111 1111 1111` | Any 3 digits | Any future date |
| Mastercard     | `5267 3181 8797 5449` | Any 3 digits | Any future date |
| Fail payment   | `4000 0000 0000 0002` | Any          | Any future date |

### Test UPI

Use `success@razorpay` as the UPI ID to simulate a successful payment in test mode.

### Simulate Webhooks

Use Razorpay Dashboard → Webhooks → "Test Webhook" to fire mock events to your local endpoint (via ngrok).

---

## Production Checklist

- [ ] Switch `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to live keys (`rzp_live_*`)
- [ ] Set `RAZORPAY_WEBHOOK_SECRET` and register webhook URL in Razorpay Dashboard
- [ ] Enable HTTPS on your domain
- [ ] Store `RAZORPAY_KEY_SECRET` only in server-side env vars — never in `NEXT_PUBLIC_*`
- [ ] Persist order + payment IDs to your database before opening checkout
- [ ] Handle duplicate webhook delivery (make handlers idempotent)
- [ ] Set up Razorpay Dashboard alerts for failed payments
- [ ] Test end-to-end in test mode before going live

---

## Summary of All Routes

| Route                               | Method | Purpose                               |
| ----------------------------------- | ------ | ------------------------------------- |
| `/api/razorpay/create-order`        | POST   | Create a Razorpay order (server-side) |
| `/api/razorpay/verify-payment`      | POST   | Verify HMAC signature after payment   |
| `/api/razorpay/webhook`             | POST   | Handle Razorpay event webhooks        |
| `/api/razorpay/create-subscription` | POST   | Create a subscription                 |
| `/api/razorpay/refund`              | POST   | Initiate a full or partial refund     |
