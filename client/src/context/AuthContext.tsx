import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Requester {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface AuthContextType {
  activeRequester: Requester | null;
  setActiveRequester: (requester: Requester | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [activeRequester, setActiveRequesterState] = useState<Requester | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from local storage on mount
    const stored = localStorage.getItem('toktickit_requester');
    if (stored) {
      try {
        setActiveRequesterState(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored requester', e);
      }
    }
    setIsLoading(false);
  }, []);

  const setActiveRequester = (requester: Requester | null) => {
    setActiveRequesterState(requester);
    if (requester) {
      localStorage.setItem('toktickit_requester', JSON.stringify(requester));
    } else {
      localStorage.removeItem('toktickit_requester');
    }
  };

  return (
    <AuthContext.Provider value={{ activeRequester, setActiveRequester, isLoading }}>
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
