"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { transliterateName } from '@/ai/flows/transliterate-name';
import {
  useUser as useFirebaseAuthUser,
  useFirestore,
  useDoc,
  setDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface UserContextType extends UserProfile {
  firebaseUser: FirebaseUser | null;
  isUserLoading: boolean;
  displayName: string;
  setUserDetails: (details: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: firebaseUser, isUserLoading } = useFirebaseAuthUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !firebaseUser) return null;
    return doc(firestore, 'users', firebaseUser.uid);
  }, [firestore, firebaseUser]);
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const [displayName, setDisplayName] = useState<string>('');
  const { language, t } = useLanguage();

  const farmerFallback = t('farmer');

  useEffect(() => {
    const handleTransliteration = async () => {
      const nameToTransliterate = userProfile?.name || firebaseUser?.displayName || 'Farmer';
      if (nameToTransliterate) {
        if (language === 'en') {
          setDisplayName(nameToTransliterate === 'Farmer' ? farmerFallback : nameToTransliterate);
        } else {
          try {
            const transliterated = await transliterateName({ name: nameToTransliterate, language });
            setDisplayName(transliterated);
          } catch (error) {
            console.error("Transliteration failed:", error);
            setDisplayName(nameToTransliterate === 'Farmer' ? farmerFallback : nameToTransliterate); // Fallback
          }
        }
      } else {
         setDisplayName(farmerFallback);
      }
    };

    handleTransliteration();
  }, [userProfile?.name, firebaseUser?.displayName, language, farmerFallback]);

  const setUserDetails = (details: Partial<UserProfile>) => {
    if (userDocRef) {
      setDocumentNonBlocking(userDocRef, details, { merge: true });
    }
  };

  const value: UserContextType = {
    firebaseUser,
    isUserLoading: isUserLoading || isProfileLoading,
    name: userProfile?.name || firebaseUser?.displayName || '',
    displayName,
    email: userProfile?.email || firebaseUser?.email || '',
    phone: userProfile?.phone || '',
    address: userProfile?.address || '',
    setUserDetails,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
