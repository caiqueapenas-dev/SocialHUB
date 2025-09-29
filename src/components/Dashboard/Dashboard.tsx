import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { PostGrid } from './PostGrid';
import { PostModal } from './PostModal';
import { CreatePostModal } from './CreatePostModal';
import { Post } from '../../types';
import { usePosts } from '../../hooks/usePosts';

export const Dashboard: React.FC = () => {
  const { posts, getPostsByStatus, loading } = usePosts();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Novo Post</span>
        </button>
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
        />

        <PostGrid
          posts={publishedPosts}
          onPostClick={setSelectedPost}
          title="Posts Publicados"
          emptyMessage="Nenhum post publicado ainda."
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