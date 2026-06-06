import type { Circle, CommunityPost, CycleInsight, Experience, Practitioner, Ritual } from './types';

export const demoUser = { name: 'Hana Bekele', email: 'hana@selam.demo' };

// Spec §4.5 — deterministic anonymous alias per user+circle
const ANON_NAMES = ['Lemlem', 'Tigist', 'Hana', 'Sara', 'Meron', 'Selam', 'Dawit', 'Yohannes', 'Abel', 'Samuel', 'Betel', 'Eden', 'Biruk', 'Naomi', 'Ruth', 'Abebe', 'Tsion', 'Miriam'];
const ANON_CITIES = ['Addis', 'Adama', 'Bahir Dar', 'Hawassa', 'Mekelle', 'Jimma', 'Dire Dawa'];

export function generateAnonymousAlias(userId?: string, circleId?: string): string {
  const seed = ((userId ?? 'demo') + (circleId ?? 'circle')).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const name = ANON_NAMES[seed % ANON_NAMES.length];
  const city = ANON_CITIES[(seed >> 2) % ANON_CITIES.length];
  return `${name} from ${city}`;
}

// Spec §21.1 — initial circles exactly as specified (Women's Circle first, sortOrder: 0)
export const fallbackCircles: Circle[] = [
  {
    id: 'womens-wellness',
    name: "Women's Wellness Circle",
    nameAmharic: 'የሴቶች ጤንነት ክበብ',
    category: "Women's Wellness",
    members: 6120,
    activity: 'Flagship',
    description: "A safe, private space exclusively for women to discuss health, wellness, and life.",
    ritual: 'New moon body listening',
    isWomenOnly: true,
    joined: true,
  },
  {
    id: 'career-anxiety',
    name: 'Career Anxiety',
    nameAmharic: 'የሥራ ጭንቀት',
    category: 'Young Professionals',
    members: 4231,
    activity: 'Very active',
    description: 'A space to talk about workplace stress, career pressure, and professional growth.',
    ritual: 'Sunday courage check-in',
  },
  {
    id: 'student-life',
    name: 'Student Life',
    nameAmharic: 'የተማሪ ሕይወት',
    category: 'Students',
    members: 1890,
    activity: 'Active today',
    description: 'University stress, exams, ALX, and student support.',
    ritual: 'Friday nervous-system reset',
  },
  {
    id: 'grief-loss',
    name: 'Grief & Loss',
    nameAmharic: 'ሐዘን እና ኪሳራ',
    category: 'Grief Support',
    members: 784,
    activity: 'Moderated',
    description: 'Processing loss with people who understand.',
    ritual: 'Memory candle circle',
  },
  {
    id: 'relationships',
    name: 'Relationships',
    nameAmharic: 'ግንኙነቶች',
    category: 'Relationships',
    members: 2340,
    activity: 'Active',
    description: 'Family, romantic relationships, friendships, and social connections.',
    ritual: 'Weekly honest conversation',
  },
  {
    id: 'stress-management',
    name: 'Stress Management',
    nameAmharic: 'የጭንቀት አስተዳደር',
    category: 'Wellness',
    members: 3105,
    activity: 'Very active',
    description: 'Daily stress, overwhelm, and finding balance.',
    ritual: 'Morning grounding practice',
    isFeatured: true,
  },
  {
    id: 'spirituality',
    name: 'Spirituality & Faith',
    nameAmharic: 'መንፈሳዊነት እና እምነት',
    category: 'Spirituality',
    members: 1540,
    activity: 'Active',
    description: 'Faith journeys, spiritual wellness, and community.',
    ritual: 'Evening reflection',
  },
];

// Keep legacy id alias so existing join logic doesn't break
export const fallbackCirclesLegacy = fallbackCircles;

