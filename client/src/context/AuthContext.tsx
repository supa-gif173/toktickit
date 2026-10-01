import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, fetchMe, logout as apiLogout } from '../api';

interface AuthContextType {
  activeUser: User | null;
  setActiveUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then(data => setActiveUser(data.user))
      .catch(() => setActiveUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const logout = async () => {
    try {
      await apiLogout();
      setActiveUser(null);
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <AuthContext.Provider value={{ activeUser, setActiveUser, isLoading, logout }}>
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
