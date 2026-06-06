import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://nzeqebomjsyuncvmrbkr.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZXFlYm9tanN5dW5jdm1yYmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MTkxMDEsImV4cCI6MjA5NjI5NTEwMX0.uPq0yT0PxpovCNGunsZqJr7mab9cEgSaHfRb_u_uDks';

export const supabase = createClient(url, key);

export type ReactionType = 'RELATE' | 'ENCOURAGED' | 'THANK_YOU' | 'INSPIRED';

export type DbProfile = {
  id: string;
  name: string;
  avatar_initial: string;
  avatar_url: string | null;
  language: string;
  is_premium: boolean;
  data_consent: boolean;
  created_at: string;
};

export type DbPost = {
  id: string;
  circle_id: string;
  author_id: string | null;
  content: string;
  anonymous: boolean;
  safety_score: number;
  created_at: string;
  profile?: DbProfile | null;
};

export type DbReaction = {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
};

export async function getProfile(userId: string): Promise<DbProfile | null> {
  const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle();
  return data;
}

export async function upsertProfile(profile: Omit<DbProfile, 'created_at'>): Promise<void> {
  await supabase.from('user_profiles').upsert(profile);
}

export async function fetchCirclePosts(circleId: string): Promise<DbPost[]> {
  const { data } = await supabase
    .from('posts')
    .select('*, profile:user_profiles(name, avatar_initial)')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
    .limit(30);
  return (data as DbPost[]) ?? [];
}

export async function fetchRecentPosts(limit = 10): Promise<DbPost[]> {
  const { data } = await supabase
    .from('posts')
    .select('*, profile:user_profiles(name, avatar_initial)')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as DbPost[]) ?? [];
}

export async function createPost(params: {
  circleId: string;
  authorId: string;
  content: string;
  anonymous: boolean;
  safetyScore: number;
}): Promise<DbPost | null> {
  const { data } = await supabase
    .from('posts')
    .insert({
      circle_id: params.circleId,
      author_id: params.anonymous ? null : params.authorId,
      content: params.content,
      anonymous: params.anonymous,
      safety_score: params.safetyScore,
    })
    .select()
    .maybeSingle();
  return data;
}

export async function fetchReactionCounts(postIds: string[]): Promise<Record<string, Record<string, number>>> {
  if (postIds.length === 0) return {};
  const { data } = await supabase
    .from('post_reactions')
    .select('post_id, reaction_type')
    .in('post_id', postIds);

  const counts: Record<string, Record<string, number>> = {};
  (data ?? []).forEach((r: { post_id: string; reaction_type: string }) => {
    if (!counts[r.post_id]) counts[r.post_id] = {};
    counts[r.post_id][r.reaction_type] = (counts[r.post_id][r.reaction_type] ?? 0) + 1;
  });
  return counts;
}

export async function addReaction(postId: string, userId: string, type: ReactionType): Promise<void> {
  await supabase
    .from('post_reactions')
    .upsert({ post_id: postId, user_id: userId, reaction_type: type });
}

export async function getJoinedCircleIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('circle_members')
    .select('circle_id')
    .eq('user_id', userId);
  return (data ?? []).map((r: { circle_id: string }) => r.circle_id);
}

export async function joinCircle(userId: string, circleId: string): Promise<void> {
  await supabase
    .from('circle_members')
    .upsert({ user_id: userId, circle_id: circleId });
  try {
    await supabase.rpc('increment_circle_members', { circle_id: circleId });
  } catch {
    // RPC may not exist; ignore
  }
}

export async function saveJournalEntry(params: {
  userId: string;
  mood: string;
  energy: number;
  prompt: string;
  response: string;
}): Promise<void> {
  await supabase.from('journal_entries').insert({
    user_id: params.userId,
    mood: params.mood,
    energy: params.energy,
    prompt: params.prompt,
    response: params.response,
  });
}

export async function saveBooking(params: {
  userId: string;
  experienceId: string;
  experienceTitle: string;
  date: string;
  guests: number;
  payment: string;
  total: number;
  paymentRef: string;
}): Promise<void> {
  await supabase.from('bookings').insert({
    user_id: params.userId,
    experience_id: params.experienceId,
    experience_title: params.experienceTitle,
    date: params.date,
    guests: params.guests,
    payment: params.payment,
    total: params.total,
    payment_ref: params.paymentRef,
    status: 'CONFIRMED',
  });
}

export async function getUserBookings(userId: string) {
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
