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

// Load Firebase configuration
export function getFirebaseDb() {
  if (dbInstance) return dbInstance;

  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn("firebase-applet-config.json not found, falling back to local storage");
      return null;
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
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
    console.log("Firebase Firestore initialized successfully with database:", databaseId);
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

// Helper to remove any undefined fields before sending to Firestore
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeForFirestore) as any;
  }
  if (typeof data === "object" && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as any;
  }
  return data;
}

// 1. User Account Operations
export async function syncUserToFirestore(user: FirestoreUser): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const payload = sanitizeForFirestore({
      ...user,
      updatedAt: Date.now()
    });
    await setDoc(doc(db, "users", user.id), payload, { merge: true });
  } catch (err) {
    console.error(`Firestore save user error (${user.username}):`, err);
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
      if (data && data.id && data.username) {
        usersMap[data.id] = data;
      }
    });
    return usersMap;
  } catch (err) {
    console.error("Firestore load users error:", err);
    return {};
  }
}

// 2. Global System Config (Prompt & Announcement) Operations
export async function syncSystemConfigToFirestore(config: FirestoreSystemConfig): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const payload = sanitizeForFirestore({
      ...config,
      updatedAt: Date.now()
    });
    await setDoc(doc(db, "system_config", "global"), payload, { merge: true });
  } catch (err) {
    console.error("Firestore save system config error:", err);
  }
}

export async function loadSystemConfigFromFirestore(): Promise<FirestoreSystemConfig | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const docRef = doc(db, "system_config", "global");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FirestoreSystemConfig;
    }
  } catch (err) {
    console.error("Firestore load system config error:", err);
  }
  return null;
}

// 3. User Search & Chat Query Log Operations
export interface UserSearchLog {
  id: string;
  userId: string;
  username: string;
  userName: string;
  query: string;
  response?: string;
  responsePreview?: string;
  timestamp: number;
  deviceInfo?: any;
  status?: 'raw' | 'trained' | 'optimized';
  trainedKnowledgeId?: string;
  optimizedAnswer?: string;
}

export async function saveUserSearchLog(log: UserSearchLog): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;
  try {
    const payload = sanitizeForFirestore({
      ...log
    });
    await setDoc(doc(db, "user_searches", log.id), payload);
  } catch (err) {
    console.error(`Firestore save search log error:`, err);
  }
}

export async function getUserSearchLogs(userId?: string): Promise<UserSearchLog[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const colRef = collection(db, "user_searches");
    // Always use a simple fetch in fallback mode first to guarantee data retrieval even if indexes are missing
    const q = query(colRef, limit(300));
    const snapshot = await getDocs(q);
    const logs: UserSearchLog[] = [];
    snapshot.forEach((d) => {
      const item = d.data() as UserSearchLog;
      // Filter in memory for maximum reliability
      if (!userId || item.userId === userId) {
        logs.push({ ...item, id: d.id });
      }
    });
    // Sort in memory by timestamp descending
    logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return logs.slice(0, 150);
  } catch (err) {
    console.error("Firestore get search logs error:", err);
    return [];
  }
}

// 4. Learned Knowledge Base & Q&A Training Operations
export interface FirestoreKnowledgeItem {
  id: string;
  topic: string;
  questionPattern: string;
  refinedAnswer: string;
  category: string;
  sourceQuery?: string;
  sourceQueryId?: string;
  confidenceScore: number;
  timesApplied: number;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'draft' | 'archived';
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
