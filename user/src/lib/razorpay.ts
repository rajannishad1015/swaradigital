import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
       console.warn("⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from environment variables.");
    }
    
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "mock_key_id",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_key_secret",
    });
  }
  return razorpayInstance;
}