export const fallbackPosts: CommunityPost[] = [
  {
    id: 'post-1',
    circleId: 'womens-wellness',
    circle: "Women's Wellness Circle",
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
    circleId: 'womens-wellness',
    circle: "Women's Wellness Circle",
    author: 'Tigist from Hawassa',
    name: 'Tigist from Hawassa',
    content:
      'The Inner Spring guide helped me stop forcing productivity last week. I planned gently today and still got more done.',
    time: '5h ago',
    anonymous: true,
    reactions: { RELATE: 89, ENCOURAGED: 21, THANK_YOU: 5, INSPIRED: 33 },
    comments: 5,
  },
  {
    id: 'post-3',
    circleId: 'career-anxiety',
    circle: 'Career Anxiety',
    author: 'Dawit from Addis',
    name: 'Dawit from Addis',
    content:
      'I froze in an interview and I am trying to see it as data, not failure. Has anyone rebuilt confidence after that?',
    time: '18m ago',
    anonymous: true,
    reactions: { RELATE: 47, ENCOURAGED: 64, THANK_YOU: 9, INSPIRED: 12 },
    comments: 14,
  },
  {
    id: 'post-4',
    circleId: 'student-life',
    circle: 'Student Life',
    author: 'Betel from Bahir Dar',
    name: 'Betel from Bahir Dar',
    content:
      'ALX week 12 hit different. The imposter syndrome is real. But I keep showing up — that is the only thing I can control right now.',
    time: '1h ago',
    anonymous: true,
    reactions: { RELATE: 93, ENCOURAGED: 72, THANK_YOU: 11, INSPIRED: 45 },
    comments: 21,
  },
  {
    id: 'post-5',
    circleId: 'stress-management',
    circle: 'Stress Management',
    author: 'Miriam D.',
    name: 'Miriam D.',
    content:
      'Tried the coffee ceremony breathing this morning. Three rounds before my meeting. I actually showed up as myself, not my anxiety.',
    time: '3h ago',
    anonymous: false,
    reactions: { RELATE: 156, ENCOURAGED: 88, THANK_YOU: 34, INSPIRED: 67 },
    comments: 29,
  },
];

export const fallbackRituals: Ritual[] = [
  {
    id: 'coffee-breath',
    title: 'Coffee Ceremony Breathing',
    category: 'Coffee Ceremony',
    duration: '7 min',
    description: 'Turn buna time into a grounding nervous-system ritual.',
    text: 'Turn buna time into a slow nervous-system reset with breath, scent, and quiet witness. Three rounds of 4-7-8 breathing while the pot is on the fire. Let the steam carry what you cannot carry.',
    premium: false,
  },
  {
    id: 'inner-spring',
    title: 'Inner Spring Planning Guide',
    category: "Women's Health",
    duration: '12 min',
    description: 'Use follicular-phase energy for planning and creative renewal.',
    text: 'Use follicular-phase energy for planning, learning, and creative renewal without forcing. Your body is building toward fullness — mirror that in your work. Start things. Plant intentions. Let curiosity lead.',
    premium: true,
  },
  {
    id: 'teff-energy',
    title: 'Teff + Iron Energy Bowl',
    category: 'Nutrition',
    duration: '9 min',
    description: 'Culturally familiar guide for fatigue and cycle-aware nourishment.',
    text: 'A culturally familiar guide for fatigue, cycle-aware nourishment, and steady morning energy. Injera with lentils is not just food — it is medicine your grandmother already knew about.',
    premium: false,
  },
  {
    id: 'career-reset',
    title: 'After Rejection Reset',
    category: 'Career Wellness',
    duration: '6 min',
    description: 'Rebuild courage after rejection without pretending it did not hurt.',
    text: 'Rebuild courage after rejection without pretending it did not hurt. This is a 3-step practice: name the feeling, release the story, find the one thing that is still true about you.',
    premium: false,
  },
  {
    id: 'rest-evening',
    title: 'Ritual of Rest',
    category: 'Sleep',
    duration: '11 min',
    description: 'Evening sequence for screens, shoulders, and sleep.',
    text: 'A parchment-soft evening sequence for screens, shoulders, prayer-adjacent silence, and sleep. Based on Orthodox evening rhythm — not religious, but shaped by that quality of slow.',
    premium: true,
  },
  {
    id: 'idir-belonging',
    title: 'Idir Belonging Practice',
    category: 'Community',
    duration: '8 min',
    description: 'A reflection on showing up for others and letting others show up for you.',
    text: 'Idir is Ethiopia\'s oldest mental health system — mutual aid, shared grief, collective joy. This practice asks: who would show up for you? And who are you showing up for? That is your village.',
    premium: false,
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
    id: 'kuriftu-couples-spa',
    title: 'Kuriftu Couples Spa Package',
    category: 'Launch Partner',
    location: 'Kuriftu Resort, Bishoftu',
    price: 2200,
    description: 'A 90-minute couples spa experience — massage, sauna, and a private lakeside coffee ceremony.',
    dates: ['2026-06-08', '2026-06-15', '2026-06-22'],
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
    id: 'dawit-m',
    name: 'Dawit M.',
    title: 'Mental Wellness Coach',
    specialization: 'Burnout, career stress, young professionals',
    languages: ['Amharic', 'English', 'Afaan Oromo'],
    rating: 4.8,
    price: 700,
    availability: 'Tomorrow, 10:00 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=180&q=80',
  },
  {
    id: 'meron-a',
    name: 'Meron A.',
    title: 'Psychologist — Amanuel Partnership',
    specialization: 'Crisis support, grief, anxiety',
    languages: ['Amharic', 'English'],
    rating: 5.0,
    price: 1200,
    availability: 'Mon & Wed, 2:00 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=180&q=80',
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
      price: 'ETB 800–2,200 avg booking',
      yearOneTarget: '200 bookings/month → ETB 160K–360K/year',
    },
    {
      name: 'Wellness Intelligence',
      model: 'B2B anonymized trends',
      price: 'ETB 50K–120K/month per institution',
      yearOneTarget: '2 contracts → ETB 1.2M–2.88M/year',
    },
  ],
  launchPartner: 'Kuriftu Resort & Spa',
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

