-- ============================================
-- FINAL RLS FIX - Fixes 406 Error During Registration
-- ============================================
-- This addresses the specific 406 error you're seeing
-- when trying to insert volunteer records
-- ============================================

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Drop ALL volunteers policies (every possible name)
DROP POLICY IF EXISTS "volunteers_insert_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_insert_during_registration" ON volunteers;
DROP POLICY IF EXISTS "volunteers_select_own_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_select_all_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_update_policy" ON volunteers;
DROP POLICY IF EXISTS "Users can read own volunteer profile" ON volunteers;
DROP POLICY IF EXISTS "Users can insert own volunteer profile" ON volunteers;
DROP POLICY IF EXISTS "Users can update own volunteer profile" ON volunteers;
DROP POLICY IF EXISTS "Authenticated users can read all volunteers" ON volunteers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON volunteers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON volunteers;
DROP POLICY IF EXISTS "Enable read access for all users" ON volunteers;
DROP POLICY IF EXISTS "Enable read for own profile" ON volunteers;
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON volunteers;
DROP POLICY IF EXISTS "Enable update for own profile" ON volunteers;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON volunteers;
DROP POLICY IF EXISTS "Allow users to read own data" ON volunteers;

-- Drop opportunities policies
DROP POLICY IF EXISTS "opportunities_select_policy" ON opportunities;
DROP POLICY IF EXISTS "opportunities_insert_policy" ON opportunities;
DROP POLICY IF EXISTS "opportunities_update_policy" ON opportunities;
DROP POLICY IF EXISTS "opportunities_delete_policy" ON opportunities;

-- Drop signups policies
DROP POLICY IF EXISTS "signups_select_policy" ON signups;
DROP POLICY IF EXISTS "signups_insert_policy" ON signups;
DROP POLICY IF EXISTS "signups_delete_policy" ON signups;

-- ============================================
-- STEP 2: DISABLE RLS TEMPORARILY
-- ============================================
ALTER TABLE volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE signups DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: GRANT PERMISSIONS
-- ============================================

-- Grant full access to authenticated users
GRANT ALL ON TABLE volunteers TO authenticated;
GRANT ALL ON TABLE opportunities TO authenticated;
GRANT ALL ON TABLE signups TO authenticated;

-- Grant sequence usage
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Also grant to anon for initial signup
GRANT SELECT, INSERT ON TABLE volunteers TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================
-- STEP 4: RE-ENABLE RLS
-- ============================================
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: CREATE PERMISSIVE POLICIES
-- ============================================

-- VOLUNTEERS TABLE POLICIES
-- These are VERY permissive - tighten later if needed

-- Allow authenticated users to INSERT their own profile
CREATE POLICY "volunteers_insert_authenticated"
ON volunteers
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Very permissive - anyone authenticated can insert

-- Allow authenticated users to SELECT all volunteers
CREATE POLICY "volunteers_select_authenticated"
ON volunteers
FOR SELECT
TO authenticated
USING (true);  -- Anyone authenticated can read all

-- Allow users to UPDATE their own profile
CREATE POLICY "volunteers_update_own"
ON volunteers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own profile (optional)
CREATE POLICY "volunteers_delete_own"
ON volunteers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- OPPORTUNITIES TABLE POLICIES
-- Very permissive for now

CREATE POLICY "opportunities_select_all"
ON opportunities
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "opportunities_insert_all"
ON opportunities
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "opportunities_update_all"
ON opportunities
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "opportunities_delete_all"
ON opportunities
FOR DELETE
TO authenticated
USING (true);

-- SIGNUPS TABLE POLICIES
-- More restrictive - users can only manage their own signups

CREATE POLICY "signups_select_all"
ON signups
FOR SELECT
TO authenticated
USING (true);  -- Can see all signups (needed for calendar)

CREATE POLICY "signups_insert_own"
ON signups
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM volunteers 
    WHERE volunteers.id = signups.volunteer_id 
    AND volunteers.user_id = auth.uid()
  )
);

CREATE POLICY "signups_delete_own"
ON signups
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM volunteers 
    WHERE volunteers.id = signups.volunteer_id 
    AND volunteers.user_id = auth.uid()
  )
);

-- ============================================
-- STEP 6: VERIFICATION
-- ============================================

-- Check RLS is enabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('volunteers', 'opportunities', 'signups')
ORDER BY tablename;

-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('volunteers', 'opportunities', 'signups')
ORDER BY tablename, policyname;

-- Check grants
SELECT 
  table_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name IN ('volunteers', 'opportunities', 'signups')
  AND grantee IN ('authenticated', 'anon')
ORDER BY table_name, grantee;

-- ============================================
-- STEP 7: TEST QUERY
-- ============================================

-- This should work now (run as authenticated user):
-- INSERT INTO volunteers (user_id, first_name, last_name, email, mobile, training_mountain, strengths, skiing_ability, preferred_opportunities, status)
-- VALUES (auth.uid(), 'Test', 'User', 'test@example.com', '1234567890', 'Cypress', ARRAY['First Aid'], 'Intermediate', 'Both', 'pending');

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- RLS Enabled:
--   opportunities | true
--   signups       | true
--   volunteers    | true
--
-- Policies (should show 13 total):
--   volunteers: 4 policies (insert, select, update, delete)
--   opportunities: 4 policies (insert, select, update, delete)
--   signups: 3 policies (select, insert, delete)
--
-- Grants:
--   authenticated: ALL on all tables
--   anon: SELECT, INSERT on volunteers (for signup)
-- ============================================

-- ============================================
-- NOTES:
-- ============================================
-- These policies are VERY PERMISSIVE for development
-- They prioritize "getting it working" over strict security
-- 
-- For production, you may want to:
-- 1. Remove anon grants
-- 2. Tighten INSERT policy to check user_id = auth.uid()
-- 3. Add admin role checks for opportunities management
-- 4. Add rate limiting
--
-- But for now, this should fix your 406 error!
-- ============================================
