import { useState } from 'react';
import { Mountain } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Add this import


const Login = ({ onLogin, onShowRegister }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        // Better error messages
        if (supabaseError.message.includes('Email not confirmed')) {
          setError('Please check your email and click the confirmation link before signing in. If you can\'t find it, check your spam folder.');
        } else if (supabaseError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(supabaseError.message);
        }
      } else if (data.user) {
        // Optional: fetch volunteer profile if needed
        const { data: volunteerProfile, error: profileError } = await supabase
          .from('volunteers')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        if (profileError) console.log(profileError);
        onLogin({ user: data.user, volunteer: volunteerProfile });
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <Mountain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to access volunteer opportunities</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-md font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">New volunteer?</p>
          <button
            onClick={onShowRegister}
            className="text-blue-600 hover:text-blue-800 font-medium"
            disabled={loading}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
