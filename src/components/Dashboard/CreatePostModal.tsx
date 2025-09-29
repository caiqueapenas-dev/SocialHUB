import React, { useState } from 'react';
import { X, Upload, Facebook, Instagram, Calendar, Link } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../hooks/usePosts';
import { Channel, PostFormat } from '../../types';
import { FacebookApiService } from '../../services/facebookApi';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { selectedClients } = useAuth();
  const { addPost, publishPost } = usePosts();
  const [formData, setFormData] = useState({
    clientId: '',
    content: '',
    format: 'single' as PostFormat,
    channels: [] as Channel[],
    scheduledDate: '',
    publishNow: false
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [approvalLink, setApprovalLink] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.publishNow) {
      setShowConfirmation(true);
    } else {
      schedulePost();
    }
  };

  const schedulePost = () => {
    const selectedClient = selectedClients.find(c => c.id === formData.clientId);
    if (!selectedClient) return;

    const newPost = addPost({
      clientId: formData.clientId,
      clientName: selectedClient.name,
      content: formData.content,
      media: [
        {
          id: Date.now().toString(),
          type: 'image' as const,
          url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500'
        }
      ],
      format: formData.format,
      channels: formData.channels,
      scheduledDate: formData.scheduledDate || new Date().toISOString(),
      status: 'pending_approval',
      approvalLink: `${window.location.origin}/approve/${Date.now()}`
    });

    setApprovalLink(newPost.approvalLink!);
    setShowConfirmation(false);
    resetForm();
  };

  const publishNow = () => {
    const selectedClient = selectedClients.find(c => c.id === formData.clientId);
    if (!selectedClient) return;

    const newPost = addPost({
      clientId: formData.clientId,
      clientName: selectedClient.name,
      content: formData.content,
      media: [
        {
          id: Date.now().toString(),
          type: 'image' as const,
          url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500'
        }
      ],
      format: formData.format,
      channels: formData.channels,
      scheduledDate: new Date().toISOString(),
      status: 'approved'
    });

    // Publicar imediatamente
    publishPost(newPost)
      .then(() => {
        alert('Post publicado com sucesso!');
        setShowConfirmation(false);
        onClose();
        resetForm();
      })
      .catch((error) => {
        console.error('Erro ao publicar:', error);
        alert(`Erro ao publicar: ${error.message}`);
        setShowConfirmation(false);
      });
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      content: '',
      format: 'single',
      channels: [],
      scheduledDate: '',
      publishNow: false
    });
  };

  const toggleChannel = (channel: Channel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Publicação</h3>
          <p className="text-sm text-gray-600 mb-6">
            Tem certeza que deseja publicar este post agora? Esta ação não pode ser desfeita.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={publishNow}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Publicar Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (approvalLink) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Post Agendado!</h3>
            <button
              onClick={() => {
                setApprovalLink('');
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Post criado com sucesso! Envie este link para aprovação do cliente:
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={approvalLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(approvalLink);
                  alert('Link copiado!');
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Link size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Criar Novo Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione um cliente</option>
              {selectedClients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mídia
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Clique para fazer upload ou arraste arquivos aqui
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, MP4 até 10MB</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legenda
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite a legenda do post..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as PostFormat }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="single">Foto única</option>
                <option value="carousel">Carrossel</option>
                <option value="story">Story</option>
                <option value="reels">Reels</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Onde Publicar
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes('facebook')}
                    onChange={() => toggleChannel('facebook')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Facebook size={20} className="text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes('instagram')}
                    onChange={() => toggleChannel('instagram')}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <Instagram size={20} className="text-pink-600" />
                  <span className="text-sm">Instagram</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selecione onde deseja publicar este conteúdo
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Agendamento
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.publishNow}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishNow: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Publicar agora</span>
              </label>
            </div>
            {!formData.publishNow && (
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  required={!formData.publishNow}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.clientId || !formData.content || formData.channels.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formData.publishNow ? 'Publicar Agora' : 'Criar e Enviar para Aprovação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};