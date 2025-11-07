-- ============================================
-- COMPLETE RLS POLICY FIX
-- This fixes BOTH insert AND select issues
-- ============================================

-- STEP 1: Drop ALL existing policies on all tables
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  -- Drop volunteers policies
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'volunteers'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON volunteers';
    RAISE NOTICE 'Dropped volunteers policy: %', r.policyname;
  END LOOP;
  
  -- Drop opportunities policies
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'opportunities'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON opportunities';
    RAISE NOTICE 'Dropped opportunities policy: %', r.policyname;
  END LOOP;
  
  -- Drop signups policies
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'signups'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON signups';
    RAISE NOTICE 'Dropped signups policy: %', r.policyname;
  END LOOP;
END $$;

-- STEP 2: Ensure RLS is enabled
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create single permissive policy for each table
-- These are DEVELOPMENT policies - very permissive to get it working

-- VOLUNTEERS: Allow all operations for authenticated users
CREATE POLICY "volunteers_all_authenticated"
ON volunteers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- OPPORTUNITIES: Allow all operations for authenticated users
CREATE POLICY "opportunities_all_authenticated"
ON opportunities
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- SIGNUPS: Allow all operations for authenticated users
CREATE POLICY "signups_all_authenticated"
ON signups
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- STEP 4: Verify policies created
SELECT 
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename IN ('volunteers', 'opportunities', 'signups')
ORDER BY tablename, policyname;

-- STEP 5: Verify RLS enabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('volunteers', 'opportunities', 'signups')
ORDER BY tablename;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- Should show 3 policies (one per table):
--   opportunities | opportunities_all_authenticated | ALL | {authenticated}
--   signups       | signups_all_authenticated       | ALL | {authenticated}
--   volunteers    | volunteers_all_authenticated    | ALL | {authenticated}
--
-- RLS should be enabled:
--   opportunities | true
--   signups       | true
--   volunteers    | true
-- ============================================

-- ============================================
-- NOTES:
-- ============================================
-- These policies are VERY permissive:
-- - Any authenticated user can INSERT, SELECT, UPDATE, DELETE
-- - No user_id checks
-- - No role checks
-- 
-- This is intentional for development to get registration working.
--
-- For production, you can tighten these later, but start with
-- these simple ones to ensure the app works first.
-- ============================================
