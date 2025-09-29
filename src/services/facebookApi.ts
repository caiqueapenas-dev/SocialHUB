import { FacebookAuth, FacebookPage, Post, Client } from "../types";

const APP_ID = "1269437438073080";
const APP_SECRET = "ebf75895a6f11f36d04ee4550388d81c";
const API_VERSION = "v23.0";
const ACCESS_TOKEN =
  "EAASCiZBZBPmPgBPlIFycrcQfrWIJm8RWB8O8Xup7P3TtGsTYrbanRvsBFyL5aUsCdTuv2VWJU4cDN93QCfnmuTZBZBOXkdXLICOekrLeeGPguekpXteOxoVU0QfUmPne4PgOxQZAVywG65ZBXC0709IRhtRlaeE0heSH9KBKNC3ZAZCZASp1B0PHGtju8Of8WhAkFNuZA2iOywBBiH0qomZBZA20R06aO6QcJQUJmqu0CbbUTntIF6FjHgZDZD";

export class FacebookApiService {
  private static instance: FacebookApiService;
  private accessToken: string;

  private constructor() {
    this.accessToken = ACCESS_TOKEN;
  }

  static getInstance(): FacebookApiService {
    if (!FacebookApiService.instance) {
      FacebookApiService.instance = new FacebookApiService();
    }
    return FacebookApiService.instance;
  }

  async authenticateUser(): Promise<FacebookAuth> {
    try {
      // Verificar se o token é válido
      const debugResponse = await fetch(
        `https://graph.facebook.com/${API_VERSION}/debug_token?input_token=${this.accessToken}&access_token=${APP_ID}|${APP_SECRET}`
      );
      const debugData = await debugResponse.json();

      if (!debugData.data?.is_valid) {
        throw new Error("Token de acesso inválido");
      }

      // Buscar informações do usuário
      const userResponse = await fetch(
        `https://graph.facebook.com/${API_VERSION}/me?access_token=${this.accessToken}&fields=id,name,email`
      );
      const userData = await userResponse.json();

      if (userData.error) {
        throw new Error(userData.error.message);
      }

      // Buscar páginas do usuário
      const pagesResponse = await fetch(
        `https://graph.facebook.com/${API_VERSION}/me/accounts?access_token=${this.accessToken}&fields=id,name,access_token,instagram_business_account{id,username},category,picture`
      );
      const pagesData = await pagesResponse.json();

      if (pagesData.error) {
        throw new Error(pagesData.error.message);
      }

      return {
        accessToken: this.accessToken,
        userId: userData.id,
        pages: pagesData.data || [],
      };
    } catch (error) {
      console.error("Erro na autenticação do Facebook:", error);
      throw new Error(
        `Falha na autenticação: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`
      );
    }
  }

  async getPagePosts(
    pageId: string,
    pageToken: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${API_VERSION}/${pageId}/posts?access_token=${pageToken}&fields=id,message,created_time,attachments,status_type,scheduled_publish_time,is_published&limit=${limit}`
      );
      const data = await response.json();

      if (data.error) {
        console.error("Erro ao buscar posts da página:", data.error);
        return [];
      }

      return data.data || [];
    } catch (error) {
      console.error("Erro ao buscar posts da página:", error);
      return [];
    }
  }

  async getInstagramPosts(
    instagramAccountId: string,
    pageToken: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${API_VERSION}/${instagramAccountId}/media?access_token=${pageToken}&fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&limit=${limit}`
      );
      const data = await response.json();

      if (data.error) {
        console.error("Erro ao buscar posts do Instagram:", data.error);
        return [];
      }

