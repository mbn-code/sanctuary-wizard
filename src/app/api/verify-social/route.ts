import { NextResponse } from 'next/server';
import { signPremiumPlan } from '@/utils/crypto';

export async function POST(req: Request) {
  try {
    const { tiktokUrl, partnerNames } = await req.json();

    if (!tiktokUrl || !partnerNames) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Basic TikTok URL validation
    if (!tiktokUrl.includes('tiktok.com')) {
      return NextResponse.json({ success: false, error: 'Invalid TikTok URL' }, { status: 400 });
    }

    // 2. Fetch OEmbed data from TikTok
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Could not fetch TikTok post data' }, { status: 400 });
    }

    const data = await response.json();
    const caption = (data.title || '').toLowerCase();

    // 3. Verify the tag @valentizewiz
    const targetTag = '@valentizewiz';
    if (!caption.includes(targetTag.toLowerCase())) {
      return NextResponse.json({ 
        success: false, 
        error: `Tag ${targetTag} not found in post description. Found: "${data.title.substring(0, 50)}..."` 
      }, { status: 400 });
    }

    // 4. Sign the "viral" plan
    const signingSecret = process.env.SIGNING_SECRET;
    if (!signingSecret) {
        throw new Error('SIGNING_SECRET not configured');
    }

    const signature = await signPremiumPlan('viral', partnerNames, signingSecret);

    return NextResponse.json({ 
      success: true, 
      signature,
      plan: 'viral'
    });

  } catch (error: any) {
    console.error('Social verification error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
