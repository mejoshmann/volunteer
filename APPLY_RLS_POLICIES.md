# How to Apply RLS Policies

Since we can't directly execute SQL from the command line, follow these steps to apply the fixed RLS policies:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the following SQL code into the editor
4. Click "Run" to execute

```sql
-- ============================================
-- FIXED RLS POLICIES FOR VOLUNTEER APP
-- ============================================

-- Clean up existing policies
DROP POLICY IF EXISTS "volunteers_insert_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_select_own_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_select_all_policy" ON volunteers;
DROP POLICY IF EXISTS "volunteers_update_policy" ON volunteers;

DROP POLICY IF EXISTS "opportunities_select_policy" ON opportunities;
DROP POLICY IF EXISTS "opportunities_insert_policy" ON opportunities;
DROP POLICY IF EXISTS "opportunities_update_policy" ON opportunities;
DROP POLICY IF EXISTS "opportunities_delete_policy" ON opportunities;

DROP POLICY IF EXISTS "signups_select_policy" ON signups;
DROP POLICY IF EXISTS "signups_insert_policy" ON signups;
DROP POLICY IF EXISTS "signups_delete_policy" ON signups;

-- Ensure RLS is enabled
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE signups ENABLE ROW LEVEL SECURITY;

-- VOLUNTEERS TABLE POLICIES
-- Allow authenticated users to INSERT their profile during registration
CREATE POLICY "volunteers_insert_policy"
ON volunteers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- Allow users to SELECT (read) their own profile
CREATE POLICY "volunteers_select_own_policy"
ON volunteers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Allow authenticated users to SELECT (read) ALL profiles
CREATE POLICY "volunteers_select_all_policy"
ON volunteers
FOR SELECT
TO authenticated
USING (true);

-- Allow users to UPDATE their own profile
CREATE POLICY "volunteers_update_policy"
ON volunteers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- OPPORTUNITIES TABLE POLICIES
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

-- SIGNUPS TABLE POLICIES
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
  EXISTS (
    SELECT 1 FROM volunteers WHERE user_id = auth.uid() AND id = volunteer_id
  )
);

-- Allow users to delete their own signups
CREATE POLICY "signups_delete_policy"
ON signups
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM volunteers WHERE user_id = auth.uid() AND id = volunteer_id
  )
);

-- Grant necessary permissions
GRANT ALL ON TABLE volunteers TO authenticated;
GRANT ALL ON TABLE opportunities TO authenticated;
GRANT ALL ON TABLE signups TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

After running this SQL, your RLS policies should be properly configured to allow:
1. Users to register and create their volunteer profiles
2. Users to read their own profiles
3. Admins to read all profiles
4. Users to sign up for opportunities
5. Users to manage their own signups