      return data.data || [];
    } catch (error) {
      console.error("Erro ao buscar posts do Instagram:", error);
      return [];
    }
  }

  async publishFacebookPost(
    pageId: string,
    pageToken: string,
    postData: {
      message: string;
      link?: string;
      scheduled_publish_time?: number;
      published?: boolean;
    }
  ): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${API_VERSION}/${pageId}/feed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...postData,
            access_token: pageToken,
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result;
    } catch (error) {
      console.error("Erro ao publicar no Facebook:", error);
      throw error;
    }
  }

  async publishInstagramPost(
    instagramAccountId: string,
    pageToken: string,
    postData: {
      image_url?: string;
      video_url?: string;
      caption: string;
      media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
    }
  ): Promise<any> {
    try {
      // Primeiro, criar o container de mídia
      const containerResponse = await fetch(
        `https://graph.facebook.com/${API_VERSION}/${instagramAccountId}/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...postData,
            access_token: pageToken,
          }),
        }
      );

      const containerResult = await containerResponse.json();

      if (containerResult.error) {
        throw new Error(containerResult.error.message);
      }

      // Depois, publicar o container
      const publishResponse = await fetch(
        `https://graph.facebook.com/${API_VERSION}/${instagramAccountId}/media_publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            creation_id: containerResult.id,
            access_token: pageToken,
          }),
        }
      );

      const publishResult = await publishResponse.json();

      if (publishResult.error) {
        throw new Error(publishResult.error.message);
      }

      return publishResult;
    } catch (error) {
      console.error("Erro ao publicar no Instagram:", error);
      throw error;
    }
  }

  async schedulePost(
    pageId: string,
    pageToken: string,
    postData: any,
    scheduledTime: Date
  ): Promise<any> {
    const scheduledTimestamp = Math.floor(scheduledTime.getTime() / 1000);

    return this.publishFacebookPost(pageId, pageToken, {
      ...postData,
      scheduled_publish_time: scheduledTimestamp,
      published: false,
    });
  }

  async getPageInsights(pageId: string, pageToken: string): Promise<any> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${API_VERSION}/${pageId}/insights?access_token=${pageToken}&metric=page_impressions,page_reach,page_engaged_users&period=day&since=7_days_ago`
      );
      const data = await response.json();

      if (data.error) {
        console.error("Erro ao buscar insights:", data.error);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error("Erro ao buscar insights:", error);
      return null;
    }
  }

  convertPagesToClients(pages: FacebookPage[]): Client[] {
    return pages.map((page) => ({
      id: page.id,
      name: page.name,
      facebookPageId: page.id,
      instagramAccountId: page.instagram_business_account?.id || "",
      avatar: page.picture?.data?.url,
      isActive: true,
    }));
  }

  // Método para buscar posts reais e converter para o formato da aplicação
  async getAllPostsForClient(
    client: Client,
    pageToken: string
  ): Promise<Post[]> {
    const posts: Post[] = [];

    try {
      // Buscar posts do Facebook
      const facebookPosts = await this.getPagePosts(
        client.facebookPageId,
        pageToken,
        100 // Aumentar limite para pegar mais posts
      );

      for (const fbPost of facebookPosts) {
        const post: Post = {
          id: `fb_${fbPost.id}`,
          clientId: client.id,
          clientName: client.name,
          content: fbPost.message || "",
          media: this.extractMediaFromFacebookPost(fbPost),
          format: this.determinePostFormat(fbPost),
          channels: ["facebook"],
          scheduledDate: fbPost.scheduled_publish_time
            ? new Date(fbPost.scheduled_publish_time * 1000).toISOString()
            : fbPost.created_time,
          status: fbPost.is_published ? "published" : "scheduled",
          createdAt: fbPost.created_time,
          facebookPostId: fbPost.id,
          combinedId: this.generateCombinedId(fbPost.message, fbPost.created_time)
        };
        posts.push(post);
      }

      // Buscar posts do Instagram se disponível
      if (client.instagramAccountId) {
        const instagramPosts = await this.getInstagramPosts(
          client.instagramAccountId,
          pageToken,
          100 // Aumentar limite para pegar mais posts
        );

        for (const igPost of instagramPosts) {
          const post: Post = {
            id: `ig_${igPost.id}`,
            clientId: client.id,
            clientName: client.name,
            content: igPost.caption || "",
            media: this.extractMediaFromInstagramPost(igPost),
            format: this.determineInstagramPostFormat(igPost),
            channels: ["instagram"],
            scheduledDate: igPost.timestamp,
            status: "published",
            createdAt: igPost.timestamp,
            instagramPostId: igPost.id,
            combinedId: this.generateCombinedId(igPost.caption, igPost.timestamp)
          };
          posts.push(post);
        }
      }

      return posts.sort(
        (a, b) =>
          new Date(b.scheduledDate).getTime() -
          new Date(a.scheduledDate).getTime()
      );
    } catch (error) {
      console.error("Erro ao buscar posts do cliente:", error);
      return [];
    }
  }

  private generateCombinedId(content: string, timestamp: string): string {
    // Gerar ID combinado baseado no conteúdo e timestamp para agrupar posts similares
    const contentHash = content ? content.substring(0, 50).replace(/\s+/g, '') : '';
    const dateHash = new Date(timestamp).toDateString();
    return `${contentHash}_${dateHash}`;
  }

  private extractMediaFromFacebookPost(fbPost: any): any[] {
    if (!fbPost.attachments?.data?.[0]) {
      // Se não há mídia, usar uma imagem padrão
      return [{
        id: fbPost.id,
        type: "image",
        url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500"
      }];
    }

    const attachment = fbPost.attachments.data[0];
    const media = [];

    if (attachment.type === "photo") {
      media.push({
        id: attachment.target?.id || fbPost.id,
        type: "image",
        url: attachment.media?.image?.src || "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500",
      });
    } else if (attachment.type === "video_inline") {
      media.push({
        id: attachment.target?.id || fbPost.id,
        type: "video",
        url: attachment.media?.source || "",
        thumbnail: attachment.media?.image?.src || "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500",
      });
    } else if (attachment.subattachments?.data) {
      // Carrossel
      for (const sub of attachment.subattachments.data) {
        media.push({
          id: sub.target?.id || `${fbPost.id}_${media.length}`,
          type: sub.type === "photo" ? "image" : "video",
          url: sub.media?.image?.src || sub.media?.source || "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500",
          thumbnail: sub.media?.image?.src || "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500",
        });
      }
    }

    return media.length > 0 ? media : [{
      id: fbPost.id,
      type: "image",
      url: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500"
    }];
  }

  private extractMediaFromInstagramPost(igPost: any): any[] {
    return [
      {
        id: igPost.id,
        type: igPost.media_type === "VIDEO" ? "video" : "image",
        url: igPost.media_url || "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500",
        thumbnail: igPost.thumbnail_url || igPost.media_url || "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
    ];
  }

  private determinePostFormat(
    fbPost: any
  ): "single" | "carousel" | "story" | "reels" {
    if (fbPost.attachments?.data?.[0]?.subattachments?.data?.length > 1) {
      return "carousel";
    }
    return "single";
  }

  private determineInstagramPostFormat(
    igPost: any
  ): "single" | "carousel" | "story" | "reels" {
    if (igPost.media_type === "VIDEO") {
      return "reels";
    } else if (igPost.media_type === "CAROUSEL_ALBUM") {
      return "carousel";
    }
    return "single";
  }
}