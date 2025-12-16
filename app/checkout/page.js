'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(1000);

  const handleCheckout = async () => {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount }),
    });

    const data = await res.json();
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: data.id });
  };

  return (
    <div>
      <h1>Checkout</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount (in cents)"
        value={amount}
        onChange={(e) => setAmount(parseInt(e.target.value))}
      />
      <button onClick={handleCheckout}>Pay</button>
    </div>
  );
}
