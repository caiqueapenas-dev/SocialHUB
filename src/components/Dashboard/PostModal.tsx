import React, { useState } from 'react';
import { X, Facebook, Instagram, Calendar, CreditCard as Edit2, Copy } from 'lucide-react';
import { Post } from '../../types';

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
}

const formatLabels: Record<string, string> = {
  single: 'Foto única',
  carousel: 'Carrossel',
  story: 'Story',
  reels: 'Reels'
};

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  pending_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  published: 'Publicado'
};

export const PostModal: React.FC<PostModalProps> = ({ post, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!post) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const copyApprovalLink = () => {
    if (post.approvalLink) {
      navigator.clipboard.writeText(post.approvalLink);
      alert('Link de aprovação copiado!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detalhes do Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mídia</h3>
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={post.media[currentImageIndex]?.url}
                    alt="Post media"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {post.media.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {post.media.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {post.media.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {post.media.map((media, index) => (
                      <button
                        key={media.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={media.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Informações</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Cliente:</span>
                    <span className="text-sm text-gray-900">{post.clientName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className="text-sm text-gray-900">{statusLabels[post.status]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Formato:</span>
                    <span className="text-sm text-gray-900">{formatLabels[post.format]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Canais:</span>
                    <div className="flex space-x-2">
                      {post.channels.includes('facebook') && (
                        <Facebook size={16} className="text-blue-600" />
                      )}
                      {post.channels.includes('instagram') && (
                        <Instagram size={16} className="text-pink-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Agendado para:</span>
                    <span className="text-sm text-gray-900 flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(post.scheduledDate)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {post.approvalLink && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Link de Aprovação</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={post.approvalLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50"
                    />
                    <button
                      onClick={copyApprovalLink}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
                    >
                      <Copy size={16} />
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Legenda</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};