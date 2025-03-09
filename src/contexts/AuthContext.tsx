import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, enableOfflinePersistence, initAnalytics } from '../lib/firebase';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  occupation?: string;
  profileImage?: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
}

type PersistenceType = 'session' | 'remember';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<AuthResult>; 
  signIn: (email: string, password: string, persistence?: PersistenceType) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Initialize Firebase features
  useEffect(() => {
    const initializeFirebaseFeatures = async () => {
      try {
        // Enable offline persistence
        await enableOfflinePersistence();
        
        // Initialize analytics
        await initAnalytics();
      } catch (error) {
        console.error('Error initializing Firebase features:', error);
      }
    };

    initializeFirebaseFeatures();
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    let timeoutId: number | undefined;

    const initializeAuth = async () => {
      try {
        // Set persistence first with a timeout to prevent hanging
        const persistencePromise = setPersistence(auth, browserLocalPersistence);
        
        // Set a timeout to prevent hanging on persistence setting
        timeoutId = window.setTimeout(() => {
          if (mounted) {
            console.warn('Persistence setup timed out, continuing with auth initialization');
            setupAuthListener();
          }
        }, 3000); // 3 second timeout
        
        // Wait for persistence to be set
        await persistencePromise;
        
        // Clear the timeout since persistence setup completed
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          timeoutId = undefined;
        }
        
        // Set up the auth listener
        setupAuthListener();
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setUser(null);
          setIsAuthenticated(false);
          setAuthInitialized(true);
        }
      }
    };
    
    const setupAuthListener = () => {
      // Set up the auth state listener
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted) return;

        try {
          if (firebaseUser) {
            // Create a basic user object immediately to improve perceived performance
            const basicUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
            };
            
            // Set the basic user info immediately
            setUser(basicUser as User);
            setIsAuthenticated(true);
            
            // Then fetch additional user data asynchronously
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              const userData = userDoc.data();
              
              if (mounted) {
                const fullUser = {
                  ...basicUser,
                  firstName: userData?.firstName,
                  lastName: userData?.lastName,
                  nickname: userData?.nickname,
                  occupation: userData?.occupation,
                  profileImage: userData?.profileImage || firebaseUser.photoURL || undefined
                };
                
                setUser(fullUser);
              }
            } catch (userDataError) {
              console.error("Error fetching additional user data:", userDataError);
              // We already set the basic user info, so we can continue
            }
          } else {
            if (mounted) {
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } catch (error) {
          console.error("Error processing auth state change:", error);
          if (mounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        } finally {
          if (mounted) {
            setLoading(false);
            setAuthInitialized(true);
          }
        }
      });
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        createdAt: new Date().toISOString()
      });

      // Return success without redirecting - let the component handle navigation
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      return { success: false, message: errorMessage };
    }
  }, []);

  const signIn = useCallback(async (
    email: string, 
    password: string, 
    persistence: PersistenceType = 'session'
  ): Promise<AuthResult> => {
    try {
      const persistenceType = persistence === 'remember' 
        ? browserLocalPersistence 
        : browserSessionPersistence;
      
      await setPersistence(auth, persistenceType);
      await signInWithEmailAndPassword(auth, email, password);

      // Return success without redirecting - let the component handle navigation
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Invalid email or password';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      }
      
      console.error("Sign in error:", error);
      return { success: false, message: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      
      // Don't redirect here - let the component handle navigation
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (data: Partial<User>) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      setLoading(true);
      
      if (Object.keys(data).length === 0) {
        return;
      }
      
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      if (data.firstName || data.lastName || data.profileImage) {
        await updateProfile(auth.currentUser, {
          displayName: data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}`
            : auth.currentUser.displayName,
          photoURL: data.profileImage || auth.currentUser.photoURL
        });
      }

      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Don't render children until auth is initialized
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1E4D3A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F5F5F2] border-t-[#E86F2C] rounded-full animate-spin mb-4"></div>
          <p className="text-[#F5F5F2] text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
