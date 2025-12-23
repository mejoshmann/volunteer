import { useState } from 'react';
import { Mountain, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <Mountain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            {success 
              ? "Check your email for reset instructions" 
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <p className="font-medium">Password reset email sent!</p>
              <p className="text-sm mt-2">
                Check your email inbox for a link to reset your password. 
                The link will expire in 60 minutes.
              </p>
              <p className="text-sm mt-2 font-medium">
                ⚠️ Check your spam/junk folder if you don't see it in your inbox.
              </p>
            </div>
            
            <button
              onClick={onBack}
              className="w-full p-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                placeholder="your.email@example.com"
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
