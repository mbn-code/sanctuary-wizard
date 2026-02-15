/**
 * Cryptographic utilities for the Valentine Wizard.
 * Implements AES-GCM for URL encryption and PBKDF2 for passcode-derived keys.
 * Uses Base64URL for safe URL serialization.
 */

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Base64URL Encoding (RFC 4648)
 */
export function toBase64URL(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64URL Decoding
 */
export function fromBase64URL(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Master Encryption: AES-GCM 256
 */
export async function generateMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return toBase64URL(raw);
}

export async function importKey(base64Url: string): Promise<CryptoKey> {
  const raw = fromBase64URL(base64Url);
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: any, key: CryptoKey): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = textEncoder.encode(JSON.stringify(data));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return {
    ciphertext: toBase64URL(ciphertext),
    iv: toBase64URL(iv.buffer)
  };
}

export async function decryptData(ciphertext: string, iv: string, key: CryptoKey): Promise<any> {
  const decodedIv = new Uint8Array(fromBase64URL(iv));
  const decodedCiphertext = fromBase64URL(ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decodedIv },
    key,
    decodedCiphertext
  );

  return JSON.parse(textDecoder.decode(decrypted));
}

/**
 * Passcode-Based Key Derivation: PBKDF2
 * Modern OWASP 2025: 310,000 iterations
 */
export async function deriveKeyFromPasscode(passcode: string, salt: string): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(passcode),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: textEncoder.encode(salt),
      iterations: 310000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Server-side HMAC Signature Generation
 */
export async function signPremiumPlan(plan: string, partnerNames: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const payload = textEncoder.encode(`${plan}:${partnerNames}`);
  const signature = await crypto.subtle.sign('HMAC', key, payload);
  return toBase64URL(signature);
}

export async function verifyPremiumPlan(plan: string, partnerNames: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const payload = textEncoder.encode(`${plan}:${partnerNames}`);
  return crypto.subtle.verify('HMAC', key, fromBase64URL(signature), payload);
}

/**
 * Generic HMAC Signature for short-lived tokens
 */
export async function signData(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(data));
  return toBase64URL(signature);
}

export async function verifyDataSignature(data: string, signature: string, secret: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      textEncoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    return crypto.subtle.verify('HMAC', key, fromBase64URL(signature), textEncoder.encode(data));
  } catch {
    return false;
  }
}
