import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  addReaction,
  createPost,
  fetchCirclePosts,
  fetchReactionCounts,
  fetchRecentPosts,
  getJoinedCircleIds,
  joinCircle as dbJoinCircle,
  saveBooking,
  saveJournalEntry,
  type DbPost,
} from '../lib/supabase';
import { api, experienceTone, formatPrice } from '../lib/api';
import {
  clientSafetyCheck,
  fallbackCircles,
  fallbackCycle,
  fallbackExperiences,
  fallbackPosts,
  fallbackPractitioners,
  fallbackRevenue,
  fallbackRituals,
  generateAnonymousAlias,
} from '../lib/demo-data';
import { t } from '../lib/i18n';
import type {
  Booking,
  Circle,
  CommunityPost,
  CycleInsight,
  Experience,
  Language,
  Practitioner,
  ReactionType,
  Ritual,
  SafetyResult,
  Tab,
} from '../lib/types';

const ritualTexts: Record<string, string> = {
  'coffee-breath': 'Turn buna time into a slow nervous-system reset with breath, scent, and quiet witness.',
  'inner-spring': 'Use follicular-phase energy for planning, learning, and creative renewal without forcing.',
  'teff-energy': 'A culturally familiar guide for fatigue, cycle-aware nourishment, and steady morning energy.',
  'career-reset': 'Rebuild courage after rejection without pretending it did not hurt.',
  'rest-evening': 'A parchment-soft evening sequence for screens, shoulders, prayer-adjacent silence, and sleep.',
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function dbPostToCommunityPost(p: DbPost, circles: Circle[]): CommunityPost {
  const circle = circles.find((c) => c.id === p.circle_id);
  const profileData = p.profile as { name?: string; avatar_initial?: string } | null | undefined;
  const alias = p.anonymous ? generateAnonymousAlias(p.author_id ?? undefined, p.circle_id) : null;
  return {
    id: p.id,
    circleId: p.circle_id,
    circle: circle?.name,
    author: alias ?? (profileData?.name ?? 'Community Member'),
    name: alias ?? (profileData?.name ?? 'Community Member'),
    time: formatRelativeTime(p.created_at),
    content: p.content,
    anonymous: p.anonymous,
    reactions: { RELATE: 0, ENCOURAGED: 0, THANK_YOU: 0, INSPIRED: 0 },
    comments: 0,
  };
}

async function enrichPostsWithReactions(posts: CommunityPost[]): Promise<CommunityPost[]> {
  if (posts.length === 0) return posts;
  try {
    const counts = await fetchReactionCounts(posts.map((p) => p.id));
    return posts.map((p) => ({
      ...p,
      reactions: {
        RELATE: counts[p.id]?.RELATE ?? 0,
        ENCOURAGED: counts[p.id]?.ENCOURAGED ?? 0,
        THANK_YOU: counts[p.id]?.THANK_YOU ?? 0,
        INSPIRED: counts[p.id]?.INSPIRED ?? 0,
      },
    }));
  } catch {
    return posts;
  }
}

export function useSelamApp() {
  const { user, profile: authProfile, updateProfile, signOut } = useAuth();

  const [tab, setTab] = useState<Tab>('home');
  const [apiOnline, setApiOnline] = useState(false);
  const [supabaseOnline, setSupabaseOnline] = useState(false);
  const [posting, setPosting] = useState(false);

  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [cycle, setCycle] = useState<CycleInsight | null>(null);
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [revenue, setRevenue] = useState<Awaited<ReturnType<typeof api.revenue>> | null>(null);
  const [feedTab, setFeedTab] = useState('Posts');

  const [composer, setComposer] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [saved, setSaved] = useState<string[]>(['coffee-breath']);
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);
  const [cycleDay, setCycleDay] = useState(8);
  const [mood, setMood] = useState({ feeling: 'Tender', energy: '7', note: '' });
  const [journal, setJournal] = useState<{ id: string; text: string }[]>([]);
  const [bookingDraft, setBookingDraft] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    'Welcome to Selam — your village is ready.',
    "Women's Haven: Inner Spring guide is live.",
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState('');
  const [crisisModal, setCrisisModal] = useState<SafetyResult | null>(null);
  const [showSelamPlus, setShowSelamPlus] = useState(false);

  const lang: Language = ((authProfile?.language as Language) ?? 'en');

  const profile = useMemo(() => ({
    name: authProfile?.name ?? user?.email?.split('@')[0] ?? 'User',
    email: user?.email ?? '',
    avatarInitial: authProfile?.avatar_initial ?? (authProfile?.name ?? user?.email ?? 'U').charAt(0).toUpperCase(),
    language: lang,
    isPremium: authProfile?.is_premium ?? false,
    dataConsent: authProfile?.data_consent ?? false,
  }), [authProfile, user, lang]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 4200);
  }, []);

  const persistProfile = useCallback(async (next: { name?: string; language?: Language; isPremium?: boolean; dataConsent?: boolean }) => {
    await updateProfile({
      ...(next.name !== undefined && { name: next.name }),
      ...(next.language !== undefined && { language: next.language }),
      ...(next.isPremium !== undefined && { is_premium: next.isPremium }),
      ...(next.dataConsent !== undefined && { data_consent: next.dataConsent }),
    });
  }, [updateProfile]);

  const loadStaticData = useCallback(async () => {
    const enrichedCircles = fallbackCircles.map((c) => ({ ...c, joined: c.joined ?? false }));
    setCircles(enrichedCircles);
    // Start with career-anxiety as the active circle (first non-women's circle)
    setActiveCircle(enrichedCircles.find((c) => c.id === 'career-anxiety') ?? enrichedCircles[1] ?? enrichedCircles[0]);    setCycle(fallbackCycle(8));
    setRituals(fallbackRituals.map((r) => ({ ...r, text: ritualTexts[r.id] ?? r.description })));
    setSelectedRitual(fallbackRituals.map((r) => ({ ...r, text: ritualTexts[r.id] ?? r.description }))[0] ?? null);
    setExperiences(fallbackExperiences.map((e) => ({ ...e, tone: experienceTone(e.id) })));
    setPractitioners(fallbackPractitioners);
    setRevenue(fallbackRevenue);
    const featured = fallbackExperiences.find((e) => e.featured) ?? fallbackExperiences[0];
    setBookingDraft({ experienceId: featured.id, retreat: featured.title, date: featured.dates[0], guests: 1, payment: 'Telebirr' });

    try {
      await api.health();
      setApiOnline(true);
      const [home, practitionerList] = await Promise.all([api.home(), api.practitioners()]);
      setCycle(home.cycle);
      setPractitioners(practitionerList);
    } catch {
      setApiOnline(false);
    }
  }, []);

  const loadUserData = useCallback(async (userId: string, currentCircles: Circle[]) => {
    try {
      const joinedIds = await getJoinedCircleIds(userId);
      setCircles((prev) => prev.map((c) => ({ ...c, joined: joinedIds.includes(c.id) })));
      setSupabaseOnline(true);
      const dbPosts = await fetchRecentPosts(20);
      const mapped = dbPosts.map((p) => dbPostToCommunityPost(p, currentCircles));
      const enriched = await enrichPostsWithReactions(mapped);
      setPosts(enriched.length > 0 ? enriched : fallbackPosts);
    } catch {
      setSupabaseOnline(false);
      setPosts(fallbackPosts);
    }
  }, []);

  useEffect(() => {
    loadStaticData();
  }, [loadStaticData]);

  // Track circles in a ref-like way to avoid stale closures in the second effect
  const [circlesLoaded, setCirclesLoaded] = useState(false);
  useEffect(() => {
    if (circles.length > 0) setCirclesLoaded(true);
  }, [circles.length]);

  useEffect(() => {
    if (user && circlesLoaded) {
      loadUserData(user.id, circles);
    } else if (!user) {
      setPosts(fallbackPosts);
      setSupabaseOnline(false);
    }
  }, [user?.id, circlesLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshCircleFeed = useCallback(async (circleId: string) => {
    try {
      const dbPosts = await fetchCirclePosts(circleId);
      const mapped = dbPosts.map((p) => dbPostToCommunityPost(p, circles));
      const enriched = await enrichPostsWithReactions(mapped);
      setPosts((prev) => {
        const others = prev.filter((p) => p.circleId !== circleId);
        return [...enriched, ...others];
      });
    } catch {
      // keep existing
    }
  }, [circles]);

  const joinCircle = useCallback(async (circle: Circle) => {
    setActiveCircle(circle);
    setCircles((prev) => prev.map((c) => (c.id === circle.id ? { ...c, joined: true, members: c.members + 1 } : c)));
    if (user) {
      try {
        await dbJoinCircle(user.id, circle.id);
        await refreshCircleFeed(circle.id);
      } catch {
        // ignore
      }
    }
    showToast(`You joined ${circle.name}. The circle makes room for you.`);
  }, [user, showToast, refreshCircleFeed]);

  const submitPost = useCallback(async (event: FormEvent<HTMLFormElement>, circleId?: string) => {
    event.preventDefault();
    if (!composer.trim() || posting) return;
    const targetId = circleId ?? activeCircle?.id;
    if (!targetId) return;
    setPosting(true);

    const check = clientSafetyCheck(composer.trim());
    if (!check.safeToPost) {
      setCrisisModal(check);
      setPosting(false);
      return;
    }

    if (user && supabaseOnline) {
      try {
        const created = await createPost({
          circleId: targetId,
          authorId: user.id,
          content: composer.trim(),
          anonymous,
          safetyScore: check.score,
        });
        if (created) {
          const profileForPost = anonymous ? null : (authProfile as unknown as DbPost['profile']);
          const newPost = dbPostToCommunityPost({ ...created, profile: profileForPost }, circles);
          setPosts((prev) => [newPost, ...prev]);
          setNotifications((n) => [`Your whisper is live in ${circles.find((c) => c.id === targetId)?.name}`, ...n]);
        }
      } catch {
        showToast('Could not post right now. Try again.');
        setPosting(false);
        return;
      }
    } else {
      const circle = circles.find((c) => c.id === targetId);
      const alias = anonymous ? generateAnonymousAlias(user?.id, targetId) : null;
      setPosts((prev) => [{
        id: `post-${Date.now()}`,
        circleId: targetId,
        circle: circle?.name,
        author: alias ?? profile.name,
        name: alias ?? profile.name,
        time: 'now',
        content: composer.trim(),
        anonymous,
        reactions: { RELATE: 0, ENCOURAGED: 0, THANK_YOU: 0, INSPIRED: 0 },
        comments: 0,
      }, ...prev]);
    }

    setComposer('');
    setAnonymous(false);
    showToast(lang === 'am' ? 'ልጦጣችሁ በክበቡ ውስጥ ተቀመጠ።' : 'Your whisper settled into the circle.');
    setPosting(false);
  }, [activeCircle?.id, anonymous, authProfile, circles, composer, lang, posting, profile.name, showToast, supabaseOnline, user]);

  const reactToPost = useCallback(async (id: string, type: ReactionType = 'RELATE') => {
    setPosts((prev) => prev.map((p) =>
      p.id === id ? { ...p, reactions: { ...p.reactions, [type]: (p.reactions[type] ?? 0) + 1 } } : p,
    ));
    if (user && supabaseOnline) {
      try { await addReaction(id, user.id, type); } catch { /* keep local */ }
    }
  }, [user, supabaseOnline]);

  const saveRitual = useCallback((id: string) => {
    const ritual = rituals.find((r) => r.id === id);
    if (ritual?.premium && !authProfile?.is_premium) { setShowSelamPlus(true); return; }
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, [authProfile?.is_premium, rituals]);

  const saveMood = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = `${mood.feeling}, energy ${mood.energy}/10 — ${mood.note || 'No note, just presence.'}`;
    setJournal((prev) => [{ id: `j-${Date.now()}`, text }, ...prev]);
    setMood((prev) => ({ ...prev, note: '' }));
    if (user && supabaseOnline) {
      try {
        await saveJournalEntry({ userId: user.id, mood: mood.feeling, energy: Number(mood.energy), prompt: cycle?.prompt ?? 'What gave you peace today?', response: mood.note });
      } catch { /* local kept */ }
    }
    showToast(lang === 'am' ? 'በግላዊነት ተቀምጧል።' : 'Journal entry saved privately.');
  }, [cycle?.prompt, lang, mood, showToast, supabaseOnline, user]);

  const reserveRetreat = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingDraft) return;
    setPaymentProcessing(true);
    showToast(t(lang, 'paymentProcessing'));
    await new Promise((r) => setTimeout(r, 1400));

    const exp = experiences.find((e) => e.id === bookingDraft.experienceId);
    const paymentRef = `TB-${Date.now().toString(36).toUpperCase()}`;
    const total = (exp?.price ?? 0) * bookingDraft.guests;
    const booking: Booking = { ...bookingDraft, id: `booking-${Date.now()}`, total, paymentRef };
    setBookings((prev) => [booking, ...prev]);
    setNotifications((n) => [`${paymentRef}: ${bookingDraft.retreat}`, ...n]);
    showToast(`${t(lang, 'bookingConfirmed')} — ${paymentRef}`);

    if (user && supabaseOnline && exp) {
      try {
        await saveBooking({ userId: user.id, experienceId: bookingDraft.experienceId, experienceTitle: bookingDraft.retreat ?? exp.title, date: bookingDraft.date, guests: bookingDraft.guests, payment: bookingDraft.payment, total, paymentRef });
      } catch { /* local kept */ }
    }
    setPaymentProcessing(false);
  }, [bookingDraft, experiences, lang, showToast, supabaseOnline, user]);

  const upgradePremium = useCallback(() => {
    persistProfile({ isPremium: true });
    setShowSelamPlus(false);
    showToast('Selam+ activated — ETB 175/month. Full library unlocked.');
  }, [persistProfile, showToast]);

  const updateCycleDay = useCallback(async (day: number) => {
    setCycleDay(day);
    if (apiOnline) {
      try { setCycle(await api.cycle(day)); } catch { setCycle(fallbackCycle(day)); }
    } else {
      setCycle(fallbackCycle(day));
    }
  }, [apiOnline]);

  const joinedCircles = useMemo(() => circles.filter((c) => c.joined), [circles]);
  const activePosts = useMemo(() => {
    if (!activeCircle) return posts;
    return posts.filter((p) => p.circleId === activeCircle.id || p.circle === activeCircle.name);
  }, [activeCircle, posts]);

  return {
    tab, setTab,
    loading: false,
    apiOnline, supabaseOnline,
    profile, lang,
    showSelamPlus, setShowSelamPlus,
    crisisModal, setCrisisModal,
    toast, setToast,
    posting,
    circles, activeCircle, setActiveCircle,
    posts, activePosts,
    cycle, cycleDay,
    rituals, experiences, practitioners, revenue,
    feedTab, setFeedTab,
    composer, setComposer,
    anonymous, setAnonymous,
    saved, selectedRitual, setSelectedRitual,
    mood, setMood,
    journal,
    bookingDraft, setBookingDraft,
    bookings, paymentProcessing,
    notifications, showNotifications, setShowNotifications,
    joinedCircles,
    joinCircle, submitPost, reactToPost,
    saveRitual, saveMood, reserveRetreat,
    upgradePremium, updateCycleDay,
    showToast, formatPrice,
    persistProfile, signOut, user,
  };
}
