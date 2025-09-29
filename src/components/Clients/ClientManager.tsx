import React, { useState } from 'react';
import { Users, Check, X, CreditCard as Edit2, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const ClientManager: React.FC = () => {
  const { allClients, selectedClients, toggleClient, updateClientDisplayName } = useAuth();
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (clientId: string, currentName: string) => {
    setEditingClient(clientId);
    setEditName(currentName);
  };

  const saveEdit = (clientId: string) => {
    updateClientDisplayName(clientId, editName);
    setEditingClient(null);
    setEditName('');
  };

  const cancelEdit = () => {
    setEditingClient(null);
    setEditName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h1>
        <p className="mt-1 text-sm text-gray-600">
          Selecione quais clientes você deseja visualizar no dashboard e personalize seus nomes
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Clientes Disponíveis</h2>
            <div className="text-sm text-gray-500">
              {selectedClients.length} de {allClients.length} selecionados
            </div>
          </div>
        </div>

        {allClients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum cliente encontrado</h3>
            <p className="mt-2 text-gray-500">
              Verifique se sua conta do Facebook tem acesso às páginas necessárias.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {allClients.map(client => {
              const isSelected = selectedClients.some(c => c.id === client.id);
              const isEditing = editingClient === client.id;
              
              return (
                <div key={client.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {client.avatar ? (
                          <img
                            src={client.avatar}
                            alt={client.displayName || client.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users size={20} className="text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEdit(client.id)}
                              className="p-1 text-green-600 hover:text-green-700"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {client.displayName || client.name}
                              </h3>
                              {client.displayName && (
                                <p className="text-xs text-gray-500">
                                  Nome original: {client.name}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                {client.instagramAccountId ? 'Facebook + Instagram' : 'Apenas Facebook'}
                              </p>
                            </div>
                            <button
                              onClick={() => startEditing(client.id, client.displayName || client.name)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-xs text-gray-400">
                        ID: {client.id.substring(0, 8)}...
                      </div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: client.color }}
                        title="Cor da tag"
                      />
                      <button
                        onClick={() => toggleClient(client.id)}
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                          isSelected
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? <Check size={16} /> : <X size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Informação</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Estes são os clientes (páginas do Facebook) associados à sua conta. 
                Selecione quais deseja gerenciar no dashboard e personalize os nomes como preferir.
                Cada cliente tem uma cor única para facilitar a identificação nos posts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};