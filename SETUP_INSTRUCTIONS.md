# Freestyle Vancouver Volunteer App - Setup Instructions

## 🎿 Overview
This is a volunteer management web app for Freestyle Vancouver that allows volunteers (parents/guardians) to sign up for volunteer opportunities on or off the snow.

## 📋 Features
- **Volunteer Registration & Login**: Secure authentication via Supabase
- **Calendar View**: Visual calendar showing all volunteer opportunities
- **Quick Sign-up/Removal**: One-click to sign up or remove yourself from opportunities
- **Admin Panel**: Manage volunteer opportunities and view who's signed up
- **Real-time Updates**: All data synced with Supabase database

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase Database

#### A. Run the Database Schema
1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of `SUPABASE_SCHEMA.sql` 
4. Paste it into the SQL Editor and click "Run"

This will create:
- `volunteers` table (stores volunteer profiles)
- `opportunities` table (stores volunteer opportunities/shifts)
- `signups` table (tracks who signed up for what)
- All necessary indexes and RLS policies

#### B. Verify Your Supabase Credentials
Make sure your `.env` file has the correct Supabase credentials:
```env
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=freestyle2025
```

Your Supabase connection is already configured in `src/lib/supabase.js`:
- URL: `https://hntwqnuabmhvxtxenunt.supabase.co`
- Anon Key: Already included in the code

### 3. Run the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📖 How to Use

### For Volunteers:
1. **Landing Page**: Click "Sign Up" to create an account or "Sign In" if you already have one
2. **Registration**: Fill out your information (name, email, training mountain, skills, etc.)
3. **Dashboard**: After logging in, you'll see a calendar with all volunteer opportunities
4. **Sign Up**: Click "Quick Sign Up" on any opportunity to volunteer
5. **Remove Signup**: If you can no longer make it, click "Remove" to free up the spot

### For Admins:
1. **Access Admin Panel**: Click the "Admin" button in the top navigation
2. **Login**: Use credentials from your `.env` file (default: admin/freestyle2025)
3. **Add Opportunities**: Click "Add Opportunity" to create new volunteer shifts
4. **Edit/Delete**: Click the edit or delete icons on any opportunity
5. **View Signups**: See who's signed up for each opportunity with their contact info

## 🗂 Project Structure
```
volunteer-app/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin login component
│   │   ├── landing/        # Landing page
│   │   ├── login/          # User login
│   │   ├── registration/   # New user registration
│   │   └── volunteer/      # Main volunteer dashboard
│   ├── lib/
│   │   └── supabase.js     # Supabase client & service functions
│   ├── App.jsx             # Main app component with routing
│   └── main.jsx            # App entry point
├── SUPABASE_SCHEMA.sql     # Database schema to run in Supabase
└── .env                    # Environment variables
```

## 🔧 Key Technologies
- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS 4** - Styling
- **Supabase** - Backend (database, authentication)
- **Lucide React** - Icons

## 🔐 Security Notes
- All database operations are protected by Row Level Security (RLS) policies
- Users can only modify their own volunteer profile
- All users can view opportunities and signups (needed for transparency)
- Authentication is handled securely through Supabase Auth

## 📝 Database Schema Overview

### volunteers
Stores volunteer profile information linked to Supabase Auth users
- Connected to auth.users via `user_id`
- Stores: name, email, mobile, training mountain, skills, preferences

### opportunities
Stores volunteer opportunities/shifts
- Fields: date, time, title, description, location, type, max volunteers
- Type: "on-snow" or "off-snow"

### signups
Junction table connecting volunteers to opportunities
- Prevents duplicate signups (unique constraint)
- Automatically deleted when volunteer or opportunity is removed

## 🐛 Troubleshooting

### "Row Level Security" Error
If you get RLS errors, make sure you ran the `SUPABASE_SCHEMA.sql` file completely. The RLS policies must be in place for the app to work.

### Can't Create Volunteer Profile
1. Check that the `volunteers` table exists in Supabase
2. Verify the RLS policies are enabled
3. Make sure you're logged in with a valid Supabase Auth session

### Opportunities Not Loading
1. Verify you're authenticated
2. Check browser console for errors
3. Ensure the `opportunities` table exists and has RLS policies

### Admin Login Not Working
Check your `.env` file has the correct admin credentials:
```env
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=freestyle2025
```

## 🎯 Next Steps / Future Enhancements
- [ ] Email notifications when opportunities are added
- [ ] Volunteer availability calendar
- [ ] Export volunteer lists to CSV
- [ ] Recurring opportunities
- [ ] Volunteer hour tracking
- [ ] Mobile app version

## 📞 Support
For questions or issues, contact: info@freestylevancouver.ski

---

Made with ❤️ for Freestyle Vancouver volunteers
