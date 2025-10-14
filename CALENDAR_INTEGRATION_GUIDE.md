# 📅 Calendar Integration Guide

## Overview

Volunteers can now add their shifts directly to their phone/computer calendars! This means they'll get automatic reminders and see their commitments alongside their other events.

## ✨ Features

### 1. **Add Individual Shifts to Calendar**

Each shift in the "My Shifts" section now has an **"Add to Calendar"** button with a dropdown menu offering three options:

- **📅 Google Calendar** - Opens in Google Calendar (web/app)
- **🍎 Apple Calendar** - Downloads .ics file for iPhone/iPad/Mac
- **📧 Outlook Calendar** - Opens in Outlook Calendar (web/app)

### 2. **Download All Shifts at Once**

At the top of the "My Shifts" section, there's a **"Download All"** button that creates a single calendar file (.ics) containing ALL upcoming volunteer shifts.

This file can be imported into:
- iPhone/iPad Calendar
- Google Calendar
- Outlook Calendar
- Any calendar app that supports .ics files

## 🎯 How Volunteers Use It

### For Individual Shifts:

1. **After signing up** for an opportunity, it appears in "My Shifts"
2. **Click "Add to Calendar"** on the shift
3. **Choose calendar type:**
   - **Google Calendar** - Opens in new tab, click "Save" to add
   - **Apple Calendar** - Downloads file, tap to import
   - **Outlook** - Opens in Outlook, click "Save" to add

### For All Shifts (Recommended):

1. Click **"Download All"** at the top of "My Shifts"
2. A file named `freestyle-vancouver-volunteer-shifts.ics` downloads
3. **On iPhone/iPad:**
   - Tap the downloaded file
   - Tap "Add All" to import to Calendar
   - All shifts appear with reminders!

4. **On Computer:**
   - Double-click the downloaded file
   - Your default calendar app opens
   - Click "Import" or "Add"
   - All shifts are added!

5. **On Android:**
   - Download the file
   - Open Google Calendar app
   - Menu → Settings → Import & Export → Import
   - Select the downloaded file

## 📋 What Gets Added to Calendar

Each calendar entry includes:

- **Title:** The opportunity name (e.g., "Sunday Morning Training")
- **Date & Time:** Exact start time
- **Duration:** 2 hours (default)
- **Location:** Mountain name (Cypress or Grouse)
- **Description:** Full details including:
  - Opportunity description
  - Location
  - Type (on-snow/off-snow)
  - "Freestyle Vancouver Volunteer Opportunity" label

## 🔔 Automatic Reminders

When volunteers add shifts to their calendar, they'll get:

- **Default reminders** based on their calendar app settings
- **Notification before shift** (typically 1 hour before)
- **All-day or calendar sync** across their devices

## 💡 Benefits

### For Volunteers:
✅ Never forget a shift - automatic reminders
✅ See all commitments in one place (personal + volunteer)
✅ Sync across all devices (phone, tablet, computer)
✅ Easy to plan around volunteer shifts
✅ Professional experience (same as work calendar)

### For You (Admin):
✅ Fewer no-shows (people get reminders)
✅ Better volunteer retention (easy to see their commitment)
✅ Professional image for the organization
✅ Less need for reminder emails

## 🎨 User Experience Flow

```
1. Volunteer signs up for shift
   ↓
2. Shift appears in "My Shifts" section
   ↓
3. Click "Add to Calendar" button
   ↓
4. Choose calendar type from dropdown
   ↓
5. Calendar opens/downloads
   ↓
6. Click "Save" or "Import"
   ↓
7. Shift appears in their calendar with reminders!
```

OR

```
1. Volunteer has multiple shifts
   ↓
2. Click "Download All" button
   ↓
3. .ics file downloads
   ↓
4. Open/import file in calendar app
   ↓
5. ALL shifts appear in calendar at once!
```

## 📱 Tested On

✅ Google Calendar (Web & App)
✅ Apple Calendar (iPhone, iPad, Mac)
✅ Outlook Calendar (Web & App)
✅ Samsung Calendar (Android)
✅ Other calendar apps supporting .ics files

## 🔧 Technical Details

### File Format
- **ICS (iCalendar)** - Industry standard format
- **Compatible** with all major calendar applications
- **UTF-8 encoding** for special characters
- **RFC 5545 compliant** specification

### Event Details
- **Duration:** 2 hours (can be customized)
- **Status:** CONFIRMED
- **UID:** Unique identifier for each shift
- **Timezone:** UTC (converted by calendar apps)

### Security
- ✅ No personal data in calendar links (only opportunity info)
- ✅ Links are generated on-the-fly (no storage)
- ✅ Files are created client-side (no server upload)

## 🎓 Teaching Volunteers

### Quick Instructions to Share:

> **How to Add Shifts to Your Calendar**
>
> 1. Sign up for a volunteer shift
> 2. Look for the shift in "My Shifts" on the right side
> 3. Click "Add to Calendar"
> 4. Choose your calendar (Google, Apple, or Outlook)
> 5. Click "Save" when it opens
>
> **OR**
>
> Click "Download All" to add all your shifts at once!

### Email Template:

```
Subject: Add Your Volunteer Shifts to Your Calendar! 📅

Hi [Volunteer Name],

Great news! You can now add your Freestyle Vancouver volunteer shifts 
directly to your phone or computer calendar.

This means you'll get automatic reminders and won't miss any shifts!

How to do it:
1. Log in to the volunteer portal
2. Find your shift in "My Shifts" (right side)
3. Click "Add to Calendar"
4. Choose your calendar type
5. Click "Save"

Have multiple shifts? Click "Download All" at the top to add them all at once!

Questions? Let us know!

Thanks for volunteering!
```

## ❓ FAQ

**Q: Do I have to add each shift separately?**
A: No! Use the "Download All" button to import all your shifts at once.

**Q: Will this update if I remove myself from a shift?**
A: No, you'll need to manually delete that event from your calendar. The calendar entries don't sync back to the website.

**Q: What if I sign up for more shifts later?**
A: Just use "Download All" again, or add individual shifts as you sign up.

**Q: Can I change the reminder time?**
A: Yes! After importing, edit the event in your calendar app to set custom reminders.

**Q: What if my calendar app isn't listed?**
A: Try "Apple Calendar" option - the .ics file works with most calendar apps!

## 🚀 Future Enhancements (Optional)

Potential future additions:
- [ ] Custom shift duration (some may be longer/shorter than 2 hours)
- [ ] Automatic calendar sync (remove if volunteer cancels)
- [ ] SMS reminders as backup
- [ ] Email calendar invites
- [ ] Google Calendar API integration (automatic add)

## 📞 Support

If volunteers have issues:
1. Try different calendar option (Google vs Apple)
2. Check default calendar app settings
3. Ensure calendar app has permission to import files
4. Try "Download All" approach instead of individual adds

---

This feature significantly improves the volunteer experience and reduces no-shows through automated reminders! 🎉
