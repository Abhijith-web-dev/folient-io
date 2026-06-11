/**
 * CryptoService.ts
 *
 * Provides client-side AES-256-GCM encryption and decryption utilities
 * using the browser's native Web Crypto API (window.crypto.subtle).
 * Derives cryptographic keys using PBKDF2 with SHA-256 (100,000 iterations).
 */

// We will use a static application salt for PBKDF2
const APP_SALT = new TextEncoder().encode('folient-client-side-salt-2026');

/**
 * Derives an AES-GCM 256-bit CryptoKey from a secret passphrase (e.g. Firebase UID) using PBKDF2.
 */
async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: APP_SALT,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a base64 encoded string containing the 12-byte initialization vector (IV)
 * prepended to the ciphertext.
 */
export async function encryptKey(plaintext: string, secret: string): Promise<string> {
  try {
    if (!plaintext) return '';
    const key = await deriveKey(secret);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedPlaintext = new TextEncoder().encode(plaintext);

    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedPlaintext
    );

    // Combine IV and ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt credential key.', { cause: error });
  }
}

/**
 * Decrypts a base64 encoded AES-256-GCM string back to plaintext.
 */
export async function decryptKey(encryptedBase64: string, secret: string): Promise<string> {
  try {
    if (!encryptedBase64) return '';
    const key = await deriveKey(secret);

    // Convert from base64
    const binaryStr = atob(encryptedBase64);
    const combined = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      combined[i] = binaryStr.charCodeAt(i);
    }

    // Extract IV (first 12 bytes) and ciphertext (rest)
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt credential key. Check passphrase.', { cause: error });
  }
}
