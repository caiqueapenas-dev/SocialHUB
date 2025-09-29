import { useState, useEffect } from 'react';
import { Post, PostStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FacebookApiService } from '../services/facebookApi';


export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedClients, facebookAuth } = useAuth();

  // Carregar posts reais quando clientes são selecionados
  useEffect(() => {
    const loadRealPosts = async () => {
      if (!facebookAuth || selectedClients.length === 0) {
        setPosts([]);
        return;
      }

      setLoading(true);
      try {
        const facebookApi = FacebookApiService.getInstance();
        const allPosts: Post[] = [];

        for (const client of selectedClients) {
          // Encontrar a página correspondente para obter o token
          const page = facebookAuth.pages.find(p => p.id === client.facebookPageId);
          if (page) {
            const clientPosts = await facebookApi.getAllPostsForClient(client, page.access_token);
            allPosts.push(...clientPosts);
          }
        }

        setPosts(allPosts);
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealPosts();
  }, [selectedClients, facebookAuth]);

  const filteredPosts = posts.filter(post =>
    selectedClients.length === 0 || selectedClients.some(client => client.id === post.clientId)
  );

  const getPostsByStatus = (status: PostStatus) => {
    return filteredPosts.filter(post => post.status === status);
  };

  const getPostById = (id: string) => {
    return posts.find(post => post.id === id);
  };

  const updatePostStatus = (postId: string, status: PostStatus) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, status } : post
    ));
  };

  const updatePostContent = (postId: string, content: string) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, content } : post
    ));
  };

  const addPost = (post: Omit<Post, 'id' | 'createdAt'>) => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setPosts(prev => [...prev, newPost]);
    return newPost;
  };

  const publishPost = async (post: Post) => {
    if (!facebookAuth) {
      throw new Error('Não autenticado');
    }

    const facebookApi = FacebookApiService.getInstance();
    const client = selectedClients.find(c => c.id === post.clientId);
    const page = facebookAuth.pages.find(p => p.id === client?.facebookPageId);

    if (!client || !page) {
      throw new Error('Cliente ou página não encontrada');
    }

    try {
      const results = [];

      // Publicar no Facebook se selecionado
      if (post.channels.includes('facebook')) {
        const fbResult = await facebookApi.publishFacebookPost(
          client.facebookPageId,
          page.access_token,
          {
            message: post.content,
            published: true
          }
        );
        results.push({ platform: 'facebook', result: fbResult });
      }

      // Publicar no Instagram se selecionado e disponível
      if (post.channels.includes('instagram') && client.instagramAccountId) {
        const igResult = await facebookApi.publishInstagramPost(
          client.instagramAccountId,
          page.access_token,
          {
            caption: post.content,
            image_url: post.media[0]?.url,
            media_type: 'IMAGE'
          }
        );
        results.push({ platform: 'instagram', result: igResult });
      }

      // Atualizar status do post
      updatePostStatus(post.id, 'published');
      
      return results;
    } catch (error) {
      console.error('Erro ao publicar post:', error);
      throw error;
    }
  };
  return {
    posts: filteredPosts,
    loading,
    getPostsByStatus,
    getPostById,
    updatePostStatus,
    updatePostContent,
    addPost,
    publishPost
  };
};