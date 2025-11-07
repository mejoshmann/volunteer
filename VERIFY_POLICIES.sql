-- ============================================
-- VERIFY RLS POLICIES ARE CORRECT
-- ============================================

-- 1. Check if RLS is enabled
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('volunteers', 'opportunities', 'signups')
ORDER BY tablename;

-- 2. List all current policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('volunteers', 'opportunities', 'signups')
ORDER BY tablename, policyname;

-- 3. Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('volunteers', 'opportunities', 'signups')
GROUP BY tablename
ORDER BY tablename;
