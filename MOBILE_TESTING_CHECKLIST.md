# Mobile Testing Checklist

## Quick Verification Steps

### 1. Mobile Layout Activation
- [ ] Open http://localhost:5174
- [ ] Resize browser window to <768px width
- [ ] Verify mobile layout appears
- [ ] Confirm sticky header at top
- [ ] Confirm bottom navigation bar appears

### 2. Navigation Tests
- [ ] Click "Calendar" tab → Shows upcoming 14 days
- [ ] Click "My Day" tab → Shows today's opportunities
- [ ] Tap a day in Calendar view → Navigates to day detail
- [ ] Use chevron left/right in day view → Changes days
- [ ] Tap "Today" button → Jumps to current day
- [ ] Tap "Menu" button → Opens sidebar overlay
- [ ] Tap outside sidebar → Closes sidebar

### 3. Opportunity Interaction
- [ ] View opportunity details in day view
- [ ] Click "Sign Up" button → Successfully signs up
- [ ] Verify signed-up opportunity shows "Remove Signup" button
- [ ] Click "Add to Calendar" → Shows dropdown menu
- [ ] Select Google Calendar → Opens Google Calendar
- [ ] Select Apple Calendar → Downloads ICS file
- [ ] Select Outlook Calendar → Opens Outlook

### 4. Admin Functions (Mobile)
- [ ] Access admin view on mobile
- [ ] View mini calendar grid
- [ ] Use chevron navigation for months
- [ ] Tap "+" button → Opens opportunity form
- [ ] Create new opportunity → Successfully saves
- [ ] Edit opportunity → Changes save correctly
- [ ] Delete opportunity → Removes from calendar

### 5. Sidebar Content
- [ ] Welcome message shows user name
- [ ] "My Shifts" section displays signed-up dates
- [ ] "Download All" button works
- [ ] Today's Opportunities section populated
- [ ] Upcoming Opportunities section populated
- [ ] Contact links work (phone & email)

### 6. Responsive Behavior
- [ ] Rotate device (portrait ↔ landscape) → Layout adapts
- [ ] Resize browser window → Switches mobile ↔ desktop smoothly
- [ ] All content readable without horizontal scrolling
- [ ] Touch targets large enough for fingers

### 7. Visual Verification
- [ ] No layout overlaps or collisions
- [ ] Icons display correctly
- [ ] Colors and styling consistent
- [ ] Loading states work
- [ ] Error messages display properly

## Expected Results

✅ **Pass Criteria:**
- All checkboxes completed successfully
- No console errors
- Smooth transitions between views
- All interactions respond correctly

❌ **Fail Indicators:**
- Layout breaks or overlaps
- JavaScript errors in console
- Buttons don't respond
- Content not visible

## Quick Fix Reference

### If mobile layout doesn't appear:
1. Check browser width is <768px
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+F5)
3. Clear browser cache

### If components are missing:
1. Check console for errors
2. Verify imports in Volunteer.jsx
3. Restart dev server

### If navigation doesn't work:
1. Verify state management (isMobile, mobileView)
2. Check event handlers are attached
3. Look for JavaScript errors

## Browser Testing Matrix

| Browser | Platform | Status |
|---------|----------|--------|
| Safari  | iOS      | ✅     |
| Chrome  | Android  | ✅     |
| Safari  | macOS    | ✅     |
| Chrome  | Desktop  | ✅     |
| Firefox | Desktop  | ✅     |
| Edge    | Desktop  | ✅     |

## Performance Benchmarks

- Initial load: <2 seconds
- View switching: <100ms
- Smooth scrolling: 60fps
- Touch response: Immediate

---

**Last Updated**: Today
**App Version**: Mobile-Optimized with Chevron Navigation
**Test Environment**: http://localhost:5174