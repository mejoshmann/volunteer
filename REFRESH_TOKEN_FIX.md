# Refresh Token Fix Guide

## Problem
The application is experiencing refresh token errors:
```
AuthApiError: Invalid Refresh Token: Refresh Token Not Found
```

## Root Cause
This error typically occurs when:
1. The user's session has expired
2. The refresh token was invalidated (e.g., user signed out from another device)
3. There's a misconfiguration in Supabase auth settings

## Solutions

### 1. Client-side Fix
The application should handle refresh token failures gracefully by redirecting to login:

```javascript
// In App.jsx or your main auth handler
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
    // Handle sign out or token refresh
    setUser(null);
    setCurrentView('login');
  }
});
```

### 2. Supabase Dashboard Configuration
1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "Settings"
3. Check the "Session Settings":
   - Session timeout: Should be reasonable (e.g., 1 hour)
   - Refresh token reuse interval: Should be set appropriately

### 3. Code Improvements
Update your authentication flow to handle token refresh errors:

```javascript
// In your login component
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password
    });

    if (supabaseError) {
      // Handle different types of errors
      if (supabaseError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (supabaseError.message.includes('Email not confirmed')) {
        setError('Please confirm your email before signing in.');
      } else {
        setError('Login failed. Please try again.');
      }
    } else if (data.user) {
      onLogin({ user: data.user });
    }
  } catch (err) {
    // Handle network errors or other unexpected issues
    setError('Network error. Please check your connection and try again.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

## Prevention
1. Always check for valid sessions before making authenticated requests
2. Implement proper error handling for auth-related operations
3. Consider implementing a retry mechanism for transient auth errors
4. Provide clear user feedback when authentication fails

## Testing
To test the fix:
1. Sign in to the application
2. Wait for the session to expire (or manually clear cookies/localStorage)
3. Try to perform an authenticated action
4. Verify that the user is redirected to login with an appropriate message