import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import fs from "fs";
import path from "path";

let dbInstance: any = null;
let isInitialized = false;

// Hardcoded safe fallback config from firebase-applet-config.json
const FALLBACK_FIREBASE_CONFIG = {
  projectId: "lucky-quota-chh41",
  appId: "1:1010117210567:web:2c6edce4f50a09b22b29e2",
  apiKey: "AIzaSyD3EuLGT32Sme9LvYmSC3n3NVNbOlnWEbM",
  authDomain: "lucky-quota-chh41.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-notrackaichat-231a7122-f7a4-4bb8-8f33-147d495472ce",
  storageBucket: "lucky-quota-chh41.firebasestorage.app",
  messagingSenderId: "1010117210567"
};

// Load Firebase configuration
export function getFirebaseDb() {
  if (dbInstance) return dbInstance;

  try {
    let config = FALLBACK_FIREBASE_CONFIG;
    try {
      const configPath = path.join(process.cwd(), "firebase-applet-config.json");
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, "utf-8");
        config = { ...FALLBACK_FIREBASE_CONFIG, ...JSON.parse(raw) };
      }
    } catch {
      // Use fallback
    }

    const firebaseConfig = {
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const databaseId = config.firestoreDatabaseId || "(default)";
    
    dbInstance = getFirestore(app, databaseId);
    isInitialized = true;
    return dbInstance;
  } catch (err) {
    console.error("Failed to initialize Firebase Firestore:", err);
    return null;
  }
}

export interface FirestoreUser {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  createdAt: number;
  lastLoginAt: number;
  loginCount: number;
  deviceInfo?: any;
  lastKnownIp?: string;
  credits?: number;
  isPremium?: boolean;
  subscriptionExpiresAt?: number;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  registeredDeviceId?: string;
}

export interface FirestoreSystemConfig {
  prompt?: string;
  announcementEnabled?: boolean;
  announcementText?: string;
  announcementBadge?: string;
  announcementLink?: string;
  announcementLinkText?: string;
  updatedAt?: number;
}

export interface FirestoreKnowledgeItem {
  id: string;
  topic: string;
  questionPattern: string;
  refinedAnswer: string;
  category: 'General' | 'Coding' | 'Security' | 'How-To' | 'Troubleshooting' | 'Architecture' | 'FAQ';
  sourceQuery?: string;
  sourceQueryId?: string;
  confidenceScore: number;
  timesApplied: number;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'draft' | 'archived';
}

function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  }
  return clean;
}

export async function syncUserToFirestore(user: FirestoreUser): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const cleanUser = sanitizeForFirestore(user);
    await setDoc(doc(db, "users", user.id), cleanUser, { merge: true });
  } catch (err) {
    console.error(`Firestore save user error (${user.id}):`, err);
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch (err) {
    console.error(`Firestore delete user error (${userId}):`, err);
  }
}

export async function loadAllUsersFromFirestore(): Promise<Record<string, FirestoreUser>> {
  const db = getFirebaseDb();
  if (!db) return {};
  try {
    const colRef = collection(db, "users");
    const snapshot = await getDocs(colRef);
    const usersMap: Record<string, FirestoreUser> = {};
    snapshot.forEach((d) => {
      const data = d.data() as FirestoreUser;
      if (data && data.id) {
        usersMap[data.id] = data;
      }
    });
    return usersMap;
  } catch (err) {
    console.error("Firestore load all users error:", err);
    return {};
  }
}

export async function syncSystemConfigToFirestore(config: FirestoreSystemConfig): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const cleanConfig = sanitizeForFirestore({
      ...config,
      updatedAt: Date.now()
    });
    await setDoc(doc(db, "system", "config"), cleanConfig, { merge: true });
  } catch (err) {
    console.error("Firestore save config error:", err);
  }
}

export async function loadSystemConfigFromFirestore(): Promise<FirestoreSystemConfig | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const docRef = doc(db, "system", "config");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as FirestoreSystemConfig;
    }
    return null;
  } catch (err) {
    console.error("Firestore load config error:", err);
    return null;
  }
}

export async function saveUserSearchLog(log: Record<string, any>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const logId = log.id || ("log_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6));
    const cleanLog = sanitizeForFirestore({
      ...log,
      id: logId,
      timestamp: log.timestamp || Date.now()
    });
    await setDoc(doc(db, "search_logs", logId), cleanLog, { merge: true });
  } catch (err) {
    console.error("Firestore save search log error:", err);
  }
}

export async function getUserSearchLogs(userId?: string): Promise<any[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const colRef = collection(db, "search_logs");
    let q;
    if (userId) {
      q = query(colRef, where("userId", "==", userId), limit(100));
    } else {
      q = query(colRef, limit(200));
    }
    const snapshot = await getDocs(q);
    const logs: any[] = [];
    snapshot.forEach((d) => {
      logs.push(d.data());
    });
    logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return logs;
  } catch (err) {
    console.error("Firestore get search logs error:", err);
    return [];
  }
}

export async function syncLearnedKnowledgeToFirestore(item: FirestoreKnowledgeItem): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const payload = sanitizeForFirestore({
      ...item,
      updatedAt: Date.now()
    });
    await setDoc(doc(db, "learned_knowledge", item.id), payload, { merge: true });
  } catch (err) {
    console.error(`Firestore save learned knowledge error (${item.id}):`, err);
  }
}

export async function deleteLearnedKnowledgeFromFirestore(id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    await deleteDoc(doc(db, "learned_knowledge", id));
  } catch (err) {
    console.error(`Firestore delete learned knowledge error (${id}):`, err);
  }
}

export async function loadAllLearnedKnowledgeFromFirestore(): Promise<Record<string, FirestoreKnowledgeItem>> {
  const db = getFirebaseDb();
  if (!db) return {};
  try {
    const colRef = collection(db, "learned_knowledge");
    const snapshot = await getDocs(colRef);
    const itemsMap: Record<string, FirestoreKnowledgeItem> = {};
    snapshot.forEach((d) => {
      const data = d.data() as FirestoreKnowledgeItem;
      if (data && data.id && data.questionPattern) {
        itemsMap[data.id] = data;
      }
    });
    return itemsMap;
  } catch (err) {
    console.error("Firestore load learned knowledge error:", err);
    return {};
  }
}
