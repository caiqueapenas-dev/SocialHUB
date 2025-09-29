export interface Post {
  id: string;
  clientId: string;
  clientName: string;
  content: string;
  media: MediaFile[];
  format: PostFormat;
  channels: Channel[];
  scheduledDate: string;
  status: PostStatus;
  createdAt: string;
  approvalLink?: string;
  facebookPostId?: string;
  instagramPostId?: string;
  combinedId?: string; // Para agrupar posts do mesmo conteúdo
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  file?: File;
}

export type PostFormat = 'single' | 'carousel' | 'story' | 'reels';
export type Channel = 'facebook' | 'instagram';
export type PostStatus = 'draft' | 'scheduled' | 'pending_approval' | 'approved' | 'rejected' | 'published';

export interface Client {
  id: string;
  name: string;
  displayName?: string; // Nome customizado pelo usuário
  facebookPageId: string;
  instagramAccountId: string;
  avatar?: string;
  isActive: boolean;
  color?: string; // Cor da tag do cliente
}

export interface FacebookAuth {
  accessToken: string;
  userId: string;
  pages: FacebookPage[];
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username?: string;
  };
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface CalendarView {
  date: Date;
  posts: Post[];
}

export interface GroupedPost {
  id: string;
  clientId: string;
  clientName: string;
  displayName?: string;
  content: string;
  media: MediaFile[];
  format: PostFormat;
  channels: Channel[];
  publishedChannels: Channel[]; // Canais onde foi realmente publicado
  scheduledDate: string;
  status: PostStatus;
  createdAt: string;
  approvalLink?: string;
  avatar?: string;
  color?: string;
  posts: Post[]; // Posts individuais agrupados
}