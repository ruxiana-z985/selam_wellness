export const demoUser = {
  id: 'demo-user',
  name: 'Hana',
  email: 'hana@selam.demo',
  avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80',
};

export const circles = [
  {
    id: 'career-anxiety',
    name: 'Career Anxiety Circle',
    category: 'Young Professionals',
    description: 'A calm Mahber-inspired circle for ambition, uncertainty, interviews, burnout, and brave next steps.',
    members: 4231,
    activity: 'Very active',
    isWomenOnly: false,
  },
  {
    id: 'womens-haven',
    name: "Women's Haven",
    category: "Women's Wellness",
    description: 'Cycle wisdom, hormonal wellness, stories, practitioners, and women-only support.',
    members: 6120,
    activity: 'Flagship',
    isWomenOnly: true,
  },
  {
    id: 'alx-learners',
    name: 'ALX Learners Reset',
    category: 'ALX Learners',
    description: 'Peer support for intense learning seasons, imposter syndrome, sleep, and focus rituals.',
    members: 1890,
    activity: 'Active today',
    isWomenOnly: false,
  },
  {
    id: 'grief-support',
    name: 'Quiet Grief Support',
    category: 'Grief Support',
    description: 'A protected circle for loss, remembrance, and being gently witnessed.',
    members: 784,
    activity: 'Moderated',
    isWomenOnly: false,
  },
];

export const posts = [
  {
    id: 'post-1',
    circleId: 'womens-haven',
    author: 'Almaz T.',
    avatarUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=160&q=80',
    content: 'Finding this space has been a revelation. For the first time, I feel my traditional roots and my modern health journey are perfectly aligned.',
    time: '2h ago',
    reactions: { RELATE: 124, ENCOURAGED: 36, THANK_YOU: 18, INSPIRED: 41 },
    comments: 18,
    anonymous: false,
  },
  {
    id: 'post-2',
    circleId: 'womens-haven',
    author: 'Sara B.',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
    content: "The moon tracking feature helped me understand why I was exhausted last week. It is like having a map of my own soul.",
    time: '5h ago',
    reactions: { RELATE: 89, ENCOURAGED: 21, THANK_YOU: 5, INSPIRED: 33 },
    comments: 5,
    anonymous: false,
  },
  {
    id: 'post-3',
    circleId: 'career-anxiety',
    author: 'Anonymous',
    avatarUrl: '',
    content: 'I froze during an interview today. I am trying to see it as data, not failure. Has anyone rebuilt confidence after a bad interview?',
    time: '18m ago',
    reactions: { RELATE: 47, ENCOURAGED: 64, THANK_YOU: 9, INSPIRED: 12 },
    comments: 14,
    anonymous: true,
  },
];

export const practitioners = [
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

export const experiences = [
  {
    id: 'kuriftu-lake-spa',
    title: 'Kuriftu Lake Spa Day',
    category: 'Launch Partner',
    location: 'Kuriftu Resort, Bishoftu',
    price: 1800,
    description:
      'Our launch partner experience: lakeside spa, traditional coffee ceremony, guided breathwork, and a closing circle with certified practitioners.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    dates: ['2026-06-08', '2026-06-15', '2026-06-22', '2026-06-29'],
    featured: true,
    partner: 'Kuriftu Resort',
  },
  {
    id: 'entoto-reset',
    title: 'Entoto Forest Reset',
    category: 'Nature Escape',
    location: 'Entoto, Addis Ababa',
    price: 2400,
    description: 'A guided half-day nature reset with breathwork, coffee ceremony reflection, and gentle movement.',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    dates: ['2026-06-15', '2026-06-22', '2026-06-29'],
  },
  {
    id: 'bishoftu-waters',
    title: 'Bishoftu Waters Weekend',
    category: 'Retreat',
    location: 'Bishoftu',
    price: 9800,
    description: 'A premium weekend retreat for restoration, journaling, lake walks, and practitioner-led circles.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    dates: ['2026-07-04', '2026-07-18', '2026-08-01'],
  },
  {
    id: 'coffee-ceremony-calm',
    title: 'Coffee Ceremony Calm',
    category: 'Ritual',
    location: 'Addis Ababa',
    price: 650,
    description: 'A guided ritual blending coffee ceremony, emotional check-in, and community storytelling.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    dates: ['2026-06-12', '2026-06-19', '2026-06-26'],
  },
];

export const wellnessLibrary = [
  {
    id: 'coffee-breath',
    title: 'Coffee Ceremony Breathing',
    category: 'Coffee Ceremony Rituals',
    format: 'Audio',
    duration: '7 min',
    description: 'Turn buna time into a grounding nervous-system ritual.',
    premium: false,
  },
  {
    id: 'inner-spring',
    title: 'Inner Spring Planning Guide',
    category: "Women's Health",
    format: 'Guide',
    duration: '12 min',
    description: 'Use follicular-phase energy for planning, learning, and creative renewal.',
    premium: true,
  },
  {
    id: 'teff-energy',
    title: 'Teff, Iron, and Energy',
    category: 'Nutrition',
    format: 'Article',
    duration: '5 min',
    description: 'A culturally familiar nutrition note for fatigue and cycle-aware meals.',
    premium: false,
  },
  {
    id: 'career-reset',
    title: 'After Rejection Reset',
    category: 'Career Wellness',
    format: 'Guide',
    duration: '6 min',
    description: 'Rebuild courage after rejection without pretending it did not hurt.',
    premium: false,
  },
  {
    id: 'rest-evening',
    title: 'Ritual of Rest',
    category: 'Sleep',
    format: 'Audio',
    duration: '11 min',
    description: 'A parchment-soft evening sequence for screens, shoulders, and sleep.',
    premium: true,
  },
];

export const revenueModel = {
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

export const crisisResources = {
  hotline: '0116-62-52-09',
  hospital: 'Amanuel Mental Specialized Hospital',
  message:
    'We noticed your post. You are not alone. A Selam support person will reach out within 30 minutes.',
  amharicMessage: 'ልጦጣችሁ ተመልክተናል። ብቻ አይደሉም። የሰላም ድጋፍ ሰው በ30 ደቂቃ ውስጥ ይገናኛችኋል።',
};

export function cycleInsight(day = 8) {
  if (day <= 5) {
    return {
      day,
      phase: 'Inner Winter',
      energy: 32,
      mood: 'Tender',
      suggestion: 'Rest, reduce obligations, choose warmth, and let your circle carry small things.',
      bestFor: ['Reflection', 'Gentle stretching', 'Warm meals'],
    };
  }
  if (day <= 13) {
    return {
      day,
      phase: 'Inner Spring',
      energy: 78,
      mood: 'Renewing',
      suggestion: 'Plan, learn, start conversations, and let creative ideas breathe.',
      bestFor: ['Planning', 'Creativity', 'Learning'],
    };
  }
  if (day <= 21) {
    return {
      day,
      phase: 'Inner Summer',
      energy: 91,
      mood: 'Open',
      suggestion: 'Lead, connect, pitch, move, and book meaningful time with people.',
      bestFor: ['Connection', 'Movement', 'Leadership'],
    };
  }
  return {
    day,
    phase: 'Inner Autumn',
    energy: 54,
    mood: 'Discerning',
    suggestion: 'Edit, complete, protect your energy, and choose honest boundaries.',
    bestFor: ['Completion', 'Boundaries', 'Nourishment'],
  };
}

export function safetyCheck(content: string) {
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
    'አልቻልም',
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
    resources: isCrisis ? crisisResources : null,
  };
}
