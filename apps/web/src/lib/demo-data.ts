import type { Circle, CommunityPost, CycleInsight, Experience, Practitioner, Ritual } from './types';

export const demoUser = { name: 'Hana Bekele', email: 'hana@selam.demo' };

export const fallbackCircles: Circle[] = [
  {
    id: 'career-anxiety',
    name: 'Career Anxiety Circle',
    category: 'Young Professionals',
    members: 4231,
    activity: 'Very active',
    description: 'For interviews, burnout, pivots, ambition, and being brave without becoming hard.',
    ritual: 'Sunday courage check-in',
  },
  {
    id: 'womens-haven',
    name: "Women's Haven",
    category: "Women's Wellness",
    members: 6120,
    activity: 'Flagship',
    description: 'Cycle wisdom, hormonal wellness, stories, practitioners, and protected support.',
    ritual: 'New moon body listening',
    isWomenOnly: true,
    joined: true,
  },
  {
    id: 'alx-learners',
    name: 'ALX Learners Reset',
    category: 'ALX Learners',
    members: 1890,
    activity: 'Active today',
    description: 'Peer support for intense learning seasons, imposter syndrome, sleep, and focus.',
    ritual: 'Friday nervous-system reset',
  },
  {
    id: 'grief-support',
    name: 'Quiet Grief Support',
    category: 'Grief Support',
    members: 784,
    activity: 'Moderated',
    description: 'A protected circle for loss, remembrance, and being gently witnessed.',
    ritual: 'Memory candle circle',
  },
];

export const fallbackPosts: CommunityPost[] = [
  {
    id: 'post-1',
    circleId: 'womens-haven',
    circle: "Women's Haven",
    author: 'Almaz T.',
    name: 'Almaz T.',
    content:
      'I used to track my cycle like a problem to solve. Today it felt like listening to an older, kinder version of myself.',
    time: '2h ago',
    anonymous: false,
    reactions: { RELATE: 124, ENCOURAGED: 36, THANK_YOU: 18, INSPIRED: 41 },
    comments: 18,
  },
  {
    id: 'post-2',
    circleId: 'womens-haven',
    circle: "Women's Haven",
    author: 'Sara B.',
    name: 'Sara B.',
    content:
      'The Inner Spring guide helped me stop forcing productivity last week. I planned gently today and still got more done.',
    time: '5h ago',
    anonymous: false,
    reactions: { RELATE: 89, ENCOURAGED: 21, THANK_YOU: 5, INSPIRED: 33 },
    comments: 5,
  },
  {
    id: 'post-3',
    circleId: 'career-anxiety',
    circle: 'Career Anxiety Circle',
    author: 'Anonymous',
    name: 'Anonymous',
    content:
      'I froze in an interview and I am trying to see it as data, not failure. Has anyone rebuilt confidence after that?',
    time: '18m ago',
    anonymous: true,
    reactions: { RELATE: 47, ENCOURAGED: 64, THANK_YOU: 9, INSPIRED: 12 },
    comments: 14,
  },
];

export const fallbackRituals: Ritual[] = [
  {
    id: 'coffee-breath',
    title: 'Coffee Ceremony Breathing',
    category: 'Coffee Ceremony',
    duration: '7 min',
    description: 'Turn buna time into a grounding nervous-system ritual.',
    text: 'Turn buna time into a slow nervous-system reset with breath, scent, and quiet witness.',
    premium: false,
  },
  {
    id: 'inner-spring',
    title: 'Inner Spring Planning Guide',
    category: "Women's Health",
    duration: '12 min',
    description: 'Use follicular-phase energy for planning and creative renewal.',
    text: 'Use follicular-phase energy for planning, learning, and creative renewal without forcing.',
    premium: true,
  },
  {
    id: 'teff-energy',
    title: 'Teff + Iron Energy Bowl',
    category: 'Nutrition',
    duration: '9 min',
    description: 'Culturally familiar guide for fatigue and cycle-aware nourishment.',
    text: 'A culturally familiar guide for fatigue, cycle-aware nourishment, and steady morning energy.',
    premium: false,
  },
  {
    id: 'career-reset',
    title: 'After Rejection Reset',
    category: 'Career Wellness',
    duration: '6 min',
    description: 'Rebuild courage after rejection without pretending it did not hurt.',
    text: 'Rebuild courage after rejection without pretending it did not hurt.',
    premium: false,
  },
  {
    id: 'rest-evening',
    title: 'Ritual of Rest',
    category: 'Sleep',
    duration: '11 min',
    description: 'Evening sequence for screens, shoulders, and sleep.',
    text: 'A parchment-soft evening sequence for screens, shoulders, prayer-adjacent silence, and sleep.',
    premium: true,
  },
];

