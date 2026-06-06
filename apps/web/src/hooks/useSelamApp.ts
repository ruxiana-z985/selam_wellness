import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
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
  UserProfile,
} from '../lib/types';

const ritualTexts: Record<string, string> = {
  'coffee-breath': 'Turn buna time into a slow nervous-system reset with breath, scent, and quiet witness.',
  'inner-spring': 'Use follicular-phase energy for planning, learning, and creative renewal without forcing.',
  'teff-energy': 'A culturally familiar guide for fatigue, cycle-aware nourishment, and steady morning energy.',
  'career-reset': 'Rebuild courage after rejection without pretending it did not hurt.',
  'rest-evening': 'A parchment-soft evening sequence for screens, shoulders, prayer-adjacent silence, and sleep.',
};

const phaseDays: Record<string, number> = { winter: 3, spring: 8, summer: 16, autumn: 24 };

function loadProfile(): UserProfile {
  const stored = localStorage.getItem('selam-profile');
  if (stored) return JSON.parse(stored) as UserProfile;
  return {
    name: 'Hana Bekele',
    email: 'hana@selam.demo',
    avatarInitial: 'H',
    language: 'en',
    isPremium: false,
    dataConsent: false,
  };
}

function mapPost(post: CommunityPost, circles: Circle[]): CommunityPost {
  const circle = circles.find((c) => c.id === post.circleId);
  return {
    ...post,
    name: post.author ?? post.name,
    circle: circle?.name ?? post.circle,
    reactions: post.reactions ?? { RELATE: 0, ENCOURAGED: 0, THANK_YOU: 0, INSPIRED: 0 },
  };
}

