import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { encryptKey, decryptKey } from '../utils/crypto';

const CREDENTIAL_KEYS = [
  'gemini_api_key',
  'groq_api_key',
  'openrouter_api_key',
  'supabase_url',
  'supabase_anon_key',
  'supabase_service_role_key',
  'supabase_bucket',
  'netlify_token',
  'vercel_token'
];

/**
 * Fetches encrypted credentials from Firestore, decrypts them, and saves to localStorage
 */
export async function syncCredentialsFromFirestore(userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'user_credentials', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const encryptedData = docSnap.data();
      for (const key of CREDENTIAL_KEYS) {
        if (encryptedData[key]) {
          const decrypted = await decryptKey(encryptedData[key], userId);
          if (decrypted) {
            localStorage.setItem(key, decrypted);
          }
        } else if (key === 'supabase_bucket') {
          if (!localStorage.getItem('supabase_bucket')) {
            localStorage.setItem('supabase_bucket', 'folient-media');
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed to sync credentials from Firestore:", err);
  }
}

/**
 * Encrypts a single key-value pair and saves to Firestore
 */
export async function syncCredentialToFirestore(userId: string, key: string, value: string): Promise<void> {
  try {
    const docRef = doc(db, 'user_credentials', userId);
    const encryptedValue = value ? await encryptKey(value, userId) : '';
    await setDoc(docRef, {
      [key]: encryptedValue,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.error(`Failed to sync credential ${key} to Firestore:`, err);
    throw err;
  }
}

/**
 * Clears all credentials from localStorage on logout
 */
export function clearLocalCredentials(): void {
  for (const key of CREDENTIAL_KEYS) {
    localStorage.removeItem(key);
  }
}
