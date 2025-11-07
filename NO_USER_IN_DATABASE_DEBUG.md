# No User Saved in Supabase - Debug Guide

## 🔍 Problem Analysis

You're seeing "Insert successful" in the console, but when you check Supabase:
- ❌ No user in **Authentication** → **Users**
- ❌ No record in **volunteers** table

This can happen for several reasons:

---

## 🚨 Most Likely Causes:

### 1. **Auto-Delete Unconfirmed Users (Most Common)**

Supabase has a setting that auto-deletes unconfirmed users after a short period.

**Check:**
1. Go to Supabase Dashboard
2. **Authentication** → **Settings**
3. Look for **"Auto Delete Unconfirmed Users"**
4. Is it enabled? What's the timeframe?

**Fix:**
- **Disable** this setting during development
- Or set it to a longer timeframe (e.g., 24 hours)

---

### 2. **Email Confirmation Still Partially Enabled**

Even though you turned email confirmation "off", there might be cached settings or triggers.

**Double-Check:**
1. Dashboard → **Authentication** → **Providers** → **Email**
2. Scroll down to **"Confirm email"**
3. Make sure it's **OFF**
4. Click **Save** again
5. **Hard refresh** your browser (Cmd+Shift+R / Ctrl+Shift+R)

---

### 3. **Database Trigger Deleting Records**

There might be a database trigger or function deleting new records.

**Check:**
```sql
-- Run in Supabase SQL Editor
-- Check for triggers on auth.users
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth';

-- Check for triggers on volunteers
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
  AND event_object_table = 'volunteers';
```

---

### 4. **RLS Policy Blocking Reads**

The user IS created, but RLS policies prevent you from seeing it.

**Check:**
```sql
-- Run as service_role (use Supabase dashboard SQL editor)
SET ROLE service_role;

-- Check auth.users
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check volunteers
SELECT id, user_id, email, first_name, last_name, created_at
FROM volunteers
ORDER BY created_at DESC
LIMIT 5;

-- Reset role
RESET ROLE;
```

---

### 5. **Session/Transaction Rollback**

The insert succeeded temporarily but was rolled back.

**Check Console for:**
- Any errors after "Insert successful"
- Network tab showing failed requests
- Auth state changes that might trigger rollback

---

## ✅ IMMEDIATE DEBUGGING STEPS:

### Step 1: Watch in Real-Time

1. **Open two browser tabs:**
   - Tab 1: Your app
   - Tab 2: Supabase Dashboard → **Authentication** → **Users**

2. **Keep refreshing Supabase while registering:**
   - Start registration in Tab 1
   - Quickly refresh Tab 2 every few seconds
   - See if user appears then disappears

### Step 2: Check Supabase Logs

1. Dashboard → **Logs** → **Auth Logs**
2. Look for events around the time you registered:
   - `signup` event
   - `user_deleted` event (this would confirm auto-delete)
3. Check timestamps

### Step 3: Verify Email Confirmation Setting

**Run this SQL to check the current config:**
```sql
-- This checks if email confirmation is required
SHOW app.settings.auth.enable_signup;
```

### Step 4: Try Registration with Console Open

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **Fetch/XHR**
4. Clear the log
5. Do a registration
6. Watch for:
   - POST to `/auth/v1/signup` - should return 200
   - POST to `/rest/v1/volunteers` - should return 201
   - Any DELETE requests (red flag!)

---

## 🔧 FIXES TO TRY:

### Fix 1: Disable Auto-Delete (Recommended)

1. Dashboard → **Authentication** → **Settings**
2. Find **"Auto Delete Unconfirmed Users"**
3. **Disable** it or set to 7 days
4. Click **Save**

### Fix 2: Force Email Confirmation OFF

Run this SQL in Supabase:
```sql
-- Make absolutely sure email confirmation is disabled
UPDATE auth.config 
SET value = 'false' 
WHERE name = 'MAILER_AUTOCONFIRM';
```

### Fix 3: Check and Fix RLS Policies

```sql
-- Ensure service_role can see everything
GRANT ALL ON auth.users TO service_role;
GRANT ALL ON public.volunteers TO service_role;

-- Re-run your RLS fix
-- Copy and paste COMPLETE_RLS_FIX.sql content here
```

### Fix 4: Create User Manually (Test)

```sql
-- Create a test user directly
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '',
  NOW(),
  NOW()
);

-- Get the user_id
SELECT id, email FROM auth.users WHERE email = 'test@example.com';

-- Insert volunteer record with that user_id
INSERT INTO volunteers (
  user_id,
  first_name,
  last_name,
  email,
  mobile,
  training_mountain,
  strengths,
  skiing_ability,
  preferred_opportunities,
  status
) VALUES (
  '[paste user_id from above]',
  'Test',
  'User',
  'test@example.com',
  '1234567890',
  'Cypress',
  ARRAY['First Aid'],
  'Intermediate',
  'Both',
  'pending'
);
```

