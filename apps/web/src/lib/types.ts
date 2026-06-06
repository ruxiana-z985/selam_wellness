export type Tab = 'home' | 'circles' | 'women' | 'wellness' | 'retreats' | 'practitioners' | 'profile';
export type PhaseKey = 'winter' | 'spring' | 'summer' | 'autumn';
export type Language = 'en' | 'am';
export type ReactionType = 'RELATE' | 'ENCOURAGED' | 'THANK_YOU' | 'INSPIRED';

export type Circle = {
  id: string;
  name: string;
  nameAmharic?: string;
  category: string;
  members: number;
  activity: string;
  description: string;
  ritual?: string;
  isWomenOnly?: boolean;
  isFeatured?: boolean;
  joined?: boolean;
};

export type PostReactions = Partial<Record<ReactionType, number>>;

export type CommunityPost = {
  id: string;
  circleId: string;
  circle?: string;
  author: string;
  name?: string;
  avatarUrl?: string;
  time: string;
  content: string;
  anonymous: boolean;
  reactions: PostReactions;
  comments: number;
  pending?: boolean;
};

export type Ritual = {
  id: string;
  title: string;
  category: string;
  format?: string;
  duration: string;
  description: string;
  text?: string;
  premium: boolean;
};

export type Experience = {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  description: string;
  imageUrl?: string;
  dates: string[];
  featured?: boolean;
  partner?: string;
  tone?: string;
};

export type Practitioner = {
  id: string;
  name: string;
  title: string;
  specialization: string;
  languages: string[];
  rating: number;
  price: number;
  availability: string;
  avatarUrl?: string;
};

export type Booking = {
  id?: string;
  experienceId: string;
  retreat?: string;
  date: string;
  guests: number;
  payment: string;
  total?: number;
  commission?: number;
  paymentRef?: string;
  status?: string;
};

export type CycleInsight = {
  day: number;
  phase: string;
  energy: number;
  mood?: string;
  suggestion?: string;
  prompt?: string;
  ritual?: string;
  bestFor?: string[];
};

export type SafetyResult = {
  safeToPost: boolean;
  score: number;
  moderation: string;
  matchedSignals: string[];
  crisis?: boolean;
  resources?: {
    hotline: string;
    hospital: string;
    message: string;
    amharicMessage: string;
  } | null;
};

export type UserProfile = {
  name: string;
  email: string;
  avatarInitial: string;
  language: Language;
  isPremium: boolean;
  dataConsent: boolean;
};
