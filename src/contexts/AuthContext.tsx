import React, { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { Client } from "../types";
import { supabase } from "../services/supabaseClient";
import { FacebookApiService } from "../services/facebookApi";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  selectedClients: Client[];
  allClients: Client[];
  selectedClientFilter: string | null;
  logout: () => void;
  toggleClient: (clientId: string) => void;
  updateClientDisplayName: (clientId: string, displayName: string) => void;
  setSelectedClientFilter: (clientId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLIENT_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#EC4899",
  "#6366F1",
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [selectedClientFilter, setSelectedClientFilter] = useState<
    string | null
  >(null);

  useEffect(() => {
    // Escuta as mudanças de autenticação do Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session) {
        // Se houver uma sessão, busca as páginas do Facebook
        fetchFacebookPages(session.provider_token!);
      }
    });

    // Carrega clientes salvos do localStorage ao iniciar
    const storedClients = localStorage.getItem("allClients");
    if (storedClients) setAllClients(JSON.parse(storedClients));

    const storedSelected = localStorage.getItem("selectedClients");
    if (storedSelected) setSelectedClients(JSON.parse(storedSelected));

    const storedFilter = localStorage.getItem("selectedClientFilter");
    if (storedFilter) setSelectedClientFilter(storedFilter);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchFacebookPages = async (providerToken: string) => {
    // Esta parte ainda usa o FacebookApiService, mas agora com um token seguro vindo do Supabase
    const facebookApi = FacebookApiService.getInstance();
    // Temporariamente, vamos precisar instanciar a classe para acessar o método,
    // já que o token agora é dinâmico. Idealmente, isso seria refatorado.
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v23.0/me/accounts?access_token=${providerToken}&fields=id,name,access_token,instagram_business_account{id,username},category,picture`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.data) {
      const clients = facebookApi.convertPagesToClients(pagesData.data);
      const clientsWithColors = clients.map((client, index) => ({
        ...client,
        color: CLIENT_COLORS[index % CLIENT_COLORS.length],
      }));
      setAllClients(clientsWithColors);
      localStorage.setItem("allClients", JSON.stringify(clientsWithColors));
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAllClients([]);
    setSelectedClients([]);
    setSelectedClientFilter(null);
    localStorage.removeItem("allClients");
    localStorage.removeItem("selectedClients");
    localStorage.removeItem("selectedClientFilter");
  };

  const toggleClient = (clientId: string) => {
    const client = allClients.find((c) => c.id === clientId);
    if (!client) return;

    const isSelected = selectedClients.some((c) => c.id === clientId);
    const newSelected = isSelected
      ? selectedClients.filter((c) => c.id !== clientId)
      : [...selectedClients, client];

    setSelectedClients(newSelected);
    localStorage.setItem("selectedClients", JSON.stringify(newSelected));
  };

  const updateClientDisplayName = (clientId: string, displayName: string) => {
    const updatedClients = allClients.map((client) =>
      client.id === clientId ? { ...client, displayName } : client
    );
    const updatedSelected = selectedClients.map((client) =>
      client.id === clientId ? { ...client, displayName } : client
    );

    setAllClients(updatedClients);
    setSelectedClients(updatedSelected);
    localStorage.setItem("allClients", JSON.stringify(updatedClients));
    localStorage.setItem("selectedClients", JSON.stringify(updatedSelected));
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated: !!session,
        selectedClients,
        allClients,
        selectedClientFilter,
        logout,
        toggleClient,
        updateClientDisplayName,
        setSelectedClientFilter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