export const fallbackExperiences: Experience[] = [
  {
    id: 'kuriftu-lake-spa',
    title: 'Kuriftu Lake Spa Day',
    category: 'Launch Partner',
    location: 'Kuriftu Resort, Bishoftu',
    price: 1800,
    description:
      'Lakeside spa, traditional coffee ceremony, guided breathwork, and a closing circle with certified practitioners.',
    dates: ['2026-06-08', '2026-06-15', '2026-06-22', '2026-06-29'],
    featured: true,
    partner: 'Kuriftu Resort',
    tone: 'water',
  },
  {
    id: 'entoto-reset',
    title: 'Entoto Forest Reset',
    category: 'Nature Escape',
    location: 'Entoto, Addis Ababa',
    price: 2400,
    description: 'Breathwork, forest walking, coffee reflection, and a closing circle under eucalyptus shade.',
    dates: ['2026-06-15', '2026-06-22', '2026-06-29'],
    tone: 'forest',
  },
  {
    id: 'bishoftu-waters',
    title: 'Bishoftu Waters Weekend',
    category: 'Retreat',
    location: 'Bishoftu',
    price: 9800,
    description: 'Lake calm, journaling, gentle movement, women-led circles, and practitioner sessions.',
    dates: ['2026-07-04', '2026-07-18', '2026-08-01'],
    tone: 'water',
  },
  {
    id: 'coffee-ceremony-calm',
    title: 'Coffee Ceremony Calm',
    category: 'Ritual',
    location: 'Addis Ababa',
    price: 650,
    description: 'A familiar ceremony redesigned for belonging, breath, storytelling, and emotional release.',
    dates: ['2026-06-12', '2026-06-19', '2026-06-26'],
    tone: 'coffee',
  },
];

export const fallbackPractitioners: Practitioner[] = [
  {
    id: 'selamawit',
    name: 'Dr. Selamawit G.',
    title: 'Holistic Health Practitioner',
    specialization: "Women's health, cycle education, nutrition",
    languages: ['Amharic', 'English'],
    rating: 4.9,
    price: 850,
    availability: 'Today, 6:30 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 'dawit',
    name: 'Dawit M.',
    title: 'Mental Wellness Coach',
    specialization: 'Burnout, career stress, young professionals',
    languages: ['Amharic', 'English', 'Afaan Oromo'],
    rating: 4.8,
    price: 700,
    availability: 'Tomorrow, 10:00 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=180&q=80',
  },
];

export const fallbackRevenue = {
  streams: [
    {
      name: 'Selam+ Premium',
      model: 'Freemium B2C',
      price: 'ETB 150–200/month',
      yearOneTarget: '500 subscribers → ETB 900K–1M/year',
    },
    {
      name: 'Experience Marketplace',
      model: '10–15% commission',
      price: 'ETB 800–2,000 avg booking',
      yearOneTarget: '200 bookings/month → ETB 160K–360K/year',
    },
    {
      name: 'Wellness Intelligence',
      model: 'B2B anonymized trends',
      price: 'ETB 50K–120K/month per institution',
      yearOneTarget: '2 contracts → ETB 1.2M–2.88M/year',
    },
  ],
  launchPartner: 'Kuriftu Resort',
  ethicsNote: 'Only aggregated, anonymized data. Government excluded. k-anonymity ≥ 150 users.',
};

export function fallbackCycle(day = 8): CycleInsight {
  if (day <= 5) {
    return {
      day,
      phase: 'Inner Winter',
      energy: 32,
      suggestion: 'Rest, reduce obligations, choose warmth.',
      prompt: 'What can you let be carried today?',
      bestFor: ['Reflection', 'Gentle stretching', 'Warm meals'],
    };
  }
  if (day <= 13) {
    return {
      day,
      phase: 'Inner Spring',
      energy: 78,
      suggestion: 'Plan, learn, start conversations, and let creative ideas breathe.',
      prompt: 'What wants to begin softly?',
      bestFor: ['Planning', 'Creativity', 'Learning'],
    };
  }
  if (day <= 21) {
    return {
      day,
      phase: 'Inner Summer',
      energy: 91,
      suggestion: 'Lead, connect, pitch, move, and book meaningful time with people.',
      prompt: 'Where can connection become medicine?',
      bestFor: ['Connection', 'Movement', 'Leadership'],
    };
  }
  return {
    day,
    phase: 'Inner Autumn',
    energy: 54,
    suggestion: 'Edit, complete, protect your energy, and choose honest boundaries.',
    prompt: 'What boundary would make peace easier?',
    bestFor: ['Completion', 'Boundaries', 'Nourishment'],
  };
}

export function clientSafetyCheck(content: string) {
  const lower = content.toLowerCase();
  const riskWords = [
    'kill myself',
    'suicide',
    'hurt myself',
    'abuse',
    'violence',
    'want to die',
    'end my life',
    'እራሴን',
    'ማጥፋት',
    'ሞት',
  ];
  const matched = riskWords.filter((word) => lower.includes(word));
  const isCrisis = matched.length > 0;
  return {
    safeToPost: !isCrisis,
    score: Math.max(20, 100 - matched.length * 35),
    moderation: isCrisis
      ? 'This post should be routed to a moderator and shown crisis-support resources before publishing.'
      : 'Supportive and safe for circle publishing.',
    matchedSignals: matched,
    crisis: isCrisis,
    resources: isCrisis
      ? {
          hotline: '0116-62-52-09',
          hospital: 'Amanuel Mental Specialized Hospital',
          message: 'We noticed your post. You are not alone. A Selam support person will reach out within 30 minutes.',
          amharicMessage: 'ልጦጣችሁ ተመልክተናል። ብቻ አይደሉም። የሰላም ድጋፍ ሰው በ30 ደቂቃ ውስጥ ይገናኛችኋል።',
        }
      : null,
  };
}
