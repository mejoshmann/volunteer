-- Fix RLS Policies for Volunteer Registration
-- Run this in Supabase SQL Editor to fix the "new row violates row-level security policy" error

-- ============================================
-- 1. DROP EXISTING POLICIES (Clean Slate)
-- ============================================

-- Drop all existing policies for volunteers table
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

-- ============================================
-- 2. CREATE CORRECT POLICIES
-- ============================================

-- Policy 1: Allow users to insert their own volunteer profile during registration
CREATE POLICY "Enable insert for authenticated users"
  ON volunteers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Allow users to read their own profile
CREATE POLICY "Enable read for own profile"
  ON volunteers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 3: Allow users to read ALL volunteer profiles (needed for admin view and seeing who's signed up)
CREATE POLICY "Enable read for all authenticated users"
  ON volunteers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 4: Allow users to update their own profile
CREATE POLICY "Enable update for own profile"
  ON volunteers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'volunteers';
-- Should show: rowsecurity = true

-- Check policies are created
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'volunteers';
-- Should show all 4 policies above

-- ============================================
-- TEST QUERY (Optional)
-- ============================================

-- You can test with this query (replace with a real user_id after signup):
-- SELECT * FROM volunteers WHERE user_id = 'your-user-id-here';
