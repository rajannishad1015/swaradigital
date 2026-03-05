import RazorpayLib from "razorpay";

export function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay API keys are missing. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local"
    );
  }

  // razorpay v2.x is CommonJS — handle both named and default export
  const Ctor = (RazorpayLib as any).default ?? RazorpayLib;
  return new Ctor({ key_id, key_secret }) as RazorpayLib;
}
