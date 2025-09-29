import React, { useState } from 'react';
import { Facebook } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { FacebookApiService } from '../../services/facebookApi';

export const FacebookLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login, setClients } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const facebookApi = FacebookApiService.getInstance();
      const authData = await facebookApi.authenticateUser();
      const clients = facebookApi.convertPagesToClients(authData.pages);
      
      login(authData);
      setClients(clients);
      
      console.log('Autenticação realizada com sucesso!');
      console.log(`Usuário: ${authData.userId}`);
      console.log(`Páginas encontradas: ${authData.pages.length}`);
    } catch (error) {
      console.error('Erro de autenticação:', error);
      alert(`Erro ao fazer login com Facebook: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Facebook className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            SocialHub
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Faça login com sua conta do Facebook para acessar o dashboard
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Facebook className="h-5 w-5" />
            </span>
            {loading ? 'Conectando...' : 'Conectar com Facebook'}
          </button>

          <div className="text-xs text-gray-500 text-center">
            <p>Conectando com suas páginas do Facebook e Instagram...</p>
            <p className="mt-1">Certifique-se de que possui as permissões necessárias.</p>
          </div>
        </div>
      </div>
    </div>
  );
};