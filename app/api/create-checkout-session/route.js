import { NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';
import { supabase } from '../../../lib/supabase';

export async function POST(req) {
  try {
    const { email, amount } = await req.json();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Test Product' },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      customer_email: email,
    });

    // Save order in Supabase
    await supabase.from('orders').insert({
      user_email: email,
      amount,
      status: 'pending',
      stripe_session_id: session.id,
    });

    return NextResponse.json({ id: session.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}