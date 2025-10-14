# Debug Guide: "Failed to Add Opportunity" Error

## 🔍 Step-by-Step Debugging

Follow these steps EXACTLY and tell me what you see:

### Step 1: Open Browser Console
1. Press **F12** on your keyboard (or right-click → Inspect)
2. Click the **Console** tab
3. Keep it open

### Step 2: Try to Add an Opportunity
1. Make sure you're **logged in as a volunteer first**
   - If not logged in, go to landing page and create/login to a volunteer account
   
2. Click **"Admin"** button in the top right

3. Enter admin credentials:
   - Username: `admin`
   - Password: `freestyle2025`
   
4. Click **"Add Opportunity"** button

5. Fill in ALL fields:
   - **Date**: Pick any future date (e.g., tomorrow)
   - **Time**: e.g., `09:00`
   - **Title**: `Test Opportunity`
   - **Description**: `Testing`
   - **Location**: Select `Cypress` or `Grouse`
   - **Type**: Select `on-snow` or `off-snow`
   - **Max Volunteers**: `5`

6. Click **"Add"** button

### Step 3: Check Console Output

Look in the browser console for messages. You should see:

```
Form submit clicked
Form data: { ... }
All validations passed, calling onSubmit
Creating opportunity with data: { ... }
Current user: { ... }
```

**COPY AND PASTE the entire console output here, especially:**
- Any red error messages
- The "Supabase error:" message
- The "Error code:" message

### Step 4: Common Issues & Solutions

| What You See in Console | Problem | Solution |
|-------------------------|---------|----------|
| `Current user: null` | Not authenticated | Make sure you're logged into a volunteer account first |
| `relation "opportunities" does not exist` | Table not created | Run SUPABASE_SCHEMA.sql again |
| `new row violates row-level security` | RLS policy issue | Make sure you ran the ENTIRE SQL schema including RLS policies |
| `permission denied for table` | Authentication issue | You need to be logged in as a volunteer user |
| `null value in column "..."` | Missing data | Make sure all form fields are filled |

### Step 5: Verify Database Setup

If you still see errors, open the file `verify-database.html` in your browser:

1. Open: `verify-database.html`
2. Click "Run Database Check"
3. Take a screenshot of the results
4. Share it with me

### Step 6: Check Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Click on your project
3. Go to **Table Editor**
4. Click on **opportunities** table
5. Do you see the table? (YES/NO)
6. Try manually adding a row:
   - Click "Insert row"
   - Fill in the fields
   - Click "Save"
   - Does it work? (YES/NO)

## 📋 Information I Need From You

Please provide:

1. **Console output** when you try to add an opportunity
2. **Error message** from the alert dialog
3. **Do you see the opportunities table** in Supabase Table Editor?
4. **Can you manually add a row** in Supabase Table Editor?

This will help me identify the exact issue!
