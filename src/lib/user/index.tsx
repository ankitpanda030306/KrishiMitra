"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { transliterateName } from '@/ai/flows/transliterate-name';

interface UserContextType {
  name: string; // This will be the original English name
  displayName: string; // This will be the (potentially) transliterated name
  setName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [name, setName] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const { language, t } = useLanguage();

  const farmerFallback = t('farmer');

  // When the component mounts, get the original name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('krishiMitraUserName');
    if (storedName) {
      setName(storedName);
    }
  }, []);

  // Effect to handle transliteration whenever the original name or language changes
  useEffect(() => {
    const handleTransliteration = async () => {
      if (name) {
        if (language === 'en') {
          setDisplayName(name);
        } else {
          try {
            const transliterated = await transliterateName({ name, language });
            setDisplayName(transliterated);
          } catch (error) {
            console.error("Transliteration failed:", error);
            setDisplayName(name); // Fallback to original name on error
          }
        }
      } else {
        // Handle the case where there is no name (e.g., not logged in or no name set)
         if (language === 'en') {
          setDisplayName(farmerFallback);
        } else {
           try {
            const transliterated = await transliterateName({ name: 'Farmer', language });
            setDisplayName(transliterated);
          } catch (error) {
            console.error("Transliteration failed:", error);
            setDisplayName(farmerFallback); // Fallback to original name on error
          }
        }
      }
    };

    handleTransliteration();
  }, [name, language, farmerFallback]);


  const handleSetName = (newName: string) => {
    setName(newName);
    localStorage.setItem('krishiMitraUserName', newName);
  };

  return (
    <UserContext.Provider value={{ name, displayName, setName: handleSetName }}>
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