export function useSelamApp() {
  const [tab, setTab] = useState<Tab>('home');
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('selam-onboarded') === 'true');
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [showSelamPlus, setShowSelamPlus] = useState(false);
  const [crisisModal, setCrisisModal] = useState<SafetyResult | null>(null);
  const [toast, setToast] = useState('');
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
  const [journal, setJournal] = useState<{ id: string; text: string }[]>([
    { id: 'j1', text: 'Morning felt lighter after coffee breathing.' },
  ]);
  const [bookingDraft, setBookingDraft] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([
    'Welcome to Selam — your village is ready.',
    "Women's Haven: Inner Spring guide is live.",
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const lang = profile.language;

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 4200);
  }, []);

  const persistProfile = useCallback((next: UserProfile) => {
    setProfile(next);
    localStorage.setItem('selam-profile', JSON.stringify(next));
  }, []);

  const completeOnboarding = useCallback(
    async (data: { name: string; language: Language; dataConsent: boolean }) => {
      const next = {
        ...profile,
        name: data.name,
        avatarInitial: data.name.charAt(0).toUpperCase(),
        language: data.language,
        dataConsent: data.dataConsent,
      };
      persistProfile(next);
      localStorage.setItem('selam-onboarded', 'true');
      setOnboarded(true);
      showToast(data.language === 'am' ? 'ወደ ሰላም እንኳን በደህና መጡ!' : 'Welcome to your Selam village.');
      try {
        const result = await api.joinCircle('career-anxiety');
        setCircles((items) =>
          items.map((c) =>
            c.id === 'career-anxiety' ? { ...c, joined: true, members: result.members } : c,
          ),
        );
        setActiveCircle((prev) =>
          prev?.id === 'career-anxiety' ? { ...prev, joined: true } : prev,
        );
      } catch {
        setCircles((items) =>
          items.map((c) => (c.id === 'career-anxiety' ? { ...c, joined: true, members: c.members + 1 } : c)),
        );
      }
      setTab('circles');
    },
    [persistProfile, profile, showToast],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await api.health();
      setApiOnline(true);
      const [home, circleList, library, retreatList, practitionerList, revenueData] = await Promise.all([
        api.home(),
        api.circles(),
        api.library(),
        api.retreats(),
        api.practitioners(),
        api.revenue(),
      ]);

      const enrichedCircles = circleList.map((c) => ({
        ...c,
        ritual:
          c.id === 'career-anxiety'
            ? 'Sunday courage check-in'
            : c.id === 'womens-haven'
              ? 'New moon body listening'
              : c.id === 'alx-learners'
                ? 'Friday nervous-system reset'
                : 'Memory candle circle',
      }));

      setCircles(enrichedCircles);
      setActiveCircle(enrichedCircles.find((c) => c.id === 'womens-haven') ?? enrichedCircles[0]);
      setPosts(home.whispers.map((p) => mapPost(p, enrichedCircles)));
      setCycle(home.cycle);
      setRituals(
        library.map((r) => ({
          ...r,
          text: ritualTexts[r.id] ?? r.description,
        })),
      );
      setSelectedRitual(
        library.map((r) => ({ ...r, text: ritualTexts[r.id] ?? r.description }))[0] ?? null,
      );
      setExperiences(
        retreatList.map((e) => ({
          ...e,
          tone: experienceTone(e.id),
        })),
      );
      setPractitioners(practitionerList);
      setRevenue(revenueData);

      const featured = retreatList.find((e) => e.featured) ?? retreatList[0];
      if (featured) {
        setBookingDraft({
          experienceId: featured.id,
          retreat: featured.title,
          date: featured.dates[0],
          guests: 1,
          payment: 'Telebirr',
        });
      }
    } catch {
      setApiOnline(false);
      setCircles(fallbackCircles);
      setActiveCircle(fallbackCircles.find((c) => c.id === 'womens-haven') ?? fallbackCircles[0]);
      setPosts(fallbackPosts);
      setCycle(fallbackCycle(8));
      setRituals(fallbackRituals);
      setSelectedRitual(fallbackRituals[0]);
      setExperiences(fallbackExperiences);
      setPractitioners(fallbackPractitioners);
      setRevenue(fallbackRevenue);
      const featured = fallbackExperiences.find((e) => e.featured) ?? fallbackExperiences[0];
      setBookingDraft({
        experienceId: featured.id,
        retreat: featured.title,
        date: featured.dates[0],
        guests: 1,
        payment: 'Telebirr',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshFeed = useCallback(
    async (circleId: string) => {
      if (!apiOnline) return;
      try {
        const feed = await api.circleFeed(circleId);
        setPosts((prev) => {
          const others = prev.filter((p) => p.circleId !== circleId);
          return [...feed.posts.map((p) => mapPost(p, circles)), ...others];
        });
      } catch {
        /* keep local state */
      }
    },
    [apiOnline, circles],
  );

  const joinCircle = useCallback(
    async (circle: Circle) => {
      setActiveCircle(circle);
      setCircles((items) =>
        items.map((c) => (c.id === circle.id ? { ...c, joined: true, members: c.members + 1 } : c)),
      );
      if (apiOnline) {
        try {
          const result = await api.joinCircle(circle.id);
          showToast(result.message);
          await refreshFeed(circle.id);
        } catch {
          showToast(`You joined ${circle.name}. The circle makes room for you.`);
        }
      } else {
        showToast(`You joined ${circle.name}. The circle makes room for you.`);
      }
    },
    [apiOnline, refreshFeed, showToast],
  );

  const submitPost = useCallback(
    async (event: FormEvent<HTMLFormElement>, circleId?: string) => {
      event.preventDefault();
      if (!composer.trim() || posting) return;
      const targetId = circleId ?? activeCircle?.id;
      if (!targetId) return;

      setPosting(true);
      try {
        if (apiOnline) {
          const result = await api.createPost({
            circleId: targetId,
            content: composer.trim(),
            anonymous,
          });
          if (!result.safety.safeToPost) {
            setCrisisModal(result.safety);
            setPosting(false);
            return;
          }
          const mapped = mapPost(result, circles);
          setPosts((items) => [mapped, ...items]);
          setNotifications((n) => [`Your whisper is live in ${mapped.circle}`, ...n]);
        } else {
          const check = clientSafetyCheck(composer.trim());
          if (!check.safeToPost) {
            setCrisisModal(check);
            setPosting(false);
            return;
          }
          const circle = circles.find((c) => c.id === targetId);
          const newPost: CommunityPost = {
            id: `post-${Date.now()}`,
            circleId: targetId,
            circle: circle?.name,
            author: anonymous ? 'Anonymous' : profile.name,
            name: anonymous ? 'Anonymous' : profile.name,
            time: 'now',
            content: composer.trim(),
            anonymous,
            reactions: { RELATE: 0 },
            comments: 0,
          };
          setPosts((items) => [newPost, ...items]);
        }
        setComposer('');
        setAnonymous(false);
        showToast(lang === 'am' ? 'ልጦጣችሁ በክበቡ ውስጥ ተቀመጠ።' : 'Your whisper settled into the circle.');
      } catch {
        showToast('Could not post right now. Try again.');
      } finally {
        setPosting(false);
      }
    },
    [activeCircle?.id, anonymous, circles, composer, apiOnline, lang, posting, profile.name, showToast],
  );

  const reactToPost = useCallback(
    async (id: string, type: ReactionType = 'RELATE') => {
      setPosts((items) =>
        items.map((post) =>
          post.id === id
            ? { ...post, reactions: { ...post.reactions, [type]: (post.reactions[type] ?? 0) + 1 } }
            : post,
        ),
      );
      if (apiOnline) {
        try {
          await api.reactToPost(id, type);
        } catch {
          /* local update kept */
        }
      }
    },
    [apiOnline],
  );

  const saveRitual = useCallback(
    (id: string) => {
      const ritual = rituals.find((r) => r.id === id);
      if (ritual?.premium && !profile.isPremium) {
        setShowSelamPlus(true);
        return;
      }
      setSaved((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
    },
    [profile.isPremium, rituals],
  );

  const saveMood = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const text = `${mood.feeling}, energy ${mood.energy}/10 — ${mood.note || 'No note, just presence.'}`;
      const entry = { id: `j-${Date.now()}`, text };
      setJournal((items) => [entry, ...items]);
      setMood({ ...mood, note: '' });
      if (apiOnline) {
        try {
          await api.createJournal({
            mood: mood.feeling,
            energy: Number(mood.energy),
            prompt: cycle?.prompt ?? 'What gave you peace today?',
            response: mood.note,
          });
        } catch {
          /* local kept */
        }
      }
      showToast(lang === 'am' ? 'በግላዊነት ተቀምጧል።' : 'Journal entry saved privately.');
    },
    [apiOnline, cycle?.prompt, lang, mood, showToast],
  );

  const reserveRetreat = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!bookingDraft) return;
      setPaymentProcessing(true);
      showToast(t(lang, 'paymentProcessing'));

      await new Promise((r) => setTimeout(r, 1400));

      try {
        if (apiOnline) {
          const result = await api.createBooking(bookingDraft);
          const booking = {
            ...bookingDraft,
            id: result.id,
            paymentRef: result.paymentRef,
            total: result.total,
            retreat: bookingDraft.retreat,
          };
          setBookings((items) => [booking, ...items]);
          setNotifications((n) => [`${result.paymentRef}: ${bookingDraft.retreat}`, ...n]);
          showToast(`${t(lang, 'bookingConfirmed')} — ${result.paymentRef}`);
        } else {
          const exp = experiences.find((e) => e.id === bookingDraft.experienceId);
          const booking = {
            ...bookingDraft,
            id: `booking-${Date.now()}`,
            total: (exp?.price ?? 0) * bookingDraft.guests,
            paymentRef: `TB-${Date.now().toString(36).toUpperCase()}`,
          };
          setBookings((items) => [booking, ...items]);
          showToast(`${t(lang, 'bookingConfirmed')} — ${booking.paymentRef}`);
        }
      } catch {
        showToast('Booking failed. Please try again.');
      } finally {
        setPaymentProcessing(false);
      }
    },
    [apiOnline, bookingDraft, experiences, lang, showToast],
  );

  const upgradePremium = useCallback(() => {
    persistProfile({ ...profile, isPremium: true });
    setShowSelamPlus(false);
    showToast('Selam+ activated — ETB 175/month. Full library unlocked.');
  }, [persistProfile, profile, showToast]);

  const updateCycleDay = useCallback(
    async (day: number) => {
      setCycleDay(day);
      if (apiOnline) {
        try {
          const insight = await api.cycle(day);
          setCycle(insight);
        } catch {
          setCycle(fallbackCycle(day));
        }
      } else {
        setCycle(fallbackCycle(day));
      }
    },
    [apiOnline],
  );

  const joinedCircles = useMemo(() => circles.filter((c) => c.joined), [circles]);

  const activePosts = useMemo(() => {
    if (!activeCircle) return posts;
    return posts.filter((p) => p.circleId === activeCircle.id || p.circle === activeCircle.name);
  }, [activeCircle, posts]);

  return {
    tab,
    setTab,
    loading,
    apiOnline,
    onboarded,
    profile,
    lang,
    showSelamPlus,
    setShowSelamPlus,
    crisisModal,
    setCrisisModal,
    toast,
    setToast,
    posting,
    circles,
    activeCircle,
    setActiveCircle,
    posts,
    activePosts,
    cycle,
    cycleDay,
    rituals,
    experiences,
    practitioners,
    revenue,
    feedTab,
    setFeedTab,
    composer,
    setComposer,
    anonymous,
    setAnonymous,
    saved,
    selectedRitual,
    setSelectedRitual,
    mood,
    setMood,
    journal,
    bookingDraft,
    setBookingDraft,
    bookings,
    paymentProcessing,
    notifications,
    showNotifications,
    setShowNotifications,
    joinedCircles,
    completeOnboarding,
    joinCircle,
    submitPost,
    reactToPost,
    saveRitual,
    saveMood,
    reserveRetreat,
    upgradePremium,
    updateCycleDay,
    showToast,
    formatPrice,
    refreshFeed,
    persistProfile,
  };
}
