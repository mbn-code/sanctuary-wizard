import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { importKey, decryptData } from '@/utils/crypto';

/**
 * Securely delete blobs from Vercel storage.
 * Requires either the encoded config (for proof) or the raw URLs.
 * In our stateless AES-GCM architecture, the client must provide proof 
 * that they possess the decryption key for the configuration that contains these URLs.
 */
export async function POST(request: Request) {
  try {
    const { urls, d, iv, k } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    // Security: Verification of ownership
    // To prevent unauthorized deletion, the client must send:
    // d: ciphertext, iv: IV, k: master key (from fragment)
    // We decrypt server-side ONLY for the purpose of verifying that the requested URLs 
    // are actually part of this configuration.
    
    if (!d || !iv || !k) {
        return NextResponse.json({ error: 'Verification payload missing' }, { status: 401 });
    }

    try {
        const masterKey = await importKey(k);
        const config = await decryptData(d, iv, masterKey);
        
        const authorizedUrls = new Set<string>();
        if (config.backgroundUrl) authorizedUrls.add(config.backgroundUrl);
        if (config.videoUrl) authorizedUrls.add(config.videoUrl);
        if (config.galleryImages) {
            Object.values(config.galleryImages).forEach((dayImages: any) => {
                dayImages.forEach((url: string) => authorizedUrls.add(url));
            });
        }

        // Only allow deletion of URLs present in the config
        const verifiedUrls = urls.filter(url => authorizedUrls.has(url));

        if (verifiedUrls.length === 0) {
            return NextResponse.json({ error: 'No authorized URLs found in configuration' }, { status: 403 });
        }

        const secretKey = process.env.BLOB_READ_WRITE_TOKEN;
        if (!secretKey) {
            return NextResponse.json({ error: 'Blob token not configured' }, { status: 500 });
        }

        await del(verifiedUrls);
        return NextResponse.json({ success: true, deletedCount: verifiedUrls.length });

    } catch (e) {
        return NextResponse.json({ error: 'Verification failed: invalid key or payload' }, { status: 403 });
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
