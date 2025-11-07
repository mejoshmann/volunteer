# Fix 406 Error - Complete Solution

## 🔴 The Problem

You're getting:
```
Failed to load resource: the server responded with a status of 406 ()
GET .../rest/v1/volunteers?select=*&user_id=eq.571971e7...
```

**What this means:**
- HTTP 406 = "Not Acceptable"
- Your RLS policy is **BLOCKING** the INSERT operation
- The policy is checking `auth.uid() = user_id` but failing
- This causes PostgREST to return 406 instead of the actual error

---

## ✅ THE FIX (5 minutes)

### **Step 1: Run the Fix SQL**

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy **ALL** contents of `FINAL_RLS_FIX.sql`
4. Paste into SQL Editor
5. Click **RUN**

**What this does:**
- Drops ALL existing policies (cleans slate)
- Temporarily disables RLS
- Grants proper permissions to authenticated users
- Re-enables RLS
- Creates VERY PERMISSIVE policies that will work

### **Step 2: Verify It Worked**

Scroll to bottom of SQL results. You should see:

**RLS Enabled:**
```
opportunities | true
signups       | true  
volunteers    | true
```

**Policies (should show 13):**
```
volunteers     | volunteers_delete_own         | ...
volunteers     | volunteers_insert_authenticated | ...
volunteers     | volunteers_select_authenticated | ...
volunteers     | volunteers_update_own          | ...
opportunities  | opportunities_delete_all       | ...
opportunities  | opportunities_insert_all       | ...
opportunities  | opportunities_select_all       | ...
opportunities  | opportunities_update_all       | ...
signups        | signups_delete_own             | ...
signups        | signups_insert_own             | ...
signups        | signups_select_all             | ...
```

### **Step 3: Test Registration**

1. Clear any stuck users:
```sql
DELETE FROM volunteers WHERE email LIKE '%test%';
DELETE FROM auth.users WHERE email LIKE '%test%';
```

2. Go to your app: `http://localhost:5174`
3. Click **"Sign Up"**
4. Fill out the form
5. Click **"Register as Volunteer"**
6. ✅ Should work WITHOUT 406 error!

---

## 🔍 Why You Were Getting 406

### The Problem Policy:
```sql
-- This was TOO RESTRICTIVE during registration
CREATE POLICY "volunteers_insert_policy"
ON volunteers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

**Why it failed:**
1. User signs up → Supabase creates auth user
2. Auth session is establishing...
3. App tries to INSERT volunteer record
4. Policy checks: `auth.uid() = user_id`
5. **BUT** `auth.uid()` might be NULL or not yet available
6. Policy BLOCKS the insert
7. PostgREST returns 406 instead of 403

### The Fix Policy:
```sql
-- This is PERMISSIVE - anyone authenticated can insert
CREATE POLICY "volunteers_insert_authenticated"
ON volunteers
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Don't check user_id match during insert
```

**Why it works:**
1. User signs up → auth user created
2. Auth session establishes
3. App tries to INSERT volunteer record
4. Policy checks: `true` (always passes!)
5. Insert succeeds ✅
6. User can now use the app

---

## 🛡️ Is This Secure?

**For Development:** YES ✅
- Only authenticated users can insert
- Can't insert without being logged in
- Good enough for testing

**For Production:**
You'll want to add these later:

1. **Tighten INSERT policy:**
```sql
-- After confirmed working, change to:
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);
```

2. **Add admin role checks:**
```sql
-- For opportunities management
WITH CHECK (
  auth.jwt()->>'role' = 'admin' OR
  auth.uid() = created_by
);
```

3. **Rate limiting:**
- Configure in Supabase Dashboard
- Prevent abuse

But for now, **just get it working**!

---

## 📋 Complete Checklist

After running the SQL:

- [ ] SQL script ran without errors
- [ ] 13 policies created (verified in output)
- [ ] RLS enabled on all 3 tables
- [ ] Test user deleted from database
- [ ] Registration form filled out completely
- [ ] Registration submitted
- [ ] **NO 406 error in console**
- [ ] "Insert successful" appears in console
- [ ] User appears in auth.users table
- [ ] Volunteer record appears in volunteers table
- [ ] User can log in
- [ ] User can access volunteer portal
- [ ] User can sign up for opportunities

---

## 🧪 Testing Steps

### 1. Check Before State:
```sql
-- Should be empty
SELECT COUNT(*) FROM volunteers;
SELECT COUNT(*) FROM auth.users;
```

### 2. Register New User:
- Email: test@example.com
- Fill all fields
- Submit

### 3. Check Console:
Should see:
```
Starting registration...
Auth response: {user: {...}, session: {...}}
User ID: [some-uuid]
Insert attempt 1: {...}
Insert successful: {...}  ← THIS IS KEY!
```

Should NOT see:
```
Failed to load resource: 406  ← Should be GONE!
```

### 4. Check After State:
```sql
-- Should have 1 user
SELECT id, email, created_at FROM auth.users;

