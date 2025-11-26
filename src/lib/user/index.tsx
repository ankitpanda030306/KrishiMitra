"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface UserContextType {
  name: string;
  setName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [name, setName] = useState<string>('');

  useEffect(() => {
    // On initial load, try to get the name from localStorage
    const storedName = localStorage.getItem('krishiMitraUserName');
    if (storedName) {
      setName(storedName);
    }
  }, []);


  const handleSetName = (newName: string) => {
    setName(newName);
    localStorage.setItem('krishiMitraUserName', newName);
  };

  return (
    <UserContext.Provider value={{ name, setName: handleSetName }}>
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
