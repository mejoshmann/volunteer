# 🔧 Fix RLS Policy Error - "new row violates row-level security policy"

## Problem

Registration is failing with the error:
```
new row violates row-level security policy for table "volunteers"
```

This means the Row Level Security (RLS) policies aren't allowing the newly registered user to insert their volunteer profile.

## ✅ Quick Fix

### Step 1: Run the Fix Script

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Run the Fix Script**
   - Open the file `FIX_RLS_POLICIES.sql` in this project
   - Copy ALL the contents
   - Paste into Supabase SQL Editor
   - Click "Run" (or Ctrl+Enter)

4. **Verify Success**
   - You should see "Success. No rows returned"
   - Check the policies are created (query at bottom of script)

### Step 2: Test Registration

1. Go back to your app
2. Try registering a new volunteer
3. Should work now! ✓

## 🔍 What the Fix Does

The script:
1. **Drops** any conflicting old policies
2. **Creates** 4 new policies that work together:
   - ✅ Allow users to INSERT their own profile (during registration)
   - ✅ Allow users to READ their own profile
   - ✅ Allow ALL authenticated users to read all profiles (for admin/signup views)
   - ✅ Allow users to UPDATE their own profile

## 🎯 Understanding RLS Policies

### What RLS Does:
Row Level Security controls WHO can access WHICH rows in your database.

### The Policies We Need:

**For Registration:**
```sql
-- User signs up → Creates volunteer profile
INSERT policy: Allow if auth.uid() = user_id
```

**For Viewing Own Profile:**
```sql
-- User sees their own info in sidebar
SELECT policy: Allow if auth.uid() = user_id
```

**For Admin/Signup Views:**
```sql
-- See who else signed up for opportunities
SELECT policy: Allow for all authenticated users
```

**For Profile Updates:**
```sql
-- User edits their info
UPDATE policy: Allow if auth.uid() = user_id
```

## 🐛 Why This Error Happens

Common causes:
1. **No INSERT policy** - Users can't create their profile
2. **Wrong policy condition** - Policy checks wrong user_id
3. **Conflicting policies** - Multiple policies fighting each other
4. **RLS not enabled** - Policies not active

Our fix addresses all of these!

## 🔐 Security Benefits

These policies ensure:
- ✅ Users can only create ONE profile (their own)
- ✅ Users can only edit THEIR OWN profile
- ✅ Users can see others (for admin/community features)
- ✅ Anonymous users can't access anything

## 🧪 Testing the Fix

### Test 1: Registration
```
1. Go to app
2. Click "Sign Up"
3. Fill form completely
4. Submit
5. Should see success message ✓
```

### Test 2: Login
```
1. Click "Sign in here"
2. Enter credentials
3. Should see volunteer dashboard ✓
```

### Test 3: Profile Display
```
1. After login, check sidebar
2. Should see "Welcome, [Your Name]!" ✓
3. Should see training mountain ✓
```

### Test 4: Sign Up for Opportunity
```
1. Add an opportunity (as admin)
2. Sign up for it
3. Should work without RLS errors ✓
```

## 📊 Verify Policies in Supabase

**Check RLS is Enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'volunteers';
```
Should show `rowsecurity = true`

**Check Policies Exist:**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'volunteers';
```
Should show:
- Enable insert for authenticated users (INSERT)
- Enable read for own profile (SELECT)
- Enable read for all authenticated users (SELECT)
- Enable update for own profile (UPDATE)

## 🚨 If Still Having Issues

### Issue: "Anonymous users can't access"
**Solution:** User must be logged in. RLS policies require authentication.

### Issue: "Still getting RLS error"
**Solution:** 
1. Check you ran the ENTIRE fix script
2. Verify policies in Supabase Dashboard → Authentication → Policies
3. Try dropping ALL policies and running fix script again

### Issue: "User can't see their profile"
**Solution:**
```sql
-- Check if profile exists
SELECT * FROM volunteers WHERE email = 'user@example.com';
```

### Issue: "Can't see other volunteers"
**Solution:** This is intentional for privacy. The SELECT policy allows it only when authenticated.

## 🔄 Alternative: Temporary Disable RLS (Development Only)

**Warning: ONLY for development/testing!**

```sql
-- Disable RLS on volunteers table
ALTER TABLE volunteers DISABLE ROW LEVEL SECURITY;

-- To re-enable later:
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
```

**DON'T do this in production!** Your data will be unprotected.

## 📋 Policy Best Practices

✅ **DO:**
- Use RLS for all tables with user data
- Test policies thoroughly
- Keep policies simple and clear
- Document what each policy does

❌ **DON'T:**
- Disable RLS in production
- Create conflicting policies
- Allow access to other users' data
- Use complex policy logic (hard to debug)

## 🎓 Learning Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

## ✅ Success Checklist

After running the fix:
- [ ] Script ran without errors
- [ ] 4 policies visible in Supabase
- [ ] Registration works
- [ ] Login works
- [ ] Profile displays in sidebar
- [ ] Can sign up for opportunities

---

**Once you run the fix script, registration should work perfectly!** 🎉
