import { useState, useEffect } from 'react';
import { Post, PostStatus, GroupedPost } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FacebookApiService } from '../services/facebookApi';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedClients, facebookAuth } = useAuth();

  const POSTS_PER_PAGE = 10;

  // Carregar posts reais quando clientes são selecionados
  useEffect(() => {
    const loadRealPosts = async () => {
      if (!facebookAuth || selectedClients.length === 0) {
        setPosts([]);
        setCurrentPage(1);
        setHasMore(true);
        return;
      }

      setLoading(true);
      try {
        const facebookApi = FacebookApiService.getInstance();
        const allPosts: Post[] = [];

        for (const client of selectedClients) {
          const page = facebookAuth.pages.find(p => p.id === client.facebookPageId);
          if (page) {
            const clientPosts = await facebookApi.getAllPostsForClient(client, page.access_token);
            allPosts.push(...clientPosts);
          }
        }

        setPosts(allPosts);
        setCurrentPage(1);
        setHasMore(allPosts.length > POSTS_PER_PAGE);
      } catch (error) {
        console.error('Erro ao carregar posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadRealPosts();
  }, [selectedClients, facebookAuth]);

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      // Simular carregamento de mais posts
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentPage(prev => prev + 1);
      
      const totalLoaded = (currentPage + 1) * POSTS_PER_PAGE;
      setHasMore(totalLoaded < posts.length);
    } catch (error) {
      console.error('Erro ao carregar mais posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    selectedClients.length === 0 || selectedClients.some(client => client.id === post.clientId)
  );

  const paginatedPosts = filteredPosts.slice(0, currentPage * POSTS_PER_PAGE);

  // Agrupar posts por conteúdo similar (mesmo cliente, data e conteúdo)
  const groupPosts = (postsToGroup: Post[]): GroupedPost[] => {
    const grouped = new Map<string, GroupedPost>();

    postsToGroup.forEach(post => {
      const client = selectedClients.find(c => c.id === post.clientId);
      const groupKey = `${post.clientId}-${post.scheduledDate}-${post.content.substring(0, 50)}`;
      
      if (grouped.has(groupKey)) {
        const existing = grouped.get(groupKey)!;
        existing.channels = [...new Set([...existing.channels, ...post.channels])];
        existing.publishedChannels = [...new Set([...existing.publishedChannels, ...post.channels])];
        existing.posts.push(post);
      } else {
        grouped.set(groupKey, {
          id: groupKey,
          clientId: post.clientId,
          clientName: post.clientName,
          displayName: client?.displayName,
          content: post.content,
          media: post.media,
          format: post.format,
          channels: post.channels,
          publishedChannels: post.channels,
          scheduledDate: post.scheduledDate,
          status: post.status,
          createdAt: post.createdAt,
          approvalLink: post.approvalLink,
          avatar: client?.avatar,
          color: client?.color,
          posts: [post]
        });
      }
    });

    return Array.from(grouped.values()).sort(
      (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  };

  const getPostsByStatus = (status: PostStatus) => {
    return groupPosts(paginatedPosts.filter(post => post.status === status));
  };

  const getAllGroupedPosts = () => {
    return groupPosts(filteredPosts);
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

      updatePostStatus(post.id, 'published');
      
      return results;
    } catch (error) {
      console.error('Erro ao publicar post:', error);
      throw error;
    }
  };

  return {
    posts: paginatedPosts,
    allPosts: filteredPosts,
    groupedPosts: getAllGroupedPosts(),
    loading,
    loadingMore,
    hasMore: hasMore && (currentPage * POSTS_PER_PAGE < filteredPosts.length),
    loadMorePosts,
    getPostsByStatus,
    getPostById,
    updatePostStatus,
    updatePostContent,
    addPost,
    publishPost
  };
};