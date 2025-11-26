"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { transliterateName } from '@/ai/flows/transliterate-name';

interface UserDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}
interface UserContextType extends UserDetails {
  displayName: string; // This will be the (potentially) transliterated name
  setUserDetails: (details: Partial<UserDetails>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const { language, t } = useLanguage();

  const farmerFallback = t('farmer');

  // Load user data from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem('krishiMitraUserName');
    if (storedName) setName(storedName);
    const storedEmail = localStorage.getItem('krishiMitraUserEmail');
    if (storedEmail) setEmail(storedEmail);
    const storedPhone = localStorage.getItem('krishiMitraUserPhone');
    if (storedPhone) setPhone(storedPhone);
    const storedAddress = localStorage.getItem('krishiMitraUserAddress');
    if (storedAddress) setAddress(storedAddress);
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


  const setUserDetails = (details: Partial<UserDetails>) => {
    if (details.name !== undefined) {
      setName(details.name);
      localStorage.setItem('krishiMitraUserName', details.name);
    }
    if (details.email !== undefined) {
      setEmail(details.email);
      localStorage.setItem('krishiMitraUserEmail', details.email);
    }
    if (details.phone !== undefined) {
      setPhone(details.phone);
      localStorage.setItem('krishiMitraUserPhone', details.phone);
    }
    if (details.address !== undefined) {
      setAddress(details.address);
      localStorage.setItem('krishiMitraUserAddress', details.address);
    }
  };

  return (
    <UserContext.Provider value={{ name, displayName, email, phone, address, setUserDetails }}>
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
