export interface SiteSettings {
  id: string;
  companyName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  aboutTitle: string;
  aboutBody: string;
  email: string;
  phone: string;
  address: string;
  accentColor: string;
  socialLinks: Record<string, string>;
  stats: Array<{ label: string; value: number; suffix?: string }>;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  published: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: string;
  description: string;
  imageUrl: string;
  link: string;
  order: number;
  published: boolean;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  company: string;
  avatarUrl: string;
  quote: string;
  rating: number;
  order: number;
  published: boolean;
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  category: string;
  published: boolean;
  publishedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  order: number;
  published: boolean;
}

export interface PublicSite {
  settings: SiteSettings;
  services: Service[];
  portfolio: PortfolioItem[];
  testimonials: Testimonial[];
  news: NewsPost[];
  team: TeamMember[];
}

export interface VisitorEvent {
  id: string;
  sessionId: string;
  type: 'pageview' | 'click';
  label: string;
  path: string;
  createdAt: string;
}

export interface VisitorSession {
  id: string;
  ip: string;
  city: string;
  region: string;
  country: string;
  email: string;
  userAgent: string;
  referrer: string;
  createdAt: string;
  lastSeen: string;
  events: VisitorEvent[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  sessionId: string | null;
  visitorIp: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface RagDocument {
  id: string;
  title: string;
  content: string;
  source: string;
  chunks: number;
  createdAt: string;
  updatedAt: string;
}
