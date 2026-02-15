import { NextResponse } from 'next/server';
import { signData } from '@/utils/crypto';

export async function GET(request: Request) {
  const signingSecret = process.env.SIGNING_SECRET;
  if (!signingSecret) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const timestamp = Date.now().toString();
  // We include user-agent for a tiny bit more entropy/binding
  const ua = request.headers.get('user-agent') || 'unknown';
  const dataToSign = `${timestamp}:${ua}`;
  
  const signature = await signData(dataToSign, signingSecret);

  return NextResponse.json({ 
    t: timestamp,
    s: signature
  });
}
