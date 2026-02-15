import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe Secret Key not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia' as any,
  });

  try {
    const { plan, config } = await req.json();

    const prices: Record<string, { amount: number; name: string }> = {
      spark: { amount: 200, name: 'The Spark Plan' },
      plus: { amount: 700, name: 'The Romance Plan' },
      infinite: { amount: 1200, name: 'The Sanctuary Plan' },
    };

    const selectedPlan = prices[plan];
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
              description: `Personalized Valentine sanctuary for ${config.names.partner2}`,
            },
            unit_amount: selectedPlan.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        plan: plan,
        partner1: config.names.partner1,
        partner2: config.names.partner2,
        config_backup: JSON.stringify(config).slice(0, 500)
      },
      success_url: `${req.headers.get('origin')}/wizard?session_id={CHECKOUT_SESSION_ID}&success=true&paid_plan=${plan}`,
      cancel_url: `${req.headers.get('origin')}/wizard?plan=${plan}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
