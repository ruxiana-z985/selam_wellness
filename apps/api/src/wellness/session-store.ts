import { circles, posts as seedPosts } from './demo-data';

export type SessionPost = (typeof seedPosts)[number] & { pending?: boolean };

const sessionPosts: SessionPost[] = [...seedPosts];
const joinedCircleIds = new Set<string>(['womens-haven']);
const reactionCounts = new Map<string, Record<string, number>>();

seedPosts.forEach((post) => {
  reactionCounts.set(post.id, { ...post.reactions });
});

export function getSessionPosts(circleId?: string) {
  if (!circleId) return [...sessionPosts];
  return sessionPosts.filter((post) => post.circleId === circleId);
}

export function addSessionPost(post: SessionPost) {
  sessionPosts.unshift(post);
  reactionCounts.set(post.id, post.reactions ?? { RELATE: 0, ENCOURAGED: 0, THANK_YOU: 0, INSPIRED: 0 });
  return post;
}

export function joinSessionCircle(id: string) {
  joinedCircleIds.add(id);
  const circle = circles.find((item) => item.id === id);
  if (!circle) return null;
  return {
    ...circle,
    joined: true,
    members: circle.members + (joinedCircleIds.has(id) ? 1 : 0),
  };
}

export function isCircleJoined(id: string) {
  return joinedCircleIds.has(id);
}

export function getJoinedCircleIds() {
  return [...joinedCircleIds];
}

export function reactToSessionPost(postId: string, type: string) {
  const defaults = { RELATE: 0, ENCOURAGED: 0, THANK_YOU: 0, INSPIRED: 0 };
  const current = { ...defaults, ...reactionCounts.get(postId) };
  if (type in current) {
    current[type as keyof typeof defaults] += 1;
  }
  reactionCounts.set(postId, current);
  const post = sessionPosts.find((item) => item.id === postId);
  if (post) {
    post.reactions = { ...current };
  }
  return { postId, type, reactions: current };
}
