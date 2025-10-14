# 🔒 Security Guide - Freestyle Vancouver Volunteer App

## ✅ Current Security Measures

### 1. **Database Security (Supabase)**
- ✅ Row Level Security (RLS) policies enabled on all tables
- ✅ Users can only access/modify their own data
- ✅ Authentication required for all database operations
- ✅ Supabase handles password hashing and secure storage

### 2. **User Authentication**
- ✅ Passwords are **never** stored in your application
- ✅ Supabase Auth handles all password management securely
- ✅ Email confirmation available (optional)
- ✅ Password reset functionality built-in
- ✅ Secure session management

### 3. **Data Protection**
- ✅ HTTPS encryption for all data transmission (via Supabase)
- ✅ Sensitive user data (emails, phones) protected by RLS
- ✅ No sensitive data stored in browser localStorage
- ✅ Automatic session expiration

## ⚠️ Important Security Actions Required

### 1. **Change Admin Credentials IMMEDIATELY**

The default admin credentials are in your `.env` file:

**Current:** (CHANGE THESE!)
```
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=FreestyleVancouver2025!Secure
```

**How to change:**
1. Open `.env` file
2. Change to strong, unique credentials:
   ```
   VITE_ADMIN_USERNAME=your_unique_admin_name
   VITE_ADMIN_PASSWORD=your_very_strong_password_here!123
   ```
3. Use a password manager to generate a strong password
4. Never share these credentials via email or messaging apps

### 2. **Protect Your .env File**

✅ **Already Done:**
- `.env` is in `.gitignore` (won't be committed to version control)

⚠️ **You Must:**
- Never commit `.env` to GitHub/GitLab
- Never share `.env` file contents publicly
- Keep backup of `.env` in a secure location (password manager)

### 3. **Supabase Security**

Your Supabase credentials are in `src/lib/supabase.js`:
- **Anon Key**: This is public and safe to expose (has limited permissions)
- **URL**: This is public and safe to expose

⚠️ **Never expose:**
- Service Role Key (if you have one)
- Database password

### 4. **Production Deployment Security**

When deploying to production (Vercel, Netlify, etc.):

1. **Add environment variables to your hosting platform:**
   - Go to your hosting dashboard
   - Add `VITE_ADMIN_USERNAME` and `VITE_ADMIN_PASSWORD`
   - Use different, stronger credentials than development

2. **Enable email confirmation in Supabase:**
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Enable "Confirm signup" template
   - This prevents fake registrations

3. **Set up proper email provider:**
   - Configure SMTP settings in Supabase
   - Use a professional email service (SendGrid, AWS SES, etc.)

## 🛡️ Additional Security Recommendations

### Immediate Actions:

1. **Review Supabase RLS Policies**
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify all tables have proper policies
   - Test with different user roles

2. **Enable Supabase Security Features:**
   - Enable rate limiting
   - Enable CAPTCHA for signup (if spam is an issue)
   - Set up email verification

3. **Monitor Access:**
   - Regularly check Supabase logs for suspicious activity
   - Monitor failed login attempts
   - Review who has admin access

### Advanced Security (Optional):

1. **Replace Simple Admin Login**
   
   Currently, admin access uses simple username/password. Consider:
   - Implementing admin users in Supabase (create admin role)
   - Using Supabase Auth for admin accounts
   - Adding two-factor authentication (2FA)

2. **Audit Logging**
   - Track who creates/edits/deletes opportunities
   - Log all signup/removal actions
   - Store logs in separate Supabase table

3. **API Rate Limiting**
   - Supabase has built-in rate limiting
   - Configure in Supabase Dashboard → Settings → API

## 🔐 Password Best Practices

For admin credentials:
- ✅ Minimum 16 characters
- ✅ Mix of uppercase, lowercase, numbers, symbols
- ✅ Don't use dictionary words
- ✅ Don't reuse passwords from other services
- ✅ Change every 90 days
- ✅ Use a password manager (1Password, Bitwarden, LastPass)

## 📊 Security Checklist

Before going live:

- [ ] Changed default admin credentials
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested RLS policies in Supabase
- [ ] Enabled email confirmation for volunteers
- [ ] Set up production environment variables
- [ ] Configured proper email provider
- [ ] Reviewed Supabase security settings
- [ ] Tested forgot password flow
- [ ] Documented admin access procedures
- [ ] Set up regular security reviews

## 🚨 What to Do If Compromised

If you suspect a security breach:

1. **Immediately:**
   - Change admin credentials in `.env`
   - Rotate Supabase project keys (if service role exposed)
   - Check Supabase logs for unauthorized access

2. **Investigate:**
   - Review recent database changes
   - Check for unauthorized user accounts
   - Look for suspicious opportunity modifications

3. **Notify:**
   - Inform volunteers if their data was accessed
   - Document the incident
   - Update security measures

## 📞 Security Questions?

If you have security concerns:
1. Check Supabase documentation: https://supabase.com/docs/guides/auth
2. Review Supabase security best practices
3. Consider hiring a security consultant for production deployments

## 🔄 Regular Security Maintenance

**Monthly:**
- Review user accounts in Supabase
- Check for failed login attempts
- Update admin password

**Quarterly:**
- Review and test RLS policies
- Update dependencies (`npm audit`)
- Review Supabase logs

**Annually:**
- Full security audit
- Update Supabase configuration
- Review access controls

---

**Remember:** Security is an ongoing process, not a one-time setup!
