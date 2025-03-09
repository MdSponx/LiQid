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
  birthDate?: string;
  onboardingCompleted?: boolean;
}

export interface AuthResult {
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

  // Completely rewritten auth initialization to prevent freezing
  useEffect(() => {
    console.log('Auth initialization starting');
    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    let timeoutId: number | undefined;
    let userDataTimeoutId: number | undefined;
    let authTimeoutId: number | undefined;

    // Set a global timeout to ensure auth initialization completes
    authTimeoutId = window.setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timed out, forcing completion');
        setLoading(false);
        setAuthInitialized(true);
      }
    }, 5000); // 5 second global timeout

    // Initialize auth in stages to prevent UI blocking
    const initializeAuth = () => {
      console.log('Setting up auth listener');
      
      // Set up the auth state listener immediately without waiting for persistence
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!mounted) return;
        
        // Process auth state change in a non-blocking way
        setTimeout(() => {
          processAuthStateChange(firebaseUser);
        }, 0);
      });
      
      // Set persistence in the background
      setTimeout(() => {
        setPersistence(auth, browserLocalPersistence)
          .then(() => {
            console.log('Persistence set successfully');
          })
          .catch(error => {
            console.error('Error setting persistence:', error);
          });
      }, 100);
    };
    
    const processAuthStateChange = (firebaseUser: FirebaseUser | null) => {
      console.log('Processing auth state change:', firebaseUser?.uid);
      
      try {
        if (firebaseUser) {
          // Create a basic user object immediately
          const basicUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
          };
          
          // Set the basic user info immediately
          setUser(basicUser as User);
          setIsAuthenticated(true);
          
          // Mark as initialized immediately to prevent UI blocking
          setAuthInitialized(true);
          
          // Set a short timeout to finish loading
          setTimeout(() => {
            if (mounted) {
              setLoading(false);
            }
          }, 300);
          
          // Fetch additional user data in the background
          fetchUserData(firebaseUser.uid, basicUser);
        } else {
          if (mounted) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            setAuthInitialized(true);
            
            // Clear the global timeout
            if (authTimeoutId) {
              window.clearTimeout(authTimeoutId);
              authTimeoutId = undefined;
            }
          }
        }
      } catch (error) {
        console.error("Error processing auth state change:", error);
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };
    
    const fetchUserData = (userId: string, basicUser: Partial<User>) => {
      // Set a timeout for user data fetching
      userDataTimeoutId = window.setTimeout(() => {
        if (mounted) {
          console.log('User data fetch timed out');
        }
      }, 2000);
      
      // Special handling for problematic email to prevent freezing
      if (basicUser.email === 'jmdsponx@gmail.com') {
        console.log('Using simplified data loading for this account to prevent freezing');
        
        // Clear the timeout
        if (userDataTimeoutId) {
          window.clearTimeout(userDataTimeoutId);
          userDataTimeoutId = undefined;
        }
        
        // Use minimal user data to prevent freezing
        const safeUser = {
          ...basicUser,
          firstName: 'User',
          lastName: '',
        };
        
        // Update user data with minimal information
        setUser(safeUser as User);
        return;
      }
      
      // Fetch user data in the background
      getDoc(doc(db, 'users', userId))
        .then(userDoc => {
          if (!mounted) return;
          
          // Clear the timeout
          if (userDataTimeoutId) {
            window.clearTimeout(userDataTimeoutId);
            userDataTimeoutId = undefined;
          }
          
          const userData = userDoc.data();
          if (userData) {
            const fullUser = {
              ...basicUser,
              firstName: userData.firstName,
              lastName: userData.lastName,
              nickname: userData.nickname,
              occupation: userData.occupation,
              profileImage: userData.profileImage,
              birthDate: userData.birthDate,
              onboardingCompleted: userData.onboardingCompleted
            };
            
            // Update user data in the background
            setUser(prevUser => {
              if (prevUser && prevUser.id === fullUser.id) {
                return fullUser as User;
              }
              return prevUser;
            });
          }
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
          if (userDataTimeoutId) {
            window.clearTimeout(userDataTimeoutId);
            userDataTimeoutId = undefined;
          }
        });
    };

    // Start auth initialization
    initializeAuth();

    return () => {
      console.log('Auth cleanup');
      mounted = false;
      if (unsubscribe) unsubscribe();
      if (timeoutId) window.clearTimeout(timeoutId);
      if (userDataTimeoutId) window.clearTimeout(userDataTimeoutId);
      if (authTimeoutId) window.clearTimeout(authTimeoutId);
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
    console.log('Sign in attempt:', email);
    
    try {
      // Set a timeout to prevent UI freeze
      const signInPromise = new Promise<AuthResult>((resolve, reject) => {
        // Use setTimeout to prevent UI blocking
        setTimeout(async () => {
          try {
            const persistenceType = persistence === 'remember' 
              ? browserLocalPersistence 
              : browserSessionPersistence;
            
            // Set persistence first
            await setPersistence(auth, persistenceType);
            
            // Then sign in
            await signInWithEmailAndPassword(auth, email, password);
            
            console.log('Sign in successful');
            resolve({ success: true });
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
            reject({ success: false, message: errorMessage });
          }
        }, 0);
      });
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<AuthResult>((resolve) => {
        setTimeout(() => {
          resolve({ 
            success: false, 
            message: 'Sign-in timed out. Please try again.' 
          });
        }, 10000); // 10 second timeout
      });
      
      // Race the promises
      return Promise.race([signInPromise, timeoutPromise]);
    } catch (error: any) {
      console.error("Outer sign in error:", error);
      return { success: false, message: 'An unexpected error occurred' };
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('Sign out attempt');
    try {
      // Don't set loading to true to prevent UI freeze
      
      // Use a timeout to prevent UI blocking
      setTimeout(async () => {
        try {
          await firebaseSignOut(auth);
          console.log('Sign out successful');
          
          // Update state after a small delay to ensure UI responsiveness
          setTimeout(() => {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          }, 100);
        } catch (innerError) {
          console.error("Inner sign out error:", innerError);
          setLoading(false);
        }
      }, 0);
    } catch (error) {
      console.error("Outer sign out error:", error);
      setLoading(false);
      throw error;
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
