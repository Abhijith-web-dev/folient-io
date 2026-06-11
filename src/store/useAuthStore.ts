import { create } from 'zustand';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { syncCredentialsFromFirestore, clearLocalCredentials } from '../services/credentialSync';

interface AuthState {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      set({ loading: false });
      throw error;
    }
  },
  signOut: async () => {
    set({ loading: true });
    try {
      await fbSignOut(auth);
      clearLocalCredentials();
    } catch (error) {
      console.error("Sign-Out Error:", error);
      set({ loading: false });
      throw error;
    }
  },
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading })
}));

// Initialize Firebase Auth listener immediately to sync state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await syncCredentialsFromFirestore(user.uid);
  } else {
    clearLocalCredentials();
  }
  useAuthStore.getState().setUser(user);
});

