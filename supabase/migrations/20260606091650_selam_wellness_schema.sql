-- Circles
CREATE TABLE circles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  members INTEGER NOT NULL DEFAULT 0,
  activity TEXT NOT NULL,
  is_women_only BOOLEAN NOT NULL DEFAULT false,
  ritual TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "circles_select" ON circles FOR SELECT TO authenticated USING (true);
CREATE POLICY "circles_insert" ON circles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "circles_update" ON circles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "circles_delete" ON circles FOR DELETE TO authenticated USING (true);

-- Allow anon to read circles (for homepage demo)
CREATE POLICY "circles_select_anon" ON circles FOR SELECT TO anon USING (true);

-- User profiles (extends auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_initial TEXT NOT NULL DEFAULT 'U',
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  data_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete" ON user_profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Circle members
CREATE TABLE circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, circle_id)
);

ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "circle_members_select" ON circle_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "circle_members_insert" ON circle_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "circle_members_update" ON circle_members FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "circle_members_delete" ON circle_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id TEXT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  safety_score INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_select" ON posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id OR anonymous = true);
CREATE POLICY "posts_update" ON posts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Allow anon to read posts
CREATE POLICY "posts_select_anon" ON posts FOR SELECT TO anon USING (true);

-- Post reactions
CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('RELATE', 'ENCOURAGED', 'THANK_YOU', 'INSPIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_select" ON post_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "reactions_insert" ON post_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_update" ON post_reactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON post_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  energy INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 10),
  prompt TEXT NOT NULL,
  response TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journal_select" ON journal_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "journal_insert" ON journal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_update" ON journal_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_delete" ON journal_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id TEXT NOT NULL,
  experience_title TEXT NOT NULL,
  date TEXT NOT NULL,
  guests INTEGER NOT NULL CHECK (guests >= 1),
  payment TEXT NOT NULL,
  total INTEGER NOT NULL,
  payment_ref TEXT,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select" ON bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "bookings_insert" ON bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_update" ON bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookings_delete" ON bookings FOR DELETE TO authenticated USING (auth.uid() = user_id);