// Spec §7.2 — full keyword list across Amharic, English, Oromiffa
const CRISIS_KEYWORDS_AMHARIC = [
  'መሞት', 'እራሴን ማጥፋት', 'አልፈልግም', 'ህይወቴ', 'ልሞት', 'መጥፋት',
  'ማንም አይፈልገኝም', 'ጥቅም የለሽ', 'ተስፋ ቆርጫለሁ', 'ሞት',
];
const CRISIS_KEYWORDS_ENGLISH = [
  'kill myself', 'end my life', 'want to die', 'suicide', 'no reason to live',
  'nobody cares', 'better off dead', "can't go on", 'self harm', 'hurt myself',
  'worthless', 'hopeless', 'disappear forever',
];
const CRISIS_KEYWORDS_OROMIFFA = [
  'of du\'uu', 'jiraachuu hin barbaadu', 'hiyyummaanoo', 'abdii kutadhe',
];

export function clientSafetyCheck(content: string) {
  const lower = content.toLowerCase();
  const allKeywords = [...CRISIS_KEYWORDS_ENGLISH, ...CRISIS_KEYWORDS_AMHARIC, ...CRISIS_KEYWORDS_OROMIFFA];
  const matched = allKeywords.filter((word) => lower.includes(word.toLowerCase()));
  const isCrisis = matched.length > 0;

  let score = 100;
  if (matched.length === 1) score = 65;
  else if (matched.length === 2) score = 30;
  else if (matched.length > 2) score = 10;

  return {
    safeToPost: !isCrisis,
    score,
    moderation: isCrisis
      ? 'This post has been routed to a Selam moderator. You will not be left alone.'
      : 'Supportive and safe for circle publishing.',
    matchedSignals: matched,
    crisis: isCrisis,
    resources: isCrisis
      ? {
          hotline: '0116-62-52-09',
          hospital: 'Amanuel Mental Specialized Hospital',
          message: 'We noticed your post. You are not alone. A Selam support person will reach out within 30 minutes.',
          amharicMessage: 'ፖስትህን/ሿን አይተናል። አንተ/ቺ ብቻ አይደለህ/ሽም። የሰላም ድጋፍ ሰጪ ሰው በ30 ደቂቃ ውስጥ ያገኝሃል/ሻል።',
        }
      : null,
  };
}
