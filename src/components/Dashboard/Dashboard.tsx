import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { PostGrid } from './PostGrid';
import { PostModal } from './PostModal';
import { CreatePostModal } from './CreatePostModal';
import { GroupedPost } from '../../types';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { 
    getPostsByStatus, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMorePosts 
  } = usePosts();
  const { 
    selectedClients, 
    allClients, 
    selectedClientFilter, 
    setSelectedClientFilter 
  } = useAuth();
  
  const [selectedPost, setSelectedPost] = useState<GroupedPost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const publishedPosts = getPostsByStatus('published');
  const scheduledPosts = getPostsByStatus('scheduled').concat(getPostsByStatus('approved'));
  const pendingPosts = getPostsByStatus('pending_approval');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Gerencie todos os seus posts em um só lugar</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Filtro de cliente */}
          <div className="relative">
            <select
              value={selectedClientFilter || ''}
              onChange={(e) => setSelectedClientFilter(e.target.value || null)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os clientes</option>
              {selectedClients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.displayName || client.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Novo Post</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Carregando posts...</span>
        </div>
      )}
      
      {!loading && (
        <div className="space-y-8">
          {pendingPosts.length > 0 && (
            <PostGrid
              posts={pendingPosts}
              onPostClick={setSelectedPost}
              title="Aguardando Aprovação"
              emptyMessage="Nenhum post aguardando aprovação."
            />
          )}

          <PostGrid
            posts={scheduledPosts}
            onPostClick={setSelectedPost}
            title="Posts Agendados"
            emptyMessage="Nenhum post agendado."
            showLoadMore={hasMore}
            onLoadMore={loadMorePosts}
            loadingMore={loadingMore}
          />

          <PostGrid
            posts={publishedPosts}
            onPostClick={setSelectedPost}
            title="Posts Publicados"
            emptyMessage="Nenhum post publicado ainda."
            showLoadMore={hasMore}
            onLoadMore={loadMorePosts}
            loadingMore={loadingMore}
          />
        </div>
      )}

      <PostModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};