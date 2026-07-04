export interface FeedItem {
  id: number;
  author: string;
  authorId?: number;
  authorUrl?: string;
  downloadUrl?: string;
  title: string;
  imageUrl: string;
  images?: string[];
  link: string;
  text: string;
  [key: string]: any;
}
