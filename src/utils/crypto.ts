// Client-side AES-GCM encryption utility using native Web Crypto API

const ENCRYPTION_SALT = "folient_vault_salt_secure_2026";

// Derives a cryptographic key from user-specific data (e.g. UID) and a static salt
async function getCryptoKey(userId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKeyMaterial = enc.encode(userId + ENCRYPTION_SALT);
  
  // Hash the material using SHA-256 to get a consistent 256-bit key buffer
  const hash = await crypto.subtle.digest("SHA-256", rawKeyMaterial);
  
  return await crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a plaintext string using AES-GCM
 * Returns a base64-encoded string containing the IV and ciphertext
 */
export async function encryptKey(plaintext: string, userId: string): Promise<string> {
  if (!plaintext) return "";
  try {
    const key = await getCryptoKey(userId);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const enc = new TextEncoder();
    const encodedPlaintext = enc.encode(plaintext);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encodedPlaintext
    );
    
    // Combine IV and Ciphertext into a single array
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error("Encryption failed:", err);
    throw new Error("Failed to encrypt credential.");
  }
}

/**
 * Decrypts a base64-encoded ciphertext string using AES-GCM
 */
export async function decryptKey(ciphertextBase64: string, userId: string): Promise<string> {
  if (!ciphertextBase64) return "";
  try {
    const key = await getCryptoKey(userId);
    
    // Convert base64 back to Uint8Array
    const binaryString = atob(ciphertextBase64);
    const len = binaryString.length;
    const combined = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }
    
    // Extract IV (first 12 bytes) and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error("Decryption failed:", err);
    return "";
  }
}
