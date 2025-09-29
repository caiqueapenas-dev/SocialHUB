import React, { createContext, useContext, useState, useEffect } from 'react';
import { FacebookAuth, Client } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  facebookAuth: FacebookAuth | null;
  selectedClients: Client[];
  allClients: Client[];
  login: (authData: FacebookAuth) => void;
  logout: () => void;
  toggleClient: (clientId: string) => void;
  setClients: (clients: Client[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [facebookAuth, setFacebookAuth] = useState<FacebookAuth | null>(null);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('facebookAuth');
    if (stored) {
      setFacebookAuth(JSON.parse(stored));
    }

    const storedClients = localStorage.getItem('allClients');
    if (storedClients) {
      setAllClients(JSON.parse(storedClients));
    }

    const storedSelected = localStorage.getItem('selectedClients');
    if (storedSelected) {
      setSelectedClients(JSON.parse(storedSelected));
    }
  }, []);

  const login = (authData: FacebookAuth) => {
    setFacebookAuth(authData);
    localStorage.setItem('facebookAuth', JSON.stringify(authData));
  };

  const logout = () => {
    setFacebookAuth(null);
    setSelectedClients([]);
    setAllClients([]);
    localStorage.removeItem('facebookAuth');
    localStorage.removeItem('selectedClients');
    localStorage.removeItem('allClients');
  };

  const toggleClient = (clientId: string) => {
    const client = allClients.find(c => c.id === clientId);
    if (!client) return;

    const isSelected = selectedClients.some(c => c.id === clientId);
    const newSelected = isSelected
      ? selectedClients.filter(c => c.id !== clientId)
      : [...selectedClients, client];

    setSelectedClients(newSelected);
    localStorage.setItem('selectedClients', JSON.stringify(newSelected));
  };

  const setClients = (clients: Client[]) => {
    setAllClients(clients);
    localStorage.setItem('allClients', JSON.stringify(clients));
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!facebookAuth,
      facebookAuth,
      selectedClients,
      allClients,
      login,
      logout,
      toggleClient,
      setClients
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};