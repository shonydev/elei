import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Business } from '../types';
import { INITIAL_BUSINESSES } from '../data/initialBusinesses';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with long-polling and ignoreUndefinedProperties
export const db: Firestore = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true,
  },
  firebaseConfig.firestoreDatabaseId || undefined
);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Designated Super Admin Email
export const SUPER_ADMIN_EMAILS = [
  'jonathanalexisleon1998@gmail.com',
];

// Connection check helper
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'businesses', 'connection-check'));
  } catch {
    // Gracefully handled - offline or initializing
  }
}

/**
 * Check if a user is an administrator
 * Grants admin rights to designated email or anyone authenticated through the Admin portal
 */
export async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  return true;
}

/**
 * Sanitize an object to ensure no `undefined` properties are sent to Firestore
 */
export function sanitizeBusinessForFirestore(business: Business): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(business)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

/**
 * Subscribe to realtime businesses updates from Firestore.
 * Merges loaded businesses with initial businesses so base cafes are never lost.
 */
export function subscribeToBusinesses(
  onUpdate: (businesses: Business[]) => void,
  onError: (err: Error) => void
): () => void {
  const businessesRef = collection(db, 'businesses');

  const unsubscribe = onSnapshot(
    businessesRef,
    (snapshot) => {
      const businessMap = new Map<string, Business>();

      // Populate base initial businesses first
      for (const init of INITIAL_BUSINESSES) {
        businessMap.set(init.id, init);
      }

      // Merge businesses from Cloud Firestore
      if (!snapshot.empty) {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Business;
          businessMap.set(docSnap.id, {
            ...data,
            id: docSnap.id,
          });
        });
      }

      const merged = Array.from(businessMap.values());
      merged.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.name.localeCompare(b.name);
      });

      onUpdate(merged);
    },
    (error) => {
      console.warn('Firestore onSnapshot connection state:', error.message);
      onError(error);
      onUpdate(INITIAL_BUSINESSES);
    }
  );

  return unsubscribe;
}

/**
 * Seed the initial 5 businesses to Firestore
 */
export async function seedInitialBusinesses(): Promise<void> {
  for (const b of INITIAL_BUSINESSES) {
    const docRef = doc(db, 'businesses', b.id);
    await setDoc(docRef, sanitizeBusinessForFirestore(b), { merge: true });
  }
}

/**
 * Save or update a business in Firestore (Admin only)
 */
export async function saveBusinessToFirestore(business: Business): Promise<void> {
  const clean = sanitizeBusinessForFirestore(business);
  const docRef = doc(db, 'businesses', business.id);
  await setDoc(docRef, clean, { merge: true });
}

/**
 * Delete a business from Firestore (Admin only)
 */
export async function deleteBusinessFromFirestore(businessId: string): Promise<void> {
  const docRef = doc(db, 'businesses', businessId);
  await deleteDoc(docRef);
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
};
export type { User };
