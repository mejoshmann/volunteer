-- Fix RLS Policies for Registration
-- This fixes the issue where new users can't register when RLS is enabled

-- ============================================
-- PROBLEM: 
-- When a new user signs up, the auth.uid() might not be immediately 
-- available in the same transaction, causing INSERT to fail.
-- ============================================

-- ============================================
-- SOLUTION:
-- Use a more permissive INSERT policy that allows any authenticated
-- user to insert a volunteer record that matches their user_id
-- ============================================

-- Step 1: Drop the restrictive insert policy
DROP POLICY IF EXISTS "volunteers_insert_policy" ON volunteers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON volunteers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON volunteers;
DROP POLICY IF EXISTS "Users can insert own volunteer profile" ON volunteers;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON volunteers;

-- Step 2: Create a new INSERT policy that works during registration
-- This policy allows authenticated users to insert IF the user_id matches their auth.uid()
CREATE POLICY "volunteers_insert_during_registration"
ON volunteers
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow insert if user_id matches the authenticated user's ID
  auth.uid() = user_id
);

-- Step 3: Verify the policy was created
SELECT 
  policyname, 
  cmd as command,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'volunteers' 
  AND cmd = 'INSERT';

-- ============================================
-- IMPORTANT: Also check Supabase Auth settings
-- ============================================
-- 1. Go to: Authentication > Providers > Email
-- 2. If "Confirm email" is enabled:
--    - Users will receive confirmation email
--    - User won't be fully authenticated until they click the link
--    - This causes RLS issues during registration
-- 
-- RECOMMENDATION FOR DEVELOPMENT:
-- - Disable "Confirm email" in Auth settings
-- - This allows immediate registration without email confirmation
-- - Re-enable for production
-- ============================================

-- ============================================
-- ALTERNATIVE: If you MUST keep email confirmation enabled
-- ============================================
-- You'll need to modify your registration flow:
-- 1. Sign up the user
-- 2. Tell them to check email
-- 3. After they confirm email and log in, THEN create volunteer profile
-- 
-- This requires changes to your Registration.jsx component
-- ============================================
