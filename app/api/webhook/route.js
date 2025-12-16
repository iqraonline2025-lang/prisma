import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabase';
import { buffer } from 'micro';

export const config = {
  api: { bodyParser: false }, // Stripe requires raw body
};

export async function POST(req) {
  const buf = await req.arrayBuffer(); // raw request body
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle checkout session completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Update order in Supabase
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('stripe_session_id', session.id);

    console.log(`Order ${session.id} marked as paid`);
  }

  return NextResponse.json({ received: true });
}
