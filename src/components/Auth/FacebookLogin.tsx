import React, { useState } from "react";
import { Facebook } from "lucide-react";
import { supabase } from "../../services/supabaseClient"; // Importamos o cliente Supabase

export const FacebookLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
      });

      if (error) {
        throw error;
      }
    } catch (err: unknown) {
      // aqui usamos unknown para segurança
      const e = err as { message?: string }; // definimos o tipo
      console.error("Erro de autenticação com Supabase:", err);
      setError(`Erro ao fazer login: ${e.message || "Ocorreu um problema."}`);
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
            {loading ? "Conectando..." : "Conectar com Facebook"}
          </button>

          {error && (
            <p className="text-sm text-red-600 text-center mt-2">{error}</p>
          )}

          <div className="text-xs text-gray-500 text-center">
            <p>Você será redirecionado para o Facebook para autorizar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
