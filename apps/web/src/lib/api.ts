import type {
  Booking,
  Circle,
  CommunityPost,
  CycleInsight,
  Experience,
  Practitioner,
  ReactionType,
  Ritual,
  SafetyResult,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),

  home: () =>
    request<{
      greeting: string;
      hero: { title: string; subtitle: string; recommendation: string };
      cycle: CycleInsight;
      whispers: CommunityPost[];
      practitioner: Practitioner;
      content: Ritual[];
      featuredExperience: Experience;
    }>('/home'),

  circles: () => request<Circle[]>('/circles'),

  joinCircle: (id: string) => request<Circle & { message: string }>(`/circles/${id}/join`, { method: 'POST' }),

  circleFeed: (id: string) =>
    request<{
      circle: Circle;
      tabs: string[];
      posts: CommunityPost[];
      events: { title: string; when: string; host: string }[];
      resources: { title: string; type: string; description: string }[];
      members: number;
    }>(`/circles/${id}/feed`),

  createPost: (body: { circleId: string; content: string; anonymous?: boolean }) =>
    request<CommunityPost & { safety: SafetyResult }>('/posts', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  reactToPost: (id: string, type: ReactionType) =>
    request<{ reactions: Record<string, number> }>(`/posts/${id}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  cycle: (day: number) => request<CycleInsight>(`/women/cycle?day=${day}`),

  library: () => request<Ritual[]>('/wellness/library'),

  practitioners: () => request<Practitioner[]>('/practitioners'),

  retreats: () => request<Experience[]>('/retreats'),

  createBooking: (body: Booking) =>
    request<Booking & { id: string; message: string; paymentRef: string; total: number; commission: number }>(
      '/bookings',
      {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  createJournal: (body: { mood: string; energy: number; prompt: string; response: string }) =>
    request<{ id: string; insight: string }>('/journal', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  safetyCheck: (content: string) =>
    request<SafetyResult>('/safety/check', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  revenue: () =>
    request<{
      streams: { name: string; model: string; price: string; yearOneTarget: string }[];
      launchPartner: string;
      ethicsNote: string;
    }>('/revenue'),
};

export function formatPrice(price: number) {
  return `${price.toLocaleString()} ETB`;
}

export function experienceTone(id: string) {
  if (id.includes('kuriftu') || id.includes('bishoftu') || id.includes('water')) return 'water';
  if (id.includes('coffee')) return 'coffee';
  return 'forest';
}
