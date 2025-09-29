import React, { createContext, useContext, useState, useEffect } from 'react';
import { FacebookAuth, Client } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  facebookAuth: FacebookAuth | null;
  selectedClients: Client[];
  allClients: Client[];
  selectedClientFilter: string | null;
  login: (authData: FacebookAuth) => void;
  logout: () => void;
  toggleClient: (clientId: string) => void;
  setClients: (clients: Client[]) => void;
  updateClientDisplayName: (clientId: string, displayName: string) => void;
  setSelectedClientFilter: (clientId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cores para tags dos clientes
const CLIENT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [facebookAuth, setFacebookAuth] = useState<FacebookAuth | null>(null);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [selectedClientFilter, setSelectedClientFilter] = useState<string | null>(null);

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

    const storedFilter = localStorage.getItem('selectedClientFilter');
    if (storedFilter) {
      setSelectedClientFilter(storedFilter);
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
    setSelectedClientFilter(null);
    localStorage.removeItem('facebookAuth');
    localStorage.removeItem('selectedClients');
    localStorage.removeItem('allClients');
    localStorage.removeItem('selectedClientFilter');
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
    // Atribuir cores aos clientes
    const clientsWithColors = clients.map((client, index) => ({
      ...client,
      color: CLIENT_COLORS[index % CLIENT_COLORS.length]
    }));

    setAllClients(clientsWithColors);
    localStorage.setItem('allClients', JSON.stringify(clientsWithColors));
  };

  const updateClientDisplayName = (clientId: string, displayName: string) => {
    const updatedClients = allClients.map(client =>
      client.id === clientId ? { ...client, displayName } : client
    );
    
    const updatedSelected = selectedClients.map(client =>
      client.id === clientId ? { ...client, displayName } : client
    );

    setAllClients(updatedClients);
    setSelectedClients(updatedSelected);
    localStorage.setItem('allClients', JSON.stringify(updatedClients));
    localStorage.setItem('selectedClients', JSON.stringify(updatedSelected));
  };

  const filteredSelectedClients = selectedClientFilter 
    ? selectedClients.filter(c => c.id === selectedClientFilter)
    : selectedClients;

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!facebookAuth,
      facebookAuth,
      selectedClients: filteredSelectedClients,
      allClients,
      selectedClientFilter,
      login,
      logout,
      toggleClient,
      setClients,
      updateClientDisplayName,
      setSelectedClientFilter
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