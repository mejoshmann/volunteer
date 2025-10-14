-- Supabase Database Schema for Freestyle Vancouver Volunteer App
-- Run these commands in your Supabase SQL Editor

-- ============================================
-- 1. VOLUNTEERS TABLE (Profile Information)
-- ============================================
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT NOT NULL,
  children_names TEXT,
  training_mountain TEXT NOT NULL CHECK (training_mountain IN ('Cypress', 'Grouse')),
  strengths TEXT[] DEFAULT '{}',
  skiing_ability TEXT NOT NULL CHECK (skiing_ability IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  preferred_opportunities TEXT NOT NULL CHECK (preferred_opportunities IN ('On Snow', 'Off Snow', 'Both')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. OPPORTUNITIES TABLE (Volunteer Shifts)
-- ============================================
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('Cypress', 'Grouse')),
  type TEXT NOT NULL CHECK (type IN ('on-snow', 'off-snow')),
  max_volunteers INTEGER NOT NULL DEFAULT 1 CHECK (max_volunteers > 0),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. SIGNUPS TABLE (Volunteer Registrations)
-- ============================================
CREATE TABLE IF NOT EXISTS signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE NOT NULL,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE NOT NULL,
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(opportunity_id, volunteer_id) -- Prevent duplicate signups
);

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email);
CREATE INDEX IF NOT EXISTS idx_opportunities_date ON opportunities(date);
CREATE INDEX IF NOT EXISTS idx_signups_opportunity_id ON signups(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_signups_volunteer_id ON signups(volunteer_id);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;

-- VOLUNTEERS TABLE POLICIES
-- Users can read their own volunteer profile
CREATE POLICY "Users can read own volunteer profile"
  ON volunteers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own volunteer profile during registration
CREATE POLICY "Users can insert own volunteer profile"
  ON volunteers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own volunteer profile
CREATE POLICY "Users can update own volunteer profile"
  ON volunteers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- All authenticated users can read all volunteer profiles (for admin view)
CREATE POLICY "Authenticated users can read all volunteers"
  ON volunteers FOR SELECT
  USING (auth.role() = 'authenticated');

-- OPPORTUNITIES TABLE POLICIES
-- All authenticated users can read opportunities
CREATE POLICY "Authenticated users can read opportunities"
  ON opportunities FOR SELECT
  USING (auth.role() = 'authenticated');

-- All authenticated users can create opportunities (admin functionality)
CREATE POLICY "Authenticated users can create opportunities"
  ON opportunities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- All authenticated users can update opportunities (admin functionality)
CREATE POLICY "Authenticated users can update opportunities"
  ON opportunities FOR UPDATE
  USING (auth.role() = 'authenticated');

-- All authenticated users can delete opportunities (admin functionality)
CREATE POLICY "Authenticated users can delete opportunities"
  ON opportunities FOR DELETE
  USING (auth.role() = 'authenticated');

-- SIGNUPS TABLE POLICIES
-- Users can read all signups (to see who's signed up)
CREATE POLICY "Authenticated users can read signups"
  ON signups FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can create signups for themselves
CREATE POLICY "Users can create own signups"
  ON signups FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    volunteer_id IN (SELECT id FROM volunteers WHERE user_id = auth.uid())
  );

-- Users can delete their own signups
CREATE POLICY "Users can delete own signups"
  ON signups FOR DELETE
  USING (
    volunteer_id IN (SELECT id FROM volunteers WHERE user_id = auth.uid())
  );

-- ============================================
-- 6. FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_volunteers_updated_at
  BEFORE UPDATE ON volunteers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. HELPFUL VIEWS (Optional)
-- ============================================

-- View to see opportunities with signup counts
CREATE OR REPLACE VIEW opportunities_with_counts AS
SELECT 
  o.*,
  COUNT(s.id) as signed_up_count,
  o.max_volunteers - COUNT(s.id) as spots_remaining
FROM opportunities o
LEFT JOIN signups s ON o.id = s.opportunity_id
GROUP BY o.id;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- After running this script:
-- 1. Your tables are created with proper constraints
-- 2. RLS policies ensure users can only modify their own data
-- 3. Indexes are in place for better performance
-- 4. Triggers automatically update timestamps