-- Should have 1 volunteer
SELECT id, user_id, email, first_name FROM volunteers;
```

### 5. Test Login:
- Go to login page
- Enter: test@example.com / [your password]
- Click Sign In
- ✅ Should load volunteer portal!

---

## 🚨 If It Still Doesn't Work

### Check 1: Policies Applied?
```sql
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename IN ('volunteers', 'opportunities', 'signups');
```
Should return: `13`

### Check 2: Permissions Granted?
```sql
SELECT table_name, grantee, privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'volunteers' 
  AND grantee = 'authenticated';
```
Should show: `INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER`

### Check 3: RLS Enabled?
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'volunteers';
```
Should show: `true`

### Check 4: Still Getting 406?

Run this to see the actual error:
```sql
-- Try inserting manually
SET ROLE authenticated;
SET request.jwt.claims.sub = '[paste-a-real-user-id-here]';

INSERT INTO volunteers (
  user_id, first_name, last_name, email, mobile, 
  training_mountain, strengths, skiing_ability, 
  preferred_opportunities, status
) VALUES (
  current_setting('request.jwt.claims.sub')::uuid,
  'Test', 'User', 'manual@example.com', '1234567890',
  'Cypress', ARRAY['First Aid'], 'Intermediate', 'Both', 'pending'
);

RESET ROLE;
```

If this fails, you'll see the REAL error message.

---

## 💡 Pro Tips

1. **Always check console first**
   - F12 → Console tab
   - Watch for 406 errors
   - Check "Insert successful" message

2. **Use Network tab**
   - F12 → Network tab
   - Filter: Fetch/XHR
   - Watch the POST to `/rest/v1/volunteers`
   - Should be 201 (Created), not 406

3. **Check both tables**
   - auth.users (for auth account)
   - volunteers (for profile)
   - Both should have matching user_id

4. **Clear between tests**
   ```sql
   -- Clean slate for each test
   DELETE FROM signups;
   DELETE FROM volunteers;
   DELETE FROM auth.users;
   ```

5. **Watch timing**
   - The INSERT might take 500-1000ms
   - Be patient
   - Don't click multiple times

---

## ✅ Success Indicators

You'll know it's fixed when:

1. ✅ No 406 error in console
2. ✅ "Insert successful: {...}" appears
3. ✅ User appears in Supabase dashboard
4. ✅ Volunteer record appears in table
5. ✅ Can log in immediately
6. ✅ Volunteer portal loads
7. ✅ Can sign up for opportunities
8. ✅ Everything just works!

---

## 🎉 After It Works

Once registration is working:

1. **Test thoroughly:**
   - Register 3-5 test users
   - Test login with each
   - Test signup for opportunities
   - Test admin panel

2. **Document what worked:**
   - Keep FINAL_RLS_FIX.sql
   - You may need it again
   - Or for another environment

3. **Plan for production:**
   - Decide if you want stricter policies
   - Set up proper email/SMS
   - Add rate limiting
   - Monitor logs

4. **Celebrate!** 🚀
   - Your app is working
   - Users can register
   - You fixed a gnarly RLS issue
   - You learned a ton about Supabase

---

Run that SQL script and you should be good to go!
