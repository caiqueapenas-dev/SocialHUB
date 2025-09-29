import React, { useState, useRef } from 'react';
import { X, Upload, Facebook, Instagram, Calendar, Link, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePosts } from '../../hooks/usePosts';
import { Channel, PostFormat, MediaFile } from '../../types';
import { FacebookApiService } from '../../services/facebookApi';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { selectedClients } = useAuth();
  const { addPost, publishPost } = usePosts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    clientIds: [] as string[],
    content: '',
    format: 'single' as PostFormat,
    channels: [] as Channel[],
    scheduledDate: '',
    publishNow: false
  });
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [approvalLink, setApprovalLink] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Definir data padrão como agora
  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setFormData(prev => ({ ...prev, scheduledDate: localDateTime }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newMediaFiles: MediaFile[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      url: URL.createObjectURL(file),
      file
    }));
    
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const removeMedia = (mediaId: string) => {
    setMediaFiles(prev => prev.filter(m => m.id !== mediaId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.publishNow) {
      setShowConfirmation(true);
    } else {
      schedulePost();
    }
  };

  const schedulePost = () => {
    if (formData.clientIds.length === 0) return;

    // Criar posts para cada cliente selecionado
    const createdPosts = formData.clientIds.map(clientId => {
      const selectedClient = selectedClients.find(c => c.id === clientId);
      if (!selectedClient) return null;

      return addPost({
        clientId,
        clientName: selectedClient.name,
        content: formData.content,
        media: mediaFiles.length > 0 ? mediaFiles : [
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
    }).filter(Boolean);

    if (createdPosts.length > 0) {
      setApprovalLink(createdPosts[0]!.approvalLink!);
    }
    
    setShowConfirmation(false);
    resetForm();
  };

  const publishNow = () => {
    if (formData.clientIds.length === 0) return;

    // Publicar para cada cliente selecionado
    const publishPromises = formData.clientIds.map(async (clientId) => {
      const selectedClient = selectedClients.find(c => c.id === clientId);
      if (!selectedClient) return;

      const newPost = addPost({
        clientId,
        clientName: selectedClient.name,
        content: formData.content,
        media: mediaFiles.length > 0 ? mediaFiles : [
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

      return publishPost(newPost);
    });

    Promise.all(publishPromises)
      .then(() => {
        alert('Posts publicados com sucesso!');
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
      clientIds: [],
      content: '',
      format: 'single',
      channels: [],
      scheduledDate: '',
      publishNow: false
    });
    setMediaFiles([]);
  };

  const toggleChannel = (channel: Channel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const toggleClient = (clientId: string) => {
    setFormData(prev => ({
      ...prev,
      clientIds: prev.clientIds.includes(clientId)
        ? prev.clientIds.filter(id => id !== clientId)
        : [...prev.clientIds, clientId]
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
              Clientes (pode selecionar múltiplos)
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
              {selectedClients.map(client => (
                <label key={client.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.clientIds.includes(client.id)}
                    onChange={() => toggleClient(client.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {client.avatar && (
                    <img
                      src={client.avatar}
                      alt={client.displayName || client.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm">{client.displayName || client.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mídia
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Clique para fazer upload ou arraste arquivos aqui
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, MP4 até 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInput}
              className="hidden"
            />
            
            {mediaFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {mediaFiles.map(media => (
                  <div key={media.id} className="relative">
                    <img
                      src={media.url}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(media.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              disabled={formData.clientIds.length === 0 || !formData.content || formData.channels.length === 0}
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