import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { verifyDataSignature } from '@/utils/crypto';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const origin = request.headers.get('origin');
    const ua = request.headers.get('user-agent') || 'unknown';
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://valentize.vercel.app',
          'https://valentine-wizard.vercel.app'
        ]
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002'
        ];

    if (process.env.NODE_ENV === 'production' && origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname,
        clientPayload
      ) => {
        // --- Security Verification ---
        if (!clientPayload) {
            throw new Error('Missing verification payload');
        }

        const { t, s } = JSON.parse(clientPayload);
        const signingSecret = process.env.SIGNING_SECRET;
        
        if (!signingSecret || !t || !s) {
            throw new Error('Verification failed: missing parameters');
        }

        // 1. Verify Signature
        const dataToVerify = `${t}:${ua}`;
        const isValid = await verifyDataSignature(dataToVerify, s, signingSecret);
        if (!isValid) {
            throw new Error('Invalid upload signature');
        }

        // 2. Verify Timestamp (Token expires in 10 minutes)
        const then = parseInt(t);
        const now = Date.now();
        if (now - then > 10 * 60 * 1000) {
            throw new Error('Upload challenge expired');
        }
        // -----------------------------

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'image/webp'],
          addRandomSuffix: true,
          maximumSizeInBytes: pathname.endsWith('.mp4') || pathname.endsWith('.mov') ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB for video, 10MB for images
          tokenPayload: JSON.stringify({}),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
