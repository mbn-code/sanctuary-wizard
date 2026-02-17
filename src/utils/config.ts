/**
 * The core configuration for a Gift Sanctuary.
 * This is what gets encrypted and stored in the URL.
 */
export interface SanctuaryConfig {
  plan: 'spark' | 'plus' | 'infinite' | 'viral';
  theme: string; // ID of the selected theme
  occasion: string; // 'birthday', 'anniversary', etc.
  customQuestion?: string; // Custom "Big Ask" question
  names: {
    sender: string;
    recipient: string;
  };
  targetDate: string; // The "Big Day" (ISO format)
  anniversaryDate: string; // The original anniversary/start date for the counter
  totalDays: number; // Number of days in the countdown (1-30)
  spotifyTracks: Record<string, string>; // "dayX" -> track ID (relative to targetDate)
  notes: {
    id: string;
    day: number; // Day index relative to targetDate (0 is the big day, 1 is day before, etc.)
    hour?: number;
    content: string;
  }[];
  passcode: string;
  videoUrl?: string;
  backgroundUrl?: string;
  galleryImages?: Record<string, string[]>; // "dayX" -> array of image URLs
  signature?: string; // HMAC proof of payment
}

/**
 * The public-facing payload stored in the query string.
 * All actual sensitive data is in 'd', encrypted.
 */
export interface SanctuaryPayload {
  d: string;  // AES-GCM Ciphertext (Base64URL)
  iv: string; // AES-GCM IV (Base64URL)
  v?: string; // Version
}
