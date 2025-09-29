import { useState, useEffect, useCallback } from "react";
import { Post, PostStatus, GroupedPost } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  // Corrigido: Não precisamos mais do facebookAuth, apenas dos clientes selecionados.
  const { selectedClients } = useAuth();

  const fetchPosts = useCallback(async () => {
    if (selectedClients.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const clientIds = selectedClients.map((client) => client.id);

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .in("clientId", clientIds)
        .order("scheduledDate", { ascending: false });

      if (error) {
        throw error;
      }

      setPosts((data as Post[]) || []);
    } catch (error) {
      console.error("Erro ao buscar posts do Supabase:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClients]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const groupPosts = (postsToGroup: Post[]): GroupedPost[] => {
    const grouped = new Map<string, GroupedPost>();

    postsToGroup.forEach((post) => {
      const client = selectedClients.find((c) => c.id === post.clientId);
      const groupKey = post.combinedId
        ? `${post.clientId}-${post.combinedId}`
        : `${post.clientId}-${post.id}`;

      if (grouped.has(groupKey)) {
        const existing = grouped.get(groupKey)!;
        existing.channels = [
          ...new Set([...existing.channels, ...post.channels]),
        ];
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
          posts: [post],
        });
      }
    });

    return Array.from(grouped.values()).sort(
      (a, b) =>
        new Date(b.scheduledDate).getTime() -
        new Date(a.scheduledDate).getTime()
    );
  };

  const getPostsByStatus = (status: PostStatus) => {
    return groupPosts(posts.filter((p) => p.status === status));
  };

  const getPostById = (id: string) => {
    return posts.find((post) => post.id.toString() === id);
  };

  const addPost = async (
    postData: Omit<Post, "id" | "createdAt">
  ): Promise<Post> => {
    const newPostData = {
      ...postData,
    };

    const { data, error } = await supabase
      .from("posts")
      .insert([newPostData])
      .select();

    if (error) {
      console.error("Erro ao adicionar post:", error);
      throw error;
    }

    const createdPost = data[0] as Post;
    setPosts((prev) => [createdPost, ...prev]);
    return createdPost;
  };

  const updatePostStatus = async (postId: string, status: PostStatus) => {
    const { data, error } = await supabase
      .from("posts")
      .update({ status: status })
      .eq("id", postId)
      .select();

    if (error) {
      console.error("Erro ao atualizar status:", error);
      throw error;
    }

    // Corrigido: Adicionamos o tipo (p: Post) para ajudar o TypeScript.
    setPosts((prev) =>
      prev.map((p: Post) =>
        p.id.toString() === postId ? (data[0] as Post) : p
      )
    );
  };

  const updatePostContent = async (postId: string, content: string) => {
    const { data, error } = await supabase
      .from("posts")
      .update({ content: content })
      .eq("id", postId)
      .select();

    if (error) {
      console.error("Erro ao atualizar conteúdo:", error);
      throw error;
    }

    // Corrigido: Adicionamos o tipo (p: Post) para ajudar o TypeScript.
    setPosts((prev) =>
      prev.map((p: Post) =>
        p.id.toString() === postId ? (data[0] as Post) : p
      )
    );
  };

  const publishPost = async (post: Post) => {
    console.log("Simulando publicação do post:", post.id);
    await updatePostStatus(post.id.toString(), "published");
    return { success: true, platform: "mock" };
  };

  return {
    posts: posts,
    // Removido allPosts para simplificar, groupedPosts é mais útil
    groupedPosts: groupPosts(posts),
    loading,
    getPostsByStatus,
    getPostById,
    updatePostStatus,
    updatePostContent,
    addPost,
    publishPost,
    loadingMore: false,
    hasMore: false,
    loadMorePosts: () => {},
  };
};
