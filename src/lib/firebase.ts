import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCDWrMoZoQxcYMAA0sDCD-3ybgOESLyDr4",
  authDomain: "liqid-dd431.firebaseapp.com",
  projectId: "liqid-dd431",
  storageBucket: "liqid-dd431.appspot.com", // แก้ไข URL ให้ถูกต้อง
  messagingSenderId: "945097903452",
  appId: "1:945097903452:web:4336c75a038db09bfc4599",
  measurementId: "G-2J39W6N1CX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with simplified performance settings
const firestoreSettings = {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  ignoreUndefinedProperties: true
};

// Initialize services
const auth = getAuth(app);
const db = initializeFirestore(app, firestoreSettings);
const storage = getStorage(app);

// ใช้ lazy initialization สำหรับ analytics
const initAnalytics = async () => {
  try {
    if (await isSupported()) {
      return getAnalytics(app);
    }
    return null;
  } catch (err) {
    console.warn('Analytics not supported:', err);
    return null;
  }
};

// ย้ายการเปิด offline persistence ไปเป็นฟังก์ชันที่เรียกเมื่อต้องการ
// และไม่เรียกใช้ทันทีที่ import ไฟล์นี้
const enableOfflinePersistence = async () => {
  // Skip enabling persistence if we're in a development environment
  // or if we detect multiple tabs are open
  if (window.location.hostname === 'localhost') {
    console.log('Skipping offline persistence in development environment');
    return false;
  }
  
  // Check if multiple tabs are open
  try {
    const storageKey = 'liqid_tab_active';
    const currentTab = Date.now().toString();
    
    // Try to set a value in localStorage
    localStorage.setItem(storageKey, currentTab);
    
    // Wait a short time to see if another tab changes it
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if our value is still there
    const tabCheck = localStorage.getItem(storageKey);
    
    if (tabCheck !== currentTab) {
      console.log('Multiple tabs detected, skipping persistence');
      return false;
    }
    
    // Now try to enable persistence
    try {
      const { enableIndexedDbPersistence } = await import('firebase/firestore');
      await enableIndexedDbPersistence(db);
      console.log('Offline persistence enabled');
      return true;
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support offline persistence');
      } else {
        console.error('Error enabling offline persistence:', err);
      }
      return false;
    }
  } catch (e: any) {
    console.warn('Error checking for multiple tabs:', e);
    return false;
  }
};

// Export all services and functions in a single statement
export { auth, db, storage, enableOfflinePersistence, initAnalytics };
export default app;
