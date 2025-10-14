-- Disable RLS for Development
-- This will allow all operations without security restrictions
-- WARNING: Only use this for development/testing!

-- Disable RLS on all tables
ALTER TABLE volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities DISABLE ROW LEVEL SECURITY;
ALTER TABLE signups DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('volunteers', 'opportunities', 'signups');

-- Should show rowsecurity = false for all tables
