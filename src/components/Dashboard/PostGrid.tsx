import React from 'react';
import { Calendar, Eye, Facebook, Instagram, MessageCircle, Clock, MoreHorizontal } from 'lucide-react';
import { GroupedPost, PostStatus } from '../../types';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface PostGridProps {
  posts: GroupedPost[];
  onPostClick: (post: GroupedPost) => void;
  title: string;
  emptyMessage?: string;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
}

const statusColors: Record<PostStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  published: 'bg-purple-100 text-purple-800'
};

const statusLabels: Record<PostStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  pending_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  published: 'Publicado'
};

const formatLabels: Record<string, string> = {
  single: 'Foto única',
  carousel: 'Carrossel',
  story: 'Story',
  reels: 'Reels'
};

export const PostGrid: React.FC<PostGridProps> = ({ 
  posts, 
  onPostClick, 
  title, 
  emptyMessage,
  showLoadMore,
  onLoadMore,
  loadingMore
}) => {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-500">{emptyMessage || 'Nenhum post encontrado.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.map(post => (
          <div
            key={post.id}
            onClick={() => onPostClick(post)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
          >
            <div className="relative">
              <img
                src={post.media[0]?.url}
                alt="Post media"
                className="w-full h-48 object-cover rounded-t-lg"
              />
              {post.media.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                  +{post.media.length - 1}
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                  {statusLabels[post.status]}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {post.avatar && (
                    <img
                      src={post.avatar}
                      alt={post.displayName || post.clientName}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <h3 className="font-medium text-gray-900 truncate">
                    {post.displayName || post.clientName}
                  </h3>
                </div>
                <div className="flex space-x-1">
                  <Facebook 
                    size={16} 
                    className={post.publishedChannels.includes('facebook') ? 'text-blue-600' : 'text-gray-300'} 
                  />
                  <Instagram 
                    size={16} 
                    className={post.publishedChannels.includes('instagram') ? 'text-pink-600' : 'text-gray-300'} 
                  />
                </div>
              </div>

              {/* Tag colorida do cliente */}
              <div className="mb-2">
                <span 
                  className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: post.color || '#6B7280' }}
                >
                  {post.displayName || post.clientName}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {post.content}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Eye size={12} />
                  <span>{formatLabels[post.format]}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatDistanceToNow(post.scheduledDate)}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showLoadMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Carregando...</span>
              </>
            ) : (
              <span>Ver mais</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};