Then try logging in with: test@example.com / password123

---

## 📊 Diagnostic SQL Queries:

### Check Recent Auth Events
```sql
SELECT 
  created_at,
  event_type,
  email,
  user_id,
  ip_address
FROM auth.audit_log_entries
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 20;
```

### Count Users
```sql
-- Total users in auth
SELECT COUNT(*) as total_users FROM auth.users;

-- Confirmed vs unconfirmed
SELECT 
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'Unconfirmed'
    ELSE 'Confirmed'
  END as status,
  COUNT(*) as count
FROM auth.users
GROUP BY status;
```

### Check Volunteers Table
```sql
SELECT COUNT(*) as total_volunteers FROM volunteers;

SELECT * FROM volunteers ORDER BY created_at DESC LIMIT 5;
```

---

## 🎯 Expected Behavior:

After registration with email confirmation OFF:

1. **auth.users table:**
   - ✅ User record created
   - ✅ `email_confirmed_at` is NOT NULL (or NULL but user is active)
   - ✅ User stays in database

2. **volunteers table:**
   - ✅ Volunteer record created
   - ✅ `user_id` matches auth.users.id
   - ✅ Record stays in database

3. **User can:**
   - ✅ Log in immediately
   - ✅ Access volunteer portal
   - ✅ Sign up for opportunities

---

## 🧪 Test Procedure:

### Clean Test:

1. **Clear everything:**
```sql
DELETE FROM signups;
DELETE FROM volunteers;
DELETE FROM auth.users;
```

2. **Verify email confirmation is OFF:**
   - Dashboard → Auth → Providers → Email
   - Confirm email: **OFF**

3. **Register new user:**
   - Use email: test-$(date +%s)@example.com
   - Fill all fields
   - Submit

4. **IMMEDIATELY check:**
```sql
-- Run this right after registration
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email LIKE 'test-%@example.com'
ORDER BY created_at DESC;
```

5. **Wait 30 seconds, check again:**
```sql
-- Did user disappear?
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email LIKE 'test-%@example.com'
ORDER BY created_at DESC;
```

6. **If user disappeared:**
   - Check auth logs for delete event
   - Check auto-delete setting
   - Check for triggers

7. **If user stayed but volunteers record missing:**
   - RLS issue
   - Run COMPLETE_RLS_FIX.sql
   - Try again

---

## 💡 Quick Wins:

### Option 1: Use Supabase Studio to Register

1. Dashboard → **Table Editor** → **auth.users**
2. Click **Insert** → **Insert row**
3. Fill in:
   - email: test@example.com
   - Set `email_confirmed_at` to NOW()
   - Set password using dashboard UI

Then manually insert volunteers record.

### Option 2: Use Supabase CLI

```bash
# Install if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref [your-project-ref]

# Create user via CLI
supabase db remote commit
```

---

## 🆘 If Nothing Works:

### Nuclear Option - Reset Auth:

**⚠️ WARNING: This deletes ALL users**

```sql
-- Backup first!
CREATE TABLE volunteers_backup AS SELECT * FROM volunteers;
CREATE TABLE users_backup AS SELECT * FROM auth.users;

-- Delete everything
DELETE FROM signups;
DELETE FROM volunteers;
DELETE FROM auth.users;

-- Verify RLS policies
-- Run COMPLETE_RLS_FIX.sql

-- Try registration again
```

---

## 📞 Get Help:

If you're still stuck:

1. **Check exact Supabase logs:**
   - Dashboard → Logs → Auth
   - Take screenshot
   - Look for error codes

2. **Supabase Discord:**
   - https://discord.supabase.com
   - Post in #help channel
   - Include: project ref, error logs, RLS policies

3. **Check Supabase Status:**
   - https://status.supabase.com
   - Service might be down

---

## ✅ Success Checklist:

After you fix the issue:

- [ ] Email confirmation is OFF
- [ ] Auto-delete unconfirmed users is OFF (or disabled)
- [ ] RLS policies are correct (COMPLETE_RLS_FIX.sql)
- [ ] User appears in auth.users after registration
- [ ] User STAYS in auth.users (doesn't disappear)
- [ ] Volunteer record appears in volunteers table
- [ ] User can log in
- [ ] No errors in console
- [ ] No errors in Supabase logs

---

Start with Step 1 (watch in real-time) and Step 2 (check logs). That will tell you exactly what's happening! 🔍
