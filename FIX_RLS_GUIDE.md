# RLS Policy Fix Guide

## Problem
The application is experiencing RLS (Row Level Security) errors:
```
401 Unauthorized
"new row violates row-level security policy for table 'volunteers'"
```

## Root Cause
The RLS policies are not properly configured to allow authenticated users to insert their own volunteer profiles during registration.

## Solution

### Step 1: Apply Fixed RLS Policies

Run the following SQL in your Supabase SQL Editor:

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

### Step 2: Update Registration Flow

The registration flow has been updated to properly handle the authentication timing:

1. User signs up with Supabase Auth
2. If email confirmation is required, user is notified to check their email
3. After email confirmation, user can sign in
4. On successful sign in, volunteer profile is created

### Step 3: Verify Policies

Run this query in your Supabase SQL Editor to verify policies are applied:

```sql
SELECT 
  tablename,
  policyname,
  cmd as "Command"
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('volunteers', 'opportunities', 'signups')
ORDER BY tablename, policyname;
```

You should see 11 policies total:
- volunteers: 4 policies
- opportunities: 4 policies  
- signups: 3 policies

## Testing

1. Try to register a new user
2. Check that no RLS errors occur
3. Verify that the volunteer profile is created after sign in
4. Test that users can only access their own data

## Common Issues and Solutions

### Issue: "new row violates row-level security policy"
**Solution**: Ensure the `auth.uid() = user_id` check in the INSERT policy matches the user ID being inserted.

### Issue: 401 Unauthorized
**Solution**: Verify that the user is properly authenticated before attempting database operations.

### Issue: Policies not applying
**Solution**: Make sure RLS is enabled on all tables with `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`