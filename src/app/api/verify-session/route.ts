import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { signPremiumPlan } from '@/utils/crypto';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const signingSecret = process.env.SIGNING_SECRET;
  if (!signingSecret) {
    return NextResponse.json({ error: 'Signing secret not configured' }, { status: 500 });
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia' as any,
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const success = session.payment_status === 'paid';
    const plan = session.metadata?.plan || 'free';
    const partnerNames = `${session.metadata?.partner1 || ''}:${session.metadata?.partner2 || ''}`;

    let signature = '';
    if (success && plan !== 'free') {
      signature = await signPremiumPlan(plan, partnerNames, signingSecret);
    }

    return NextResponse.json({ 
      status: session.payment_status,
      success,
      plan,
      signature
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
