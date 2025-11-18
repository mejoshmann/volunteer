import { useState, useEffect } from 'react';
import Volunteer from './components/volunteer/Volunteer';
import Landing from './components/landing/Landing';
import Login from './components/login/Login';
import Registration from './components/registration/Registration';
import ForgotPassword from './components/login/ForgotPassword';
import ResetPassword from './components/login/ResetPassword';
import { supabase } from './lib/supabase';
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'login', 'register', 'volunteer', 'forgot-password', 'reset-password'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    // Check if this is a password recovery link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (type === 'recovery' && accessToken) {
      // User clicked password reset link
      setCurrentView('reset-password');
      setLoading(false);
      return;
    }
    
    checkUser();

    // Listen for auth changes (including email confirmation)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      
      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          setUser(session?.user ?? null);
          setCurrentView('volunteer');
          break;
        case 'SIGNED_OUT':
          setUser(null);
          setCurrentView('landing');
          break;
        case 'TOKEN_REFRESHED':
          setUser(session?.user ?? null);
          if (session?.user) {
            setCurrentView('volunteer');
          }
          break;
        case 'USER_UPDATED':
          // Email was confirmed
          setUser(session?.user ?? null);
          if (session?.user) {
            setCurrentView('volunteer');
          }
          break;
        case 'INITIAL_SESSION':
          // Initial session check
          setUser(session?.user ?? null);
          if (session?.user) {
            setCurrentView('volunteer');
          }
          break;
        default:
          // Handle other events if needed
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setCurrentView('volunteer');
      }
    } catch (error) {
      // If there's an auth error, clear the user and show login
      setUser(null);
      setCurrentView('login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    if (userData.user) {
      setUser(userData.user);
      setCurrentView('volunteer');
    }
  };

  const handleRegister = async () => {
    // After registration, show login
    setCurrentView('login');
    
    // Longer delay to ensure volunteer profile is created
    setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Additional delay to ensure volunteer profile is fully created
          await new Promise(resolve => setTimeout(resolve, 500));
          setUser(user);
          setCurrentView('volunteer');
        }
      } catch (error) {
        // Error checking user after registration
      }
    }, 2000); // Increased from 1500 to 2000ms
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setCurrentView('landing');
    } catch (error) {
      // Even if there's an error, clear local state
      setUser(null);
      setCurrentView('landing');
    }
  };

  const handlePasswordReset = async () => {
    // After password reset, check user and redirect to volunteer view
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentView('volunteer');
    } else {
      setCurrentView('login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === 'landing' && (
        <Landing 
          onShowLogin={() => setCurrentView('login')}
          onShowRegister={() => setCurrentView('register')}
        />
      )}
      {currentView === 'login' && (
        <Login 
          onLogin={handleLogin}
          onShowRegister={() => setCurrentView('register')}
          onShowForgotPassword={() => setCurrentView('forgot-password')}
        />
      )}
      {currentView === 'forgot-password' && (
        <ForgotPassword 
          onBack={() => setCurrentView('login')}
        />
      )}
      {currentView === 'reset-password' && (
        <ResetPassword 
          onPasswordReset={handlePasswordReset}
        />
      )}
      {currentView === 'register' && (
        <Registration 
          onRegister={handleRegister}
          onShowLogin={() => setCurrentView('login')}
        />
      )}
      {currentView === 'volunteer' && user && (
        <Volunteer 
          user={user}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}

export default App