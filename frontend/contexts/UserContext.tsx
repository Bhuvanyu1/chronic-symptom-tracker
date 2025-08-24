import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import backend from '~backend/client';
import type { User } from '~backend/symptom/types';

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  createUser: (userData: { name: string; conditions: string[]; checkInTime: string }) => Promise<User>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          const userData = await backend.symptom.getUser({ id: storedUserId });
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('userId');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const createUser = async (userData: { name: string; conditions: string[]; checkInTime: string }) => {
    const newUser = await backend.symptom.createUser(userData);
    localStorage.setItem('userId', newUser.id);
    setUser(newUser);
    return newUser;
  };

  return (
    <UserContext.Provider value={{ user, loading, setUser, createUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
