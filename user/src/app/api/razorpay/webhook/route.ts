import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);
  const supabase = createAdminClient(); 

  // Handling Events
  try {
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const { userId, albumId, type } = payment.notes;

        if (type === 'release_payment') {
          // Record the payment
          const { error: payError } = await supabase
            .from('release_payments')
            .upsert({
              user_id: userId,
              album_id: albumId,
              amount: payment.amount / 100,
              razorpay_payment_id: payment.id,
              razorpay_order_id: payment.order_id,
              status: 'captured'
            }, { onConflict: 'razorpay_payment_id' });

          if (payError) {
            console.error('Webhook: Failed to record release payment:', {
              paymentId: payment.id,
              orderId: payment.order_id,
              userId,
              albumId,
              error: payError
            });
            throw payError;
          }

          console.log('Webhook: Release payment recorded successfully:', payment.id);
        }
        break;
      }

      case 'subscription.activated':
      case 'subscription.charged': {
        const subscription = event.payload.subscription.entity;
        const { userId, planName } = subscription.notes;

        // Update or Insert subscription
        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_name: planName,
            status: 'active',
            razorpay_subscription_id: subscription.id,
            current_period_end: new Date(subscription.current_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'razorpay_subscription_id' });

        if (subError) throw subError;

        // Update profile plan type
        const planType = (planName === 'multi_monthly' || planName === 'multi_yearly') ? 'multi' : 'elite'
        const maxProfiles = planType === 'multi' ? 1 : 100

        const { error: profError } = await supabase
          .from('profiles')
          .update({ plan_type: planType, max_artist_profiles: maxProfiles })
          .eq('id', userId);

        if (profError) throw profError;
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        const subscription = event.payload.subscription.entity;
        const { userId } = subscription.notes;

        const { error: subError } = await supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('razorpay_subscription_id', subscription.id);

        if (subError) throw subError;

        const { error: profError } = await supabase
          .from('profiles')
          .update({ plan_type: 'none', max_artist_profiles: 1 })
          .eq('id', userId);

        if (profError) throw profError;
        break;
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
