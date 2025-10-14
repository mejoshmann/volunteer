# ✅ Database Setup Checklist

Before using the app, you MUST set up your Supabase database. Follow these steps:

## Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: **hntwqnuabmhvxtxenunt**
3. Click on **SQL Editor** in the left sidebar

## Step 2: Run the Schema
1. Click **New Query** button
2. Open the file `SUPABASE_SCHEMA.sql` in this project
3. Copy ALL the contents (Ctrl+A, Ctrl+C)
4. Paste into the Supabase SQL Editor
5. Click **Run** (or press Ctrl+Enter)

## Step 3: Verify Tables Created
After running the SQL, go to **Table Editor** and verify you see:
- ✅ `volunteers` table
- ✅ `opportunities` table  
- ✅ `signups` table

## Step 4: Test the App
1. Run `npm run dev` in your terminal
2. Open http://localhost:5174 (or whatever port Vite uses)
3. Click "Sign Up" on the landing page
4. Create a test account
5. Verify you can see the volunteer dashboard

## Common Issues

### ❌ "relation 'volunteers' does not exist"
**Solution**: You haven't run the SQL schema yet. Go back to Step 2.

### ❌ "new row violates row-level security policy"
**Solution**: The RLS policies weren't created. Make sure you ran the ENTIRE SQL file, including the RLS sections.

### ❌ Can't see the volunteer dashboard after login
**Solution**: 
1. Check browser console for errors
2. Make sure you're logged in (check Supabase Auth in dashboard)
3. Verify the `volunteers` table has your profile

## Quick SQL Verification Query
Run this in Supabase SQL Editor to check if everything is set up:
```sql
-- This should return table info without errors
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('volunteers', 'opportunities', 'signups');
```

You should see 3 rows returned.

## Need Help?
- Check `SETUP_INSTRUCTIONS.md` for detailed setup guide
- Check Supabase logs in Dashboard > Logs
- Open browser DevTools Console (F12) to see JavaScript errors
