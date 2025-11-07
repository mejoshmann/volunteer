-- ============================================
-- CLEAN UP DUPLICATE POLICIES AND FIX
-- ============================================
-- You have 8 policies when you should have 4
-- This will remove ALL and create clean ones
-- ============================================

-- STEP 1: See what policies exist now
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'volunteers'
ORDER BY policyname;

-- STEP 2: Drop ALL policies on volunteers (force clean)
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'volunteers'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON volunteers';
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- STEP 3: Verify all dropped
SELECT COUNT(*) as remaining_policies 
FROM pg_policies 
WHERE tablename = 'volunteers';
-- Should return 0

-- STEP 4: Create ONE simple, permissive policy for ALL operations
CREATE POLICY "volunteers_authenticated_all"
ON volunteers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- STEP 5: Verify new policy created
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'volunteers';
-- Should show 1 policy: volunteers_authenticated_all

-- STEP 6: Test it works
-- This should succeed (you can uncomment and test):
-- INSERT INTO volunteers (user_id, first_name, last_name, email, mobile, training_mountain, strengths, skiing_ability, preferred_opportunities, status)
-- VALUES (gen_random_uuid(), 'Test', 'User', 'test@example.com', '1234567890', 'Cypress', ARRAY['First Aid'], 'Intermediate', 'Both', 'pending');

-- ============================================
-- EXPECTED OUTPUT:
-- ============================================
-- Step 1: Shows 8 policies (the problem)
-- Step 2: Drops all 8 policies with NOTICE messages
-- Step 3: Returns 0 (all cleared)
-- Step 4: Creates 1 new policy
-- Step 5: Shows 1 policy named "volunteers_authenticated_all"
-- ============================================
