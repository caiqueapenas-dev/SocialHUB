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
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export type PostFormat = 'single' | 'carousel' | 'story' | 'reels';
export type Channel = 'facebook' | 'instagram';
export type PostStatus = 'draft' | 'scheduled' | 'pending_approval' | 'approved' | 'rejected' | 'published';

export interface Client {
  id: string;
  name: string;
  facebookPageId: string;
  instagramAccountId: string;
  avatar?: string;
  isActive: boolean;
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
  };
}

export interface CalendarView {
  date: Date;
  posts: Post[];
}