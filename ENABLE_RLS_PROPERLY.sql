-- Enable RLS with Working Policies
-- This setup keeps your data secure while allowing registration to work

-- ============================================
-- Step 1: Clean slate - Drop ALL existing policies
-- ============================================

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

-- ============================================
-- Step 2: Enable RLS on all tables
-- ============================================

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 3: Create WORKING policies for VOLUNTEERS table
-- ============================================

-- Policy 1: Allow authenticated users to INSERT their profile during registration
CREATE POLICY "volunteers_insert_policy"
ON volunteers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Policy 2: Allow users to SELECT (read) their own profile
CREATE POLICY "volunteers_select_own_policy"
ON volunteers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Policy 3: Allow authenticated users to SELECT (read) ALL profiles
-- (This is needed so volunteers can see who else signed up for opportunities)
CREATE POLICY "volunteers_select_all_policy"
ON volunteers
FOR SELECT
TO authenticated
USING (true);

-- Policy 4: Allow users to UPDATE their own profile
CREATE POLICY "volunteers_update_policy"
ON volunteers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Step 4: Create policies for OPPORTUNITIES table
-- ============================================

-- Allow all authenticated users to read opportunities
CREATE POLICY "opportunities_select_policy"
ON opportunities
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to create opportunities (admin function)
CREATE POLICY "opportunities_insert_policy"
ON opportunities
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update opportunities (admin function)
CREATE POLICY "opportunities_update_policy"
ON opportunities
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete opportunities (admin function)
CREATE POLICY "opportunities_delete_policy"
ON opportunities
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- Step 5: Create policies for SIGNUPS table
-- ============================================

-- Allow all authenticated users to read signups
CREATE POLICY "signups_select_policy"
ON signups
FOR SELECT
TO authenticated
USING (true);

-- Allow users to create signups for themselves
CREATE POLICY "signups_insert_policy"
ON signups
FOR INSERT
TO authenticated
WITH CHECK (
  volunteer_id IN (
    SELECT id FROM volunteers WHERE user_id = auth.uid()
  )
);

-- Allow users to delete their own signups
CREATE POLICY "signups_delete_policy"
ON signups
FOR DELETE
TO authenticated
USING (
  volunteer_id IN (
    SELECT id FROM volunteers WHERE user_id = auth.uid()
  )
);

-- ============================================
-- Step 6: Verification
-- ============================================

-- Check RLS is enabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('volunteers', 'opportunities', 'signups')
ORDER BY tablename;

-- Check all policies are created
SELECT 
  tablename,
  policyname,
  cmd as "Command"
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('volunteers', 'opportunities', 'signups')
ORDER BY tablename, policyname;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- RLS Enabled table should show:
--   opportunities | true
--   signups       | true
--   volunteers    | true
--
-- Policies should show 13 total policies:
--   volunteers: 4 policies
--   opportunities: 4 policies  
--   signups: 3 policies
-- ============================================
