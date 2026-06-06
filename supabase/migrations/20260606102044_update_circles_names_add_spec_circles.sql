-- Update circle names to match spec
UPDATE circles SET name = 'Career Anxiety' WHERE id = 'career-anxiety';
UPDATE circles SET name = 'Women''s Wellness Circle', members = 6120 WHERE id = 'womens-haven';
UPDATE circles SET name = 'Student Life' WHERE id = 'alx-learners';
UPDATE circles SET name = 'Grief & Loss' WHERE id = 'grief-support';

-- Insert new circles with all required fields
INSERT INTO circles (id, name, category, description, members, activity, is_women_only) VALUES
  ('womens-wellness', 'Women''s Wellness Circle', 'WOMENS_HEALTH', 'A safe, private space exclusively for women to discuss health, wellness, and life.', 6120, 'Flagship', true),
  ('student-life', 'Student Life', 'STUDENT_LIFE', 'University stress, exams, ALX, and student support.', 1890, 'Active today', false),
  ('grief-loss', 'Grief & Loss', 'GRIEF_AND_LOSS', 'Processing loss with people who understand.', 784, 'Moderated', false),
  ('relationships', 'Relationships', 'RELATIONSHIPS', 'Family, romantic relationships, friendships, and social connections.', 2340, 'Active', false),
  ('stress-management', 'Stress Management', 'STRESS_MANAGEMENT', 'Daily stress, overwhelm, and finding balance.', 3105, 'Very active', false),
  ('spirituality', 'Spirituality & Faith', 'SPIRITUALITY', 'Faith journeys, spiritual wellness, and community.', 1540, 'Active', false)
ON CONFLICT (id) DO NOTHING;
